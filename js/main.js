




//#region ===== HELPERS =====

// Function to dynamically load scripts
function loadScript(src, callback) {
    let script = document.createElement('script');
    script.src = src;
    script.onload = callback;
    document.head.appendChild(script);
}

// Function to add a stylesheet
function loadCSS(href, callback) {
    let link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;

    if (callback) {
        link.onload = callback;
        link.onerror = () => console.error(`Failed to load CSS: ${href}`);
    }

    document.head.appendChild(link);
}

//#endregion



//#region ===== CSS & SCRIPTS =====

// LENIS (SMOOTH SCROLL)
loadScript("https://unpkg.com/lenis@1.1.20/dist/lenis.min.js", () => {

    // Attach to window so codeBlocks.js can use it
    window.lenis = new Lenis(); 
    
    function raf(time) {
        window.lenis.raf(time);
        requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // smooth url movement
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            // stop default browser jump
            e.preventDefault();

            // move to target
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                window.lenis.scrollTo(targetElement); 
                
                // manually update url
                window.history.pushState(null, null, targetId); 
            }
        });
    });
});




// FONT AWESOME
loadCSS("https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css");

//#endregion






//#region ===== MOBILE CONTENT TABLE =====
const menuBtn = document.getElementById('mobileMenuToggle');
    const contentTable = document.getElementById('contentTable');

    if (menuBtn && contentTable) {
        // toggle button
        menuBtn.addEventListener('click', () => {
            contentTable.classList.toggle('active');
            menuBtn.classList.toggle('active');
        });

        // close menu when a link inside it is clicked
        const links = contentTable.querySelectorAll('a');
        links.forEach(link => {
            link.addEventListener('click', () => {
                contentTable.classList.remove('active');
                menuBtn.classList.remove('active');
            });
        });

        // close menu when clicking outside
        document.addEventListener('click', (event) => {

            if (!contentTable.classList.contains('active')) return;

            const isClickInside = contentTable.contains(event.target);
            const isClickOnBtn = menuBtn.contains(event.target);

            if (!isClickInside && !isClickOnBtn) {
                contentTable.classList.remove('active');
                menuBtn.classList.remove('active');
            }
        });
    }


//#endregion



