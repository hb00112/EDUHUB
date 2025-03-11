// content-manager.js
class ContentManager {
    constructor() {
        this.notesManager = new NotesManager();
    }

    initialize() {
        const content = document.createElement('div');
        content.className = 'subjects-notes-section';

        // Initialize notes section
        content.appendChild(this.notesManager.initialize());

        return content;
    }
}