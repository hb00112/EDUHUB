const homeSection = {
    initialize: function() {
        const homeContent = `
            <div class="container mx-auto px-6">
                <div class="text-reveal mb-8">
                    <h1 class="text-6xl md:text-8xl font-bold mb-6">
                        <span class="block">Welcome to Mordern Learning</span>
                        <span class="gradient-text">Hemant Borana</span>
                    </h1>
                </div>
                <p class="text-xl md:text-2xl text-gray-400 mb-12 text-reveal">
                    Your personalized learning journey starts here
                </p>
                
                <div class="flex gap-6">
                    <button class="btn btn-primary" data-section="subjects">Get Started</button>
                    <button class="btn btn-secondary" data-section="resources">Learn More</button>
                </div>
            </div>

            <section class="container mx-auto px-6 py-32">
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <div class="glass-card p-8">
                        <h3 class="text-2xl font-bold mb-4">Study Progress</h3>
                        <p class="text-gray-400">Track your learning journey with detailed analytics and insights.</p>
                    </div>
                    <div class="glass-card p-8">
                        <h3 class="text-2xl font-bold mb-4">Upcoming Topics</h3>
                        <p class="text-gray-400">Preview and prepare for your next learning objectives.</p>
                    </div>
                    <div class="glass-card p-8">
                        <h3 class="text-2xl font-bold mb-4">Recent Notes</h3>
                        <p class="text-gray-400">Access your latest study materials and annotations.</p>
                    </div>
                </div>
            </section>`;

        const homeSection = document.getElementById('home');
        homeSection.innerHTML = homeContent;
        this.initializeEffects();
    },

    initializeEffects: function() {
        // Initialize card hover effects
        document.querySelectorAll('.glass-card').forEach(card => {
            card.addEventListener('mousemove', this.handleCardHover);
            card.addEventListener('mouseleave', this.handleCardLeave);
        });

        // Initialize button effects
        document.querySelectorAll('.btn').forEach(button => {
            button.addEventListener('mousemove', this.handleButtonHover);
            button.addEventListener('mouseleave', this.handleButtonLeave);
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
    },

    handleButtonHover: function(e) {
        const rect = this.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const deltaX = (x - centerX) * 0.1;
        const deltaY = (y - centerY) * 0.1;
        
        this.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
    },

    handleButtonLeave: function() {
        this.style.transform = 'translate(0, 0)';
    }
};

// Initialize home section
document.addEventListener('DOMContentLoaded', () => {
    homeSection.initialize();
});