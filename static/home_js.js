
// Theme Switch Functionality
const themeSwitch = document.getElementById('theme-switch');
const body = document.body;

themeSwitch.addEventListener('change', () => {
    body.classList.toggle('dark-mode');
});

// Language Switch Functionality
const languageSwitch = document.getElementById('language-switch');
const languageLabel = document.getElementById('language-label');

languageSwitch.addEventListener('change', () => {
    if (languageSwitch.checked) {
        languageLabel.textContent = 'Hindi';
    } else {
        languageLabel.textContent = 'English';
    }
});



