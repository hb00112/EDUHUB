//MAIN.JS
document.addEventListener('DOMContentLoaded', () => {
    // Initialize cursor
    const cursor = document.querySelector('.cursor');
    if (cursor) {
        document.addEventListener('mousemove', (e) => {
            cursor.style.transform = `translate(${e.clientX - 10}px, ${e.clientY - 10}px)`;
        });
    }

    // Section management
    let currentSection = 'home';

    const switchSection = (sectionId) => {
        if (currentSection === sectionId) return;

        // Hide current section
        document.querySelector(`#${currentSection}`).classList.remove('active');
        
        // Show new section
        const newSection = document.querySelector(`#${sectionId}`);
        newSection.classList.add('active');
        
        currentSection = sectionId;
    };

    // Event listene
    //rs for navigation
    document.querySelectorAll('[data-section]').forEach(element => {
        element.addEventListener('click', (e) => {
            e.preventDefault();
            const sectionId = element.dataset.section;
            switchSection(sectionId);
        });
    });
});
