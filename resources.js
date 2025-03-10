const resourcesSection = {
    initialize: function() {
        const resourcesContent = `
            <div class="section-template">
                <div class="section-header">
                    <h2 class="gradient-text text-4xl font-bold mb-4">Resources</h2>
                    <p class="text-gray-400 text-xl mb-8">Educational materials and tools</p>
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
                    ${this.createResourceCards()}
                </div>
                
                <div class="coming-soon-container">
                    <h3 class="coming-soon-text">More Resources Coming Soon</h3>
                    <p class="text-gray-400 text-xl">Additional study materials and interactive tools</p>
                </div>
            </div>`;

        const resourcesSection = document.getElementById('resources');
        resourcesSection.innerHTML = resourcesContent;
        this.initializeEffects();
    },

    createResourceCards: function() {
        const resources = [
            { title: 'E-Books', icon: '📚' },
            { title: 'Video Lectures', icon: '🎥' },
            { title: 'Study Guides', icon: '📖' },
            { title: 'Practice Sets', icon: '✏️' }
        ];

        return resources.map(resource => `
            <div class="glass-card p-8 text-center">
                <div class="text-4xl mb-4">${resource.icon}</div>
                <h3 class="text-xl font-bold">${resource.title}</h3>
            </div>
        `).join('');
    },

    initializeEffects: function() {
        document.querySelectorAll('.glass-card').forEach(card => {
            card.addEventListener('mousemove', this.handleCardHover);
            card.addEventListener('mouseleave', this.handleCardLeave);
        });
    },

    handleCardHover: function(e) {
        const rect = this.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const rotateX = (y - centerY) * -0.01;
        const rotateY = (x - centerX) * 0.01;
        
        this.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    },

    handleCardLeave: function() {
        this.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg)';
    }
};

// Initialize resources section when loaded
document.addEventListener('DOMContentLoaded', () => {
    const resourcesNav = document.querySelector('[data-section="resources"]');
    resourcesNav.addEventListener('click', () => {
        resourcesSection.initialize();
    });
});