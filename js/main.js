/**
 * Mobile menu functionality for Dr. Etain Kiely's website
 */

document.addEventListener('DOMContentLoaded', function() {
    // Mobile menu toggle
    const mobileMenuButton = document.querySelector('.mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    
    if (mobileMenuButton && mobileMenu) {
        // Initialize mobile menu (closed by default)
        mobileMenu.style.display = 'none';
        
        // Toggle mobile menu function
        window.toggleMobileMenu = function() {
            if (mobileMenu.style.display === 'block') {
                mobileMenu.style.display = 'none';
            } else {
                mobileMenu.style.display = 'block';
            }
        };
        
        // Handle window resize events
        window.addEventListener('resize', function() {
            if (window.innerWidth > 768) {
                document.querySelector('.nav-menu').style.display = 'flex';
                document.querySelector('.mobile-menu-button').style.display = 'none';
                mobileMenu.style.display = 'none';
            } else {
                document.querySelector('.nav-menu').style.display = 'none';
                document.querySelector('.mobile-menu-button').style.display = 'block';
            }
        });
        
        // Initialize on page load
        if (window.innerWidth <= 768) {
            document.querySelector('.nav-menu').style.display = 'none';
            document.querySelector('.mobile-menu-button').style.display = 'block';
        }
    }
    
    // Add smooth scrolling for anchor links
    const anchorLinks = document.querySelectorAll('a[href^="#"]');
    anchorLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            
            if (targetId !== '#') {
                e.preventDefault();
                const targetElement = document.querySelector(targetId);
                
                if (targetElement) {
                    targetElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                    
                    // Close mobile menu if open
                    if (mobileMenu && mobileMenu.style.display === 'block') {
                        mobileMenu.style.display = 'none';
                    }
                }
            }
        });
    });
    
    // File Upload Functionality
    initFileUpload();
});

/**
 * File Upload System
 */
let uploadedFiles = [];

/**
 * Escape HTML to prevent XSS attacks
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function initFileUpload() {
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');
    
    if (!uploadArea || !fileInput) return;
    
    // Click to upload
    uploadArea.addEventListener('click', function(e) {
        if (e.target.tagName !== 'BUTTON') {
            fileInput.click();
        }
    });
    
    // File input change
    fileInput.addEventListener('change', function(e) {
        handleFiles(e.target.files);
    });
    
    // Drag and drop events
    uploadArea.addEventListener('dragover', function(e) {
        e.preventDefault();
        e.stopPropagation();
        uploadArea.classList.add('drag-over');
    });
    
    uploadArea.addEventListener('dragleave', function(e) {
        e.preventDefault();
        e.stopPropagation();
        uploadArea.classList.remove('drag-over');
    });
    
    uploadArea.addEventListener('drop', function(e) {
        e.preventDefault();
        e.stopPropagation();
        uploadArea.classList.remove('drag-over');
        
        const files = e.dataTransfer.files;
        handleFiles(files);
    });
}

function handleFiles(files) {
    const previewArea = document.getElementById('previewArea');
    const previewContainer = document.getElementById('previewContainer');
    
    if (files.length === 0) return;
    
    // Convert FileList to Array and add to uploadedFiles
    Array.from(files).forEach(file => {
        uploadedFiles.push(file);
        createPreview(file);
    });
    
    // Show preview area
    if (previewArea) {
        previewArea.style.display = 'block';
    }
}

function createPreview(file) {
    const previewContainer = document.getElementById('previewContainer');
    const previewItem = document.createElement('div');
    previewItem.className = 'preview-item';
    
    const fileIndex = uploadedFiles.length - 1;
    const escapedFileName = escapeHtml(file.name);
    
    // Check if file is an image
    if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = function(e) {
            previewItem.innerHTML = `
                <button class="remove-file-btn" onclick="removeFile(${fileIndex})">
                    <i class="fas fa-times"></i>
                </button>
                <img src="${e.target.result}" class="preview-image" alt="${escapedFileName}">
                <div class="preview-file-info">
                    <div class="preview-file-name">${escapedFileName}</div>
                    <div class="preview-file-size">${formatFileSize(file.size)}</div>
                </div>
            `;
        };
        reader.readAsDataURL(file);
    } else {
        // For non-image files, show an icon
        const iconClass = getFileIcon(file.name);
        previewItem.innerHTML = `
            <button class="remove-file-btn" onclick="removeFile(${fileIndex})">
                <i class="fas fa-times"></i>
            </button>
            <div class="preview-file-info">
                <div class="preview-file-icon">
                    <i class="fas ${iconClass}"></i>
                </div>
                <div class="preview-file-name">${escapedFileName}</div>
                <div class="preview-file-size">${formatFileSize(file.size)}</div>
            </div>
        `;
    }
    
    previewContainer.appendChild(previewItem);
}

function removeFile(index) {
    uploadedFiles.splice(index, 1);
    renderPreviews();
}

function clearUploads() {
    uploadedFiles = [];
    const previewArea = document.getElementById('previewArea');
    const previewContainer = document.getElementById('previewContainer');
    
    if (previewContainer) {
        previewContainer.innerHTML = '';
    }
    
    if (previewArea) {
        previewArea.style.display = 'none';
    }
    
    // Clear file input
    const fileInput = document.getElementById('fileInput');
    if (fileInput) {
        fileInput.value = '';
    }
}

function renderPreviews() {
    const previewContainer = document.getElementById('previewContainer');
    const previewArea = document.getElementById('previewArea');
    
    if (!previewContainer) return;
    
    previewContainer.innerHTML = '';
    
    if (uploadedFiles.length === 0) {
        if (previewArea) {
            previewArea.style.display = 'none';
        }
        return;
    }
    
    uploadedFiles.forEach((file, index) => {
        const previewItem = document.createElement('div');
        previewItem.className = 'preview-item';
        const escapedFileName = escapeHtml(file.name);
        
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = function(e) {
                previewItem.innerHTML = `
                    <button class="remove-file-btn" onclick="removeFile(${index})">
                        <i class="fas fa-times"></i>
                    </button>
                    <img src="${e.target.result}" class="preview-image" alt="${escapedFileName}">
                    <div class="preview-file-info">
                        <div class="preview-file-name">${escapedFileName}</div>
                        <div class="preview-file-size">${formatFileSize(file.size)}</div>
                    </div>
                `;
            };
            reader.readAsDataURL(file);
        } else {
            const iconClass = getFileIcon(file.name);
            previewItem.innerHTML = `
                <button class="remove-file-btn" onclick="removeFile(${index})">
                    <i class="fas fa-times"></i>
                </button>
                <div class="preview-file-info">
                    <div class="preview-file-icon">
                        <i class="fas ${iconClass}"></i>
                    </div>
                    <div class="preview-file-name">${escapedFileName}</div>
                    <div class="preview-file-size">${formatFileSize(file.size)}</div>
                </div>
            `;
        }
        
        previewContainer.appendChild(previewItem);
    });
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

function getFileIcon(filename) {
    const ext = filename.split('.').pop().toLowerCase();
    
    const iconMap = {
        'pdf': 'fa-file-pdf',
        'doc': 'fa-file-word',
        'docx': 'fa-file-word',
        'txt': 'fa-file-alt',
        'xls': 'fa-file-excel',
        'xlsx': 'fa-file-excel',
        'ppt': 'fa-file-powerpoint',
        'pptx': 'fa-file-powerpoint',
        'zip': 'fa-file-archive',
        'rar': 'fa-file-archive'
    };
    
    return iconMap[ext] || 'fa-file';
}

// Make functions globally accessible
window.clearUploads = clearUploads;
window.removeFile = removeFile;

