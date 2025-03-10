//sidebar.js
class SidebarManager {
    constructor() {
        this.sidebarRef = db.ref('education');
        this.initializeFirebaseListeners();
        this.onSubjectClick = null;
        this.sidebar = null; // Store the sidebar element reference
        this.initializeKeyboardShortcuts(); // Initialize keyboard shortcuts

    }

    initializeKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.shiftKey && e.key === 'S') {
                e.preventDefault(); // Prevent the default behavior of the shortcut
                this.toggleSidebar();
            }
            else if (e.ctrlKey && e.shiftKey && e.key === 's') {
                e.preventDefault(); // Prevent the default behavior of the shortcut
                this.toggleSidebar();
            }
        });
    }

    toggleSidebar() {
        if (!this.sidebar) {
            this.sidebar = this.initialize();
            document.body.appendChild(this.sidebar);
        } else {
            this.sidebar.style.display = this.sidebar.style.display === 'none' ? 'block' : 'none';
        }
    }

    initializeFirebaseListeners() {
        this.sidebarRef.on('value', (snapshot) => {
            const data = snapshot.val();
            if (data) {
                this.updateSidebar(data);
            }
        });
    }

    initialize() {
        const existingSidebar = document.querySelector('.hb-subjects-sidebar');
        if (existingSidebar) {
            this.sidebar = existingSidebar; 
            return existingSidebar;
        }

        const sidebar = document.createElement('div');
        sidebar.className = 'hb-subjects-sidebar';

        const style = document.createElement('style');
        

        sidebar.appendChild(this.createSemesterSection());
        sidebar.appendChild(this.createAfcatSection());
        this.addEventListeners(sidebar);
        
        this.sidebar = sidebar; 
        return sidebar;
    }

    createSemesterSection() {
        const section = document.createElement('div');
        section.className = 'hb-sidebar-section';
        
        section.innerHTML = `
            <div class="hb-sidebar-header" data-section="bca">
                <span class="hb-sidebar-icon">🎓💻</span>
                <h3>Amity Online BCA</h3>
                <span class="hb-expand-icon">▾</span>
            </div>
            <div class="hb-sidebar-content" style="display: block;">
                <div id="hb-semester-list"></div>
            </div>
        `;
        
        return section;
    }

    createAfcatSection() {
        const section = document.createElement('div');
        section.className = 'hb-sidebar-section';
        
        section.innerHTML = `
            <div class="hb-sidebar-header" data-section="afcat">
                <span class="hb-sidebar-icon">📚</span>
                <h3>AFCAT</h3>
                <span class="hb-expand-icon">▾</span>
            </div>
            <div class="hb-sidebar-content" style="display: block;">
                <div id="hb-afcat-semester-list"></div>
            </div>
        `;
        
        return section;
    }

    addEventListeners(sidebar) {
        let pressTimer;
        let clickCount = 0;
        let clickTimer;
        let isLongPress = false;
    
        const handleLongPressOrTripleClick = (element) => {
            const sectionType = element.closest('[data-section]')?.dataset.section;
            const semesterId = element.closest('[data-semester-id]')?.dataset.semesterId;
            const parentSection = element.closest('.hb-sidebar-section');
            const actualSectionType = parentSection?.querySelector('.hb-sidebar-header')?.dataset.section;
    
            if (element.classList.contains('hb-sidebar-header')) {
                this.showAddSemesterModal(actualSectionType || sectionType);
            } else if (element.classList.contains('hb-semester-header')) {
                this.showAddSubjectModal(actualSectionType || sectionType, semesterId);
            }
        };
    
        sidebar.addEventListener('mousedown', (e) => {
            const target = e.target.closest('.hb-sidebar-header, .hb-semester-header');
            if (!target) return;
    
            isLongPress = false;
            pressTimer = setTimeout(() => {
                isLongPress = true;
                handleLongPressOrTripleClick(target);
            }, 2000);
        });
    
        sidebar.addEventListener('mouseup', () => {
            clearTimeout(pressTimer);
        });
    
        sidebar.addEventListener('mouseleave', () => {
            clearTimeout(pressTimer);
        });
    
        // Use event delegation for all clicks inside the sidebar
        sidebar.addEventListener('click', (e) => {
            if (isLongPress) {
                isLongPress = false;
                return;
            }
    
            // Handle subject clicks - THIS IS THE KEY FIX: Improve the selector to catch clicks on any part of the subject item
            const subjectItem = e.target.closest('.hb-sidebar-subject');
            if (subjectItem) {
                console.log("Subject clicked in event listener", subjectItem);
                
                // Add active class to highlight the selected subject
                const allSubjects = document.querySelectorAll('.hb-sidebar-subject');
                allSubjects.forEach(item => item.classList.remove('active-subject'));
                subjectItem.classList.add('active-subject');
                
                const subjectId = subjectItem.dataset.subjectId;
                const subjectName = subjectItem.querySelector('.hb-subject-name').textContent;
                const semesterItem = subjectItem.closest('.hb-semester-item');
                
                if (!semesterItem) {
                    console.error("Could not find parent semester item");
                    return;
                }
                
                const semesterId = semesterItem.dataset.semesterId;
                const sectionType = semesterItem.closest('.hb-sidebar-section')
                    .querySelector('.hb-sidebar-header').dataset.section;
                
                // Make sure the subject list is visible
                const subjectsList = subjectItem.closest('.hb-subjects-list');
                if (subjectsList) {
                    subjectsList.style.display = 'block';
                }
                
                // Call the handler if it exists
                if (this.onSubjectClick) {
                    console.log("Calling onSubjectClick with:", sectionType, semesterId, subjectId, subjectName);
                    this.onSubjectClick(sectionType, semesterId, subjectId, subjectName);
                } else {
                    console.error("onSubjectClick handler is not set");
                }
                return;
            }
    
            // Handle headers (expand/collapse)
            const target = e.target.closest('.hb-sidebar-header, .hb-semester-header');
            if (!target) return;
    
            clickCount++;
            if (clickCount === 1) {
                clickTimer = setTimeout(() => {
                    if (clickCount === 1) {
                        this.handleSingleClick(target);
                    }
                    clickCount = 0;
                }, 300);
            } else if (clickCount === 3) {
                clearTimeout(clickTimer);
                clickCount = 0;
                handleLongPressOrTripleClick(target);
            }
        });
    }
    
    handleSingleClick(target) {
        const content = target.nextElementSibling;
        const icon = target.querySelector('.hb-expand-icon');
        if (content && icon) {
            const isCollapsed = content.style.display === 'none';
            content.style.display = isCollapsed ? 'block' : 'none';
            icon.textContent = isCollapsed ? '▴' : '▾';
        }
    }
    
    showAddSemesterModal(sectionType) {
        const mainContent = document.querySelector('.hb-subjects-sidebar');
        mainContent.classList.add('blur-background');
        
        const modal = document.createElement('div');
        modal.className = 'hb-sidebar-modal';
        
        modal.innerHTML = `
            <div class="hb-sidebar-modal-content">
                <h2 class="hb-sidebar-modal-title">Add New Semester</h2>
                <input type="text" id="hb-item-name" class="hb-sidebar-modal-input" 
                    placeholder="Enter semester name">
                <button id="hb-save-item" class="hb-sidebar-modal-button">Save</button>
                <button id="hb-cancel-modal" class="hb-sidebar-modal-button hb-sidebar-modal-button--cancel">Cancel</button>
            </div>
        `;

        document.body.appendChild(modal);

        document.getElementById('hb-save-item').addEventListener('click', () => {
            const name = document.getElementById('hb-item-name').value;
            if (name) {
                if (sectionType === 'afcat') {
                    this.addAfcatSemester(name);
                } else if (sectionType === 'bca') {
                    this.addBcaSemester(name);
                }
                this.closeModal(modal, mainContent);
            }
        });

        document.getElementById('hb-cancel-modal').addEventListener('click', () => {
            this.closeModal(modal, mainContent);
        });
    }

    showAddSubjectModal(sectionType, semesterId) {
        if (!semesterId) {
            console.error('No semester ID provided for adding subject');
            return;
        }

        const mainContent = document.querySelector('.hb-subjects-sidebar');
        mainContent.classList.add('blur-background');
        
        const modal = document.createElement('div');
        modal.className = 'hb-sidebar-modal';
        
        // Store the section type and semester ID as data attributes
        modal.dataset.sectionType = sectionType;
        modal.dataset.semesterId = semesterId;

        modal.innerHTML = `
            <div class="hb-sidebar-modal-content">
                <h2 class="hb-sidebar-modal-title">Add New Subject</h2>
                <input type="text" id="hb-subject-name" class="hb-sidebar-modal-input" placeholder="Enter subject name">
                <button id="hb-save-subject" class="hb-sidebar-modal-button">Save</button>
                <button id="hb-cancel-modal" class="hb-sidebar-modal-button hb-sidebar-modal-button--cancel">Cancel</button>
            </div>
        `;

        document.body.appendChild(modal);

        document.getElementById('hb-save-subject').addEventListener('click', () => {
            const name = document.getElementById('hb-subject-name').value;
            const modalElement = document.querySelector('.hb-sidebar-modal');
            const actualSectionType = modalElement.dataset.sectionType;
            const actualSemesterId = modalElement.dataset.semesterId;

            if (name && actualSemesterId) {
                if (actualSectionType === 'afcat') {
                    this.addAfcatSubject(actualSemesterId, name);
                } else if (actualSectionType === 'bca') {
                    this.addBcaSubject(actualSemesterId, name);
                }
                this.closeModal(modal, mainContent);
            }
        });

        document.getElementById('hb-cancel-modal').addEventListener('click', () => {
            this.closeModal(modal, mainContent);
        });
    }

    closeModal(modal, mainContent) {
        mainContent.classList.remove('blur-background');
        document.body.removeChild(modal);
    }

    // Database Operations
    addBcaSemester(name) {
        const newSemesterRef = this.sidebarRef.child('bca/semesters').push();
        newSemesterRef.set({
            name: name,
            order: Date.now(),
            subjects: {}
        });
    }

    addBcaSubject(semesterId, name) {
        const newSubjectRef = this.sidebarRef.child(`bca/semesters/${semesterId}/subjects`).push();
        newSubjectRef.set({
            name: name,
            order: Date.now(),
            topics: {},
            resources: {},
            notes: {} // Added for notes
        });
    }

    addAfcatSemester(name) {
        const newSemesterRef = this.sidebarRef.child('afcat/semesters').push();
        newSemesterRef.set({
            name: name,
            order: Date.now(),
            subjects: {}
        });
    }

    addAfcatSubject(semesterId, name) {
        const newSubjectRef = this.sidebarRef.child(`afcat/semesters/${semesterId}/subjects`).push();
        newSubjectRef.set({
            name: name,
            order: Date.now(),
            topics: {},
            resources: {},
            notes: {} // Added for notes
        });
    }

    updateSidebar(data) {
        // Update BCA section
        const semesterList = document.getElementById('hb-semester-list');
        if (semesterList && data.bca?.semesters) {
            const sortedSemesters = Object.entries(data.bca.semesters)
                .sort(([,a], [,b]) => (a.order || 0) - (b.order || 0));
    
            semesterList.innerHTML = sortedSemesters.map(([key, semester]) => `
                <div class="hb-semester-item" data-semester-id="${key}">
                    <div class="hb-semester-header">
                        <span class="hb-semester-name">${semester.name}</span>
                        <span class="hb-expand-icon">▾</span>
                    </div>
                    <ul class="hb-subjects-list" style="display: block;">
                        ${Object.entries(semester.subjects || {})
                            .sort(([,a], [,b]) => (a.order || 0) - (b.order || 0))
                            .map(([subKey, subject]) => `
                                <li class="hb-sidebar-subject" data-subject-id="${subKey}">
                                    <div class="hb-subject-header">
                                        <span class="hb-subject-name">${subject.name}</span>
                                    </div>
                                </li>
                            `).join('')}
                    </ul>
                </div>
            `).join('');
        }
    
        // Update AFCAT section
        const afcatSemesterList = document.getElementById('hb-afcat-semester-list');
        if (afcatSemesterList && data.afcat?.semesters) {
            const sortedSemesters = Object.entries(data.afcat.semesters)
                .sort(([,a], [,b]) => (a.order || 0) - (b.order || 0));
    
            afcatSemesterList.innerHTML = sortedSemesters.map(([key, semester]) => `
                <div class="hb-semester-item" data-semester-id="${key}">
                    <div class="hb-semester-header">
                        <span class="hb-semester-name">${semester.name}</span>
                        <span class="hb-expand-icon">▾</span>
                    </div>
                    <ul class="hb-subjects-list" style="display: block;">
                        ${Object.entries(semester.subjects || {})
                            .sort(([,a], [,b]) => (a.order || 0) - (b.order || 0))
                            .map(([subKey, subject]) => `
                                <li class="hb-sidebar-subject" data-subject-id="${subKey}">
                                    <div class="hb-subject-header">
                                        <span class="hb-subject-name">${subject.name}</span>
                                    </div>
                                </li>
                            `).join('')}
                    </ul>
                </div>
            `).join('');
        }
        
        // After rendering, reattach subject click handlers to ensure they work
        this.attachSubjectClickHandlers();
    }
    
    // NEW FUNCTION: Explicitly attach click handlers after sidebar is updated
   // Updated attachSubjectClickHandlers function
attachSubjectClickHandlers() {
    const subjects = document.querySelectorAll('.hb-sidebar-subject');
    
    subjects.forEach(subject => {
        // First remove any existing click handlers to prevent duplicates
        subject.removeEventListener('click', this.subjectClickHandler);
        
        // Create a bound handler function
        this.subjectClickHandler = (e) => {
            e.stopPropagation(); // Prevent event bubbling
            
            // Add active class
            document.querySelectorAll('.hb-sidebar-subject').forEach(item => {
                item.classList.remove('active-subject');
            });
            subject.classList.add('active-subject');
            
            // Get necessary data
            const subjectId = subject.dataset.subjectId;
            const subjectName = subject.querySelector('.hb-subject-name').textContent;
            const semesterItem = subject.closest('.hb-semester-item');
            
            if (!semesterItem) {
                console.error("Could not find parent semester item");
                return;
            }
            
            const semesterId = semesterItem.dataset.semesterId;
            const sectionType = semesterItem.closest('.hb-sidebar-section')
                .querySelector('.hb-sidebar-header').dataset.section;
            
            console.log("Direct subject click:", sectionType, semesterId, subjectId, subjectName);
            
            // Call the handler
            if (this.onSubjectClick) {
                this.onSubjectClick(sectionType, semesterId, subjectId, subjectName);
            } else {
                console.error("Subject click handler is not set");
            }
        };
        
        // Add the click handler
        subject.addEventListener('click', this.subjectClickHandler);
    });
}
setSubjectClickHandler(callback) {
    this.onSubjectClick = (sectionType, semesterId, subjectId, subjectName) => {
        // Hide the unit notes section when a new subject is selected
        const unitNotesSection = document.getElementById('unit-notes-section');
        if (unitNotesSection) {
            unitNotesSection.style.display = 'none';
        }
        
        // Call the original callback
        callback(sectionType, semesterId, subjectId, subjectName);
    };
    
    // Immediately attach to any existing subjects
    if (callback) {
        this.attachSubjectClickHandlers();
    }
}
}