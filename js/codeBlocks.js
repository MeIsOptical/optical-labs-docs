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




function addJSONCodeBlock(title, code) {
    const scriptTag = document.currentScript;
    const block = document.createElement('div');
    block.className = 'code-block';

    block.innerHTML = `
        <div class="code-header">
            <span>${title}</span>
            <span class="code-lang">JSON</span>
        </div>
        <pre><code>${formatJSON(code)}</code></pre>
    `;

    scriptTag.parentElement.insertBefore(block, scriptTag);
}