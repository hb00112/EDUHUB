class NotesManager {
    constructor() {
        this.dbRef = db.ref('education');
        this.currentSubject = null;
        this.currentModule = null;
        this.modules = [];
        this.notes = [];
        this.unitNotesManager = null; // New property
    }
    
    // Modify the initialize method to include the unit notes section
    initialize() {
        const notesSection = document.createElement('div');
        notesSection.className = 'notes-content';
        notesSection.id = 'subject-notes-section';
        
        notesSection.innerHTML = `
        <div class="notes-header">
            <h2 id="subject-notes-title">Modules</h2>
            <div class="notes-search">
                <input type="text" placeholder="Search modules..." class="search-input">
                <button class="search-btn"><span class="search-icon">🔍</span></button>
            </div>
        </div> 
        
        <div id="module-welcome" class="module-welcome-container">
            <div class="welcome-content">
                <h3>Welcome to Module Notes Section</h3>
                <p>Select a subject from the sidebar to view your modules or create new ones.</p>
                <div class="welcome-illustration">
                    <svg width="300" height="200" viewBox="0 0 300 200" xmlns="http://www.w3.org/2000/svg">
                        <rect x="50" y="30" width="200" height="140" rx="10" fill="#3a4b5c" />
                        <rect x="70" y="50" width="160" height="20" rx="5" fill="#6c8eaf" />
                        <rect x="70" y="80" width="160" height="10" rx="5" fill="#6c8eaf" />
                        <rect x="70" y="100" width="120" height="10" rx="5" fill="#6c8eaf" />
                        <rect x="70" y="120" width="140" height="10" rx="5" fill="#6c8eaf" />
                        <rect x="70" y="140" width="80" height="10" rx="5" fill="#6c8eaf" />
                    </svg>
                </div>
            </div>
        </div>
        
        <!-- Module Grid (shown when a subject is selected) -->
        <div id="modules-grid" class="modules-grid" style="display: none;">
            <!-- Module cards will be displayed here -->
        </div>
        
        <!-- Module Creator Modal -->
        <div id="module-creator" class="module-creator-container" style="display: none;">
            <div class="module-creator-content">
                <div class="module-creator-header">
                    <h3>Create New Module</h3>
                    <button id="close-module-creator-btn" class="close-btn">×</button>
                </div>
                <div class="module-creator-body">
                    <div class="form-group">
                        <label for="module-number-input">Module Number:</label>
                        <input type="number" id="module-number-input" placeholder="e.g. 1" min="1" class="module-input">
                    </div>
                    <div class="form-group">
                        <label for="module-name-input">Module Name:</label>
                        <input type="text" id="module-name-input" placeholder="e.g. Introduction to Topic" class="module-input">
                    </div>
                    <div class="module-creator-actions">
                        <button id="save-module-btn" class="action-btn save-btn">Save Module</button>
                        <button id="cancel-module-btn" class="action-btn cancel-btn">Cancel</button>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Notes View (shown when a module is selected) -->
        <div id="notes-container" class="notes-container" style="display: none;">
            <div class="notes-actions" id="notes-actions-container">
                <!-- Add Note button is now handled by UnitNotesManager -->
            </div>
            
            <div id="notes-grid" class="notes-grid">
                <!-- Notes will be displayed here -->
            </div>
        </div>
        
        <!-- Note Editor -->
        <div id="note-editor" class="note-editor-container" style="display: none;">
            <div class="note-editor-header">
                <input type="text" id="note-title-input" placeholder="Note title..." class="note-title-input">
                <div class="note-editor-actions">
                    <button id="save-note-btn" class="editor-action-btn">Save</button>
                    <button id="cancel-note-btn" class="editor-action-btn">Cancel</button>
                </div>
            </div>
            <textarea id="note-content-input" class="note-content-input" placeholder="Start typing your note here..."></textarea>
        </div>
        `;
    
        // Initialize unit notes manager
        this.unitNotesManager = new UnitNotesManager(this);
        const unitNotesSection = this.unitNotesManager.initialize();
        notesSection.appendChild(unitNotesSection);
    
        this.initializeEvents(notesSection);
        this.initializeNavEvents();
        return notesSection;
    }

    initializeEvents(container) {
        // Add module button (plus card)
        document.addEventListener('click', (e) => {
            if (e.target.closest('.add-module-card')) {
                this.showModuleCreator();
            }
        });
        
        // Close module creator
        const closeModuleCreatorBtn = container.querySelector('#close-module-creator-btn');
        if (closeModuleCreatorBtn) {
            closeModuleCreatorBtn.addEventListener('click', () => {
                this.hideModuleCreator();
            });
        }
        
        // Save module button
        const saveModuleBtn = container.querySelector('#save-module-btn');
        if (saveModuleBtn) {
            saveModuleBtn.addEventListener('click', () => {
                this.saveModule();
            });
        }
        
        // Cancel module button
        const cancelModuleBtn = container.querySelector('#cancel-module-btn');
        if (cancelModuleBtn) {
            cancelModuleBtn.addEventListener('click', () => {
                this.hideModuleCreator();
            });
        }
        
        // Save note button
        const saveNoteBtn = container.querySelector('#save-note-btn');
        if (saveNoteBtn) {
            saveNoteBtn.addEventListener('click', () => {
                this.saveNote();
            });
        }
        
        // Cancel note button
        const cancelNoteBtn = container.querySelector('#cancel-note-btn');
        if (cancelNoteBtn) {
            cancelNoteBtn.addEventListener('click', () => {
                this.hideNoteEditor();
            });
        }
        // Global search functionality
    const searchInput = container.querySelector('.search-input');
    const searchBtn = container.querySelector('.search-btn');
    
    if (searchInput && searchBtn) {
        searchInput.addEventListener('input', () => {
            const searchTerm = searchInput.value.trim();
            if (searchTerm) {
                this.performGlobalSearch(searchTerm);
            } else {
                this.clearSearchResults();
            }
        });

        searchBtn.addEventListener('click', () => {
            const searchTerm = searchInput.value.trim();
            if (searchTerm) {
                this.performGlobalSearch(searchTerm);
            }
        });
    }

    }

    initializeNavEvents() {
        // Find all navigation links
        const navLinks = document.querySelectorAll('.nav-link');
        
        // Add click event for the Subjects nav link
        navLinks.forEach(link => {
            if (link.dataset.section === 'subjects') {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.showModuleSection();
                });
            }
        });
    }

    showModuleSection() {
        // Make sure the entire notes section is visible
        const notesSection = document.getElementById('subject-notes-section');
        if (notesSection) {
            notesSection.style.display = 'block';
        }
        
        // Show the welcome screen
        this.showWelcomeScreen();
        
        // Clear the active subject selection
        const activeSubjects = document.querySelectorAll('.hb-sidebar-subject.active-subject');
        activeSubjects.forEach(subject => {
            subject.classList.remove('active-subject');
        });
        
        // Hide the unit notes section if it's visible
        const unitNotesSection = document.getElementById('unit-notes-section');
        if (unitNotesSection) {
            unitNotesSection.style.display = 'none';
        }
        
        // Reset current subject and module
        this.currentSubject = null;
        this.currentModule = null;
        
        // Reset the title
        const titleElement = document.getElementById('subject-notes-title');
        if (titleElement) {
            titleElement.textContent = 'Modules';
        }
        
        console.log("Module Notes section displayed and reset");
    }
    showWelcomeScreen() {
        // Show welcome screen
        const welcomeScreen = document.getElementById('module-welcome');
        if (welcomeScreen) {
            welcomeScreen.style.display = 'block';
        }
        
        // Hide modules-related elements
        const modulesGrid = document.getElementById('modules-grid');
        const notesContainer = document.getElementById('notes-container');
        const noteEditor = document.getElementById('note-editor');
        const moduleCreator = document.getElementById('module-creator');
        
        if (modulesGrid) modulesGrid.style.display = 'none';
        if (notesContainer) notesContainer.style.display = 'none';
        if (noteEditor) noteEditor.style.display = 'none';
        if (moduleCreator) moduleCreator.style.display = 'none';
        
        // Reset the title
        const titleElement = document.getElementById('subject-notes-title');
        if (titleElement) {
            titleElement.textContent = 'Modules';
        }
        
        // Reset current subject and module
        this.currentSubject = null;
        this.currentModule = null;
    }

    showModuleCreator() {
        const moduleCreator = document.getElementById('module-creator');
        const moduleNumberInput = document.getElementById('module-number-input');
        const moduleNameInput = document.getElementById('module-name-input');
        
        // Reset inputs
        moduleNumberInput.value = '';
        moduleNameInput.value = '';
        
        // Show the creator
        moduleCreator.style.display = 'flex';
        
        // Focus on the module number input
        moduleNumberInput.focus();
    }

    hideModuleCreator() {
        document.getElementById('module-creator').style.display = 'none';
    }

    saveModule() {
        const moduleNumberInput = document.getElementById('module-number-input');
        const moduleNameInput = document.getElementById('module-name-input');
        
        const moduleNumber = moduleNumberInput.value.trim();
        const moduleName = moduleNameInput.value.trim();
        
        if (!moduleNumber) {
            alert('Please enter a module number');
            return;
        }
        
        if (!moduleName) {
            alert('Please enter a module name');
            return;
        }
        
        if (!this.currentSubject) {
            alert('No subject selected');
            return;
        }
        
        const { sectionType, semesterId, subjectId } = this.currentSubject;
        
        // Reference to the modules collection for this subject
        const modulesRef = this.dbRef.child(`${sectionType}/semesters/${semesterId}/subjects/${subjectId}/modules`);
        
        // Create new module
        const moduleData = {
            number: moduleNumber,
            name: moduleName,
            createdAt: new Date().toISOString()
        };
        
        // Create new module
        const newModuleRef = modulesRef.push();
        newModuleRef.set(moduleData)
            .then(() => {
                // Hide the creator
                this.hideModuleCreator();
                
                // Refresh the modules list
                this.loadSubjectModules(sectionType, semesterId, subjectId);
            })
            .catch(error => {
                console.error("Error saving module:", error);
                alert('Failed to save module. Please try again.');
            });
    }

    setSubject(sectionType, semesterId, subjectId, subjectName) {
        console.log("NotesManager.setSubject called with:", { sectionType, semesterId, subjectId, subjectName });
        
        // Validate inputs
        if (!sectionType || !semesterId || !subjectId) {
            console.error("Missing required parameters in setSubject:", { sectionType, semesterId, subjectId });
            return;
        }
        
        // Update the title
        const titleElement = document.getElementById('subject-notes-title');
        if (titleElement) {
            titleElement.textContent = `${subjectName} Modules`;
        } else {
            console.error("Could not find subject-notes-title element");
        }
        
        // Store current subject info
        this.currentSubject = { sectionType, semesterId, subjectId };
        this.currentModule = null;
        
        // Load the modules for this subject
        this.loadSubjectModules(sectionType, semesterId, subjectId);
        
        // Hide the note editor and notes container
        const noteEditor = document.getElementById('note-editor');
        const notesContainer = document.getElementById('notes-container');
        
        if (noteEditor) noteEditor.style.display = 'none';
        if (notesContainer) notesContainer.style.display = 'none';
        
        // Show the main notes section if it's hidden
        const notesSection = document.getElementById('subject-notes-section');
        if (notesSection) {
            notesSection.style.display = 'block';
        } else {
            console.error("Could not find subject-notes-section element");
        }
        
        console.log(`Selected subject: ${subjectName} (${subjectId}) in ${sectionType}, semester ${semesterId}`);
    }

    loadSubjectModules(sectionType, semesterId, subjectId) {
        console.log("Loading modules for:", { sectionType, semesterId, subjectId });
        
        // Validate parameters
        if (!sectionType || !semesterId || !subjectId) {
            console.error("Missing required parameters in loadSubjectModules");
            return;
        }
        
        try {
            // Reference to the modules collection for this subject
            const modulesRef = this.dbRef.child(`${sectionType}/semesters/${semesterId}/subjects/${subjectId}/modules`);
            
            // First, ensure the modules section exists in Firebase
            modulesRef.once('value')
                .then((snapshot) => {
                    if (!snapshot.exists()) {
                        // Create an empty modules section if it doesn't exist
                        console.log("Creating new modules section for this subject");
                        return modulesRef.set({});
                    }
                    return snapshot;
                })
                .then(() => {
                    // Now get the modules
                    return modulesRef.once('value');
                })
                .then((snapshot) => {
                    const modulesData = snapshot.val() || {};
                    console.log("Modules data retrieved:", modulesData);
                    
                    // Convert to array and sort by module number
                    this.modules = Object.entries(modulesData)
                        .map(([id, module]) => ({ id, ...module }))
                        .sort((a, b) => {
                            // Sort by module number numerically
                            return parseInt(a.number) - parseInt(b.number);
                        });
                    
                    // Update the UI
                    this.renderModules();
                    
                    // Hide the welcome screen
                    const welcomeScreen = document.getElementById('module-welcome');
                    const modulesGrid = document.getElementById('modules-grid');
                    
                    if (welcomeScreen) welcomeScreen.style.display = 'none';
                    if (modulesGrid) modulesGrid.style.display = 'grid';
                })
                .catch(error => {
                    console.error("Error loading modules:", error);
                    // Show an error message
                    const modulesGrid = document.getElementById('modules-grid');
                    if (modulesGrid) {
                        modulesGrid.innerHTML = `<div class="empty-modules-message">Error loading modules: ${error.message}. Please try again.</div>`;
                        modulesGrid.style.display = 'grid';
                    }
                    
                    // Hide the welcome screen
                    const welcomeScreen = document.getElementById('module-welcome');
                    if (welcomeScreen) welcomeScreen.style.display = 'none';
                });
        } catch (error) {
            console.error("Exception in loadSubjectModules:", error);
            // Show an error message
            const modulesGrid = document.getElementById('modules-grid');
            if (modulesGrid) {
                modulesGrid.innerHTML = `<div class="empty-modules-message">Error loading modules: ${error.message}. Please check your connection.</div>`;
                modulesGrid.style.display = 'grid';
            }
            
            // Hide the welcome screen
            const welcomeScreen = document.getElementById('module-welcome');
            if (welcomeScreen) welcomeScreen.style.display = 'none';
        }
    }

    renderModules() {
        const modulesGrid = document.getElementById('modules-grid');
        
        // Clear current modules
        modulesGrid.innerHTML = '';
        
        // Create module cards for existing modules
        this.modules.forEach(module => {
            const moduleCard = document.createElement('div');
            moduleCard.className = 'module-card';
            moduleCard.dataset.moduleId = module.id;
            
            moduleCard.innerHTML = `
                <div class="module-card-content">
                    <div class="module-number">Module ${module.number}</div>
                    <h3 class="module-name">${module.name}</h3>
                </div>
            `;
            
            // Add click event to view module notes
            moduleCard.addEventListener('click', () => {
                this.selectModule(module.id);
            });
            
            modulesGrid.appendChild(moduleCard);
        });
        
        // Add the "+" card for creating new modules
        const addModuleCard = document.createElement('div');
        addModuleCard.className = 'module-card add-module-card';
        
        addModuleCard.innerHTML = `
            <div class="add-module-content">
                <div class="add-module-icon">+</div>
                <div class="add-module-text">Add New Module</div>
            </div>
        `;
        
        modulesGrid.appendChild(addModuleCard);
        
        // Show the modules grid
        modulesGrid.style.display = 'grid';
        
        // Hide other sections
        const notesContainer = document.getElementById('notes-container');
        const noteEditor = document.getElementById('note-editor');
        const welcomeScreen = document.getElementById('module-welcome');
        
        if (notesContainer) notesContainer.style.display = 'none';
        if (noteEditor) noteEditor.style.display = 'none';
        if (welcomeScreen) welcomeScreen.style.display = 'none';
    }

    selectModule(moduleId) {
        const module = this.modules.find(m => m.id === moduleId);
        if (!module) {
            console.error("Module not found:", moduleId);
            return;
        }
        
        console.log("Selected module:", module);
        this.currentModule = module;
        
        // Hide modules grid
        const modulesGrid = document.getElementById('modules-grid');
        if (modulesGrid) modulesGrid.style.display = 'none';
        
        // Now show the notes container instead of unit notes section
        const notesContainer = document.getElementById('notes-container');
        if (notesContainer) {
            notesContainer.style.display = 'block';
            
            // Update the module title in the unit notes section
            const moduleTitle = `Module ${module.number}: ${module.name}`;
            this.unitNotesManager.showUnitNotes(moduleTitle);
        } else {
            console.error("Could not find unit-notes-section element");
            
            // Fallback to old behavior if unit notes section is not found
            const notesContainer = document.getElementById('notes-container');
            if (notesContainer) {
                // Update module title in notes container
                const moduleTitle = document.getElementById('module-title');
        if (moduleTitle) {
            moduleTitle.textContent = `Module ${module.number}: ${module.name}`;
        }
                
                notesContainer.style.display = 'block';
                
                // Load notes for this module
                this.loadModuleNotes();
            }
        }
    }
    
    // Modify the showModulesGrid method to also hide unit notes section
    showModulesGrid() {
        // Get the search elements
        const moduleSearchContainer = document.querySelector('.notes-search');
        const unitSearchContainer = document.querySelector('.unit-notes-search');
        
        // Move the module search back to its original position
        if (moduleSearchContainer && unitSearchContainer) {
            // Remove the unit search from the header
            unitSearchContainer.remove();
            
            // Put the module search back
            const notesHeader = document.querySelector('.notes-header');
            if (notesHeader) {
                notesHeader.appendChild(moduleSearchContainer);
            }
            
            // Update styles and classes if needed
            unitSearchContainer.classList.remove('notes-search');
            unitSearchContainer.classList.add('unit-notes-search');
            
            // Put the unit search back in its original position
            const unitNotesHeader = document.querySelector('.unit-notes-header');
            if (unitNotesHeader) {
                const unitNotesControls = unitNotesHeader.querySelector('.unit-notes-controls');
                if (unitNotesControls) {
                    unitNotesControls.prepend(unitSearchContainer);
                }
            }
        }
    
        // Hide notes container, note editor, and unit notes section
        const notesContainer = document.getElementById('notes-container');
        const noteEditor = document.getElementById('note-editor');
        const unitNotesSection = document.getElementById('unit-notes-section');
        
        if (notesContainer) notesContainer.style.display = 'none';
        if (noteEditor) noteEditor.style.display = 'none';
        if (unitNotesSection) unitNotesSection.style.display = 'none';
        
        // Show modules grid
        const modulesGrid = document.getElementById('modules-grid');
        if (modulesGrid) modulesGrid.style.display = 'grid';
        
        // Reset current module
        this.currentModule = null;
    }
    
    loadModuleNotes() {
        const { sectionType, semesterId, subjectId } = this.currentSubject;
        const moduleId = this.currentModule.id;
        
        console.log("Loading notes for module:", { sectionType, semesterId, subjectId, moduleId });
        
        // Reference to the notes collection for this module
        const notesRef = this.dbRef.child(`${sectionType}/semesters/${semesterId}/subjects/${subjectId}/modules/${moduleId}/notes`);
        
        // First, ensure the notes section exists in Firebase
        notesRef.once('value')
            .then((snapshot) => {
                if (!snapshot.exists()) {
                    // Create an empty notes section if it doesn't exist
                    console.log("Creating new notes section for this module");
                    return notesRef.set({});
                }
                return snapshot;
            })
            .then(() => {
                // Now get the notes
                return notesRef.once('value');
            })
            .then((snapshot) => {
                const notesData = snapshot.val() || {};
                console.log("Notes data retrieved:", notesData);
                
                // Convert to array and sort by update date
                this.notes = Object.entries(notesData)
                    .map(([id, note]) => ({ id, ...note }))
                    .sort((a, b) => {
                        // Handle missing dates safely
                        const dateA = a.updatedAt ? new Date(a.updatedAt) : new Date(0);
                        const dateB = b.updatedAt ? new Date(b.updatedAt) : new Date(0);
                        return dateB - dateA;
                    });
                
                // Update the UI
                this.renderNotes();
            })
            .catch(error => {
                console.error("Error loading notes:", error);
                const notesGrid = document.getElementById('notes-grid');
                if (notesGrid) {
                    notesGrid.innerHTML = `<div class="empty-notes-message">Error loading notes: ${error.message}. Please try again.</div>`;
                }
            });
    }

    renderNotes() {
        const notesGrid = document.getElementById('notes-grid');
        
        // Clear current notes
        notesGrid.innerHTML = '';
        
        if (this.notes.length === 0) {
            notesGrid.innerHTML = `
                <div class="empty-notes-message">No notes found for this module. Click "Add Note" to create one.</div>
            `;
            return;
        }
        
        // Add each note to the grid
        this.notes.forEach(note => {
            const noteCard = document.createElement('div');
            noteCard.className = 'note-card';
            noteCard.dataset.noteId = note.id;
            
            // Format date
            const date = new Date(note.updatedAt);
            const formattedDate = `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
            
            // Create a preview of the content (first 100 characters)
            const contentPreview = note.content.length > 100 
                ? note.content.substring(0, 100) + '...' 
                : note.content;
            
            noteCard.innerHTML = `
                <h4 class="note-title">${note.title}</h4>
                <p class="note-preview">${contentPreview}</p>
                <div class="note-meta">
                    <span class="note-date">Updated: ${formattedDate}</span>
                    <div class="note-actions">
                        <button class="note-edit-btn" title="Edit note">✏️</button>
                        <button class="note-delete-btn" title="Delete note">🗑️</button>
                    </div>
                </div>
            `;
            
            // Add click event for editing
            noteCard.querySelector('.note-edit-btn').addEventListener('click', (e) => {
                e.stopPropagation();
                this.editNote(note.id);
            });
            
            // Add click event for deleting
            noteCard.querySelector('.note-delete-btn').addEventListener('click', (e) => {
                e.stopPropagation();
                this.deleteNote(note.id);
            });
            
            // Add click event for viewing
            noteCard.addEventListener('click', () => {
                this.viewNote(note.id);
            });
            
            notesGrid.appendChild(noteCard);
        });
    }

    showNoteEditor(noteId = null, title = '', content = '') {
        const editorContainer = document.getElementById('note-editor');
        const titleInput = document.getElementById('note-title-input');
        const contentInput = document.getElementById('note-content-input');
        
        // Set values if editing an existing note
        titleInput.value = title;
        contentInput.value = content;
        
        // Store the note ID if editing
        editorContainer.dataset.noteId = noteId || '';
        
        // Show the editor
        editorContainer.style.display = 'block';
        
        // Hide other sections
        const notesContainer = document.getElementById('notes-container');
        if (notesContainer) notesContainer.style.display = 'none';
        
        // Focus on the title
        titleInput.focus();
    }

    hideNoteEditor() {
        document.getElementById('note-editor').style.display = 'none';
        
        // Show the notes container
        const notesContainer = document.getElementById('notes-container');
        if (notesContainer) notesContainer.style.display = 'block';
    }

    saveNote() {
        const titleInput = document.getElementById('note-title-input');
        const contentInput = document.getElementById('note-content-input');
        const editorContainer = document.getElementById('note-editor');
        
        const title = titleInput.value.trim();
        const content = contentInput.value.trim();
        const noteId = editorContainer.dataset.noteId;
        
        if (!title) {
            alert('Please enter a title for your note');
            return;
        }
        
        if (!this.currentModule) {
            alert('No module selected');
            return;
        }
        
        const { sectionType, semesterId, subjectId } = this.currentSubject;
        const moduleId = this.currentModule.id;
        
        // Reference to the notes collection for this module
        const notesRef = this.dbRef.child(`${sectionType}/semesters/${semesterId}/subjects/${subjectId}/modules/${moduleId}/notes`);
        
        // Create or update the note
        const noteData = {
            title: title,
            content: content,
            updatedAt: new Date().toISOString(),
            createdAt: noteId ? null : new Date().toISOString() // Only set createdAt for new notes
        };
        
        if (noteId) {
            // Update existing note
            notesRef.child(noteId).update(noteData)
                .then(() => {
                    // Hide the editor
                    this.hideNoteEditor();
                    // Refresh the notes list
                    this.loadModuleNotes();
                })
                .catch(error => {
                    console.error("Error updating note:", error);
                    alert('Failed to update note. Please try again.');
                });
        } else {
            // Create new note
            const newNoteRef = notesRef.push();
            newNoteRef.set({
                ...noteData,
                createdAt: new Date().toISOString()
            })
                .then(() => {
                    // Hide the editor
                    this.hideNoteEditor();
                    // Refresh the notes list
                    this.loadModuleNotes();
                })
                .catch(error => {
                    console.error("Error creating note:", error);
                    alert('Failed to create note. Please try again.');
                });
        }
    }

    editNote(noteId) {
        const note = this.notes.find(n => n.id === noteId);
        if (note) {
            this.showNoteEditor(noteId, note.title, note.content);
        }
    }

    deleteNote(noteId) {
        if (!confirm('Are you sure you want to delete this note?')) {
            return;
        }
        
        const { sectionType, semesterId, subjectId } = this.currentSubject;
        const moduleId = this.currentModule.id;
        const noteRef = this.dbRef.child(`${sectionType}/semesters/${semesterId}/subjects/${subjectId}/modules/${moduleId}/notes/${noteId}`);
        
        noteRef.remove()
            .then(() => {
                // Remove from the local array
                this.notes = this.notes.filter(note => note.id !== noteId);
                
                // Update the UI
                this.renderNotes();
            })
            .catch(error => {
                console.error('Error deleting note:', error);
                alert('Failed to delete note. Please try again.');
            });
    }

    viewNote(noteId) {
        const note = this.notes.find(n => n.id === noteId);
        if (note) {
            this.showNoteEditor(noteId, note.title, note.content);
        }
    }
    
    resetToHome() {
        // Hide the notes section entirely when going to home
        const notesSection = document.getElementById('subject-notes-section');
        if (notesSection) {
            notesSection.style.display = 'none';
        }
        
        // Reset current subject and module
        this.currentSubject = null;
        this.currentModule = null;
        
        console.log("Reset to home page");
    }

    performGlobalSearch(searchTerm) {
        const searchResults = [];
        const searchLower = searchTerm.toLowerCase();
    
        // Recursive function to search through Firebase data
        const searchRecursive = (data, path = '') => {
            if (typeof data === 'object' && data !== null) {
                for (const key in data) {
                    const currentPath = path ? `${path} > ${key}` : key;
                    const value = data[key];
    
                    // Check if the current object has a name, title, or content field
                    if (typeof value === 'object' && value !== null) {
                        if (value.name && value.name.toLowerCase().includes(searchLower)) {
                            searchResults.push({ path: currentPath, match: value.name });
                        }
                        if (value.title && value.title.toLowerCase().includes(searchLower)) {
                            searchResults.push({ path: currentPath, match: value.title });
                        }
                        if (value.content && value.content.toLowerCase().includes(searchLower)) {
                            searchResults.push({ path: currentPath, match: value.content });
                        }
    
                        // Recursively search nested objects
                        searchRecursive(value, currentPath);
                    }
                }
            }
        };
    
        // Start the search from the root of the Firebase data
        this.dbRef.once('value').then((snapshot) => {
            const data = snapshot.val();
            searchRecursive(data);
    
            // Display the search results
            this.displaySearchResults(searchResults);
        }).catch((error) => {
            console.error("Error performing global search:", error);
        });
    }
    displaySearchResults(results) {
        const searchResultsContainer = document.createElement('div');
        searchResultsContainer.className = 'search-results-container';
    
        if (results.length === 0) {
            searchResultsContainer.innerHTML = `<div class="no-results">No results found.</div>`;
        } else {
            results.forEach(result => {
                const resultItem = document.createElement('div');
                resultItem.className = 'search-result-item';
                resultItem.innerHTML = `
                    <div class="search-result-path">${result.path}</div>
                    <div class="search-result-match">${result.match}</div>
                `;
                searchResultsContainer.appendChild(resultItem);
            });
        }
    
        // Append the search results below the search bar
        const notesHeader = document.querySelector('.notes-header');
        if (notesHeader) {
            const existingResults = notesHeader.querySelector('.search-results-container');
            if (existingResults) {
                notesHeader.removeChild(existingResults);
            }
            notesHeader.appendChild(searchResultsContainer);
        }
    }
    clearSearchResults() {
    const notesHeader = document.querySelector('.notes-header');
    if (notesHeader) {
        const existingResults = notesHeader.querySelector('.search-results-container');
        if (existingResults) {
            notesHeader.removeChild(existingResults);
        }
    }
}
}