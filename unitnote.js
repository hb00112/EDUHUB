//unitnote.js
class UnitNotesManager {
    constructor(notesManager) {
        this.notesManager = notesManager;
        this.dbRef = notesManager.dbRef;
        this.currentUnit = null;
        this.units = [];
        this.noteTabsManager = null; // Will be initialized when needed
        
    }
    setElementHeightToContent(element) {
        if (!element) return;
        console.log(`Setting height to content for element`, element);
        requestAnimationFrame(() => {
            const fullHeight = element.scrollHeight;
            element.style.height = `${fullHeight}px`;
            element.style.maxHeight = `${fullHeight}px`;
            console.log(`Height set: ${fullHeight}px`);
        });
    }

    initialize() {
        const unitNotesSection = document.createElement('div');
        unitNotesSection.className = 'unit-notes-content';
        unitNotesSection.id = 'unit-notes-section';
        unitNotesSection.style.display = 'none';

        unitNotesSection.innerHTML = `
                <div class="unit-notes-header">
                    <div class="unit-notes-header-top">
                        <button id="back-to-modules-btn" class="back-btn">← Back to Modules</button>
                        <h3 id="module-display-title">Module Title</h3>
                    </div>
                    <div class="unit-notes-controls">
                        <div class="unit-notes-search">
                            <input type="text" id="unit-search-input" placeholder="Search units..." class="search-input">
                            <button class="search-btn"><span class="search-icon">🔍</span></button>
                        </div>
                        <button id="add-unit-btn" class="unit-action-btn">
                            <span class="action-icon">+</span> Add Unit
                        </button>
                    </div>
                </div>
                
                <div id="units-accordion" class="units-accordion">
                    <!-- Units will be displayed here as accordion items -->
                    <div class="empty-units-message">No units found for this module. Click "Add Unit" to create one.</div>
                </div>
                
                <!-- Unit Creator Modal -->
                <div id="unit-creator" class="unit-creator-container" style="display: none;">
                    <div class="unit-creator-content">
                        <div class="unit-creator-header">
                            <h3 id="unit-creator-title">Create New Unit</h3>
                            <button id="close-unit-creator-btn" class="close-btn">×</button>
                        </div>
                        <div class="unit-creator-body">
                            <div class="form-group">
                                <label for="unit-number-input">Unit Number:</label>
                                <input type="number" id="unit-number-input" placeholder="e.g. 1" min="1" class="unit-input">
                            </div>
                            <div class="form-group">
                                <label for="unit-title-input">Unit Title:</label>
                                <input type="text" id="unit-title-input" placeholder="e.g. Introduction to Topic" class="unit-input">
                            </div>
                            <div class="unit-creator-actions">
                                <button id="save-unit-btn" class="action-btn save-btn">Save Unit</button>
                                <button id="cancel-unit-btn" class="action-btn cancel-btn">Cancel</button>
                            </div>
                        </div>
                    </div>
                </div>
            `;

        this.initializeEvents(unitNotesSection);
        return unitNotesSection;
    }

    initializeEvents(container) {
        // Back to modules button
        const backToModulesBtn = container.querySelector('#back-to-modules-btn');
        backToModulesBtn.addEventListener('click', () => {
            // Close any open accordions before going back
            this.closeAllAccordions();
            this.notesManager.showModulesGrid();
            container.style.display = 'none';
        });

        // Add unit button
        const addUnitBtn = container.querySelector('#add-unit-btn');
        addUnitBtn.addEventListener('click', () => {
            this.showUnitCreator();
        });

        // Close unit creator
        const closeUnitCreatorBtn = container.querySelector('#close-unit-creator-btn');
        closeUnitCreatorBtn.addEventListener('click', () => {
            this.hideUnitCreator();
        });

        // Save unit button
        const saveUnitBtn = container.querySelector('#save-unit-btn');
        saveUnitBtn.addEventListener('click', () => {
            this.saveUnit();
        });

        // Cancel unit button
        const cancelUnitBtn = container.querySelector('#cancel-unit-btn');
        cancelUnitBtn.addEventListener('click', () => {
            this.hideUnitCreator();
        });

        // Search functionality
        const searchInput = container.querySelector('#unit-search-input');
        searchInput.addEventListener('input', () => {
            this.filterUnits(searchInput.value);
        });

        const searchBtn = container.querySelector('.search-btn');
        searchBtn.addEventListener('click', () => {
            this.filterUnits(searchInput.value);
        });
    }

    showUnitCreator(isEdit = false) {
        const unitCreator = document.getElementById('unit-creator');
        const unitNumberInput = document.getElementById('unit-number-input');
        const unitTitleInput = document.getElementById('unit-title-input');
        const creatorTitle = document.getElementById('unit-creator-title');

        // Update title based on whether we're editing or creating
        creatorTitle.textContent = isEdit ? 'Edit Unit' : 'Create New Unit';

        // Reset inputs if not editing
        if (!isEdit) {
            unitNumberInput.value = '';
            unitTitleInput.value = '';
            unitCreator.dataset.editUnitId = '';
        }

        // Show the creator
        unitCreator.style.display = 'flex';

        // Focus on the appropriate input
        if (isEdit) {
            unitTitleInput.focus();
        } else {
            unitNumberInput.focus();
        }
    }

    hideUnitCreator() {
        const unitCreator = document.getElementById('unit-creator');
        unitCreator.style.display = 'none';
        unitCreator.dataset.editUnitId = '';
    }

    saveUnit() {
        const unitCreator = document.getElementById('unit-creator');
        const unitNumberInput = document.getElementById('unit-number-input');
        const unitTitleInput = document.getElementById('unit-title-input');
        const editUnitId = unitCreator.dataset.editUnitId;

        const unitNumber = unitNumberInput.value.trim();
        const unitTitle = unitTitleInput.value.trim();

        if (!unitNumber) {
            alert('Please enter a unit number');
            return;
        }

        if (!unitTitle) {
            alert('Please enter a unit title');
            return;
        }

        const { sectionType, semesterId, subjectId } = this.notesManager.currentSubject;
        const moduleId = this.notesManager.currentModule.id;

        // Reference to the units collection for this module
        const unitsRef = this.dbRef.child(`${sectionType}/semesters/${semesterId}/subjects/${subjectId}/modules/${moduleId}/units`);

        // Create unit data
        const unitData = {
            number: unitNumber,
            title: unitTitle,
            progress: editUnitId ? this.units.find(u => u.id === editUnitId)?.progress || 0 : 0
        };

        // If editing, update the existing unit
        if (editUnitId) {
            const unitRef = unitsRef.child(editUnitId);
            unitRef.update(unitData)
                .then(() => {
                    this.hideUnitCreator();
                    this.loadModuleUnits();
                })
                .catch(error => {
                    console.error("Error updating unit:", error);
                    alert('Failed to update unit. Please try again.');
                });
        } else {
            // Add createdAt for new units
            unitData.createdAt = new Date().toISOString();

            // Add the new unit to Firebase
            const newUnitRef = unitsRef.push();
            newUnitRef.set(unitData)
                .then(() => {
                    this.hideUnitCreator();
                    this.loadModuleUnits();
                })
                .catch(error => {
                    console.error("Error saving unit:", error);
                    alert('Failed to save unit. Please try again.');
                });
        }
    }

    loadModuleUnits() {
        const { sectionType, semesterId, subjectId } = this.notesManager.currentSubject;
        const moduleId = this.notesManager.currentModule.id;

        const unitsRef = this.dbRef.child(`${sectionType}/semesters/${semesterId}/subjects/${subjectId}/modules/${moduleId}/units`);

        unitsRef.once('value')
            .then((snapshot) => {
                if (!snapshot.exists()) {
                    return unitsRef.set({});
                }
                return snapshot;
            })
            .then(() => {
                return unitsRef.once('value');
            })
            .then((snapshot) => {
                const unitsData = snapshot.val() || {};
                this.units = Object.entries(unitsData)
                    .map(([id, unit]) => ({ id, ...unit }))
                    .sort((a, b) => parseInt(a.number) - parseInt(b.number));

                this.renderUnits();

                // Ensure all accordions are closed by default
                this.closeAllAccordions();
            })
            .catch(error => {
                console.error("Error loading units:", error);
                const unitsAccordion = document.getElementById('units-accordion');
                if (unitsAccordion) {
                    unitsAccordion.innerHTML = `<div class="empty-units-message">Error loading units: ${error.message}. Please try again.</div>`;
                }
            });
    }


    renderUnits() {
        const unitsAccordion = document.getElementById('units-accordion');

        // Clear current units
        unitsAccordion.innerHTML = '';

        if (this.units.length === 0) {
            unitsAccordion.innerHTML = `
                    <div class="empty-units-message">No units found for this module. Click "Add Unit" to create one.</div>
                `;
            return;
        }

        // Create accordion items for each unit
        this.units.forEach(unit => {
            const accordionItem = document.createElement('div');
            accordionItem.className = 'accordion-item';
            accordionItem.dataset.unitId = unit.id;

            accordionItem.innerHTML = `
                    <div class="accordion-header">
                        <div class="accordion-title-area">
                            <div class="unit-number">Unit ${unit.number}</div>
                            <h3 class="unit-title">${unit.title}</h3>
                        </div>
                        <div class="accordion-controls">
                            <div class="progress-container">
                                <div class="progress-bar" style="width: ${unit.progress}%"></div>
                                <span class="progress-text">${unit.progress}%</span>
                            </div>
                            <div class="unit-actions">
                                <button class="unit-edit-btn" title="Edit unit">✏️</button>
                                <button class="unit-delete-btn" title="Delete unit">🗑️</button>
                                <button class="accordion-toggle">
                                    <span class="accordion-icon"></span>
                                </button>
                            </div>
                        </div>
                    </div>
                    <div class="accordion-content">
                        <div class="note-tabs-container" id="note-tabs-container-${unit.id}">
                            <div class="loading-note-tabs">Loading note tabs...</div>
                        </div>
                    </div>
                `;

            unitsAccordion.appendChild(accordionItem);

            // Add event listeners for this accordion item
            this.setupAccordionEvents(accordionItem, unit);
        });
    }


    setupAccordionEvents(accordionItem, unit) {
        // Toggle button
        const toggleBtn = accordionItem.querySelector('.accordion-toggle');
        toggleBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleAccordion(accordionItem, unit);
        });

        // Make header also toggle the accordion (except buttons)
        const header = accordionItem.querySelector('.accordion-header');
        header.addEventListener('click', (e) => {
            // Don't toggle if clicking on buttons
            if (!e.target.closest('.unit-actions')) {
                this.toggleAccordion(accordionItem, unit);
            }
        });

        // Edit button
        const editBtn = accordionItem.querySelector('.unit-edit-btn');
        editBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.editUnit(unit.id);
        });

        // Delete button
        const deleteBtn = accordionItem.querySelector('.unit-delete-btn');
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.deleteUnit(unit.id);
        });
    }

    toggleAccordion(accordionItem, unit) {
        const isOpen = accordionItem.classList.contains('active');
        console.log(`Toggle accordion: ${isOpen ? 'Close' : 'Open'} unit ${unit.id}`);
    
        // If we're opening this accordion, close all others first
        if (!isOpen) {
            this.closeAllAccordions();
        }
    
        // Toggle this accordion
        accordionItem.classList.toggle('active');
    
        const content = accordionItem.querySelector('.accordion-content');
        if (!content) {
            console.error('Accordion content not found.');
            return;
        }
    
        const noteTabsContainer = content.querySelector('.note-tabs-container');
        const noteContent = content.querySelector('.note-content');
        const noteDisplay = content.querySelector('.note-display');
    
        if (!noteTabsContainer) {
            console.error('Note tabs container not found.');
            return;
        }
    
        if (!isOpen) {
            // Opening the accordion
            requestAnimationFrame(() => {
                const fullHeight = content.scrollHeight;
                content.style.height = `${fullHeight}px`;
                content.style.maxHeight = `${fullHeight}px`;
                if (noteTabsContainer) noteTabsContainer.style.height = `${fullHeight}px`;
                if (noteTabsContainer) noteTabsContainer.style.maxHeight = `${fullHeight}px`;
                if (noteContent) noteContent.style.height = `${fullHeight}px`;
                if (noteContent) noteContent.style.maxHeight = `${fullHeight}px`;
                if (noteDisplay) noteDisplay.style.height = `${fullHeight}px`;
                if (noteDisplay) noteDisplay.style.maxHeight = `${fullHeight}px`;
            });
    
            // Ensure the note tabs are loaded and displayed
            this.selectUnit(unit.id);
        } else {
            // Closing the accordion
            content.style.height = null;
            content.style.maxHeight = null;
            if (noteTabsContainer) noteTabsContainer.style.height = null;
            if (noteTabsContainer) noteTabsContainer.style.maxHeight = null;
            if (noteContent) noteContent.style.height = null;
            if (noteContent) noteContent.style.maxHeight = null;
            if (noteDisplay) noteDisplay.style.height = null;
            if (noteDisplay) noteDisplay.style.maxHeight = null;
    
            // Reset the current unit and note tabs manager
            this.currentUnit = null;
            if (this.noteTabsManager) {
                this.noteTabsManager.reset(); // Reset the note tabs manager
            }
        }
    }






    closeAllAccordions() {
        const accordionItems = document.querySelectorAll('.accordion-item');
        accordionItems.forEach(item => {
            item.classList.remove('active');
            const content = item.querySelector('.accordion-content');
            if (content) {
                content.style.maxHeight = null;
            }
        });
    }


    selectUnit(unitId) {
        const unit = this.units.find(u => u.id === unitId);
        if (!unit) {
            console.error("Unit not found:", unitId);
            return;
        }
    
        console.log("Selected unit:", unit);
        this.currentUnit = unit;
    
        // Reinitialize the NoteTabsManager if it was reset
        if (!this.noteTabsManager) {
            this.noteTabsManager = new NoteTabsManager(this);
        }
    
        // Load and render the note tabs for this unit
        const noteTabsContainer = document.getElementById(`note-tabs-container-${unit.id}`);
        if (noteTabsContainer) {
            noteTabsContainer.innerHTML = '<div class="loading-note-tabs">Loading note tabs...</div>';
            this.noteTabsManager.loadUnitNotes(unit, noteTabsContainer);
        } else {
            console.error("Note tabs container not found for unit:", unit.id);
        }
    }

    loadUnitNotes(unit, container) {
        this.currentUnit = unit;
        this.renderEmptyNoteTabs(container);
    
        const { sectionType, semesterId, subjectId } = this.unitNotesManager.notesManager.currentSubject;
        const moduleId = this.unitNotesManager.notesManager.currentModule.id;
        const unitId = unit.id;
    
        const notesRef = this.dbRef.child(`${sectionType}/semesters/${semesterId}/subjects/${subjectId}/modules/${moduleId}/units/${unitId}/notes`);
    
        notesRef.once('value')
            .then((snapshot) => {
                if (!snapshot.exists()) {
                    return notesRef.set({}).then(() => notesRef.once('value'));
                }
                return snapshot;
            })
            .then((snapshot) => {
                const notesData = snapshot.val() || {};
                this.notes = Object.entries(notesData).map(([id, note]) => ({ id, ...note }));
                this.notes.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                this.renderNoteTabs(container);
    
                // Automatically select the first note if no note is selected
                if (this.notes.length > 0 && !this.activeNoteId) {
                    this.selectNote(this.notes[0].id);
                }
    
                this.updateUnitProgress();
            })
            .catch(error => {
                console.error("Error loading notes:", error);
                container.innerHTML = `<div class="empty-notes-message">Error loading notes: ${error.message}. Please try again.</div>`;
            });
    }

    editUnit(unitId) {
        const unit = this.units.find(u => u.id === unitId);
        if (!unit) {
            console.error("Unit not found:", unitId);
            return;
        }

        const unitCreator = document.getElementById('unit-creator');
        const unitNumberInput = document.getElementById('unit-number-input');
        const unitTitleInput = document.getElementById('unit-title-input');

        // Set values
        unitNumberInput.value = unit.number;
        unitTitleInput.value = unit.title;

        // Set edit ID
        unitCreator.dataset.editUnitId = unitId;

        // Show the creator in edit mode
        this.showUnitCreator(true);
    }

    deleteUnit(unitId) {
        if (!confirm('Are you sure you want to delete this unit? This will also delete all notes within this unit.')) {
            return;
        }

        const { sectionType, semesterId, subjectId } = this.notesManager.currentSubject;
        const moduleId = this.notesManager.currentModule.id;

        const unitRef = this.dbRef.child(`${sectionType}/semesters/${semesterId}/subjects/${subjectId}/modules/${moduleId}/units/${unitId}`);

        unitRef.remove()
            .then(() => {
                // Remove from the local array
                this.units = this.units.filter(unit => unit.id !== unitId);

                // Update the UI
                this.renderUnits();
            })
            .catch(error => {
                console.error("Error deleting unit:", error);
                alert('Failed to delete unit. Please try again.');
            });
    }

    filterUnits(searchTerm) {
        const unitsAccordion = document.getElementById('units-accordion');
        const searchLower = searchTerm.toLowerCase();

        // First check if there are any units
        if (this.units.length === 0) {
            return;
        }

        // Get all accordion items
        const accordionItems = unitsAccordion.querySelectorAll('.accordion-item');
        let matchFound = false;

        // Filter units based on title or number
        accordionItems.forEach(item => {
            const unitTitle = item.querySelector('.unit-title').textContent.toLowerCase();
            const unitNumber = item.querySelector('.unit-number').textContent.toLowerCase();

            if (!searchTerm || unitTitle.includes(searchLower) || unitNumber.includes(searchLower)) {
                item.style.display = 'block';
                matchFound = true;
            } else {
                item.style.display = 'none';
            }
        });

        // Show "no results" message if needed
        let noResultsMsg = unitsAccordion.querySelector('.no-search-results');

        if (!matchFound && searchTerm) {
            if (!noResultsMsg) {
                noResultsMsg = document.createElement('div');
                noResultsMsg.className = 'no-search-results';
                noResultsMsg.textContent = `No units found matching "${searchTerm}"`;
                unitsAccordion.appendChild(noResultsMsg);
            } else {
                noResultsMsg.textContent = `No units found matching "${searchTerm}"`;
                noResultsMsg.style.display = 'block';
            }
        } else if (noResultsMsg) {
            noResultsMsg.style.display = 'none';
        }
    }

    showUnitNotes(moduleTitle) {
        // Update module title display
        const moduleTitleElement = document.getElementById('module-display-title');
        if (moduleTitleElement) {
            moduleTitleElement.textContent = moduleTitle;
        }
    
        // Get the search elements
        const moduleSearchContainer = document.querySelector('.notes-search');
        const unitSearchContainer = document.querySelector('.unit-notes-search');
        
        // Move the unit search to where module search is
        if (moduleSearchContainer && unitSearchContainer) {
            // Remove the unit search from its original position
            unitSearchContainer.remove();
            
            // Replace module search with unit search
            moduleSearchContainer.replaceWith(unitSearchContainer);
            
            // Update styles and classes if needed
            unitSearchContainer.classList.remove('unit-notes-search');
            unitSearchContainer.classList.add('notes-search');
        }
    
        // Show the unit notes section
        const unitNotesSection = document.getElementById('unit-notes-section');
        if (unitNotesSection) {
            unitNotesSection.style.display = 'block';
        }
    
        // Load units for the current module
        this.loadModuleUnits();
    }
    // Helper method to update the progress of a unit
    updateUnitProgress(unitId, progress) {
        const { sectionType, semesterId, subjectId } = this.notesManager.currentSubject;
        const moduleId = this.notesManager.currentModule.id;

        // Reference to the unit
        const unitRef = this.dbRef.child(`${sectionType}/semesters/${semesterId}/subjects/${subjectId}/modules/${moduleId}/units/${unitId}`);

        // Update just the progress
        return unitRef.update({ progress })
            .then(() => {
                // Update local data
                const unit = this.units.find(u => u.id === unitId);
                if (unit) {
                    unit.progress = progress;

                    // Update UI if needed
                    const accordionItem = document.querySelector(`.accordion-item[data-unit-id="${unitId}"]`);
                    if (accordionItem) {
                        const progressBar = accordionItem.querySelector('.progress-bar');
                        const progressText = accordionItem.querySelector('.progress-text');

                        if (progressBar) progressBar.style.width = `${progress}%`;
                        if (progressText) progressText.textContent = `${progress}%`;
                    }
                }
            })
            .catch(error => {
                console.error("Error updating unit progress:", error);
            });
    }
}



/**
 * Part 3: Note Tabs Manager
 * This class manages the tabbed interface for notes within a unit.
 * It handles loading, displaying, and managing note tabs.
 */
class NoteTabsManager {
    constructor(unitNotesManager) {
        this.unitNotesManager = unitNotesManager;
        this.dbRef = unitNotesManager.dbRef;
        this.currentUnit = null;
        this.notes = [];
        this.activeNoteId = null;
        this.noteDisplayManager = null; // Will be initialized in Part 4
    }

    loadUnitNotes(unit, container) {
        this.currentUnit = unit;
        this.renderEmptyNoteTabs(container);

        const { sectionType, semesterId, subjectId } = this.unitNotesManager.notesManager.currentSubject;
        const moduleId = this.unitNotesManager.notesManager.currentModule.id;
        const unitId = unit.id;

        const notesRef = this.dbRef.child(`${sectionType}/semesters/${semesterId}/subjects/${subjectId}/modules/${moduleId}/units/${unitId}/notes`);

        notesRef.once('value')
            .then((snapshot) => {
                if (!snapshot.exists()) {
                    return notesRef.set({}).then(() => notesRef.once('value'));
                }
                return snapshot;
            })
            .then((snapshot) => {
                const notesData = snapshot.val() || {};
                this.notes = Object.entries(notesData).map(([id, note]) => ({ id, ...note }));
                this.notes.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                this.renderNoteTabs(container);

                // Reset activeNoteId when loading new notes
                this.activeNoteId = null;

                // Automatically select the first note if notes are available
                if (this.notes.length > 0) {
                    this.selectNote(this.notes[0].id);
                }

                this.updateUnitProgress();
            })
            .catch(error => {
                console.error("Error loading notes:", error);
                container.innerHTML = `<div class="empty-notes-message">Error loading notes: ${error.message}. Please try again.</div>`;
            });
    }
    reset() {
        this.currentUnit = null;
        this.notes = [];
        this.activeNoteId = null;
        this.noteDisplayManager = null;
    }
    renderEmptyNoteTabs(container) {
        const tabsWrapper = document.createElement('div');
        tabsWrapper.className = 'note-tabs-wrapper';

        const tabsHeader = document.createElement('div');
        tabsHeader.className = 'note-tabs-header';

        const tabsScroll = document.createElement('div');
        tabsScroll.className = 'note-tabs-scroll';
        tabsScroll.id = `tabs-scroll-${this.currentUnit.id}`;

        const tabsControls = document.createElement('div');
        tabsControls.className = 'note-tabs-controls';

        const scrollLeftBtn = document.createElement('button');
        scrollLeftBtn.className = 'tab-scroll-btn';
        scrollLeftBtn.innerHTML = '&lt;';
        scrollLeftBtn.title = 'Scroll left';

        const scrollRightBtn = document.createElement('button');
        scrollRightBtn.className = 'tab-scroll-btn';
        scrollRightBtn.innerHTML = '&gt;';
        scrollRightBtn.title = 'Scroll right';

        const addNoteBtn = document.createElement('button');
        addNoteBtn.className = 'add-note-btn';
        addNoteBtn.innerHTML = '<span>+</span> Add Note';
        addNoteBtn.title = 'Create a new note';

        tabsScroll.innerHTML = '<div class="loading-note-tabs">Loading notes...</div>';

        tabsControls.appendChild(scrollLeftBtn);
        tabsControls.appendChild(scrollRightBtn);
        tabsControls.appendChild(addNoteBtn);

        tabsHeader.appendChild(tabsScroll);
        tabsHeader.appendChild(tabsControls);

        const tabsContent = document.createElement('div');
        tabsContent.className = 'note-tabs-content';
        tabsContent.id = `note-content-${this.currentUnit.id}`;
        tabsContent.innerHTML = '<div class="loading-note-content">Loading content...</div>';

        tabsWrapper.appendChild(tabsHeader);
        tabsWrapper.appendChild(tabsContent);

        container.innerHTML = '';
        container.appendChild(tabsWrapper);
    }

    renderNoteTabs(container) {
        const tabsWrapper = document.createElement('div');
        tabsWrapper.className = 'note-tabs-wrapper';

        const tabsHeader = document.createElement('div');
        tabsHeader.className = 'note-tabs-header';

        const tabsScroll = document.createElement('div');
        tabsScroll.className = 'note-tabs-scroll';
        tabsScroll.id = `tabs-scroll-${this.currentUnit.id}`;

        const tabsControls = document.createElement('div');
        tabsControls.className = 'note-tabs-controls';

        const scrollLeftBtn = document.createElement('button');
        scrollLeftBtn.className = 'tab-scroll-btn';
        scrollLeftBtn.innerHTML = '&lt;';
        scrollLeftBtn.title = 'Scroll left';

        const scrollRightBtn = document.createElement('button');
        scrollRightBtn.className = 'tab-scroll-btn';
        scrollRightBtn.innerHTML = '&gt;';
        scrollRightBtn.title = 'Scroll right';

        const addNoteBtn = document.createElement('button');
        addNoteBtn.className = 'add-note-btn';
        addNoteBtn.innerHTML = '<span>+</span> Add Note';
        addNoteBtn.title = 'Create a new note';

        tabsControls.appendChild(scrollLeftBtn);
        tabsControls.appendChild(scrollRightBtn);
        tabsControls.appendChild(addNoteBtn);

        tabsHeader.appendChild(tabsScroll);
        tabsHeader.appendChild(tabsControls);

        const tabsContent = document.createElement('div');
        tabsContent.className = 'note-tabs-content';
        tabsContent.id = `note-content-${this.currentUnit.id}`;

        if (this.notes.length === 0) {
            tabsContent.innerHTML = `
                <div class="empty-notes-message">
                    No notes found for this unit. Click "Add Note" to create one.
                </div>
            `;
        }

        tabsWrapper.appendChild(tabsHeader);
        tabsWrapper.appendChild(tabsContent);

        container.innerHTML = '';
        container.appendChild(tabsWrapper);

        this.populateTabs(tabsScroll);
        this.setupTabEvents(tabsScroll, tabsContent, scrollLeftBtn, scrollRightBtn, addNoteBtn);
    }

    populateTabs(tabsContainer) {
        tabsContainer.innerHTML = '';

        this.notes.forEach(note => {
            const tab = document.createElement('div');
            tab.className = 'note-tab';
            tab.dataset.noteId = note.id;

            if (note.id === this.activeNoteId) {
                tab.classList.add('active');
            }

            tab.innerHTML = `
                <span class="note-tab-title">${note.title || 'Untitled Note'}</span>
                <span class="note-tab-close" title="Close note">×</span>
            `;

            tabsContainer.appendChild(tab);
        });
    }

    setupTabEvents(tabsScroll, tabsContent, scrollLeftBtn, scrollRightBtn, addNoteBtn) {
        tabsScroll.addEventListener('click', (e) => {
            const tab = e.target.closest('.note-tab');
            const closeBtn = e.target.closest('.note-tab-close');

            if (tab && !closeBtn) {
                const noteId = tab.dataset.noteId;
                this.selectNote(noteId);
            }

            if (closeBtn && tab) {
                e.stopPropagation();
                const noteId = tab.dataset.noteId;
                this.closeNote(noteId);
            }
        });

        scrollLeftBtn.addEventListener('click', () => {
            tabsScroll.scrollBy({ left: -200, behavior: 'smooth' });
        });

        scrollRightBtn.addEventListener('click', () => {
            tabsScroll.scrollBy({ left: 200, behavior: 'smooth' });
        });

        addNoteBtn.addEventListener('click', () => {
            this.createNewNote();
        });

        document.addEventListener('keydown', (e) => {
            if (this.currentUnit && document.getElementById(`note-content-${this.currentUnit.id}`)) {
                if (e.ctrlKey && e.key === 'Tab' && !e.shiftKey) {
                    e.preventDefault();
                    this.selectNextNote();
                }
                if (e.ctrlKey && e.key === 'Tab' && e.shiftKey) {
                    e.preventDefault();
                    this.selectPreviousNote();
                }
                if (e.ctrlKey && e.key === 't') {
                    e.preventDefault();
                    this.createNewNote();
                }
                if (e.ctrlKey && e.key === 'w') {
                    e.preventDefault();
                    if (this.activeNoteId) {
                        this.closeNote(this.activeNoteId);
                    }
                }
            }
        });
    }

    selectNote(noteId) {
        if (this.activeNoteId === noteId) {
            return;
        }

        this.activeNoteId = noteId;

        const contentContainer = document.getElementById(`note-content-${this.currentUnit.id}`);
        if (contentContainer) {
            contentContainer.innerHTML = '<div class="loading-note-content">Loading content...</div>';
        }

        const allTabs = document.querySelectorAll(`.note-tab`);
        allTabs.forEach(tab => {
            if (tab.dataset.noteId === noteId) {
                tab.classList.add('active');
                if (tab.scrollIntoView) {
                    setTimeout(() => {
                        tab.scrollIntoView({ behavior: 'auto', block: 'nearest', inline: 'nearest' });
                    }, 0);
                }
            } else {
                tab.classList.remove('active');
            }
        });

        const selectedNote = this.notes.find(note => note.id === noteId);

        if (!selectedNote) {
            console.error("Selected note not found:", noteId);
            return;
        }

        requestAnimationFrame(() => {
            this.displayNoteContent(selectedNote);
        });
    }

    displayNoteContent(note) {
        // Get the content container
        const contentContainer = document.getElementById(`note-content-${this.currentUnit.id}`);

        if (!contentContainer) {
            console.error("Note content container not found");
            return;
        }

        // Initialize the Note Display Manager if not already done
        if (!this.noteDisplayManager) {
            this.noteDisplayManager = new NoteDisplayManager(this);
        }

        // Display the note content using the Note Display Manager
        this.noteDisplayManager.displayNote(note, contentContainer);

        // Ensure the note content expands to full height
        requestAnimationFrame(() => {
            contentContainer.style.height = 'auto';
            contentContainer.style.maxHeight = 'none';
        });
    }


    /**
     * Select the next note in the list
     */
    selectNextNote() {
        if (this.notes.length <= 1) return;

        const currentIndex = this.notes.findIndex(note => note.id === this.activeNoteId);

        if (currentIndex === -1) return;

        const nextIndex = (currentIndex + 1) % this.notes.length;
        this.selectNote(this.notes[nextIndex].id);
    }

    /**
     * Select the previous note in the list
     */
    selectPreviousNote() {
        if (this.notes.length <= 1) return;

        const currentIndex = this.notes.findIndex(note => note.id === this.activeNoteId);

        if (currentIndex === -1) return;

        const prevIndex = (currentIndex - 1 + this.notes.length) % this.notes.length;
        this.selectNote(this.notes[prevIndex].id);
    }

    /**
     * Create a new note for the current unit
     */
    createNewNote() {
        const { sectionType, semesterId, subjectId } = this.unitNotesManager.notesManager.currentSubject;
        const moduleId = this.unitNotesManager.notesManager.currentModule.id;
        const unitId = this.currentUnit.id;

        // Reference to the notes collection
        const notesRef = this.dbRef.child(`${sectionType}/semesters/${semesterId}/subjects/${subjectId}/modules/${moduleId}/units/${unitId}/notes`);

        // Create new note data
        const newNote = {
            title: 'New Note',
            content: '',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            completed: false
        };

        // Add to Firebase
        const newNoteRef = notesRef.push();
        newNoteRef.set(newNote)
            .then(() => {
                console.log("New note created:", newNoteRef.key);

                // Add to local notes array
                const noteWithId = {
                    id: newNoteRef.key,
                    ...newNote
                };

                this.notes.unshift(noteWithId); // Add to beginning

                // Re-render tabs
                const tabsScroll = document.getElementById(`tabs-scroll-${this.currentUnit.id}`);
                if (tabsScroll) {
                    this.populateTabs(tabsScroll);

                    // Select the new note
                    this.selectNote(noteWithId.id);
                }
            })
            .catch(error => {
                console.error("Error creating new note:", error);
                alert('Failed to create new note. Please try again.');
            });
    }

    /**
     * Close a note tab
     * @param {string} noteId - The ID of the note to close
     */
    closeNote(noteId) {
        // If we're closing the active note, select another one first
        if (noteId === this.activeNoteId) {
            const currentIndex = this.notes.findIndex(note => note.id === noteId);

            // Find the next note to select
            let nextNoteToSelect = null;

            if (this.notes.length > 1) {
                // Prefer the note to the right, or if we're closing the last note, take the one to the left
                const nextIndex = currentIndex < this.notes.length - 1 ? currentIndex + 1 : currentIndex - 1;
                nextNoteToSelect = this.notes[nextIndex].id;
            }

            // Remove from array
            this.notes = this.notes.filter(note => note.id !== noteId);

            // Re-render tabs
            const tabsScroll = document.getElementById(`tabs-scroll-${this.currentUnit.id}`);
            if (tabsScroll) {
                this.populateTabs(tabsScroll);
            }

            // Select next note or clear content if none left
            if (nextNoteToSelect) {
                this.selectNote(nextNoteToSelect);
            } else {
                this.activeNoteId = null;
                const contentContainer = document.getElementById(`note-content-${this.currentUnit.id}`);
                if (contentContainer) {
                    contentContainer.innerHTML = `
                        <div class="empty-notes-message">
                            No notes found for this unit. Click "Add Note" to create one.
                        </div>
                    `;
                }
            }
        } else {
            // Simply remove from array and re-render
            this.notes = this.notes.filter(note => note.id !== noteId);

            const tabsScroll = document.getElementById(`tabs-scroll-${this.currentUnit.id}`);
            if (tabsScroll) {
                this.populateTabs(tabsScroll);
            }
        }
    }

    /**
     * Update the progress of the unit based on completed notes
     */
    updateUnitProgress() {
        if (!this.currentUnit || this.notes.length === 0) return;

        // Calculate percentage of completed notes
        const totalNotes = this.notes.length;
        const completedNotes = this.notes.filter(note => note.completed).length;
        const progress = Math.round((completedNotes / totalNotes) * 100);

        // Update unit progress in the manager
        this.unitNotesManager.updateUnitProgress(this.currentUnit.id, progress);
    }

    /**
     * Update note data in Firebase
     * @param {string} noteId - The ID of the note to update
     * @param {Object} data - The data to update
     * @returns {Promise} - A promise that resolves when the update is complete
     */
    updateNote(noteId, data) {
        const { sectionType, semesterId, subjectId } = this.unitNotesManager.notesManager.currentSubject;
        const moduleId = this.unitNotesManager.notesManager.currentModule.id;
        const unitId = this.currentUnit.id;

        // Include updatedAt in the data
        const updateData = {
            ...data,
            updatedAt: new Date().toISOString()
        };

        // Reference to the note
        const noteRef = this.dbRef.child(`${sectionType}/semesters/${semesterId}/subjects/${subjectId}/modules/${moduleId}/units/${unitId}/notes/${noteId}`);

        return noteRef.update(updateData)
            .then(() => {
                // Update local data
                const noteIndex = this.notes.findIndex(note => note.id === noteId);
                if (noteIndex !== -1) {
                    this.notes[noteIndex] = {
                        ...this.notes[noteIndex],
                        ...updateData
                    };

                    // If title changed, update the tab
                    if (data.title) {
                        const tab = document.querySelector(`.note-tab[data-note-id="${noteId}"] .note-tab-title`);
                        if (tab) {
                            tab.textContent = data.title;
                        }
                    }

                    // If completed status changed, update unit progress
                    if (data.completed !== undefined) {
                        this.updateUnitProgress();
                    }
                }
            })
            .catch(error => {
                console.error("Error updating note:", error);
                throw error;
            });
    }

    /**
     * Delete a note from Firebase
     * @param {string} noteId - The ID of the note to delete
     * @returns {Promise} - A promise that resolves when the delete is complete
     */
    deleteNote(noteId) {
        const { sectionType, semesterId, subjectId } = this.unitNotesManager.notesManager.currentSubject;
        const moduleId = this.unitNotesManager.notesManager.currentModule.id;
        const unitId = this.currentUnit.id;

        // Reference to the note
        const noteRef = this.dbRef.child(`${sectionType}/semesters/${semesterId}/subjects/${subjectId}/modules/${moduleId}/units/${unitId}/notes/${noteId}`);

        return noteRef.remove()
            .then(() => {
                // Close the note tab
                this.closeNote(noteId);

                // Update unit progress
                this.updateUnitProgress();
            })
            .catch(error => {
                console.error("Error deleting note:", error);
                throw error;
            });
    }
}


/**
 * Part 4: Note Display Manager
 * This class manages the display and editing of individual note content.
 * It provides read and edit modes for notes with rich text editing capabilities.
 */
class NoteDisplayManager {
    constructor(noteTabsManager) {
        this.noteTabsManager = noteTabsManager;
        this.currentNote = null;
        this.isEditing = false;
        this.container = null;
        this.richTextEditor = null;
        this.originalContent = null;
        this.originalTitle = null;
    }

    displayNote(note, container) {
        this.currentNote = note;
        this.container = container;
        this.isEditing = false;
        container.innerHTML = '';
        this.renderReadMode();
    }

    renderReadMode() {
        if (!this.currentNote || !this.container) return;
    
        const note = this.currentNote;
        const noteDisplay = document.createElement('div');
        noteDisplay.className = 'note-display';
    
        const noteHeader = document.createElement('div');
        noteHeader.className = 'note-header';
    
        const noteHeaderLeft = document.createElement('div');
        noteHeaderLeft.className = 'note-header-left';
    
        const noteTitle = document.createElement('h3');
        noteTitle.className = 'note-title';
        noteTitle.textContent = note.title || 'Untitled Note';
    
        const noteTimestamp = document.createElement('div');
        noteTimestamp.className = 'note-timestamp';
        noteTimestamp.textContent = `Last updated: ${new Date(note.updatedAt || note.createdAt).toLocaleString()}`;
    
        noteHeaderLeft.appendChild(noteTitle);
        noteHeaderLeft.appendChild(noteTimestamp);
    
        const noteControls = document.createElement('div');
        noteControls.className = 'note-controls';
    
        const noteCompletionContainer = document.createElement('div');
        noteCompletionContainer.className = 'note-completion-container';
    
        const noteCompletionLabel = document.createElement('label');
        noteCompletionLabel.className = 'note-completion-label';
        noteCompletionLabel.htmlFor = `note-complete-${note.id}`;
        noteCompletionLabel.textContent = 'Mark as complete:';
    
        const noteCompletionCheckbox = document.createElement('input');
        noteCompletionCheckbox.type = 'checkbox';
        noteCompletionCheckbox.id = `note-complete-${note.id}`;
        noteCompletionCheckbox.className = 'note-completion-checkbox';
        noteCompletionCheckbox.checked = note.completed || false;
    
        noteCompletionContainer.appendChild(noteCompletionLabel);
        noteCompletionContainer.appendChild(noteCompletionCheckbox);
    
        const noteActionButtons = document.createElement('div');
        noteActionButtons.className = 'note-action-buttons';
    
        const editButton = document.createElement('button');
        editButton.className = 'note-action-btn edit-btn';
        editButton.innerHTML = '<span class="btn-icon">✏️</span> Edit';
    
        const deleteButton = document.createElement('button');
        deleteButton.className = 'note-action-btn delete-btn';
        deleteButton.innerHTML = '<span class="btn-icon">🗑️</span> Delete';
    
        const exportButton = document.createElement('button');
        exportButton.className = 'note-action-btn export-btn';
        exportButton.innerHTML = '📤 Export';
    
        noteActionButtons.appendChild(editButton);
        noteActionButtons.appendChild(deleteButton);
        noteActionButtons.appendChild(exportButton);
    
        noteControls.appendChild(noteCompletionContainer);
        noteControls.appendChild(noteActionButtons);
    
        noteHeader.appendChild(noteHeaderLeft);
        noteHeader.appendChild(noteControls);
    
        const noteContent = document.createElement('div');
        noteContent.className = 'note-content';
    
        // Only setting the font-family directly on the element
        noteContent.style.fontFamily = '-apple-system, BlinkMacSystemFont, sans-serif';
    
        if (!note.content || note.content.trim() === '') {
            const emptyContent = document.createElement('div');
            emptyContent.className = 'note-content-empty';
            emptyContent.textContent = 'This note is empty. Click "Edit" to add content.';
            noteContent.appendChild(emptyContent);
        } else {
            noteContent.innerHTML = note.content;
        }
    
        noteDisplay.appendChild(noteHeader);
        noteDisplay.appendChild(noteContent);
    
        this.container.innerHTML = '';
        this.container.appendChild(noteDisplay);
    
        this.setupReadModeEvents(editButton, deleteButton, exportButton, noteCompletionCheckbox);
    }

    setupReadModeEvents(editButton, deleteButton,exportButton, completionCheckbox) {
        editButton.addEventListener('click', () => {
            this.switchToEditMode();
        });
    
        deleteButton.addEventListener('click', () => {
            this.deleteNote();
        });
        exportButton.addEventListener('click', () => {
            this.showExportModal();
        });
    
        completionCheckbox.addEventListener('change', () => {
            this.toggleNoteCompletion(completionCheckbox.checked);
        });
    }
    showExportModal() {
        // Create modal container
        const noteExportModalOverlay = document.createElement('div');
        noteExportModalOverlay.className = 'note-export-modal-overlay';
        
        const noteExportModalContent = document.createElement('div');
        noteExportModalContent.className = 'note-export-modal-content';
        
        const noteExportModalHeader = document.createElement('div');
        noteExportModalHeader.className = 'note-export-modal-header';
        
        const noteExportModalTitle = document.createElement('h3');
        noteExportModalTitle.className = 'note-export-modal-title';
        noteExportModalTitle.textContent = 'Export Note';
        
        const noteExportCloseButton = document.createElement('button');
        noteExportCloseButton.className = 'note-export-close-btn';
        noteExportCloseButton.innerHTML = '&times;';
        noteExportCloseButton.title = 'Close';
        
        noteExportModalHeader.appendChild(noteExportModalTitle);
        noteExportModalHeader.appendChild(noteExportCloseButton);
        
        const noteExportModalBody = document.createElement('div');
        noteExportModalBody.className = 'note-export-modal-body';
        
        const formatOptions = [
            { id: 'pdf', icon: '📄', label: 'PDF Document', desc: 'Export as PDF document' },
            { id: 'docx', icon: '📝', label: 'Word Document', desc: 'Export as Microsoft Word document' },
            { id: 'txt', icon: '📋', label: 'Plain Text', desc: 'Export as plain text file' },
            { id: 'html', icon: '🌐', label: 'HTML', desc: 'Export as HTML file' },
            { id: 'md', icon: '📓', label: 'Markdown', desc: 'Export as Markdown file' },
        ];
        
        const noteExportFormatList = document.createElement('div');
        noteExportFormatList.className = 'note-export-format-list';
        
        formatOptions.forEach(format => {
            const noteExportFormatItem = document.createElement('div');
            noteExportFormatItem.className = 'note-export-format-item';
            noteExportFormatItem.dataset.format = format.id;
            
            const noteExportFormatIcon = document.createElement('span');
            noteExportFormatIcon.className = 'note-export-format-icon';
            noteExportFormatIcon.textContent = format.icon;
            
            const noteExportFormatContent = document.createElement('div');
            noteExportFormatContent.className = 'note-export-format-content';
            
            const noteExportFormatLabel = document.createElement('div');
            noteExportFormatLabel.className = 'note-export-format-label';
            noteExportFormatLabel.textContent = format.label;
            
            const noteExportFormatDesc = document.createElement('div');
            noteExportFormatDesc.className = 'note-export-format-desc';
            noteExportFormatDesc.textContent = format.desc;
            
            noteExportFormatContent.appendChild(noteExportFormatLabel);
            noteExportFormatContent.appendChild(noteExportFormatDesc);
            
            noteExportFormatItem.appendChild(noteExportFormatIcon);
            noteExportFormatItem.appendChild(noteExportFormatContent);
            
            noteExportFormatList.appendChild(noteExportFormatItem);
        });
        
        noteExportModalBody.appendChild(noteExportFormatList);
        
        const noteExportModalFooter = document.createElement('div');
        noteExportModalFooter.className = 'note-export-modal-footer';
        
        const noteExportCancelBtn = document.createElement('button');
        noteExportCancelBtn.className = 'note-export-cancel-btn';
        noteExportCancelBtn.textContent = 'Cancel';
        
        noteExportModalFooter.appendChild(noteExportCancelBtn);
        
        noteExportModalContent.appendChild(noteExportModalHeader);
        noteExportModalContent.appendChild(noteExportModalBody);
        noteExportModalContent.appendChild(noteExportModalFooter);
        
        noteExportModalOverlay.appendChild(noteExportModalContent);
        
        document.body.appendChild(noteExportModalOverlay);
        
        // Ensure modal is visible and centered
        setTimeout(() => {
            noteExportModalOverlay.classList.add('note-export-active');
        }, 10);
        
        // Add event listeners
        noteExportCloseButton.addEventListener('click', () => {
            noteExportModalOverlay.classList.remove('note-export-active');
            setTimeout(() => {
                document.body.removeChild(noteExportModalOverlay);
            }, 300);
        });
        
        noteExportCancelBtn.addEventListener('click', () => {
            noteExportModalOverlay.classList.remove('note-export-active');
            setTimeout(() => {
                document.body.removeChild(noteExportModalOverlay);
            }, 300);
        });
        
        // Close on outside click
        noteExportModalOverlay.addEventListener('click', (e) => {
            if (e.target === noteExportModalOverlay) {
                noteExportModalOverlay.classList.remove('note-export-active');
                setTimeout(() => {
                    document.body.removeChild(noteExportModalOverlay);
                }, 300);
            }
        });
        
        // Export format click handling
        noteExportFormatList.addEventListener('click', (e) => {
            const formatItem = e.target.closest('.note-export-format-item');
            if (formatItem) {
                const format = formatItem.dataset.format;
                this.exportNote(format);
                noteExportModalOverlay.classList.remove('note-export-active');
                setTimeout(() => {
                    document.body.removeChild(noteExportModalOverlay);
                }, 300);
            }
        });
    }
    // New function to handle export functionality
    exportNote(format) {
        if (!this.currentNote) return;
        
        const title = this.currentNote.title || 'Untitled Note';
        const content = this.currentNote.content || '';
        const fileName = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${Date.now()}`;
        
        switch (format) {
            case 'pdf':
                this.exportAsPDF(title, content, fileName);
                break;
            case 'docx':
                this.exportAsWord(title, content, fileName);
                break;
            case 'txt':
                this.exportAsText(title, content, fileName);
                break;
            case 'html':
                this.exportAsHTML(title, content, fileName);
                break;
            case 'md':
                this.exportAsMarkdown(title, content, fileName);
                break;
            default:
                console.error('Unsupported export format:', format);
        }
    }
    
    // Helper export functions
    exportAsPDF(title, content, fileName) {
        console.log('Exporting as PDF:', title);
        
        // Create a hidden iframe to generate the PDF
        const iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        document.body.appendChild(iframe);
        
        const doc = iframe.contentDocument || iframe.contentWindow.document;
        doc.open();
        doc.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>${title}</title>
                <style>
                    body {
                        font-family: -apple-system, BlinkMacSystemFont, sans-serif;
                        margin: 40px;
                        line-height: 1.5;
                    }
                    h1 { font-size: 24px; margin-bottom: 20px; }
                    h2 { font-size: 20px; margin-bottom: 15px; }
                    h3 { font-size: 18px; margin-bottom: 10px; }
                    h4 { font-size: 16px; margin-bottom: 10px; }
                    p { margin-bottom: 10px; }
                </style>
            </head>
            <body>
                <h1>${title}</h1>
                <div class="content">${content}</div>
            </body>
            </html>
        `);
        doc.close();
        
        // Use setTimeout to ensure the content is fully loaded
        setTimeout(() => {
            // Use browser's print function to save as PDF
            iframe.contentWindow.print();
            // Clean up
            setTimeout(() => {
                document.body.removeChild(iframe);
            }, 1000);
        }, 500);
    }
    
    exportAsWord(title, content, fileName) {
        console.log('Exporting as Word:', title);
        
        // Create Word-compatible HTML
        const htmlContent = `
            <html xmlns:o="urn:schemas-microsoft-com:office:office" 
                  xmlns:w="urn:schemas-microsoft-com:office:word" 
                  xmlns="http://www.w3.org/TR/REC-html40">
            <head>
                <meta charset="utf-8">
                <title>${title}</title>
                <!--[if gte mso 9]>
                <xml>
                    <w:WordDocument>
                        <w:View>Print</w:View>
                        <w:Zoom>100</w:Zoom>
                        <w:DoNotOptimizeForBrowser/>
                    </w:WordDocument>
                </xml>
                <![endif]-->
                <style>
                    body {
                        font-family: 'Calibri', sans-serif;
                        margin: 1in;
                    }
                    h1 { font-size: 16pt; }
                    h2 { font-size: 14pt; }
                    h3 { font-size: 12pt; }
                    p { font-size: 11pt; }
                </style>
            </head>
            <body>
                <h1>${title}</h1>
                ${content}
            </body>
            </html>
        `;
        
        const blob = new Blob([htmlContent], { type: 'application/msword' });
        this.downloadFile(blob, `${fileName}.doc`);
    }
    exportAsText(title, content, fileName) {
        console.log('Exporting as Text:', title);
        
        // Convert HTML to plain text
        const tempElement = document.createElement('div');
        tempElement.innerHTML = content;
        const plainText = `${title}\n\n${tempElement.textContent}`;
        
        const blob = new Blob([plainText], { type: 'text/plain' });
        this.downloadFile(blob, `${fileName}.txt`);
    }
    
    exportAsHTML(title, content, fileName) {
        console.log('Exporting as HTML:', title);
        
        const htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <title>${title}</title>
                <style>
                    body {
                        font-family: -apple-system, BlinkMacSystemFont, sans-serif;
                        margin: 40px;
                        line-height: 1.5;
                        max-width: 800px;
                        margin: 0 auto;
                        padding: 20px;
                    }
                    h1 { font-size: 24px; margin-bottom: 20px; }
                    h2 { font-size: 20px; margin-bottom: 15px; }
                    h3 { font-size: 18px; margin-bottom: 10px; }
                    h4 { font-size: 16px; margin-bottom: 10px; }
                    p { margin-bottom: 10px; }
                </style>
            </head>
            <body>
                <h1>${title}</h1>
                ${content}
            </body>
            </html>
        `;
        
        const blob = new Blob([htmlContent], { type: 'text/html' });
        this.downloadFile(blob, `${fileName}.html`);
    }
    
    exportAsMarkdown(title, content, fileName) {
        console.log('Exporting as Markdown:', title);
        
        // Convert HTML to Markdown
        const tempElement = document.createElement('div');
        tempElement.innerHTML = content;
        
        // Basic HTML to Markdown conversion
        let markdown = `# ${title}\n\n`;
        
        // Process node by node
        const processNode = (node, level = 0) => {
            if (!node) return '';
            
            let result = '';
            
            // Process node based on type
            switch (node.nodeType) {
                case Node.TEXT_NODE:
                    result += node.textContent;
                    break;
                    
                case Node.ELEMENT_NODE:
                    const tagName = node.tagName.toLowerCase();
                    
                    // Handle different HTML elements
                    switch (tagName) {
                        case 'h1':
                            result += `# ${node.textContent.trim()}\n\n`;
                            break;
                        case 'h2':
                            result += `## ${node.textContent.trim()}\n\n`;
                            break;
                        case 'h3':
                            result += `### ${node.textContent.trim()}\n\n`;
                            break;
                        case 'h4':
                            result += `#### ${node.textContent.trim()}\n\n`;
                            break;
                        case 'p':
                            result += `${node.textContent.trim()}\n\n`;
                            break;
                        case 'strong':
                        case 'b':
                            result += `**${node.textContent.trim()}**`;
                            break;
                        case 'em':
                        case 'i':
                            result += `*${node.textContent.trim()}*`;
                            break;
                        case 'u':
                            result += `_${node.textContent.trim()}_`;
                            break;
                        case 'code':
                        case 'pre':
                            result += `\`\`\`\n${node.textContent.trim()}\n\`\`\`\n\n`;
                            break;
                        case 'blockquote':
                            result += `> ${node.textContent.trim()}\n\n`;
                            break;
                        case 'a':
                            result += `[${node.textContent.trim()}](${node.getAttribute('href')})`;
                            break;
                        case 'img':
                            result += `![${node.getAttribute('alt') || 'Image'}](${node.getAttribute('src')})`;
                            break;
                        case 'ul':
                            // Process list items
                            for (const child of node.children) {
                                if (child.tagName.toLowerCase() === 'li') {
                                    result += `- ${child.textContent.trim()}\n`;
                                }
                            }
                            result += '\n';
                            break;
                        case 'ol':
                            // Process ordered list items
                            let counter = 1;
                            for (const child of node.children) {
                                if (child.tagName.toLowerCase() === 'li') {
                                    result += `${counter}. ${child.textContent.trim()}\n`;
                                    counter++;
                                }
                            }
                            result += '\n';
                            break;
                        default:
                            // For other elements, process children
                            for (const child of node.childNodes) {
                                result += processNode(child, level);
                            }
                    }
                    break;
            }
            
            return result;
        };
        
        // Process all child nodes
        for (const child of tempElement.childNodes) {
            markdown += processNode(child);
        }
        
        const blob = new Blob([markdown], { type: 'text/markdown' });
        this.downloadFile(blob, `${fileName}.md`);
    }
    
    // Helper function to download files
    downloadFile(blob, fileName) {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = fileName;
        link.style.display = 'none';
        
        document.body.appendChild(link);
        link.click();
        
        setTimeout(() => {
            document.body.removeChild(link);
            URL.revokeObjectURL(link.href);
        }, 100);
    }  
    switchToEditMode() {
        if (!this.currentNote || !this.container) return;
    
        this.isEditing = true;
        this.originalTitle = this.currentNote.title || '';
        this.originalContent = this.currentNote.content || '';
    
        const editForm = document.createElement('div');
        editForm.className = 'note-edit-form';
    
        const formHeader = document.createElement('div');
        formHeader.className = 'note-form-header';
    
        const titleLabel = document.createElement('label');
        titleLabel.htmlFor = 'note-title-input';
        titleLabel.textContent = 'Note Title:';
        titleLabel.className = 'note-form-label';
    
        const titleInput = document.createElement('input');
        titleInput.type = 'text';
        titleInput.id = 'note-title-input';
        titleInput.className = 'note-title-input';
        titleInput.value = this.currentNote.title || '';
        titleInput.placeholder = 'Enter note title...';
    
        const formActions = document.createElement('div');
        formActions.className = 'note-form-actions';
    
        const saveButton = document.createElement('button');
        saveButton.className = 'note-form-btn save-btn';
        saveButton.innerHTML = '<span class="btn-icon">💾</span> Save';
    
        const cancelButton = document.createElement('button');
        cancelButton.className = 'note-form-btn cancel-btn';
        cancelButton.innerHTML = '<span class="btn-icon">❌</span> Cancel';
    
        formActions.appendChild(saveButton);
        formActions.appendChild(cancelButton);
    
        formHeader.appendChild(titleLabel);
        formHeader.appendChild(titleInput);
        formHeader.appendChild(formActions);
    
        const editorLabel = document.createElement('label');
        editorLabel.htmlFor = 'note-content-editor';
        editorLabel.textContent = 'Note Content:';
        editorLabel.className = 'note-form-label';
    
        const editorContainer = document.createElement('div');
        editorContainer.className = 'note-editor-container';
    
        const toolbar = document.createElement('div');
        toolbar.className = 'editor-toolbar';
    
        // Enhanced Toolbar Buttons
        const boldBtn = this.createToolbarButton('Bold', 'B', 'bold');
        const italicBtn = this.createToolbarButton('Italic', 'I', 'italic');
        const underlineBtn = this.createToolbarButton('Underline', 'U', 'underline');
        const strikeBtn = this.createToolbarButton('Strikethrough', 'S', 'strikeThrough');
        const listBtn = this.createToolbarButton('Bullet List', '•', 'insertUnorderedList');
        const numberedListBtn = this.createToolbarButton('Numbered List', '1.', 'insertOrderedList');
        const blockquoteBtn = this.createToolbarButton('Blockquote', '❝', 'formatBlock', '<blockquote>');
        const codeBtn = this.createToolbarButton('Code', '</>', 'formatBlock', '<pre>');
        const linkBtn = this.createToolbarButton('Insert Link', '🔗', 'createLink');
        const unlinkBtn = this.createToolbarButton('Remove Link', '🔗❌', 'unlink');
        const imageBtn = this.createToolbarButton('Insert Image', '🖼️', 'insertImage');
        const undoBtn = this.createToolbarButton('Undo', '↺', 'undo');
        const redoBtn = this.createToolbarButton('Redo', '↻', 'redo');
        const clearFormatBtn = this.createToolbarButton('Clear Formatting', '✖', 'removeFormat');
    
        // Heading Selector
        const headingSelect = document.createElement('select');
        headingSelect.className = 'toolbar-select';
        headingSelect.innerHTML = `
            <option value="">Normal Text</option>
            <option value="h1">Heading 1</option>
            <option value="h2">Heading 2</option>
            <option value="h3">Heading 3</option>
            <option value="h4">Heading 4</option>
        `;
        headingSelect.addEventListener('change', (e) => {
            const value = e.target.value;
            if (value) {
                document.execCommand('formatBlock', false, value);
            } else {
                document.execCommand('formatBlock', false, '<p>');
            }
            this.richTextEditor.focus();
        });
    
        toolbar.appendChild(boldBtn);
        toolbar.appendChild(italicBtn);
        toolbar.appendChild(underlineBtn);
        toolbar.appendChild(strikeBtn);
        toolbar.appendChild(headingSelect);
        toolbar.appendChild(listBtn);
        toolbar.appendChild(numberedListBtn);
        toolbar.appendChild(blockquoteBtn);
        toolbar.appendChild(codeBtn);
        toolbar.appendChild(linkBtn);
        toolbar.appendChild(unlinkBtn);
        toolbar.appendChild(imageBtn);
        toolbar.appendChild(undoBtn);
        toolbar.appendChild(redoBtn);
        toolbar.appendChild(clearFormatBtn);
    
        const editor = document.createElement('div');
        editor.id = 'note-content-editor';
        editor.className = 'note-content-editor';
        editor.contentEditable = true;
        editor.innerHTML = this.currentNote.content || '';
    
        // Apply iOS system font and other styles
        editor.style.cssText = `
            font-family: -apple-system, BlinkMacSystemFont, sans-serif;
            h1 { font-size: 2em; margin: 0.67em 0; }
            h2 { font-size: 1.5em; margin: 0.75em 0; }
            h3 { font-size: 1.17em; margin: 0.83em 0; }
            h4 { font-size: 1em; margin: 1.12em 0; }
            ul, ol { padding-left: 40px; }
            ul { list-style-type: disc; }
            ol { list-style-type: decimal; }
        `;
    
        this.richTextEditor = editor;
    
        editorContainer.appendChild(toolbar);
        editorContainer.appendChild(editor);
    
        editForm.appendChild(formHeader);
        editForm.appendChild(editorLabel);
        editForm.appendChild(editorContainer);
    
        this.container.innerHTML = '';
        this.container.appendChild(editForm);
    
        // Handle paste event to ensure proper formatting
        editor.addEventListener('paste', (e) => {
            e.preventDefault();
            const text = (e.clipboardData || window.clipboardData).getData('text/plain');
            const lines = text.split('\n');
            let formattedContent = '';
    
            lines.forEach(line => {
                if (line.trim() === '') {
                    formattedContent += '<br>';
                } else if (line.startsWith('#### ')) {
                    formattedContent += `<h4>${line.substring(5).trim()}</h4>`;
                } else if (line.startsWith('### ')) {
                    formattedContent += `<h3>${line.substring(4).trim()}</h3>`;
                } else if (line.startsWith('## ')) {
                    formattedContent += `<h2>${line.substring(3).trim()}</h2>`;
                } else if (line.startsWith('# ')) {
                    formattedContent += `<h1>${line.substring(2).trim()}</h1>`;
                } else {
                    formattedContent += `<p>${line.trim()}</p>`;
                }
            });
    
            document.execCommand('insertHTML', false, formattedContent);
        });
    
        this.setupEditModeEvents(saveButton, cancelButton, toolbar, headingSelect);
        titleInput.focus();
    }
    
    createToolbarButton(title, label, command, value = null) {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'toolbar-btn';
        button.dataset.command = command;
        button.dataset.value = value;
        button.title = title;
        button.textContent = label;
        return button;
    }
    
    setupEditModeEvents(saveButton, cancelButton, toolbar, headingSelect) {
        saveButton.addEventListener('click', () => {
            this.saveNote();
        });
    
        cancelButton.addEventListener('click', () => {
            this.cancelEdit();
        });
    
        toolbar.addEventListener('click', (e) => {
            const button = e.target.closest('.toolbar-btn');
            if (button) {
                e.preventDefault();
                const command = button.dataset.command;
                const value = button.dataset.value;
                if (command === 'createLink') {
                    const url = prompt('Enter the URL:');
                    if (url) {
                        document.execCommand(command, false, url);
                    }
                } else if (command === 'insertImage') {
                    const url = prompt('Enter the image URL:');
                    if (url) {
                        document.execCommand(command, false, url);
                    }
                } else {
                    document.execCommand(command, false, value);
                    this.updateToolbarButtonState(button, command);
                }
                this.richTextEditor.focus();
            }
        });
    
        this.richTextEditor.addEventListener('keydown', (e) => {
            // Save note with Ctrl+S
            if (e.ctrlKey && e.key === 's') {
                e.preventDefault();
                this.saveNote();
            }
            // Cancel edit with Escape
            if (e.key === 'Escape') {
                e.preventDefault();
                this.cancelEdit();
            }
            // Bold with Ctrl+B
            if (e.ctrlKey && e.key === 'b') {
                e.preventDefault();
                document.execCommand('bold');
                this.updateToolbarButtonState(toolbar.querySelector('[data-command="bold"]'), 'bold');
            }
            // Italic with Ctrl+I
            if (e.ctrlKey && e.key === 'i') {
                e.preventDefault();
                document.execCommand('italic');
                this.updateToolbarButtonState(toolbar.querySelector('[data-command="italic"]'), 'italic');
            }
            // Underline with Ctrl+U
            if (e.ctrlKey && e.key === 'u') {
                e.preventDefault();
                document.execCommand('underline');
                this.updateToolbarButtonState(toolbar.querySelector('[data-command="underline"]'), 'underline');
            }
            // Strikethrough with Ctrl+Shift+S
            if (e.ctrlKey && e.shiftKey && e.key === 'S') {
                e.preventDefault();
                document.execCommand('strikeThrough');
                this.updateToolbarButtonState(toolbar.querySelector('[data-command="strikeThrough"]'), 'strikeThrough');
            }
            // Insert unordered list with Ctrl+Shift+L
            if (e.ctrlKey && e.shiftKey && e.key === 'L') {
                e.preventDefault();
                document.execCommand('insertUnorderedList');
                this.updateToolbarButtonState(toolbar.querySelector('[data-command="insertUnorderedList"]'), 'insertUnorderedList');
            }
            // Insert ordered list with Ctrl+Shift+O
            if (e.ctrlKey && e.shiftKey && e.key === 'O') {
                e.preventDefault();
                document.execCommand('insertOrderedList');
                this.updateToolbarButtonState(toolbar.querySelector('[data-command="insertOrderedList"]'), 'insertOrderedList');
            }
            // Clear formatting with Ctrl+Shift+C
            if (e.ctrlKey && e.shiftKey && e.key === 'C') {
                e.preventDefault();
                document.execCommand('removeFormat');
                this.updateToolbarButtonStates();
                this.resetHeadingSelector(headingSelect);
            }
        });
    
        this.richTextEditor.addEventListener('input', () => {
            this.updateToolbarButtonStates();
            this.updateHeadingSelector(headingSelect);
        });
    
        // Handle Enter key with a specific approach for formatting and heading reset
        this.richTextEditor.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                // Remember if any formatting is active
                const formattingStates = {
                    underline: document.queryCommandState('underline'),
                    bold: document.queryCommandState('bold'),
                    italic: document.queryCommandState('italic'),
                    strikeThrough: document.queryCommandState('strikeThrough')
                };
                
                // Check if we're in a heading
                let currentHeadingState = this.getCurrentBlockFormat();
                let isHeading = currentHeadingState && ['H1', 'H2', 'H3', 'H4'].includes(currentHeadingState);
                
                // Let the default Enter behavior happen
                setTimeout(() => {
                    // Force all formatting off
                    this.enforceNoFormatting();
                    
                    // Reset heading specifically if we were in a heading
                    if (isHeading) {
                        document.execCommand('formatBlock', false, 'p');
                        // Update the heading selector to show "Normal Text"
                        this.resetHeadingSelector(headingSelect);
                    }
                    
                    // Update all toolbar buttons
                    this.updateToolbarButtonStates();
                }, 0);
            }
        });
    
        // Monitor for heading changes using MutationObserver
        const observer = new MutationObserver(() => {
            this.updateHeadingSelector(headingSelect);
        });
        
        observer.observe(this.richTextEditor, {
            childList: true,
            subtree: true,
            characterData: true,
            attributes: true
        });
    
        // Initialize with all formatting disabled
        this.enforceNoFormatting();
        this.updateToolbarButtonStates();
        this.resetHeadingSelector(headingSelect);
    }
    
    // Get the current block format (p, h1, h2, etc.)
    getCurrentBlockFormat() {
        const selection = window.getSelection();
        if (selection.rangeCount === 0) return null;
        
        let node = selection.getRangeAt(0).commonAncestorContainer;
        
        // If we're in a text node, get its parent
        if (node.nodeType === 3) {
            node = node.parentNode;
        }
        
        // Walk up the DOM until we find a block-level element
        while (node && node !== this.richTextEditor) {
            const nodeName = node.nodeName.toUpperCase();
            if (['P', 'H1', 'H2', 'H3', 'H4', 'PRE', 'BLOCKQUOTE'].includes(nodeName)) {
                return nodeName;
            }
            node = node.parentNode;
        }
        
        return null;
    }
    
    // Reset heading selector to "Normal Text"
    resetHeadingSelector(headingSelect) {
        if (headingSelect) {
            headingSelect.value = "";
        }
    }
    
    // Update heading selector based on current cursor position
    updateHeadingSelector(headingSelect) {
        if (!headingSelect) return;
        
        const currentFormat = this.getCurrentBlockFormat();
        
        if (!currentFormat) {
            headingSelect.value = "";
            return;
        }
        
        switch (currentFormat) {
            case 'H1':
                headingSelect.value = "h1";
                break;
            case 'H2':
                headingSelect.value = "h2";
                break;
            case 'H3':
                headingSelect.value = "h3";
                break;
            case 'H4':
                headingSelect.value = "h4";
                break;
            default:
                headingSelect.value = "";
        }
    }
    
    // Enhanced method to enforce no formatting with special handling for underline
    enforceNoFormatting() {
        // Get current selection
        const selection = window.getSelection();
        if (!selection.rangeCount) return;
        
        // Store cursor position
        const range = selection.getRangeAt(0).cloneRange();
        
        // First specifically handle underline
        if (document.queryCommandState('underline')) {
            document.execCommand('underline', false, false);
        }
        
        // Apply removeFormat to ensure any existing formatting is cleared
        document.execCommand('removeFormat', false, null);
        
        // Explicitly turn off each formatting command if it's active
        // Handle underline first and separately for special emphasis
        document.execCommand('underline', false, false);
        
        const formattingCommands = ['bold', 'italic', 'strikeThrough'];
        formattingCommands.forEach(command => {
            if (document.queryCommandState(command)) {
                document.execCommand(command, false, false);
            }
        });
        
        // Insert a special marker paragraph at cursor position for a clean break
        const marker = document.createElement('span');
        marker.id = 'temp-marker-' + Date.now();
        marker.innerHTML = '&#8203;'; // Zero-width space
        marker.style.textDecoration = 'none'; // Explicitly set no underline
        
        // Insert the marker
        range.insertNode(marker);
        
        // Remove all formatting from the marker and surrounding text
        if (marker.parentElement) {
            // Explicitly remove underline from the parent element
            marker.parentElement.style.textDecoration = 'none';
            marker.parentElement.style.fontWeight = 'normal';
            marker.parentElement.style.fontStyle = 'normal';
        }
        
        // Create a new clean range at the marker
        const newRange = document.createRange();
        newRange.selectNodeContents(marker);
        newRange.collapse(false); // Collapse to end
        
        // Select the clean position
        selection.removeAllRanges();
        selection.addRange(newRange);
        
        // Remove our marker element now that we've positioned the cursor
        if (marker.parentNode) {
            // Create a text node with a formatting reset wrapper
            const cleanSpan = document.createElement('span');
            cleanSpan.style.textDecoration = 'none';
            cleanSpan.appendChild(document.createTextNode('\u200B')); // Zero-width space
            
            marker.parentNode.replaceChild(cleanSpan, marker);
            
            // Position cursor after the clean span
            newRange.selectNodeContents(cleanSpan);
            newRange.collapse(false);
            selection.removeAllRanges();
            selection.addRange(newRange);
        }
        
        // Check one more time for underline and forcefully disable it
        if (document.queryCommandState('underline')) {
            document.execCommand('underline', false, false);
        }
        
        // Force update toolbar state
        this.updateToolbarButtonStates();
        
        // Update underline button specifically
        const underlineButton = this.container.querySelector('.toolbar-btn[data-command="underline"]');
        if (underlineButton) {
            underlineButton.classList.remove('active');
        }
    }
    
    // Keep your existing methods
    updateToolbarButtonState(button, command) {
        const isActive = document.queryCommandState(command);
        button.classList.toggle('active', isActive);
    }
    
    updateToolbarButtonStates() {
        const buttons = this.container.querySelectorAll('.toolbar-btn');
        buttons.forEach(button => {
            const command = button.dataset.command;
            if (command) {
                const isActive = document.queryCommandState(command);
                button.classList.toggle('active', isActive);
            }
        });
    }

    saveNote() {
        if (!this.currentNote || !this.container) return;

        const titleInput = this.container.querySelector('#note-title-input');
        const newTitle = titleInput ? titleInput.value.trim() : this.currentNote.title || '';
        const newContent = this.richTextEditor ? this.richTextEditor.innerHTML : this.currentNote.content || '';

        const updateData = {
            title: newTitle,
            content: newContent
        };

        this.noteTabsManager.updateNote(this.currentNote.id, updateData)
            .then(() => {
                console.log("Note saved successfully");
                this.currentNote.title = newTitle;
                this.currentNote.content = newContent;
                this.isEditing = false;
                this.renderReadMode();
            })
            .catch(error => {
                console.error("Error saving note:", error);
                alert('Failed to save note. Please try again.');
            });
    }

    cancelEdit() {
        if (!this.currentNote) return;

        this.currentNote.title = this.originalTitle;
        this.currentNote.content = this.originalContent;
        this.isEditing = false;
        this.renderReadMode();
    }

    deleteNote() {
        if (!this.currentNote) return;

        if (!confirm(`Are you sure you want to delete the note "${this.currentNote.title || 'Untitled Note'}"?`)) {
            return;
        }

        this.noteTabsManager.deleteNote(this.currentNote.id)
            .then(() => {
                console.log("Note deleted successfully");
            })
            .catch(error => {
                console.error("Error deleting note:", error);
                alert('Failed to delete note. Please try again.');
            });
    }

    toggleNoteCompletion(isCompleted) {
        if (!this.currentNote) return;

        this.noteTabsManager.updateNote(this.currentNote.id, { completed: isCompleted })
            .then(() => {
                console.log(`Note marked as ${isCompleted ? 'completed' : 'incomplete'}`);
            })
            .catch(error => {
                console.error("Error updating note completion status:", error);
                alert('Failed to update note status. Please try again.');
            });
    }
}