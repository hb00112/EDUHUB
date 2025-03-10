const plannerSection = {
    initialize: function() {
        const plannerContent = `
            <div class="section-template">
                <div class="section-header">
                    <h2 class="gradient-text text-4xl font-bold mb-4">Study Planner</h2>
                    <p class="text-gray-400 text-xl mb-8">Organize your learning journey</p>
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
                    ${this.createPlannerFeatures()}
                </div>
                
                <div class="coming-soon-container">
                    <h3 class="coming-soon-text">Advanced Features Coming Soon</h3>
                    <p class="text-gray-400 text-xl">Smart scheduling and AI-powered recommendations</p>
                </div>
            </div>`;

        const plannerSection = document.getElementById('planner');
        plannerSection.innerHTML = plannerContent;
        this.initializeEffects();
    },

    createPlannerFeatures: function() {
        const features = [
            {
                title: 'Weekly Schedule',
                description: 'Plan your study sessions with our interactive calendar'
            },
            {
                title: 'Progress Tracking',
                description: 'Monitor your learning progress across all subjects'
            }
        ];

        return features.map(feature => `
            <div class="glass-card p-8">
                <h3 class="text-2xl font-bold mb-4">${feature.title}</h3>
                <p class="text-gray-400">${feature.description}</p>
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

// Initialize planner section when loaded
document.addEventListener('DOMContentLoaded', () => {
    const plannerNav = document.querySelector('[data-section="planner"]');
    plannerNav.addEventListener('click', () => {
        plannerSection.initialize();
    });
});