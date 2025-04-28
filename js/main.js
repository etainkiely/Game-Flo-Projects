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
});

