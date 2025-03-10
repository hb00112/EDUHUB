const quizzesSection = {
    initialize: function() {
        const quizzesContent = `
            <div class="section-template">
                <div class="section-header">
                    <h2 class="gradient-text text-4xl font-bold mb-4">Quizzes</h2>
                    <p class="text-gray-400 text-xl mb-8">Test your knowledge</p>
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                    ${this.createQuizCategories()}
                </div>
                
                <div class="coming-soon-container">
                    <h3 class="coming-soon-text">Interactive Quizzes Coming Soon</h3>
                    <p class="text-gray-400 text-xl">Practice tests and assessments for all subjects</p>
                </div>
            </div>`;

        const quizzesSection = document.getElementById('quizzes');
        quizzesSection.innerHTML = quizzesContent;
        this.initializeEffects();
    },

    createQuizCategories: function() {
        const categories = [
            { title: 'Practice Tests', icon: '📝' },
            { title: 'Flash Cards', icon: '🎴' },
            { title: 'Challenges', icon: '🏆' }
        ];

        return categories.map(category => `
            <div class="glass-card p-8 text-center">
                <div class="text-4xl mb-4">${category.icon}</div>
                <h3 class="text-2xl font-bold">${category.title}</h3>
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

// Initialize quizzes section when loaded
document.addEventListener('DOMContentLoaded', () => {
    const quizzesNav = document.querySelector('[data-section="quizzes"]');
    quizzesNav.addEventListener('click', () => {
        quizzesSection.initialize();
    });
});