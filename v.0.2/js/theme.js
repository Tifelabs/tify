        function changeTheme() {
            const theme = document.getElementById('style').value;
            document.body.className = ''; // Reset classes
            document.body.classList.add(theme);
            localStorage.setItem('selectedTheme', theme); // Save theme
        }

        // Apply saved theme on page load
        window.onload = function() {
            const savedTheme = localStorage.getItem('selectedTheme');
            if (savedTheme) {
                const themeSelect = document.getElementById('style');
                if (themeSelect) {
                    themeSelect.value = savedTheme;
                }
                document.body.classList.add(savedTheme);
            }
        };