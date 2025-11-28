// API Configuration
// Read from config.js (window.API_CONFIG) or use fallback defaults
// To change API URL, edit config.js file
const API_BASE_URL_HTTPS = (window.API_CONFIG && window.API_CONFIG.API_BASE_URL) || 
    window.API_BASE_URL || 
    'https://portfolio-948422802071.asia-southeast1.run.app/api';

const API_BASE_URL_HTTP = (window.API_CONFIG && window.API_CONFIG.API_BASE_URL_HTTP) || 
    window.API_BASE_URL_HTTP || 
    'http://portfolio-948422802071.asia-southeast1.run.app/api';

let API_BASE_URL = API_BASE_URL_HTTPS; // Default to HTTPS

const API_TIMEOUT = (window.API_CONFIG && window.API_CONFIG.API_TIMEOUT) || 60000; // 60 seconds timeout
const MAX_RETRIES = (window.API_CONFIG && window.API_CONFIG.MAX_RETRIES) || 100; // Maximum number of retry attempts
const INITIAL_RETRY_DELAY = (window.API_CONFIG && window.API_CONFIG.INITIAL_RETRY_DELAY) || 1000; // Initial delay in milliseconds (1 second)

// Common navbar HTML (fallback for file:// protocol or when fetch fails)
const NAVBAR_HTML = `
    <nav class="navbar" id="navbar">
        <div class="container">
            <a href="index.html" class="nav-brand">Hansraj Deghun</a>
            <ul class="nav-links">
                <li><a href="index.html#home">Home</a></li>
                <li><a href="index.html#about">About</a></li>
                <li><a href="index.html#projects">Projects</a></li>
                <li><a href="/blogs">Blogs</a></li>
                <li><a href="index.html#contact">Contact</a></li>
            </ul>
        </div>
    </nav>
`;

// Load common footer
async function loadFooter() {
    const footerPlaceholder = document.getElementById('footer-placeholder');
    if (!footerPlaceholder) {
        return;
    }

    // Check if we're using file:// protocol (local file)
    const isFileProtocol = window.location.protocol === 'file:';
    
    if (isFileProtocol) {
        // Use fallback footer directly for file:// protocol
        footerPlaceholder.innerHTML = `
            <footer class="footer">
                <div class="container">
                    <p>&copy; Hansraj Deghun, All rights reserved.</p>
                </div>
            </footer>
        `;
        return;
    }

    // Try to fetch footer.html (works with http/https)
    try {
        const response = await fetch('footer.html');
        if (response.ok) {
            const html = await response.text();
            footerPlaceholder.innerHTML = html;
        } else {
            // Fallback footer
            footerPlaceholder.innerHTML = `
                <footer class="footer">
                    <div class="container">
                        <p>&copy; Hansraj Deghun, All rights reserved.</p>
                    </div>
                </footer>
            `;
        }
    } catch (error) {
        // Fallback footer
        footerPlaceholder.innerHTML = `
            <footer class="footer">
                <div class="container">
                    <p>&copy; Hansraj Deghun, All rights reserved.</p>
                </div>
            </footer>
        `;
    }
}

// Load common navbar
async function loadNavbar() {
    const navbarPlaceholder = document.getElementById('navbar-placeholder');
    if (!navbarPlaceholder) {
        console.error('Navbar placeholder not found');
        return;
    }

    // Check if we're using file:// protocol (local file)
    const isFileProtocol = window.location.protocol === 'file:';
    
    if (isFileProtocol) {
        // Use fallback navbar directly for file:// protocol
        console.log('File protocol detected, using inline navbar');
        navbarPlaceholder.innerHTML = NAVBAR_HTML;
        return;
    }

    // Try to fetch navbar.html (works with http/https)
    try {
        console.log('Loading navbar from navbar.html...');
        const response = await fetch('navbar.html');
        if (response.ok) {
            const html = await response.text();
            navbarPlaceholder.innerHTML = html;
            console.log('Navbar loaded successfully from navbar.html');
        } else {
            console.warn('Failed to load navbar, status:', response.status, '- using fallback');
            navbarPlaceholder.innerHTML = NAVBAR_HTML;
        }
    } catch (error) {
        console.warn('Error loading navbar:', error.message, '- using fallback');
        // Fallback: use inline navbar if fetch fails
        navbarPlaceholder.innerHTML = NAVBAR_HTML;
    }
}

// Infinite scroll for blogs page - declare early to avoid initialization issues
let currentBlogPage = 1;
let isLoadingBlogs = false;
let hasMoreBlogs = true;
const BLOGS_PER_PAGE = 5;

// Use window property to avoid temporal dead zone issues
if (!window.infiniteScrollInitialized) {
    window.infiniteScrollInitialized = false;
}

// Helper function to create fetch with timeout
async function fetchWithTimeout(url, options = {}, timeout = API_TIMEOUT) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    
    try {
        const response = await fetch(url, {
            ...options,
            signal: controller.signal
        });
        clearTimeout(id);
        return response;
    } catch (error) {
        clearTimeout(id);
        if (error.name === 'AbortError') {
            throw new Error('Request timeout: The server took too long to respond');
        }
        throw error;
    }
}

// Exponential backoff retry function
async function fetchWithRetry(url, options = {}, retries = MAX_RETRIES, attempt = 1) {
    try {
        const response = await fetchWithTimeout(url, options);
        
        // If response is not ok, throw error to trigger retry
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        return response;
    } catch (error) {
        // If we've exhausted all retries, throw the error
        if (attempt >= retries) {
            console.error(`Failed after ${retries} attempts:`, error);
            throw error;
        }
        
        // Calculate exponential backoff delay: 2^(attempt-1) * INITIAL_RETRY_DELAY
        // Cap the delay at 15 seconds to avoid extremely long waits
        const delay = Math.min(
            Math.pow(2, attempt - 1) * INITIAL_RETRY_DELAY,
            15000
        );
        
        console.warn(`API call failed (attempt ${attempt}/${retries}). Retrying in ${delay}ms...`, error.message);
        
        // Wait for the calculated delay
        await new Promise(resolve => setTimeout(resolve, delay));
        
        // Retry the request
        return fetchWithRetry(url, options, retries, attempt + 1);
    }
}

// Show loading animation
function showLoading(element) {
    element.innerHTML = `
        <div class="loading-container" style="grid-column: 1 / -1; text-align: center; padding: 3rem;">
            <div class="loading-spinner"></div>
            <p style="color: var(--text-secondary); margin-top: 1rem; font-size: 0.9rem;">
                System runs on Cloud Run. Please wait while we wake up the server...
            </p>
            <p style="color: var(--text-secondary); margin-top: 0.5rem; font-size: 0.85rem; opacity: 0.7;">
                This may take a few seconds on first request.
            </p>
        </div>
    `;
}

// Smooth scroll for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Navbar scroll effect
let lastScroll = 0;

window.addEventListener('scroll', () => {
    const navbar = document.getElementById('navbar');
    if (!navbar) return;
    
    const currentScroll = window.pageYOffset;
    
    if (currentScroll > 100) {
        navbar.style.background = '#000000';
    } else {
        navbar.style.background = '#000000';
    }
    
    lastScroll = currentScroll;
});

// Fetch and display projects
async function loadProjects() {
    const projectsGrid = document.getElementById('projects-grid');
    
    // Show loading animation
    showLoading(projectsGrid);
    
    try {
        const response = await fetchWithRetry(`${API_BASE_URL}/projects`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        
        const projects = await response.json();
        
        if (projects.length === 0) {
            projectsGrid.innerHTML = '<p style="text-align: center; color: var(--text-secondary); grid-column: 1 / -1;">No projects available yet.</p>';
            return;
        }
        
        projectsGrid.innerHTML = projects.map(project => {
            // Determine GitHub and demo URLs
            const githubUrl = project.github_url || (project.url && project.url.includes('github.com') ? project.url : null);
            const demoUrlRaw = project.demo_url || project.live_url || null;
            const demoUrl = demoUrlRaw ? normalizeDemoUrl(demoUrlRaw) : null;
            const hasDetails = project.details || project.technologies || project.features;
            
            // Store URLs as data attributes for click handling
            const redirectUrl = demoUrl || githubUrl || null;
            
            return `
            <div class="project-card ${redirectUrl ? 'project-card-clickable' : ''}" 
                 data-project-id="${escapeHtml(project.name.toLowerCase().replace(/\s+/g, '-'))}"
                 ${redirectUrl ? `data-redirect-url="${escapeHtml(redirectUrl)}"` : ''}>
                <h3>${escapeHtml(project.name)}</h3>
                <p>${escapeHtml(project.desc || 'No description available.')}</p>
                <div class="project-buttons">
                    ${githubUrl ? `
                        <a href="${escapeHtml(githubUrl)}" target="_blank" rel="noopener noreferrer" class="project-btn project-btn-github" onclick="event.stopPropagation();">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                            </svg>
                            GitHub
                        </a>
                    ` : ''}
                    ${demoUrl ? `
                        <a href="${escapeHtml(demoUrl)}" target="_blank" rel="noopener noreferrer" class="project-btn project-btn-demo" onclick="event.stopPropagation();">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                                <polyline points="15 3 21 3 21 9"></polyline>
                                <line x1="10" y1="14" x2="21" y2="3"></line>
                            </svg>
                            Live Demo
                        </a>
                    ` : ''}
                    ${hasDetails ? `
                        <button class="project-btn project-btn-details" data-project='${JSON.stringify(project).replace(/'/g, "&#39;")}' onclick="event.stopPropagation();">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <circle cx="12" cy="12" r="10"></circle>
                                <line x1="12" y1="16" x2="12" y2="12"></line>
                                <line x1="12" y1="8" x2="12.01" y2="8"></line>
                            </svg>
                            Details
                        </button>
                    ` : ''}
                </div>
            </div>
            `;
        }).join('');
        
        // Add event delegation for project card clicks and details buttons
        const handleProjectCardClick = (e) => {
            // Handle details button clicks
            if (e.target.closest('.project-btn-details')) {
                const button = e.target.closest('.project-btn-details');
                const projectData = button.getAttribute('data-project');
                if (projectData) {
                    try {
                        const project = JSON.parse(projectData);
                        showProjectDetails(project);
                    } catch (error) {
                        console.error('Error parsing project data:', error);
                    }
                }
                return;
            }
            
            // Handle project card clicks (redirect to demo or GitHub)
            const projectCard = e.target.closest('.project-card');
            if (projectCard) {
                const redirectUrl = projectCard.getAttribute('data-redirect-url');
                if (redirectUrl) {
                    window.open(redirectUrl, '_blank', 'noopener,noreferrer');
                }
            }
        };
        
        // Remove existing listener if any, then add new one
        projectsGrid.removeEventListener('click', handleProjectCardClick);
        projectsGrid.addEventListener('click', handleProjectCardClick);
    } catch (error) {
        console.error('Error loading projects after all retries:', error);
        const errorMessage = error.message.includes('timeout') 
            ? 'Request timeout: The server took too long to respond after multiple retries. Please check your connection.'
            : `Failed to load projects after ${MAX_RETRIES} attempts. Please check if the backend is running.`;
        projectsGrid.innerHTML = `<p style="text-align: center; color: #f87171; grid-column: 1 / -1;">${errorMessage}</p>`;
    }
}

// Format date to show only date (no time)
function formatDate(dateString) {
    if (!dateString) return '';
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
    } catch (e) {
        return dateString;
    }
}

// Fetch and display blog posts (homepage - only 5 posts)
async function loadBlogPosts(page = 1, limit = 5) {
    const blogList = document.getElementById('hero-blog-list');
    if (!blogList) return;
    
    // Show loading animation
    showLoading(blogList);
    
    try {
        const response = await fetchWithRetry(`${API_BASE_URL}/blog?page=${page}&limit=${limit}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        
        const result = await response.json();
        
        // Handle both old format (array) and new format (object with data and pagination)
        const posts = Array.isArray(result) ? result : (result.data || []);
        const pagination = result.pagination || null;
        
        if (posts.length === 0) {
            blogList.innerHTML = '<p style="color: rgba(255, 255, 255, 0.6); font-size: 0.875rem;">No blog posts available yet.</p>';
            return;
        }
        
        blogList.innerHTML = posts.map(post => `
            ${post.created_at && post.link ? `
                <p style="font-size: 0.875rem; margin: 0; line-height: 1.8; color: #ffffff; word-wrap: break-word; overflow-wrap: break-word;">
                    <span style="color: #a3e635;">•</span> <span style="color: rgba(255, 255, 255, 0.6);">${formatDate(post.created_at)}</span> : <a href="${escapeHtml(post.link)}" target="_blank" rel="noopener noreferrer" style="color: #a3e635; text-decoration: none; transition: opacity 0.3s ease; word-wrap: break-word; overflow-wrap: break-word;" onmouseover="this.style.opacity='0.8';" onmouseout="this.style.opacity='1';">${escapeHtml(post.title)}</a>
                </p>
            ` : post.created_at ? `
                <p style="font-size: 0.875rem; margin: 0; line-height: 1.8; color: #ffffff; word-wrap: break-word; overflow-wrap: break-word;">
                    <span style="color: #a3e635;">•</span> <span style="color: rgba(255, 255, 255, 0.6);">${formatDate(post.created_at)}</span> : <span style="color: #a3e635; word-wrap: break-word; overflow-wrap: break-word;">${escapeHtml(post.title)}</span>
                </p>
            ` : `
                <p style="font-size: 0.875rem; margin: 0; line-height: 1.8; color: #ffffff; word-wrap: break-word; overflow-wrap: break-word;">
                    <span style="color: #a3e635; word-wrap: break-word; overflow-wrap: break-word;">${escapeHtml(post.title)}</span>
                </p>
            `}
        `).join('');
        
        // Add "View All Blogs" link if there are more posts
        const shouldShowLink = (pagination && (pagination.has_next || pagination.total > 5)) || 
                               (!pagination && posts.length >= 5);
        if (shouldShowLink) {
            const viewAllLink = document.createElement('p');
            viewAllLink.style.marginTop = '1rem';
            viewAllLink.style.marginBottom = '0';
            viewAllLink.innerHTML = `
                <a href="/blogs" style="color: #a3e635; text-decoration: none; font-size: 0.875rem; transition: opacity 0.3s ease;" onmouseover="this.style.opacity='0.8';" onmouseout="this.style.opacity='1';">View All Blogs →</a>
            `;
            blogList.appendChild(viewAllLink);
        }
    } catch (error) {
        console.error('Error loading blog posts after all retries:', error);
        const errorMessage = error.message.includes('timeout') 
            ? 'Request timeout: The server took too long to respond after multiple retries. Please check your connection.'
            : `Failed to load blog posts after ${MAX_RETRIES} attempts. Please check if the backend is running.`;
        blogList.innerHTML = `<p style="color: rgba(255, 255, 255, 0.6); font-size: 0.875rem;">${errorMessage}</p>`;
    }
}

// Add pagination controls
function addPaginationControls(pagination, loadFunction) {
    const blogSection = document.getElementById('blog');
    if (!blogSection) return;
    
    // Remove existing pagination if any
    const existingPagination = blogSection.querySelector('.pagination-controls');
    if (existingPagination) {
        existingPagination.remove();
    }
    
    const paginationDiv = document.createElement('div');
    paginationDiv.className = 'pagination-controls';
    paginationDiv.style.cssText = 'display: flex; justify-content: center; align-items: center; gap: 1rem; margin-top: 2rem; flex-wrap: wrap;';
    
    // Previous button
    const prevButton = document.createElement('button');
    prevButton.textContent = '← Previous';
    prevButton.disabled = !pagination.has_previous;
    prevButton.className = 'btn btn-secondary';
    prevButton.style.cssText = 'padding: 0.5rem 1rem; cursor: pointer; opacity: ' + (pagination.has_previous ? '1' : '0.5') + ';';
    if (pagination.has_previous) {
        prevButton.onclick = () => loadFunction(pagination.page - 1, pagination.limit);
    }
    
    // Page info
    const pageInfo = document.createElement('span');
    pageInfo.textContent = `Page ${pagination.page} of ${pagination.total_pages} (${pagination.total} total)`;
    pageInfo.style.cssText = 'color: var(--text-secondary);';
    
    // Next button
    const nextButton = document.createElement('button');
    nextButton.textContent = 'Next →';
    nextButton.disabled = !pagination.has_next;
    nextButton.className = 'btn btn-secondary';
    nextButton.style.cssText = 'padding: 0.5rem 1rem; cursor: pointer; opacity: ' + (pagination.has_next ? '1' : '0.5') + ';';
    if (pagination.has_next) {
        nextButton.onclick = () => loadFunction(pagination.page + 1, pagination.limit);
    }
    
    paginationDiv.appendChild(prevButton);
    paginationDiv.appendChild(pageInfo);
    paginationDiv.appendChild(nextButton);
    
    blogSection.appendChild(paginationDiv);
}

// Handle contact form submission
const contactForm = document.getElementById('contact-form');
const formMessage = document.getElementById('form-message');

contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = {
        name: document.getElementById('name').value.trim(),
        email: document.getElementById('email').value.trim(),
        message: document.getElementById('message').value.trim()
    };
    
    // Validate
    if (!formData.name || !formData.email || !formData.message) {
        showFormMessage('Please fill in all fields.', 'error');
        return;
    }
    
    // Disable submit button
    const submitBtn = contactForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending...';
    
    try {
        const response = await fetchWithRetry(`${API_BASE_URL}/contact`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showFormMessage(data.message || 'Thank you! Your message has been sent.', 'success');
            contactForm.reset();
        } else {
            showFormMessage(data.detail || 'Failed to send message. Please try again.', 'error');
        }
    } catch (error) {
        console.error('Error sending message after all retries:', error);
        const errorMessage = error.message.includes('timeout') 
            ? 'Request timeout: The server took too long to respond after multiple retries. Please check your connection.'
            : `Failed to send message after ${MAX_RETRIES} attempts. Please check if the backend is running.`;
        showFormMessage(errorMessage, 'error');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
    }
});

function showFormMessage(message, type) {
    formMessage.textContent = message;
    formMessage.className = `form-message ${type}`;
    
    // Scroll to message
    formMessage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    
    // Hide after 5 seconds
    setTimeout(() => {
        formMessage.className = 'form-message';
    }, 5000);
}

// Utility function to escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Normalize demo URL - if it's a relative path, prepend current domain
function normalizeDemoUrl(url) {
    if (!url) return null;
    
    // If it's already a full URL, return as is
    if (url.startsWith('http://') || url.startsWith('https://')) {
        return url;
    }
    
    // If it starts with /, it's a relative path on the same domain
    if (url.startsWith('/')) {
        // Check if we're on file:// protocol (local file)
        if (window.location.protocol === 'file:') {
            // For file://, we can't use absolute paths properly
            // Use relative path from current file location
            const currentPath = window.location.pathname;
            const currentDir = currentPath.substring(0, currentPath.lastIndexOf('/') + 1);
            // Remove leading / from url and construct relative path
            return currentDir + url.substring(1);
        }
        // For http/https, prepend origin to get full URL
        // This will create URLs like https://hansraj.me/shorturl
        return window.location.origin + url;
    }
    
    // Otherwise, treat as relative path (no leading /)
    if (window.location.protocol === 'file:') {
        const currentPath = window.location.pathname;
        const currentDir = currentPath.substring(0, currentPath.lastIndexOf('/') + 1);
        return currentDir + url.replace(/^\//, '');
    }
    // For http/https, construct full URL
    return window.location.origin + '/' + url.replace(/^\//, '');
}

// Show project details modal
function showProjectDetails(project) {
    // Create modal if it doesn't exist
    let modal = document.getElementById('project-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'project-modal';
        modal.className = 'project-modal';
        document.body.appendChild(modal);
    }
    
    const githubUrl = project.github_url || (project.url && project.url.includes('github.com') ? project.url : null);
    const demoUrlRaw = project.demo_url || project.live_url || null;
    const demoUrl = demoUrlRaw ? normalizeDemoUrl(demoUrlRaw) : null;
    
    modal.innerHTML = `
        <div class="project-modal-content">
            <button class="project-modal-close" aria-label="Close">&times;</button>
            <h2>${escapeHtml(project.name)}</h2>
            <p class="project-modal-desc">${escapeHtml(project.desc || 'No description available.')}</p>
            
            ${project.details ? `<div class="project-modal-section"><h3>Details</h3><p>${escapeHtml(project.details)}</p></div>` : ''}
            
            ${project.technologies && project.technologies.length > 0 ? `
                <div class="project-modal-section">
                    <h3>Technologies</h3>
                    <div class="project-tech-tags">
                        ${project.technologies.map(tech => `<span class="project-tech-tag">${escapeHtml(tech)}</span>`).join('')}
                    </div>
                </div>
            ` : ''}
            
            ${project.features && project.features.length > 0 ? `
                <div class="project-modal-section">
                    <h3>Features</h3>
                    <ul class="project-features-list">
                        ${project.features.map(feature => `<li>${escapeHtml(feature)}</li>`).join('')}
                    </ul>
                </div>
            ` : ''}
            
            <div class="project-modal-actions">
                ${githubUrl ? `
                    <a href="${escapeHtml(githubUrl)}" target="_blank" rel="noopener noreferrer" class="project-btn project-btn-github">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                        </svg>
                        View on GitHub
                    </a>
                ` : ''}
                ${demoUrl ? `
                    <a href="${escapeHtml(demoUrl)}" target="_blank" rel="noopener noreferrer" class="project-btn project-btn-demo">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                            <polyline points="15 3 21 3 21 9"></polyline>
                            <line x1="10" y1="14" x2="21" y2="3"></line>
                        </svg>
                        Live Demo
                    </a>
                ` : ''}
            </div>
        </div>
    `;
    
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    
    // Close modal handlers
    const closeModal = () => {
        modal.style.display = 'none';
        document.body.style.overflow = '';
    };
    
    modal.querySelector('.project-modal-close').addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });
    
    // Close on Escape key
    const escapeHandler = (e) => {
        if (e.key === 'Escape') {
            closeModal();
            document.removeEventListener('keydown', escapeHandler);
        }
    };
    document.addEventListener('keydown', escapeHandler);
}

// Intersection Observer for fade-in animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe all sections
document.querySelectorAll('section').forEach(section => {
    section.style.opacity = '0';
    section.style.transform = 'translateY(30px)';
    section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(section);
});

// Initialize page based on current page
function initializePage() {
    // Check if we're on the blogs page
    const isBlogsPage = document.getElementById('blogs-container') !== null;
    
    console.log('Initializing page, isBlogsPage:', isBlogsPage);
    
    if (isBlogsPage) {
        // Initialize infinite scroll for blogs page
        console.log('Blogs page detected, initializing infinite scroll');
        initInfiniteScroll();
    } else {
        // Load homepage data
        console.log('Homepage detected, loading projects and blogs');
        loadProjects();
        loadBlogPosts();
    }
}

// Load data on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', async () => {
        await loadNavbar();
        await loadFooter();
        initializePage();
    });
} else {
    // DOM is already loaded, run immediately
    (async () => {
        await loadNavbar();
        await loadFooter();
        initializePage();
    })();
}


async function initInfiniteScroll() {
    // Prevent double initialization
    if (window.infiniteScrollInitialized) {
        console.log('Infinite scroll already initialized, skipping');
        return;
    }
    
    const blogsContainer = document.getElementById('blogs-container');
    if (!blogsContainer) {
        console.error('blogs-container element not found');
        return;
    }
    
    console.log('Initializing infinite scroll for blogs page');
    console.log('API_BASE_URL:', API_BASE_URL);
    
    window.infiniteScrollInitialized = true;
    
    // Reset state
    currentBlogPage = 1;
    isLoadingBlogs = false;
    hasMoreBlogs = true;
    
    // Show initial loading state
    showLoading(blogsContainer);
    
    // Small delay to ensure DOM is ready
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Load initial blogs
    console.log('Calling loadMoreBlogs for initial load...');
    await loadMoreBlogs();
    
    // Set up scroll listener (only once)
    if (!window.blogScrollHandlerAdded) {
        window.addEventListener('scroll', handleBlogScroll);
        window.blogScrollHandlerAdded = true;
        console.log('Scroll handler added');
    }
    
    console.log('Infinite scroll initialized');
}

async function handleBlogScroll() {
    if (isLoadingBlogs || !hasMoreBlogs) return;
    
    const scrollPosition = window.innerHeight + window.scrollY;
    const pageHeight = document.documentElement.scrollHeight;
    const threshold = 200; // Load when 200px from bottom
    
    if (scrollPosition >= pageHeight - threshold) {
        await loadMoreBlogs();
    }
}

async function loadMoreBlogs() {
    console.log('loadMoreBlogs called, isLoadingBlogs:', isLoadingBlogs, 'hasMoreBlogs:', hasMoreBlogs, 'currentBlogPage:', currentBlogPage);
    
    if (isLoadingBlogs) {
        console.log('Already loading blogs, skipping');
        return;
    }
    
    if (!hasMoreBlogs) {
        console.log('No more blogs to load, skipping');
        return;
    }
    
    isLoadingBlogs = true;
    const blogsContainer = document.getElementById('blogs-container');
    const loadingIndicator = document.getElementById('blog-loading');
    const isInitialLoad = currentBlogPage === 1;
    
    console.log('Starting to load blogs, isInitialLoad:', isInitialLoad);
    
    // Show loading indicator for subsequent loads (not initial)
    if (loadingIndicator && !isInitialLoad) {
        loadingIndicator.style.display = 'block';
    }
    
    try {
        console.log(`Loading blogs page ${currentBlogPage}...`);
        const response = await fetchWithRetry(`${API_BASE_URL}/blog?page=${currentBlogPage}&limit=20`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        
        console.log('Blogs API response received:', response.status);
        const result = await response.json();
        console.log('Blogs data:', result);
        const posts = Array.isArray(result) ? result : (result.data || []);
        const pagination = result.pagination || null;
        const totalCount = result.count || result.pagination?.total || 0;
        
        // Update blog count display on first load
        if (isInitialLoad) {
            const countElement = document.getElementById('blog-count');
            if (countElement) {
                if (totalCount > 0) {
                    countElement.textContent = `(${totalCount} ${totalCount === 1 ? 'post' : 'posts'})`;
                } else {
                    countElement.textContent = '(0 posts)';
                }
            }
        }
        
        if (posts.length === 0 && currentBlogPage === 1) {
            blogsContainer.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 3rem;">No blog posts available yet.</p>';
            const countElement = document.getElementById('blog-count');
            if (countElement) {
                countElement.textContent = '(0 posts)';
            }
            hasMoreBlogs = false;
            return;
        }
        
        if (posts.length > 0) {
            const postsHTML = posts.map(post => `
                ${post.created_at && post.link ? `
                    <p style="font-size: 0.875rem; margin: 0; line-height: 1.6;">
                        <span style="color: #a3e635;">•</span> <span style="color: var(--text-secondary);">${formatDate(post.created_at)}</span> : <a href="${escapeHtml(post.link)}" target="_blank" rel="noopener noreferrer" style="color: #a3e635; text-decoration: none; transition: opacity 0.3s ease;" onmouseover="this.style.opacity='0.8';" onmouseout="this.style.opacity='1';">${escapeHtml(post.title)}</a>
                    </p>
                ` : post.created_at ? `
                    <p style="font-size: 0.875rem; margin: 0; line-height: 1.6;">
                        <span style="color: #a3e635;">•</span> <span style="color: var(--text-secondary);">${formatDate(post.created_at)}</span> : <span style="color: #a3e635;">${escapeHtml(post.title)}</span>
                    </p>
                ` : `
                    <p style="font-size: 0.875rem; margin: 0; line-height: 1.6;">
                        <span style="color: #a3e635;">•</span> <span style="color: #a3e635;">${escapeHtml(post.title)}</span>
                    </p>
                `}
            `).join('');
            
            // Clear initial loading state on first load, otherwise append
            if (isInitialLoad) {
                blogsContainer.innerHTML = `<div style="max-width: 800px; margin: 0 auto;">${postsHTML}</div>`;
            } else {
                const container = blogsContainer.querySelector('div');
                if (container) {
                    container.insertAdjacentHTML('beforeend', postsHTML);
                } else {
                    blogsContainer.innerHTML = `<div style="max-width: 800px; margin: 0 auto;">${postsHTML}</div>`;
                }
            }
            
            currentBlogPage++;
            
            // Check if there are more posts
            if (pagination) {
                hasMoreBlogs = pagination.has_next;
            } else {
                hasMoreBlogs = posts.length === 20; // Match the limit used in API call
            }
        } else {
            hasMoreBlogs = false;
        }
        
        if (!hasMoreBlogs && loadingIndicator) {
            loadingIndicator.style.display = 'none';
            const endMessage = document.createElement('p');
            endMessage.textContent = 'No more blog posts to load.';
            endMessage.style.cssText = 'text-align: center; color: var(--text-secondary); padding: 2rem;';
            blogsContainer.appendChild(endMessage);
        }
    } catch (error) {
        console.error('Error loading more blogs:', error);
        hasMoreBlogs = false;
        const errorMessage = error.message.includes('timeout') 
            ? 'Request timeout: The server took too long to respond after multiple retries. Please check your connection.'
            : `Failed to load blog posts after ${MAX_RETRIES} attempts. Please check if the backend is running.`;
        
        if (isInitialLoad) {
            blogsContainer.innerHTML = `<p style="text-align: center; color: #f87171; padding: 3rem;">${errorMessage}</p>`;
        } else if (loadingIndicator) {
            loadingIndicator.style.display = 'none';
        }
    } finally {
        isLoadingBlogs = false;
        if (loadingIndicator && hasMoreBlogs && !isInitialLoad) {
            loadingIndicator.style.display = 'none';
        }
    }
}

