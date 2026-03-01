function formatJSON(obj, indent = 0) {
    const spacing = ' '.repeat(indent);
    const nextSpacing = ' '.repeat(indent + 4);

    const escapeHTML = (str) => str.replace(/</g, '&lt;').replace(/>/g, '&gt;');
    
    // Helper to determine if a string is a placeholder and wrap it
    const wrapString = (str) => {
        const escaped = escapeHTML(str);
        if (str.startsWith('<') && str.endsWith('>')) {
            return `<span class="placeholder">"${escaped}"</span>`;
        }
        return `"${escaped}"`;
    };

    if (obj === null) return '<span class="null">null</span>';
    if (typeof obj === 'number') return `<span class="number">${obj}</span>`;
    if (typeof obj === 'boolean') return `<span class="boolean">${obj}</span>`;
    
    if (typeof obj === 'string') {
        return `<span class="string">${wrapString(obj)}</span>`;
    }
    
    if (Array.isArray(obj)) {
        if (obj.length === 0) return '[]';
        const items = obj.map(item => nextSpacing + formatJSON(item, indent + 4)).join(',\n');
        return `[\n${items}\n${spacing}]`;
    }
    
    if (typeof obj === 'object') {
        const keys = Object.keys(obj);
        if (keys.length === 0) return '{}';
        const entries = keys.map(key => {
            const isPlaceholderKey = key.startsWith('<') && key.endsWith('>');
            const keyContent = isPlaceholderKey 
                ? `<span class="placeholder">"${escapeHTML(key)}"</span>` 
                : `"${escapeHTML(key)}"`;
                
            return `${nextSpacing}<span class="key">${keyContent}</span>: ${formatJSON(obj[key], indent + 4)}`;
        }).join(',\n');
        return `{\n${entries}\n${spacing}}`;
    }
}




function addJSONCodeBlock(pTitle, pCode) {
    const scriptTag = document.currentScript;
    const block = document.createElement('div');
    block.className = 'code-block';

    block.innerHTML = `
        <div class="code-header">
            <span>${pTitle}</span>
            <span class="code-lang">JSON</span>
        </div>
        <pre><code>${formatJSON(pCode)}</code></pre>
    `;

    scriptTag.parentElement.insertBefore(block, scriptTag);
}





function addCodeBlock(pTitle, pCodeLang, pCode) {
    const scriptTag = document.currentScript;
    const block = document.createElement('div');
    block.className = 'code-block';

    const safeCode = pCode
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");

    block.innerHTML = `
        <div class="code-header">
            <span>${pTitle}</span>
            <span class="code-lang">${pCodeLang}</span>
        </div>
        <pre><code>${safeCode}</code></pre>
    `;

    scriptTag.parentElement.insertBefore(block, scriptTag);
}













//#region ===== FREE API PREVIEW =====


function addInteractivePreview(pEndpoint, pFields) {
    const scriptTag = document.currentScript;
    const div = document.createElement('div');


    // generate fields dynamically based on pFields
    const fieldsHTML = pFields.map(field => {
        
        // textareas
        if (field.type === 'text') {
            const placeholder = field.placeholder ? `placeholder="${field.placeholder}"` : '';
            const isRequired = field.required ? 'required' : '';
            
            return `
                <div>
                    <label for="${field.id}">${field.label}</label>
                    <textarea id="${field.id}" data-key="${field.key}" ${isRequired} ${placeholder}></textarea>
                </div>
            `;
        } 
        
        // dropdowns
        else if (field.type === 'dropdown') {
            // generate <option> tags
            const optionsHTML = field.options.map(opt => {
                const isSelected = opt.selected ? 'selected' : '';
                return `<option value="${opt.value}" ${isSelected}>${opt.label}</option>`;
            }).join('\n');

            // wrap in <select>
            return `
                <div>
                    <label for="${field.id}">${field.label}</label>
                    <select id="${field.id}" data-key="${field.key}">
                        ${optionsHTML}
                    </select>
                </div>
            `;
        }

        // arrays
        else if (field.type === 'array') {
            return `
                <div class="array-container" data-array-container-key="${field.key}">
                    <label>${field.label}</label>
                    <div id="${field.id}-items" class="array-list"></div>
                    <button type="button" class="add-array-btn" data-container="${field.id}-items" data-key="${field.key}"><i class="fa-regular fa-square-plus"></i> Add Item</button>
                </div>
            `;
        }
        
        return '';
        
    }).join('\n');



    // inject fields in div
    div.innerHTML = `
        <div>
            <form id="preview-form" data-endpoint="${pEndpoint}">

                <p style="margin:0; font-size: 2em">Request to: <span class="inline-code">https://prism.optical-labs.ca/${pEndpoint}</span></p>

                <div id="preview-fields">
                    ${fieldsHTML}
                </div>

                <hr>

                <button type="submit" id="preview-btn">Send Request</button>

                <p id="live-response"><span style="text-decoration: underline; font-style: italic;">Note:</span> Because this is a free preview, we are enforcing a strict maximum of 7 requests per minute.</p>

            </form>

        </div>


        <div class="code-block" id="preview-request">
            <div class="code-header">
                <span>Request Preview</span>
                <span class="code-lang">BASH</span>
            </div>
            <pre><code id="preview-body">{}</code></pre>
        </div>
        
        <div class="code-block" id="preview-output">
            <div class="code-header">
                <span>Live Response</span>
                <span class="code-lang">JSON</span>
            </div>
            <pre><code>The response will appear here</code></pre>
        </div>
    `;




    // read current values and update the body preview
    const updateJSONPreview = () => {
        const requestBody = {};
        pFields.forEach(field => {
            if (field.type === 'array') {
                // Find all generated inputs for this specific array
                const arrayInputs = div.querySelectorAll(`input[data-array-key="${field.key}"]`);
                const arr = [];
                arrayInputs.forEach(input => {
                    let val = input.value.trim();
                    if (val !== "") {
                        if (!isNaN(Number(val))) val = Number(val); // cast numbers
                        arr.push(val);
                    }
                });
                requestBody[field.key] = arr;
            } else {
                // Standard text/dropdown fields
                const element = div.querySelector(`#${field.id}`);
                if (element) {                
                    let rawValue = element.value; 
                    if (rawValue.trim() !== "" && !isNaN(Number(rawValue))) rawValue = Number(rawValue);
                    requestBody[field.key] = rawValue;
                }
            }
        });
        const previewBlock = div.querySelector('#preview-body');

        // stringify the object
        const formattedBody = JSON.stringify(requestBody, null, 4).replace(/\n/g, '\n    ');

        const codePreview =
`curl -X POST https://prism.optical-labs.ca/${pEndpoint} \\
    -H "Authorization: Bearer <YOUR_SECRET_API_KEY>" \\
    -H "Content-Type: application/json" \\
    -d '${formattedBody}'`;

        previewBlock.innerText = codePreview;
    };

    // add event listeners to all fields to update preview
    pFields.forEach(field => {
        if (field.type !== 'array') {
            const element = div.querySelector(`#${field.id}`);
            if (element) {
                element.addEventListener('input', updateJSONPreview);
                element.addEventListener('change', updateJSONPreview);
            }
        }
    });


    // Handle buttons for arrays
    const addButtons = div.querySelectorAll('.add-array-btn');
    addButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const containerId = btn.dataset.container;
            const container = div.querySelector(`#${containerId}`);
            const key = btn.dataset.key;

            // Create row container
            const itemDiv = document.createElement('div');
            itemDiv.classList.add('array-item-row');

            // Create input field
            const input = document.createElement('input');
            input.type = 'text';
            input.dataset.arrayKey = key; 
            input.classList.add('array-item-input');
            
            // Update live preview when typing
            input.addEventListener('input', updateJSONPreview);

            // create "X" remove button
            const removeBtn = document.createElement('button');
            removeBtn.type = 'button';
            removeBtn.innerHTML = '<i class="fa-solid fa-trash"></i>';
            removeBtn.classList.add('array-item-remove');

            removeBtn.addEventListener('click', () => {
                itemDiv.remove();
                updateJSONPreview(); // update JSON when removed
            });

            itemDiv.appendChild(input);
            itemDiv.appendChild(removeBtn);
            container.appendChild(itemDiv);
            
            updateJSONPreview(); // update JSON when added

            // foxus the new input
            input.focus();
        });
    });

    updateJSONPreview();
    scriptTag.parentElement.insertBefore(div, scriptTag);
}






// sending form
document.addEventListener('DOMContentLoaded', () => {
    const previewForm = document.getElementById('preview-form');
    const previewBtn = document.getElementById('preview-btn');
    const previewOutput = document.getElementById('preview-output');

    if (previewForm) {
        const btnInitText = previewBtn.innerText;
        previewForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            // get parameters
            const endpoint = previewForm.dataset.endpoint;

            // dynamically get fields and build request body
            const requestBody = {};
            const inputElements = document.querySelectorAll('#preview-fields [data-key]');
            
            inputElements.forEach(element => {
                let rawValue = element.value; 
                if (rawValue.trim() !== "" && !isNaN(Number(rawValue))) {
                    rawValue = Number(rawValue);
                }
                requestBody[element.dataset.key] = element.value;
            });


            // get array fields
            const arrayContainers = document.querySelectorAll('#preview-fields .array-container');
            arrayContainers.forEach(container => {
                const key = container.dataset.arrayContainerKey;
                const arrayInputs = container.querySelectorAll(`input[data-array-key="${key}"]`);
                const arr = [];
                arrayInputs.forEach(input => {
                    let val = input.value.trim();
                    if (val !== "") {
                        if (!isNaN(Number(val))) val = Number(val);
                        arr.push(val);
                    }
                });
                requestBody[key] = arr;
            });

            // set state
            previewBtn.innerText = 'Fetching...';
            previewBtn.disabled = true;

            // fetch
            try {
                const response = await fetch(`https://prism.optical-labs.ca/${endpoint}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(requestBody)
                });

                const data = await response.json();

                // display formatted output
                previewOutput.innerHTML = `
                    <div class="code-header">
                        <span>Live Response</span>
                        <span class="code-lang">JSON</span>
                    </div>
                    <pre><code>${formatJSON(data)}</code></pre>
                `

            } catch (error) {
                previewOutput.innerText = `Error: Could not connect to the API.`;
            } finally {
                // reset button state
                previewBtn.innerText = btnInitText;
                previewBtn.disabled = false;

                // smooth scroll to response
                if (window.lenis) {
                    window.lenis.scrollTo(previewOutput, { offset: -120 }); 
                }
            }
        });
    }
});

//#endregion
