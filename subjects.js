// subject.js
class SubjectManager {
    constructor() {
        this.container = null;
        this.sidebarManager = new SidebarManager();
        this.notesManager = new NotesManager();
        this.isSidebarCollapsed = false; // Track sidebar state
    }

    initialize() {
        // Create main container
        this.container = document.createElement('div');
        this.container.className = 'subjects-container';
    
        // Add CSS for layout
        this.addStyles(); // This method needs to be defined
    
        // Initialize sidebar
        const sidebar = this.sidebarManager.initialize();
        
        // Initialize notes content area
        const notesSection = this.notesManager.initialize();
        
        // Create content container
        const content = document.createElement('div');
        content.className = 'subject-content';
        content.appendChild(notesSection);
    
        // Append to container
        this.container.appendChild(sidebar);
        this.container.appendChild(content);
    
        // Set up the sidebar click handler
        this.sidebarManager.setSubjectClickHandler((sectionType, semesterId, subjectId, subjectName) => {
            console.log("Subject clicked in SubjectManager:", sectionType, semesterId, subjectId, subjectName);
            
            // Hide the unit notes section when a new subject is selected
            const unitNotesSection = document.getElementById('unit-notes-section');
            if (unitNotesSection) {
                unitNotesSection.style.display = 'none';
            }
            
            this.notesManager.setSubject(sectionType, semesterId, subjectId, subjectName);
            
            // Collapse the sidebar when a subject is clicked
            this.toggleSidebar(true); // Collapse sidebar
        });
    
        // Add a button to toggle the sidebar
        this.addSidebarToggleButton();
    
        return this.container;
    }
    
    addStyles() {
        // Create a style element
        const styleElement = document.createElement('style');
        styleElement.textContent = `
            .subjects-container {
                display: flex;
                width: 100%;
                height: 100%;
                position: relative;
            }
            .subject-content {
                flex: 1;
                padding: 20px;
                transition: margin-left 0.3s ease;
            }
            .sidebar-collapsed .subject-content {
                margin-left: 0;
            }
            .sidebar-toggle-btn {
                position: absolute;
                top: 10px;
                left: 10px;
                z-index: 1000;
                background-color: #007bff;
                color: white;
                border: none;
                padding: 10px;
                cursor: pointer;
                border-radius: 5px;
            }
            .sidebar-collapsed .sidebar-toggle-btn {
                left: 0;
            }
        `;
        document.head.appendChild(styleElement);
    }
    addSidebarToggleButton() {
        // Create toggle button element
        const toggleBtn = document.createElement('button');
        toggleBtn.className = 'sidebar-toggle-btn';
        toggleBtn.id = 'sidebar-toggle';
        toggleBtn.innerHTML = '☰';
        toggleBtn.addEventListener('click', () => this.toggleSidebar());
        
        // Add styles for the toggle button
        const styleElement = document.createElement('style');
        styleElement.textContent = `
            .sidebar-toggle-btn {
                background-color: #2d325a;
                color: #8b8ff8;
                border: none;
                padding: 8px;
                top:16px;
                cursor: pointer;
                border-radius: 8px;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
                transition: background-color 0.3s ease;
                font-size: 18px;
                display: flex;
                align-items: center;
                justify-content: center;
                width: 36px;
                height: 36px;
                margin-right: 10px;
            }
            
            .sidebar-toggle-btn:hover {
                background-color: #373d6d;
            }
        `;
        document.head.appendChild(styleElement);
        
        // Find the main header (where EduHub is located)
        const mainHeader = document.querySelector('header') || 
                          document.querySelector('.header') ||
                          document.querySelector('nav');
        
        if (mainHeader) {
            // Add the button to the header (before the EduHub logo)
            mainHeader.insertBefore(toggleBtn, mainHeader.firstChild);
            
            // Function to check if we're in the Subjects section
            const updateButtonVisibility = () => {
                // Methods to check if we're in the Subjects section
                // 1. Check URL
                const isSubjectUrl = window.location.href.toLowerCase().includes('/subjects');
                
                // 2. Check active nav item
                const subjectsNavItem = Array.from(document.querySelectorAll('a, button, .nav-item')).find(
                    el => el.textContent.includes('Subject') && 
                         (el.classList.contains('active') || 
                          el.getAttribute('aria-selected') === 'true')
                );
                
                // 3. Check if the Subjects content is visible
                const subjectsContent = document.getElementById('subjects') || 
                                       document.querySelector('.subjects-section');
                const isSubjectsVisible = subjectsContent && 
                                         window.getComputedStyle(subjectsContent).display !== 'none';
                
                // Show button only in Subjects section
                if (isSubjectUrl || subjectsNavItem || isSubjectsVisible) {
                    toggleBtn.style.display = 'flex';
                } else {
                    toggleBtn.style.display = 'none';
                }
            };
            
            // Initial check
            updateButtonVisibility();
            
            // Listen for navigation changes
            const navLinks = document.querySelectorAll('nav a, .nav-item');
            navLinks.forEach(link => {
                link.addEventListener('click', () => {
                    // Small delay to allow for page/view change
                    setTimeout(updateButtonVisibility, 100);
                });
            });
            
            // Also listen for URL changes (for SPAs)
            let lastUrl = window.location.href;
            setInterval(() => {
                if (lastUrl !== window.location.href) {
                    lastUrl = window.location.href;
                    updateButtonVisibility();
                }
            }, 500);
        }
    }
    
    toggleSidebar(collapse = null) {
        if (collapse !== null) {
            this.isSidebarCollapsed = collapse;
        } else {
            this.isSidebarCollapsed = !this.isSidebarCollapsed;
        }
        
        const sidebar = this.container.querySelector('.hb-subjects-sidebar');
        const content = this.container.querySelector('.subject-content');
        const toggleBtn = document.querySelector('.sidebar-toggle-btn');
        
        if (this.isSidebarCollapsed) {
            sidebar.style.display = 'none';
            content.style.marginLeft = '0';
            this.container.classList.add('sidebar-collapsed');
            toggleBtn.innerHTML = '☰';
        } else {
            sidebar.style.display = 'block';
            content.style.marginLeft = '250px'; 
            this.container.classList.remove('sidebar-collapsed');
            toggleBtn.innerHTML = '✕';
        }
    }
    attachToDOM() {
        const subjectsSection = document.getElementById('subjects');
        if (subjectsSection) {
            subjectsSection.appendChild(this.container);
        } else {
            // Fallback if the subjects section doesn't exist
            const mainContainer = document.querySelector('main');
            if (mainContainer) {
                mainContainer.appendChild(this.container);
            } else {
                document.body.appendChild(this.container);
            }
        }
    }
}
 //Fix the initialization script
document.addEventListener('DOMContentLoaded', () => {
    const subjectManager = new SubjectManager();
    subjectManager.initialize(); // No need to store the container separately
    subjectManager.attachToDOM();
});