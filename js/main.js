


const menuBtn = document.getElementById('mobileMenuToggle');
    const contentTable = document.getElementById('contentTable');

    if (menuBtn && contentTable) {
        // 1. Toggle Menu Button
        menuBtn.addEventListener('click', () => {
            contentTable.classList.toggle('active');
            menuBtn.classList.toggle('active');
        });

        // 2. Close menu when a link INSIDE it is clicked
        const links = contentTable.querySelectorAll('a');
        links.forEach(link => {
            link.addEventListener('click', () => {
                contentTable.classList.remove('active');
                menuBtn.classList.remove('active');
            });
        });

        // 3. NEW: Close menu when clicking OUTSIDE (on the main content)
        document.addEventListener('click', (event) => {
            // Only run if the menu is currently open
            if (!contentTable.classList.contains('active')) return;

            // Check if the click target is inside the menu or the button
            const isClickInside = contentTable.contains(event.target);
            const isClickOnBtn = menuBtn.contains(event.target);

            // If the click is NOT inside the menu AND NOT on the button, close it
            if (!isClickInside && !isClickOnBtn) {
                contentTable.classList.remove('active');
                menuBtn.classList.remove('active');
            }
        });
    }


