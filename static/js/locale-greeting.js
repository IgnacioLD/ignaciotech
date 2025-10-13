// Dynamic greeting based on browser locale
(function() {
  'use strict';

  // Greeting translations
  const greetings = {
    'en': "Hi, I'm <strong>Ignacio</strong>",
    'es': "Hola, soy <strong>Ignacio</strong>",
    'ca': "Hola, sóc <strong>Ignacio</strong>",
    'val': "Hola, sóc <strong>Ignacio</strong>",  // Valencian
    'fr': "Salut, je suis <strong>Ignacio</strong>",
    'de': "Hallo, ich bin <strong>Ignacio</strong>",
    'ru': "Привет, я <strong>Ignacio</strong>"
  };

  // Default greeting
  const defaultGreeting = greetings['en'];

  function getGreeting() {
    // Get browser locale
    const browserLocale = navigator.language || navigator.userLanguage;

    // Extract the language code (e.g., 'en' from 'en-US')
    const langCode = browserLocale.split('-')[0].toLowerCase();

    // Return the greeting for the detected language, or default to English
    return greetings[langCode] || defaultGreeting;
  }

  function updateGreeting() {
    const greetingElement = document.getElementById('dynamic-greeting');
    if (greetingElement) {
      greetingElement.innerHTML = getGreeting();
    }
  }

  // Update greeting when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', updateGreeting);
  } else {
    updateGreeting();
  }
})();
