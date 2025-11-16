// API Configuration
// This file can be easily modified for different environments
// For production, update this file before deployment

window.API_CONFIG = {
    // Primary API URL (script.js will use this)
    // To use HTTP instead of HTTPS, change this to API_BASE_URL_HTTP value below
    API_BASE_URL: 'https://portfolio.hansraj.me/api',
    
    // Fallback HTTP URL (if HTTPS doesn't work)
    // To switch to HTTP, change API_BASE_URL above to this value:
    API_BASE_URL_HTTP: 'https://portfolio.hansraj.me/api',
    
    // Timeout settings
    API_TIMEOUT: 60000, // 60 seconds
    MAX_RETRIES: 100,
    INITIAL_RETRY_DELAY: 1000
};

