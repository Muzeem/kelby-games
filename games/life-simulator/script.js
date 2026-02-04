// Life Choices - Complete Rebuild with Rich Story Content

class LifeChoicesGame {
    constructor() {
        this.stats = {
            money: 0,
            happiness: 50,
            education: 0,
            reputation: 0,
            health: 100,
            age: 18
        };
        
        this.currentStage = 0;
        this.currentScenario = 0;
        this.totalScenarios = 0;
        this.achievements = [];
        this.storyPath = [];
        
        this.stages = [
            { name: 'Young Adult', icon: '🎓', ageRange: [18, 25] },
            { name: 'Career Start', icon: '💼', ageRange: [25, 35] },
            { name: 'Relationships', icon: '❤️', ageRange: [25, 40] },
            { name: 'Mid-Life', icon: '🏠', ageRange: [35, 50] },
            { name: 'Mature Years', icon: '🌟', ageRange: [50, 65] },
            { name: 'Retirement', icon: '🌅', ageRange: [65, 80] }
        ];
        
        this.scenarios = this.createScenarios();
        this.achievementsList = this.createAchievements();
    }
    
    createScenarios() {
        return {
            youngAdult: [
                {
                    title: "College Decision",
                    text: "You've just graduated high school. Your parents are discussing your future. What path will you choose?",
                    choices: [
                        {
                            text: "Attend a prestigious university",
                            effects: { education: 30, money: -20000, happiness: 10 },
                            description: "High education, expensive"
                        },
                        {
                            text: "Go to community college",
                            effects: { education: 15, money: -5000, happiness: 5 },
                            description: "Balanced approach"
                        },
                        {
                            text: "Start working immediately",
                            effects: { money: 15000, education: 0, happiness: -5 },
                            description: "Earn money early"
                        },
                        {
                            text: "Take a gap year to travel",
                            effects: { happiness: 20, money: -10000, education: 5 },
                            description: "Life experience"
                        }
                    ]
                },
                {
                    title: "First Job Opportunity",
                    text: "You've received multiple job offers. Each has different benefits and challenges.",
                    choices: [
                        {
                            text: "High-paying corporate job",
                            effects: { money: 50000, happiness: -10, reputation: 15 },
                            description: "Good money, stressful"
                        },
                        {
                            text: "Startup with equity",
                            effects: { money: 20000, happiness: 15, reputation: 10 },
                            description: "Risky but exciting"
                        },
                        {
                            text: "Non-profit organization",
                            effects: { money: 25000, happiness: 20, reputation: 20 },
                            description: "Fulfilling work"
                        },
                        {
                            text: "Freelance/Self-employed",
                            effects: { money: 30000, happiness: 10, reputation: 5 },
                            description: "Be your own boss"
                        }
                    ]
                },
                {
                    title: "Living Situation",
                    text: "You need to decide where to live. Your choice will affect your finances and lifestyle.",
                    choices: [
                        {
                            text: "Rent a nice apartment alone",
                            effects: { money: -30000, happiness: 15, health: 10 },
                            description: "Privacy and comfort"
                        },
                        {
                            text: "Share apartment with roommates",
                            effects: { money: -15000, happiness: 5, reputation: 5 },
                            description: "Save money, social"
                        },
                        {
                            text: "Live with parents",
                            effects: { money: 10000, happiness: -10, health: 5 },
                            description: "Save lots of money"
                        },
                        {
                            text: "Buy a small condo",
                            effects: { money: -50000, happiness: 20, reputation: 10 },
                            description: "Investment for future"
                        }
                    ]
                }
            ],
            careerStart: [
                {
                    title: "Career Advancement",
                    text: "Your boss offers you a promotion, but it requires relocating to another city.",
                    choices: [
                        {
                            text: "Accept promotion and relocate",
                            effects: { money: 40000, reputation: 25, happiness: -5 },
                            description: "Career growth"
                        },
                        {
                            text: "Decline and stay put",
                            effects: { money: 10000, happiness: 10, reputation: -5 },
                            description: "Stability"
                        },
                        {
                            text: "Negotiate remote work",
                            effects: { money: 30000, happiness: 15, reputation: 15 },
                            description: "Best of both worlds"
                        },
                        {
                            text: "Look for opportunities elsewhere",
                            effects: { money: 35000, reputation: 10, happiness: 5 },
                            description: "Explore options"
                        }
                    ]
                },
                {
                    title: "Investment Opportunity",
                    text: "A friend pitches you an investment opportunity. It could be lucrative or risky.",
                    choices: [
                        {
                            text: "Invest heavily",
                            effects: { money: -30000, happiness: -10, reputation: 5 },
                            description: "High risk, high reward"
                        },
                        {
                            text: "Invest moderately",
                            effects: { money: -10000, happiness: 0, reputation: 5 },
                            description: "Balanced approach"
                        },
                        {
                            text: "Decline the investment",
                            effects: { money: 5000, happiness: 5, reputation: 0 },
                            description: "Play it safe"
                        },
                        {
                            text: "Counter with your own idea",
                            effects: { money: 15000, happiness: 10, reputation: 15 },
                            description: "Entrepreneurial spirit"
                        }
                    ]
                },
                {
                    title: "Skill Development",
                    text: "You have free time. How will you invest in yourself?",
                    choices: [
                        {
                            text: "Take online courses",
                            effects: { education: 20, money: -5000, reputation: 10 },
                            description: "Improve skills"
                        },
                        {
                            text: "Attend networking events",
                            effects: { reputation: 20, money: -2000, happiness: 5 },
                            description: "Build connections"
                        },
                        {
                            text: "Start a side business",
                            effects: { money: 20000, happiness: 10, health: -10 },
                            description: "Extra income"
                        },
                        {
                            text: "Focus on health and fitness",
                            effects: { health: 20, happiness: 15, money: -3000 },
                            description: "Invest in wellness"
                        }
                    ]
                }
            ],
            relationships: [
                {
                    title: "Romantic Relationship",
                    text: "You've met someone special. How will you approach this relationship?",
                    choices: [
                        {
                            text: "Commit fully and move in together",
                            effects: { happiness: 25, money: -10000, health: 10 },
                            description: "Deep commitment"
                        },
                        {
                            text: "Take it slow and steady",
                            effects: { happiness: 15, money: 0, health: 5 },
                            description: "Cautious approach"
                        },
                        {
                            text: "Focus on career instead",
                            effects: { money: 30000, happiness: -10, reputation: 10 },
                            description: "Career priority"
                        },
                        {
                            text: "Balance both love and career",
                            effects: { happiness: 20, money: 15000, health: 5 },
                            description: "Have it all"
                        }
                    ]
                },
                {
                    title: "Family Planning",
                    text: "You and your partner are discussing starting a family. What's your decision?",
                    choices: [
                        {
                            text: "Start a family now",
                            effects: { happiness: 30, money: -40000, health: -5 },
                            description: "Begin parenthood"
                        },
                        {
                            text: "Wait a few more years",
                            effects: { money: 20000, happiness: 10, reputation: 5 },
                            description: "Build stability first"
                        },
                        {
                            text: "Adopt a pet instead",
                            effects: { happiness: 20, money: -5000, health: 10 },
                            description: "Smaller commitment"
                        },
                        {
                            text: "Focus on career goals",
                            effects: { money: 40000, reputation: 20, happiness: -5 },
                            description: "Professional growth"
                        }
                    ]
                },
                {
                    title: "Social Life",
                    text: "Your friends want to go on an expensive vacation. What do you do?",
                    choices: [
                        {
                            text: "Join them on the trip",
                            effects: { happiness: 25, money: -15000, health: 10 },
                            description: "Create memories"
                        },
                        {
                            text: "Suggest a budget alternative",
                            effects: { happiness: 15, money: -5000, reputation: 10 },
                            description: "Compromise"
                        },
                        {
                            text: "Decline and save money",
                            effects: { money: 10000, happiness: -10, reputation: -5 },
                            description: "Financial responsibility"
                        },
                        {
                            text: "Plan your own solo adventure",
                            effects: { happiness: 20, money: -8000, health: 15 },
                            description: "Independence"
                        }
                    ]
                }
            ],
            midLife: [
                {
                    title: "Career Crossroads",
                    text: "You're established in your career but feeling unfulfilled. What's your next move?",
                    choices: [
                        {
                            text: "Change careers entirely",
                            effects: { happiness: 30, money: -20000, education: 15 },
                            description: "Fresh start"
                        },
                        {
                            text: "Start your own business",
                            effects: { money: 50000, happiness: 20, health: -10 },
                            description: "Entrepreneurship"
                        },
                        {
                            text: "Stay and seek promotion",
                            effects: { money: 60000, reputation: 25, happiness: 5 },
                            description: "Climb the ladder"
                        },
                        {
                            text: "Pursue a passion project",
                            effects: { happiness: 35, money: -10000, reputation: 15 },
                            description: "Follow your heart"
                        }
                    ]
                },
                {
                    title: "Financial Decision",
                    text: "You have savings. How will you use them?",
                    choices: [
                        {
                            text: "Invest in real estate",
                            effects: { money: 80000, reputation: 20, happiness: 10 },
                            description: "Property investment"
                        },
                        {
                            text: "Start a retirement fund",
                            effects: { money: 40000, happiness: 15, health: 5 },
                            description: "Plan for future"
                        },
                        {
                            text: "Help family members",
                            effects: { happiness: 30, money: -30000, reputation: 25 },
                            description: "Support loved ones"
                        },
                        {
                            text: "Invest in yourself",
                            effects: { education: 30, money: -20000, happiness: 20 },
                            description: "Personal growth"
                        }
                    ]
                },
                {
                    title: "Health Wake-Up Call",
                    text: "A health scare makes you reconsider your lifestyle. What changes will you make?",
                    choices: [
                        {
                            text: "Complete lifestyle overhaul",
                            effects: { health: 40, happiness: 20, money: -15000 },
                            description: "Major changes"
                        },
                        {
                            text: "Gradual improvements",
                            effects: { health: 25, happiness: 15, money: -5000 },
                            description: "Steady progress"
                        },
                        {
                            text: "Hire personal trainer/nutritionist",
                            effects: { health: 35, money: -20000, happiness: 15 },
                            description: "Professional help"
                        },
                        {
                            text: "Focus on mental health",
                            effects: { happiness: 30, health: 20, money: -10000 },
                            description: "Holistic approach"
                        }
                    ]
                }
            ],
            matureYears: [
                {
                    title: "Legacy Planning",
                    text: "You're thinking about your legacy. How will you make an impact?",
                    choices: [
                        {
                            text: "Mentor young professionals",
                            effects: { reputation: 35, happiness: 25, education: 10 },
                            description: "Share wisdom"
                        },
                        {
                            text: "Start a charitable foundation",
                            effects: { reputation: 40, money: -50000, happiness: 30 },
                            description: "Give back"
                        },
                        {
                            text: "Write a book",
                            effects: { reputation: 30, happiness: 25, money: 20000 },
                            description: "Share your story"
                        },
                        {
                            text: "Focus on family",
                            effects: { happiness: 35, health: 15, reputation: 20 },
                            description: "Family first"
                        }
                    ]
                },
                {
                    title: "Retirement Planning",
                    text: "Retirement is approaching. How will you prepare?",
                    choices: [
                        {
                            text: "Retire early and travel",
                            effects: { happiness: 40, money: -60000, health: 20 },
                            description: "Enjoy life now"
                        },
                        {
                            text: "Work part-time consulting",
                            effects: { money: 40000, happiness: 20, reputation: 25 },
                            description: "Stay active"
                        },
                        {
                            text: "Fully retire and relax",
                            effects: { happiness: 30, health: 25, money: -20000 },
                            description: "Well-deserved rest"
                        },
                        {
                            text: "Start a passion business",
                            effects: { happiness: 35, money: 30000, health: 10 },
                            description: "New chapter"
                        }
                    ]
                }
            ],
            retirement: [
                {
                    title: "Golden Years",
                    text: "You're in your retirement years. How will you spend your time?",
                    choices: [
                        {
                            text: "Travel the world",
                            effects: { happiness: 40, money: -40000, health: 15 },
                            description: "See the world"
                        },
                        {
                            text: "Volunteer and give back",
                            effects: { happiness: 35, reputation: 30, health: 10 },
                            description: "Help others"
                        },
                        {
                            text: "Spend time with grandchildren",
                            effects: { happiness: 45, health: 20, reputation: 15 },
                            description: "Family time"
                        },
                        {
                            text: "Pursue hobbies and interests",
                            effects: { happiness: 40, health: 25, money: -10000 },
                            description: "Personal fulfillment"
                        }
                    ]
                },
                {
                    title: "Final Reflections",
                    text: "Looking back on your life, what matters most to you?",
                    choices: [
                        {
                            text: "The relationships I built",
                            effects: { happiness: 50, reputation: 25, health: 10 },
                            description: "Love and connection"
                        },
                        {
                            text: "The impact I made",
                            effects: { reputation: 40, happiness: 40, education: 20 },
                            description: "Leaving a legacy"
                        },
                        {
                            text: "The experiences I had",
                            effects: { happiness: 55, health: 15, money: 10000 },
                            description: "Living fully"
                        },
                        {
                            text: "The wisdom I gained",
                            effects: { education: 40, happiness: 45, reputation: 30 },
                            description: "Personal growth"
                        }
                    ]
                }
            ]
        };
    }
    
    createAchievements() {
        return [
            { id: 'millionaire', name: 'Millionaire', icon: '💰', desc: 'Accumulate $1,000,000', check: () => this.stats.money >= 1000000 },
            { id: 'scholar', name: 'Scholar', icon: '🎓', desc: 'Reach 100 education', check: () => this.stats.education >= 100 },
            { id: 'celebrity', name: 'Celebrity', icon: '⭐', desc: 'Reach 100 reputation', check: () => this.stats.reputation >= 100 },
            { id: 'happy', name: 'Truly Happy', icon: '😊', desc: 'Reach 100 happiness', check: () => this.stats.happiness >= 100 },
            { id: 'healthy', name: 'Health Nut', icon: '💪', desc: 'Maintain 100 health', check: () => this.stats.health >= 100 },
            { id: 'balanced', name: 'Balanced Life', icon: '⚖️', desc: 'All stats above 50', check: () => Object.values(this.stats).every(v => v >= 50) },
            { id: 'elder', name: 'Wise Elder', icon: '👴', desc: 'Reach age 80', check: () => this.stats.age >= 80 },
            { id: 'successful', name: 'Success Story', icon: '🏆', desc: 'Money + Reputation > 150', check: () => this.stats.money + this.stats.reputation > 150000 }
        ];
    }
    
    startGame() {
        // Reset stats
        this.stats = {
            money: 0,
            happiness: 50,
            education: 0,
            reputation: 0,
            health: 100,
            age: 18
        };
        
        this.currentStage = 0;
        this.currentScenario = 0;
        this.totalScenarios = 0;
        this.achievements = [];
        this.storyPath = [];
        
        this.showScreen('gameScreen');
        this.loadScenario();
        this.updateUI();
    }
    
    loadScenario() {
        const stageKeys = ['youngAdult', 'careerStart', 'relationships', 'midLife', 'matureYears', 'retirement'];
        const stageKey = stageKeys[this.currentStage];
        const scenarios = this.scenarios[stageKey];
        
        if (!scenarios || this.currentScenario >= scenarios.length) {
            this.nextStage();
            return;
        }
        
        const scenario = scenarios[this.currentScenario];
        const stage = this.stages[this.currentStage];
        
        // Update UI
        document.getElementById('stageIcon').textContent = stage.icon;
        document.getElementById('stageName').textContent = stage.name;
        document.getElementById('scenarioTitle').textContent = scenario.title;
        document.getElementById('scenarioText').textContent = scenario.text;
        
        // Update progress
        this.totalScenarios++;
        document.getElementById('scenarioCount').textContent = `Scenario ${this.totalScenarios}`;
        document.getElementById('stageProgress').textContent = `Stage ${this.currentStage + 1}/6`;
        
        const progress = ((this.currentStage * 3 + this.currentScenario) / 18) * 100;
        document.getElementById('progressFill').style.width = progress + '%';
        
        // Render choices
        this.renderChoices(scenario.choices);
    }
    
    renderChoices(choices) {
        const container = document.getElementById('choicesContainer');
        container.innerHTML = '';
        
        choices.forEach((choice, index) => {
            const btn = document.createElement('button');
            btn.className = 'choice-btn';
            btn.onclick = () => this.makeChoice(choice);
            
            const effectsHTML = Object.entries(choice.effects)
                .map(([stat, value]) => {
                    const sign = value > 0 ? '+' : '';
                    const className = value > 0 ? 'positive' : 'negative';
                    const icon = this.getStatIcon(stat);
                    return `<span class="effect ${className}">${icon} ${sign}${value}</span>`;
                })
                .join('');
            
            btn.innerHTML = `
                <div class="choice-text">${choice.text}</div>
                <div class="choice-effects">${effectsHTML}</div>
            `;
            
            container.appendChild(btn);
        });
    }
    
    getStatIcon(stat) {
        const icons = {
            money: '💰',
            happiness: '😊',
            education: '🎓',
            reputation: '⭐',
            health: '💪'
        };
        return icons[stat] || '';
    }
    
    makeChoice(choice) {
        // Apply effects
        Object.entries(choice.effects).forEach(([stat, value]) => {
            this.stats[stat] = Math.max(0, Math.min(200, this.stats[stat] + value));
        });
        
        // Age progression
        this.stats.age += Math.floor(Math.random() * 3) + 1;
        
        // Record choice
        this.storyPath.push(choice.text);
        
        // Check achievements
        this.checkAchievements();
        
        // Update UI with animation
        this.updateUI();
        this.animateStats();
        
        // Next scenario
        this.currentScenario++;
        
        setTimeout(() => {
            this.loadScenario();
        }, 500);
    }
    
    nextStage() {
        this.currentStage++;
        this.currentScenario = 0;
        
        if (this.currentStage >= this.stages.length) {
            this.endGame();
        } else {
            this.loadScenario();
        }
    }
    
    endGame() {
        this.showScreen('endScreen');
        this.displayResults();
    }
    
    displayResults() {
        const summary = document.getElementById('lifeSummary');
        summary.innerHTML = `
            <div class="summary-item">
                <span class="summary-label">Final Age</span>
                <span class="summary-value">${this.stats.age} years</span>
            </div>
            <div class="summary-item">
                <span class="summary-label">💰 Wealth</span>
                <span class="summary-value">$${this.stats.money.toLocaleString()}</span>
            </div>
            <div class="summary-item">
                <span class="summary-label">😊 Happiness</span>
                <span class="summary-value">${this.stats.happiness}/100</span>
            </div>
            <div class="summary-item">
                <span class="summary-label">🎓 Education</span>
                <span class="summary-value">${this.stats.education}/100</span>
            </div>
            <div class="summary-item">
                <span class="summary-label">⭐ Reputation</span>
                <span class="summary-value">${this.stats.reputation}/100</span>
            </div>
            <div class="summary-item">
                <span class="summary-label">💪 Health</span>
                <span class="summary-value">${this.stats.health}/100</span>
            </div>
        `;
        
        // Display achievements
        const achievementsDisplay = document.getElementById('achievementsDisplay');
        if (this.achievements.length > 0) {
            achievementsDisplay.innerHTML = '<h3 style="margin-bottom: 20px;">🏆 Achievements Unlocked</h3>' +
                this.achievements.map(ach => `
                    <div class="achievement">
                        <div class="achievement-icon">${ach.icon}</div>
                        <div class="achievement-name">${ach.name}</div>
                        <div class="achievement-desc">${ach.desc}</div>
                    </div>
                `).join('');
        } else {
            achievementsDisplay.innerHTML = '<p style="color: rgba(255,255,255,0.7);">No achievements unlocked this time. Try different choices!</p>';
        }
    }
    
    checkAchievements() {
        this.achievementsList.forEach(ach => {
            if (!this.achievements.find(a => a.id === ach.id) && ach.check()) {
                this.achievements.push(ach);
                this.showAchievementNotification(ach);
            }
        });
    }
    
    showAchievementNotification(ach) {
        // Could add a toast notification here
        console.log(`Achievement Unlocked: ${ach.name}`);
    }
    
    updateUI() {
        document.getElementById('money').textContent = '$' + this.stats.money.toLocaleString();
        document.getElementById('happiness').textContent = this.stats.happiness;
        document.getElementById('education').textContent = this.stats.education;
        document.getElementById('reputation').textContent = this.stats.reputation;
        document.getElementById('health').textContent = this.stats.health;
        document.getElementById('age').textContent = this.stats.age;
    }
    
    animateStats() {
        document.querySelectorAll('.stat-card').forEach(card => {
            card.classList.add('pulse');
            setTimeout(() => card.classList.remove('pulse'), 500);
        });
    }
    
    showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        document.getElementById(screenId).classList.add('active');
    }
    
    shareResults() {
        const text = `I just completed Life Choices! 🎮\n\nFinal Stats:\n💰 Wealth: $${this.stats.money.toLocaleString()}\n😊 Happiness: ${this.stats.happiness}\n🎓 Education: ${this.stats.education}\n⭐ Reputation: ${this.stats.reputation}\n\nAchievements: ${this.achievements.length}\n\nPlay now at Kelby Games!`;
        
        if (navigator.share) {
            navigator.share({
                title: 'Life Choices - My Results',
                text: text
            });
        } else {
            alert('Share feature not available. Copy this:\n\n' + text);
        }
    }
}

// Initialize game
let game;
document.addEventListener('DOMContentLoaded', () => {
    game = new LifeChoicesGame();
});
