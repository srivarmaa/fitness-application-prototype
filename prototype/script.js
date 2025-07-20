// FitAI Pro - Main JavaScript
// Theme-driven, Grid-based Fitness Application

// ===== GLOBAL VARIABLES =====
let userData = null;
let workoutData = null;
let nutritionData = null;
let wellnessData = null;
let socialData = null;
let coachData = null;
let progressData = null;
let plannerData = null;
let exerciseListData = null; // Keep for backward compatibility
let exerciseDBService = null; // New ExerciseDB API service

let currentTheme = 'dark';
let themeData = null;
let dataLoaded = false;
let currentExerciseId = null; // Track current exercise in bottom sheet

// ===== THEME MANAGEMENT SYSTEM =====
class ThemeManager {
    constructor() {
        this.currentTheme = 'dark';
        this.themes = new Map();
        this.init();
    }

    async init() {
        try {
            await this.loadThemes();
            this.applyTheme(this.currentTheme);
            this.setupThemeToggle();
        } catch (error) {
            console.error('Theme initialization failed:', error);
            this.applyFallbackTheme();
        }
    }

    async loadThemes() {
        try {
            const [darkTheme, lightTheme] = await Promise.all([
                fetch('./themes/dark-theme.json').then(res => res.json()),
                fetch('./themes/light-theme.json').then(res => res.json())
            ]);

            this.themes.set('dark', darkTheme);
            this.themes.set('light', lightTheme);
            
            console.log('✅ Themes loaded successfully');
        } catch (error) {
            console.error('❌ Failed to load themes:', error);
            throw error;
        }
    }

    applyTheme(themeName) {
        const theme = this.themes.get(themeName);
        if (!theme) {
            console.error(`Theme "${themeName}" not found`);
            return;
        }

        const root = document.documentElement;
        
        // Apply primary theme colors
        Object.entries(theme.primaryThemeColors).forEach(([key, value]) => {
            root.style.setProperty(`--${this.kebabCase(key)}`, value);
        });

        // Apply secondary & accent colors
        Object.entries(theme.secondaryAccentColors).forEach(([key, value]) => {
            root.style.setProperty(`--${this.kebabCase(key)}`, value);
        });

        // Apply UI component colors
        Object.entries(theme.uiComponentColors).forEach(([key, value]) => {
            root.style.setProperty(`--${this.kebabCase(key)}`, value);
        });

        // Apply utility & form colors
        Object.entries(theme.utilityFormColors).forEach(([key, value]) => {
            root.style.setProperty(`--${this.kebabCase(key)}`, value);
        });

        // Apply status & feedback colors
        Object.entries(theme.statusFeedbackColors).forEach(([key, value]) => {
            root.style.setProperty(`--${this.kebabCase(key)}`, value);
        });

        // Apply chart colors
        Object.entries(theme.chartVisualizationColors).forEach(([key, value]) => {
            root.style.setProperty(`--${this.kebabCase(key)}`, value);
        });

        // Apply sidebar colors
        Object.entries(theme.sidebarNavigationColors).forEach(([key, value]) => {
            root.style.setProperty(`--${this.kebabCase(key)}`, value);
        });

        // Apply gradients
        Object.entries(theme.gradients).forEach(([key, value]) => {
            root.style.setProperty(`--gradient-${this.kebabCase(key)}`, value);
        });

        // Apply shadows
        Object.entries(theme.shadows).forEach(([key, value]) => {
            root.style.setProperty(`--shadow-${this.kebabCase(key)}`, value);
        });

        // Apply spacing
        Object.entries(theme.spacing).forEach(([key, value]) => {
            root.style.setProperty(`--spacing-${this.kebabCase(key)}`, value);
        });

        // Apply border radius
        Object.entries(theme.borderRadius).forEach(([key, value]) => {
            root.style.setProperty(`--radius-${this.kebabCase(key)}`, value);
        });

        // Apply typography
        Object.entries(theme.typography.fontFamily).forEach(([key, value]) => {
            root.style.setProperty(`--font-family-${this.kebabCase(key)}`, value);
        });

        Object.entries(theme.typography.fontSize).forEach(([key, value]) => {
            root.style.setProperty(`--font-size-${this.kebabCase(key)}`, value);
        });

        Object.entries(theme.typography.fontWeight).forEach(([key, value]) => {
            root.style.setProperty(`--font-weight-${this.kebabCase(key)}`, value);
        });

        // Apply animations
        Object.entries(theme.animations).forEach(([key, value]) => {
            root.style.setProperty(`--animation-${this.kebabCase(key)}`, value);
        });

        this.currentTheme = themeName;
        this.updateThemeIcon();
        
        console.log(`✅ Applied ${theme.name} theme`);
    }

    toggleTheme() {
        const newTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
        this.applyTheme(newTheme);
        localStorage.setItem('fitai-theme', newTheme);
    }

    setupThemeToggle() {
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => this.toggleTheme());
        }

        // Load saved theme preference
        const savedTheme = localStorage.getItem('fitai-theme');
        if (savedTheme && this.themes.has(savedTheme)) {
            this.applyTheme(savedTheme);
        }
    }

    updateThemeIcon() {
        const themeToggle = document.getElementById('theme-toggle');
        const icon = themeToggle?.querySelector('i');
        if (icon) {
            icon.className = this.currentTheme === 'dark' 
                ? 'fas fa-sun' 
                : 'fas fa-moon';
        }
    }

    kebabCase(str) {
        return str.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase();
    }

    applyFallbackTheme() {
        console.warn('Applying fallback theme');
        // Apply basic fallback styles
        const root = document.documentElement;
        root.style.setProperty('--background', '#000000');
        root.style.setProperty('--foreground', '#ffffff');
        root.style.setProperty('--primary', '#4693c6');
    }
}

// ===== DATA LOADING SYSTEM =====
async function loadAllData() {
    if (dataLoaded) {
        console.log('📊 Data already loaded');
        return;
    }

    try {
        showLoadingOverlay('⏳ Loading fitness data...');
        
        const dataFiles = [
            { key: 'userData', file: './data/user-data.json' },
            { key: 'workoutData', file: './data/workout-data.json' },
            { key: 'nutritionData', file: './data/nutrition-data.json' },
            { key: 'wellnessData', file: './data/wellness-data.json' },
            { key: 'socialData', file: './data/social-data.json' },
            { key: 'coachData', file: './data/coach-data.json' },
            { key: 'progressData', file: './data/progress-data.json' },
            { key: 'plannerData', file: './data/planner-data.json' },
            { key: 'exerciseListData', file: './data/exercise-list.json' } // Keep for fallback
        ];

        const promises = dataFiles.map(async ({ key, file }) => {
            try {
                const response = await fetch(file);
                if (!response.ok) {
                    throw new Error(`Failed to load ${file}: ${response.status}`);
                }
                const data = await response.json();
                
                // Update global variables
                switch(key) {
                    case 'userData':
                        userData = data;
                        break;
                    case 'workoutData':
                        workoutData = data;
                        break;
                    case 'nutritionData':
                        nutritionData = data;
                        break;
                    case 'wellnessData':
                        wellnessData = data;
                        break;
                    case 'socialData':
                        socialData = data;
                        break;
                    case 'coachData':
                        coachData = data;
                        break;
                    case 'progressData':
                        progressData = data;
                        break;
                    case 'plannerData':
                        plannerData = data;
                        break;
                    case 'exerciseListData':
                        exerciseListData = data;
                        break;
                }
                
                window[key] = data;
                return { key, success: true };
            } catch (error) {
                console.error(`❌ Error loading ${key}:`, error);
                return { key, success: false, error };
            }
        });

        const results = await Promise.all(promises);
        
        // Check if all data loaded successfully
        const failedLoads = results.filter(result => !result.success);
        if (failedLoads.length > 0) {
            const failedKeys = failedLoads.map(result => result.key).join(', ');
            throw new Error(`Failed to load: ${failedKeys}`);
        }

        dataLoaded = true;
        
        // Initialize ExerciseDB API service
        try {
            console.log('🔌 Initializing ExerciseDB API service...');
            exerciseDBService = new ExerciseDBService();
            
            console.log('✅ ExerciseDB API service initialized (Local API)');
        } catch (error) {
            console.warn('⚠️ ExerciseDB API service initialization failed, using fallback data:', error);
        }
        
        console.log('✅ All data loaded successfully');
        
        // Initialize application after data is loaded
        await initializeApplication();
        
    } catch (error) {
        console.error('❌ Critical error loading data:', error);
        showNotification('Failed to load application data. Please refresh the page.', 'error');
    } finally {
        hideLoadingOverlay();
    }
}

// ===== APPLICATION INITIALIZATION =====
async function initializeApplication() {
    try {
        console.log('🚀 Starting application initialization...');
        
        // Initialize navigation system first
        initializeNavigation();
        
        // Update dashboard with real data
        updateDashboard();
        updateUserProfile();
        updateTrainingModes();
        updatePlanner();
        initializeCharts();
        
        // Initialize exercise filters
        initializeExerciseFilters();
        
        console.log('✅ Application initialized successfully');
        showNotification('Welcome to FitAI Pro! 💪', 'success');
        
    } catch (error) {
        console.error('❌ Error initializing application:', error);
        showNotification('Application initialization failed. Some features may not work correctly.', 'warning');
    } finally {
        // Ensure UI is always enabled after initialization
        enableUI();
        console.log('🔓 UI interactions enabled');
    }
}

// Ensure DOM is ready before initializing
document.addEventListener('DOMContentLoaded', () => {
    console.log('📄 DOM Content Loaded');
    // The actual initialization will be called from loadAllData()
});

// ===== DASHBOARD FUNCTIONS =====
function updateDashboard() {
    // Allow dashboard to update even with partial data
    // Individual functions will handle their own data availability

    try {
        // Update today's stats
        updateDailyStats();
        
        // Update body visualization
        updateBodyVisualization();
        
        // Update AI recommendations
        updateRecommendations();
        
        // Update next workout
        updateNextWorkout();
        
        console.log('✅ Dashboard updated');
    } catch (error) {
        console.error('❌ Error updating dashboard:', error);
    }
}

function updateDailyStats() {
    try {
        // Use default values if data is not loaded yet
        let caloriesBurned = 0;
        let activeTime = 0;
        let stepsToday = 0;
        
        if (workoutData?.history) {
            // Calculate daily stats from workout history
            const today = new Date().toDateString();
            const todayWorkouts = workoutData.history.filter(workout => 
                new Date(workout.date).toDateString() === today
            ) || [];
            
            // Calculate calories burned from today's workouts
            caloriesBurned = todayWorkouts.reduce((total, workout) => 
                total + (workout.caloriesBurned || 0), 0);
            
            // Calculate active time from today's workouts
            activeTime = todayWorkouts.reduce((total, workout) => 
                total + (workout.duration || 0), 0);
        }
        
        if (wellnessData?.stepTracking?.today?.steps) {
            // Get steps from wellness data
            stepsToday = wellnessData.stepTracking.today.steps;
        }
        
        // Update UI elements
        const caloriesEl = document.getElementById('calories-burned');
        const activeTimeEl = document.getElementById('active-time');
        const stepsEl = document.getElementById('steps-count');
        
        if (caloriesEl) caloriesEl.textContent = caloriesBurned.toLocaleString();
        if (activeTimeEl) activeTimeEl.textContent = `${activeTime}min`;
        if (stepsEl) stepsEl.textContent = stepsToday.toLocaleString();
        
    } catch (error) {
        console.error('❌ Error updating daily stats:', error);
    }
}

function updateUserProfile() {
    try {
        // Use default values if user data is not loaded yet
        const defaultStats = {
            level: 1,
            xp: 0,
            currentStreak: 0,
            xpToNextLevel: 1000
        };
        
        const stats = userData?.stats || defaultStats;
        
        // Update XP badge in header
        const xpBadge = document.querySelector('.xp-badge');
        if (xpBadge) {
            xpBadge.textContent = `Level ${stats.level} • ${stats.xp.toLocaleString()} XP`;
        }

        // Update streak info if available
        const streakEl = document.querySelector('.streak');
        if (streakEl && stats.currentStreak) {
            streakEl.textContent = `🔥 ${stats.currentStreak} day streak`;
        }

        // Update level progress bar
        const levelFill = document.getElementById('level-fill');
        const levelText = document.getElementById('level-text');
        
        if (levelFill && levelText && stats.xpToNextLevel) {
            const currentLevelXP = stats.xp % stats.xpToNextLevel;
            const progressPercent = (currentLevelXP / stats.xpToNextLevel) * 100;
            
            levelFill.style.width = `${progressPercent}%`;
            levelText.textContent = `${stats.xp.toLocaleString()} / ${stats.xpToNextLevel.toLocaleString()} XP to Level ${stats.level + 1}`;
        }

        console.log('✅ User profile updated');
    } catch (error) {
        console.error('❌ Error updating user profile:', error);
    }
}

function updateTrainingModes() {
    try {
        const trainingModesContainer = document.getElementById('training-modes-container');
        if (!trainingModesContainer) return;

        // Use default training modes if data is not loaded yet
        const defaultModes = [
            { id: 'gym', name: 'Gym', description: 'Equipment-based workouts', icon: 'fas fa-weight-hanging', color: '#4693c6' },
            { id: 'calisthenics', name: 'Calisthenics', description: 'Bodyweight exercises', icon: 'fas fa-running', color: '#25936e' },
            { id: 'hiit', name: 'HIIT', description: 'High-intensity intervals', icon: 'fas fa-bolt', color: '#cea851' },
            { id: 'aerobics', name: 'Aerobics', description: 'Cardio workouts', icon: 'fas fa-heart', color: '#ba456c' },
            { id: 'yoga', name: 'Yoga', description: 'Flexibility & mindfulness', icon: 'fas fa-leaf', color: '#399d66' },
            { id: 'stretching', name: 'Stretching', description: 'Recovery & mobility', icon: 'fas fa-expand-arrows-alt', color: '#4894c7' }
        ];

        const modes = workoutData?.trainingModes || defaultModes;
        trainingModesContainer.innerHTML = '';

        modes.forEach(mode => {
            const modeCard = document.createElement('div');
            modeCard.className = 'mode-card';
            modeCard.dataset.mode = mode.id;
            
            modeCard.innerHTML = `
                <i class="${mode.icon}" style="color: ${mode.color}"></i>
                <h3>${mode.name}</h3>
                <p>${mode.description}</p>
            `;
            
            modeCard.addEventListener('click', () => selectMode(mode.id));
            trainingModesContainer.appendChild(modeCard);
        });

        // Setup scroll functionality
        setupTrainingModesScroll();

        console.log('✅ Training modes updated');
    } catch (error) {
        console.error('❌ Error updating training modes:', error);
    }
}

function setupTrainingModesScroll() {
    const container = document.getElementById('training-modes-container');
    const scrollLeftBtn = document.getElementById('scroll-left');
    const scrollRightBtn = document.getElementById('scroll-right');
    
    if (!container || !scrollLeftBtn || !scrollRightBtn) return;

    // Check scroll position and show/hide arrows
    function updateScrollButtons() {
        const isAtStart = container.scrollLeft === 0;
        const isAtEnd = container.scrollLeft >= container.scrollWidth - container.clientWidth - 1;
        
        scrollLeftBtn.classList.toggle('visible', !isAtStart);
        scrollRightBtn.classList.toggle('visible', !isAtEnd);
    }

    // Scroll left
    scrollLeftBtn.addEventListener('click', () => {
        container.scrollBy({
            left: -300,
            behavior: 'smooth'
        });
    });

    // Scroll right
    scrollRightBtn.addEventListener('click', () => {
        container.scrollBy({
            left: 300,
            behavior: 'smooth'
        });
    });

    // Update buttons on scroll
    container.addEventListener('scroll', updateScrollButtons);
    
    // Initial check
    updateScrollButtons();
}

// ===== NAVIGATION SYSTEM =====
function initializeNavigation() {
    console.log('🔧 Initializing navigation system...');
    
    const navItems = document.querySelectorAll('.nav-item');
    const tabContents = document.querySelectorAll('.tab-content');
    
    console.log('📊 Found nav items:', navItems.length);
    console.log('📊 Found tab contents:', tabContents.length);

    // Simple test function to verify navigation
    function testNavigation() {
        console.log('🧪 Testing navigation functionality...');
        
        navItems.forEach((item, index) => {
            console.log(`Nav item ${index}:`, {
                element: item,
                dataset: item.dataset,
                tab: item.dataset.tab,
                classes: item.className,
                style: item.style.cssText
            });
            
            // Add a simple click test
            item.addEventListener('click', function(e) {
                console.log('🎯 NAV CLICKED:', this.dataset.tab);
            });
        });
    }

    // Run test immediately
    testNavigation();

    // Navigation item click handlers
    navItems.forEach((item, index) => {
        console.log(`🔗 Setting up nav item ${index}:`, item.dataset.tab);
        
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const targetTab = item.dataset.tab;
            
            console.log('🖱️ Nav item clicked:', targetTab);
            
            if (targetTab) {
                // Remove active class from all nav items and tabs
                navItems.forEach(nav => nav.classList.remove('active'));
                tabContents.forEach(tab => tab.classList.remove('active'));
                
                // Add active class to clicked nav item and corresponding tab
                item.classList.add('active');
                const targetTabContent = document.getElementById(targetTab);
                
                console.log('🎯 Target tab content found:', !!targetTabContent);
                
                if (targetTabContent) {
                    targetTabContent.classList.add('active');
                    
                    // Load tab-specific content
                    loadTabContent(targetTab);
                } else {
                    console.error('❌ Target tab content not found:', targetTab);
                }
            }
        });
    });

    console.log('✅ Navigation system initialized');
    
    // Test navigation functionality
    setTimeout(() => {
        console.log('🧪 Testing navigation...');
        const testNavItem = document.querySelector('.nav-item[data-tab="planner"]');
        if (testNavItem) {
            console.log('✅ Test nav item found:', testNavItem);
            testNavItem.style.cursor = 'pointer';
            
            // Add a simple test click handler
            testNavItem.addEventListener('click', (e) => {
                console.log('🧪 Test click handler fired!');
            });
        } else {
            console.error('❌ Test nav item not found');
        }
        
        // Check if all nav items are present
        const allNavItems = document.querySelectorAll('.nav-item');
        console.log('📋 All nav items:', Array.from(allNavItems).map(item => item.dataset.tab));
    }, 1000);
    
    // Fallback navigation system
    setTimeout(() => {
        console.log('🔄 Setting up fallback navigation...');
        const navItems = document.querySelectorAll('.nav-item');
        const tabContents = document.querySelectorAll('.tab-content');
        
        navItems.forEach(item => {
            item.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                const targetTab = this.getAttribute('data-tab');
                console.log('🔄 Fallback nav clicked:', targetTab);
                
                // Hide all tabs
                tabContents.forEach(tab => tab.style.display = 'none');
                
                // Show target tab
                const targetTabContent = document.getElementById(targetTab);
                if (targetTabContent) {
                    targetTabContent.style.display = 'block';
                    console.log('✅ Tab shown:', targetTab);
                }
                
                // Update active state
                navItems.forEach(nav => nav.classList.remove('active'));
                this.classList.add('active');
            });
        });
        
        console.log('✅ Fallback navigation setup complete');
    }, 2000);
}

function loadTabContent(tabName) {
    // Allow navigation even when data is still loading
    // Individual functions will handle their own data loading checks
    
    try {
        switch (tabName) {
            case 'dashboard':
                updateDashboard();
                break;
            case 'planner':
                updatePlanner();
                break;
            case 'train':
                updateTrainingCenter();
                break;
            case 'progress':
                updateProgressCharts();
                break;
            case 'nutrition':
                updateNutritionCenter();
                break;
            case 'coach':
                updateCoachCenter();
                break;
            case 'wellness':
                updateWellnessCenter();
                break;
            case 'profile':
                updateProfileCenter();
                break;
            case 'gif':
                initializeGifGallery();
                break;
        }
    } catch (error) {
        console.error(`❌ Error loading ${tabName} content:`, error);
        showNotification(`Failed to load ${tabName} content`, 'error');
    }
}

// ===== PLANNER FUNCTIONS =====
let currentDate = new Date();
let selectedDate = null; // Don't auto-select today's date

function updatePlanner() {
    try {
        initializeMonthlyCalendar();
        setupMonthlyCalendarControls();
        setupWorkoutModal();
        setupAddWorkoutButton();
        console.log('✅ Planner updated');
    } catch (error) {
        console.error('❌ Error updating planner:', error);
    }
}

function initializeMonthlyCalendar() {
    currentDate = new Date();
    renderMonthlyCalendar();
    updateMonthYearDisplay();
    
    // Automatically select today's date but don't show modals
    const today = new Date();
    selectedDate = today;
    
    // Update calendar selection
    const todayElement = document.querySelector(`[data-date="${today.toISOString().split('T')[0]}"]`);
    if (todayElement) {
        todayElement.classList.add('selected');
    }
    
    // Update day title
    const dayTitle = document.getElementById('selected-day-title');
    if (dayTitle) {
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        dayTitle.textContent = today.toLocaleDateString('en-US', options);
    }
    
    // Load today's workouts without showing modals
    loadDayWorkouts(today);
}

function setupMonthlyCalendarControls() {
    const prevMonthBtn = document.getElementById('prev-month');
    const nextMonthBtn = document.getElementById('next-month');
    
    if (prevMonthBtn) {
        prevMonthBtn.addEventListener('click', () => {
            currentDate.setMonth(currentDate.getMonth() - 1);
            renderMonthlyCalendar();
            updateMonthYearDisplay();
        });
    }
    
    if (nextMonthBtn) {
        nextMonthBtn.addEventListener('click', () => {
            currentDate.setMonth(currentDate.getMonth() + 1);
            renderMonthlyCalendar();
            updateMonthYearDisplay();
        });
    }
}

function renderMonthlyCalendar() {
    const calendarGrid = document.getElementById('calendar-grid');
    if (!calendarGrid) return;

    calendarGrid.innerHTML = '';
    
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    
    // Get first day of the month and last day
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const daysInMonth = lastDay.getDate();
    const firstDayOfWeek = firstDay.getDay();
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfWeek; i++) {
        const emptyDay = document.createElement('div');
        emptyDay.className = 'calendar-day other-month';
        calendarGrid.appendChild(emptyDay);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(currentYear, currentMonth, day);
        const dayElement = createCalendarDay(date);
        calendarGrid.appendChild(dayElement);
    }
    
    // Add empty cells to complete the grid (if needed)
    const totalCells = firstDayOfWeek + daysInMonth;
    const remainingCells = 42 - totalCells; // 6 rows × 7 days = 42
    
    for (let i = 0; i < remainingCells; i++) {
        const emptyDay = document.createElement('div');
        emptyDay.className = 'calendar-day other-month';
        calendarGrid.appendChild(emptyDay);
    }
}

function createCalendarDay(date) {
    const dayElement = document.createElement('div');
    dayElement.className = 'calendar-day';
    dayElement.dataset.date = date.toISOString().split('T')[0];
    
    const dayNumber = date.getDate();
    const isToday = isSameDay(date, new Date());
    const isSelected = isSameDay(date, selectedDate);
    
    if (isToday) dayElement.classList.add('today');
    if (isSelected) dayElement.classList.add('selected');
    
    // Check if day has workouts
    const hasWorkouts = checkDayHasWorkouts(date);
    
    dayElement.innerHTML = `
        <div class="day-number">${dayNumber}</div>
        ${hasWorkouts ? '<div class="workout-indicator"></div>' : ''}
    `;
    
    dayElement.addEventListener('click', () => {
        selectDate(date);
    });
    
    return dayElement;
}

function selectDate(date) {
    selectedDate = date;
    
    // Update calendar selection
    document.querySelectorAll('.calendar-day').forEach(day => {
        day.classList.remove('selected');
    });
    
    const selectedDayElement = document.querySelector(`[data-date="${date.toISOString().split('T')[0]}"]`);
    if (selectedDayElement) {
        selectedDayElement.classList.add('selected');
    }
    
    // Update day title
    const dayTitle = document.getElementById('selected-day-title');
    if (dayTitle) {
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        dayTitle.textContent = date.toLocaleDateString('en-US', options);
    }
    
    // Load day workouts
    loadDayWorkouts(date);
}

function loadDayWorkouts(date) {
    const dayWorkoutsContainer = document.getElementById('day-workouts');
    if (!dayWorkoutsContainer) return;
    
    const dateString = date.toISOString().split('T')[0];
    const dayWorkouts = getWorkoutsForDate(date);
    
    if (dayWorkouts.length === 0) {
        dayWorkoutsContainer.innerHTML = `
            <div class="empty-day-message">
                <i class="fas fa-calendar-plus"></i>
                <p>No workouts scheduled for this day</p>
                <button class="btn btn-primary add-workout-day-btn" data-date="${dateString}">
                    <i class="fas fa-plus"></i>
                    Add Workout
                </button>
            </div>
        `;
        
        // Add event listener to the button
        const addBtn = dayWorkoutsContainer.querySelector('.add-workout-day-btn');
        if (addBtn) {
            addBtn.addEventListener('click', () => {
                addWorkoutToDate(dateString);
            });
        }
    } else {
        dayWorkoutsContainer.innerHTML = dayWorkouts.map(workout => `
            <div class="workout-item" data-workout-id="${workout.id}">
                <div class="workout-time">${workout.time}</div>
                <div class="workout-name">${workout.name}</div>
                <div class="workout-duration">${workout.duration}</div>
            </div>
        `).join('');
        
        // Add click listeners to workout items
        dayWorkoutsContainer.querySelectorAll('.workout-item').forEach(item => {
            item.addEventListener('click', () => {
                const workoutId = item.dataset.workoutId;
                showWorkoutDetails(workoutId);
            });
        });
    }
}

function showInitialPlannerState() {
    const dayWorkoutsContainer = document.getElementById('day-workouts');
    const dayTitle = document.getElementById('selected-day-title');
    
    if (dayWorkoutsContainer) {
        dayWorkoutsContainer.innerHTML = `
            <div class="empty-day-message">
                <i class="fas fa-calendar-alt"></i>
                <p>Click on a date in the calendar to view or add workouts</p>
            </div>
        `;
    }
    
    if (dayTitle) {
        dayTitle.textContent = 'Select a Date';
    }
}

function getWorkoutsForDate(date) {
    const dayName = date.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    const allWorkouts = [];
    
    // Get workouts from planner data
    if (plannerData?.scheduledWorkouts) {
        const dayWorkouts = plannerData.scheduledWorkouts[dayName] || [];
        dayWorkouts.forEach(workout => {
            // Add exercises based on workout type
            const workoutWithExercises = {
                ...workout,
                exercises: getExercisesForWorkoutType(workout.type, workout.name)
            };
            allWorkouts.push(workoutWithExercises);
        });
    }
    
    // Get workouts from localStorage (user-added workouts) - by specific date
    const dateString = date.toISOString().split('T')[0];
    const savedWorkouts = JSON.parse(localStorage.getItem(`workouts_${dateString}`) || '[]');
    savedWorkouts.forEach(workout => {
        // Ensure workout has exercises
        if (!workout.exercises) {
            workout.exercises = getExercisesForWorkoutType(workout.type, workout.name);
        }
        allWorkouts.push(workout);
    });
    
    // If no workouts found, return sample data for demonstration
    if (allWorkouts.length === 0) {
        const dayOfWeek = date.getDay();
        const dayOfMonth = date.getDate();
        
        const sampleWorkouts = [
            { id: '1', name: 'Morning Cardio', time: '07:00 AM', duration: '30 min', exercises: [
                { name: 'Running', sets: '1', reps: '30 min', notes: 'Moderate pace' },
                { name: 'Jump Rope', sets: '3', reps: '5 min', notes: 'High intensity intervals' }
            ]},
            { id: '2', name: 'Strength Training', time: '06:00 PM', duration: '45 min', exercises: [
                { name: 'Bench Press', sets: '3', reps: '8-10', notes: 'Focus on form' },
                { name: 'Squats', sets: '4', reps: '12', notes: 'Full depth' },
                { name: 'Deadlifts', sets: '3', reps: '6-8', notes: 'Heavy weight' }
            ]},
            { id: '3', name: 'Yoga Session', time: '08:00 AM', duration: '60 min', exercises: [
                { name: 'Sun Salutation', sets: '3', reps: '5 rounds', notes: 'Flow sequence' },
                { name: 'Balance Poses', sets: '1', reps: '20 min', notes: 'Tree, warrior poses' },
                { name: 'Meditation', sets: '1', reps: '10 min', notes: 'Mindfulness practice' }
            ]}
        ];
        
        // Create patterns: Monday/Wednesday/Friday workouts, plus some weekend sessions
        const hasWorkout = (dayOfWeek === 1 || dayOfWeek === 3 || dayOfWeek === 5) || 
                          (dayOfWeek === 0 && dayOfMonth % 7 === 0) || // Every 7th day of month on Sunday
                          (dayOfWeek === 6 && dayOfMonth % 5 === 0);   // Every 5th day of month on Saturday
        
        if (hasWorkout) {
            const workoutIndex = dayOfMonth % sampleWorkouts.length;
            return [sampleWorkouts[workoutIndex]];
        }
    }
    
    return allWorkouts;
}

function checkDayHasWorkouts(date) {
    const workouts = getWorkoutsForDate(date);
    return workouts.length > 0;
}

function updateMonthYearDisplay() {
    const monthYearDisplay = document.getElementById('current-month-year');
    if (monthYearDisplay) {
        const options = { month: 'long', year: 'numeric' };
        monthYearDisplay.textContent = currentDate.toLocaleDateString('en-US', options);
    }
}

function isSameDay(date1, date2) {
    // Handle null values
    if (!date1 || !date2) return false;
    return date1.toDateString() === date2.toDateString();
}

function setupWorkoutModal() {
    const workoutModal = document.getElementById('workout-details-modal');
    const addWorkoutModal = document.getElementById('add-workout-modal');
    const closeWorkoutBtn = document.getElementById('close-workout-modal');
    const closeAddWorkoutBtn = document.getElementById('close-add-workout-modal');
    const cancelAddWorkoutBtn = document.getElementById('cancel-add-workout');
    
    // Close workout details modal
    if (closeWorkoutBtn) {
        closeWorkoutBtn.addEventListener('click', () => {
            workoutModal.style.display = 'none';
            // Ensure planner content is visible
            const plannerTab = document.getElementById('planner');
            if (plannerTab) {
                plannerTab.style.display = 'block';
            }
        });
    }
    
    // Close add workout modal
    if (closeAddWorkoutBtn) {
        closeAddWorkoutBtn.addEventListener('click', () => {
            addWorkoutModal.style.display = 'none';
            // Ensure planner content is visible
            const plannerTab = document.getElementById('planner');
            if (plannerTab) {
                plannerTab.style.display = 'block';
            }
        });
    }
    
    if (cancelAddWorkoutBtn) {
        cancelAddWorkoutBtn.addEventListener('click', () => {
            addWorkoutModal.style.display = 'none';
            // Ensure planner content is visible
            const plannerTab = document.getElementById('planner');
            if (plannerTab) {
                plannerTab.style.display = 'block';
            }
        });
    }
    
    // Close modals when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === workoutModal) {
            workoutModal.style.display = 'none';
            // Ensure planner content is visible
            const plannerTab = document.getElementById('planner');
            if (plannerTab) {
                plannerTab.style.display = 'block';
            }
        }
        if (e.target === addWorkoutModal) {
            addWorkoutModal.style.display = 'none';
            // Ensure planner content is visible
            const plannerTab = document.getElementById('planner');
            if (plannerTab) {
                plannerTab.style.display = 'block';
            }
        }
    });
    
    // Setup add workout form functionality
    setupAddWorkoutForm();
}

function showWorkoutDetails(workoutId) {
    const modal = document.getElementById('workout-details-modal');
    const modalTitle = document.getElementById('workout-modal-title');
    const workoutExercises = document.getElementById('workout-exercises');
    
    if (!modal || !modalTitle || !workoutExercises) {
        console.error('❌ Modal elements not found');
        return;
    }
    
    // Find workout data
    const workout = findWorkoutById(workoutId);
    if (!workout) {
        console.error('❌ Workout not found for ID:', workoutId);
        showNotification('Workout details not found', 'error');
        return;
    }
    
    modalTitle.textContent = workout.name;
    
    workoutExercises.innerHTML = workout.exercises.map(exercise => `
        <div class="exercise-item">
            <div class="exercise-icon">
                <i class="fas fa-dumbbell"></i>
            </div>
            <div class="exercise-details">
                <h4>${exercise.name}</h4>
                <p>${exercise.sets} sets × ${exercise.reps}</p>
                ${exercise.notes ? `<p class="text-muted">${exercise.notes}</p>` : ''}
            </div>
        </div>
    `).join('');
    
    modal.style.display = 'flex';
}

function findWorkoutById(workoutId) {
    // Search through all workouts to find the one with matching ID
    const allWorkouts = getAllWorkouts();
    return allWorkouts.find(workout => workout.id === workoutId);
}

function getAllWorkouts() {
    const allWorkouts = [];
    
    // Get workouts from planner data
    if (plannerData?.scheduledWorkouts) {
        Object.values(plannerData.scheduledWorkouts).forEach(dayWorkouts => {
            dayWorkouts.forEach(workout => {
                // Add exercises based on workout type
                const workoutWithExercises = {
                    ...workout,
                    exercises: getExercisesForWorkoutType(workout.type, workout.name)
                };
                allWorkouts.push(workoutWithExercises);
            });
        });
    }
    
    // Get workouts from localStorage (user-added workouts) - by specific date
    // We need to scan all localStorage keys that start with 'workouts_'
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('workouts_') && key !== 'workouts_monday' && key !== 'workouts_tuesday' && 
            key !== 'workouts_wednesday' && key !== 'workouts_thursday' && key !== 'workouts_friday' && 
            key !== 'workouts_saturday' && key !== 'workouts_sunday') {
            const savedWorkouts = JSON.parse(localStorage.getItem(key) || '[]');
            savedWorkouts.forEach(workout => {
                // Ensure workout has exercises
                if (!workout.exercises) {
                    workout.exercises = getExercisesForWorkoutType(workout.type, workout.name);
                }
                allWorkouts.push(workout);
            });
        }
    }
    
    // Add sample data if no workouts found
    if (allWorkouts.length === 0) {
        allWorkouts.push(
            { id: '1', name: 'Morning Cardio', time: '07:00 AM', duration: '30 min', exercises: [
                { name: 'Running', sets: '1', reps: '30 min', notes: 'Moderate pace' },
                { name: 'Jump Rope', sets: '3', reps: '5 min', notes: 'High intensity intervals' }
            ]},
            { id: '2', name: 'Strength Training', time: '06:00 PM', duration: '45 min', exercises: [
                { name: 'Bench Press', sets: '3', reps: '8-10', notes: 'Focus on form' },
                { name: 'Squats', sets: '4', reps: '12', notes: 'Full depth' },
                { name: 'Deadlifts', sets: '3', reps: '6-8', notes: 'Heavy weight' }
            ]}
        );
    }
    
    return allWorkouts;
}

function getExercisesForWorkoutType(type, workoutName) {
    // Use comprehensive exercise data if available
    if (exerciseListData) {
        const exercises = [];
        
        // Map workout types to muscle groups
        const typeToMuscleGroups = {
            'gym': ['chest', 'shoulders', 'legs', 'biceps', 'triceps'],
            'calisthenics': ['chest', 'shoulders', 'legs', 'biceps', 'triceps'],
            'hiit': ['chest', 'shoulders', 'legs', 'biceps', 'triceps'],
            'aerobics': ['chest', 'shoulders', 'legs', 'biceps', 'triceps'],
            'yoga': ['chest', 'shoulders', 'legs', 'biceps', 'triceps'],
            'stretching': ['chest', 'shoulders', 'legs', 'biceps', 'triceps']
        };
        
        const muscleGroups = typeToMuscleGroups[type] || Object.keys(exerciseListData);
        
        // Get 3-5 exercises from different muscle groups
        muscleGroups.forEach((muscleGroup, index) => {
            if (exerciseListData[muscleGroup]?.exercises && index < 5) {
                const exercise = exerciseListData[muscleGroup].exercises[0]; // Get first exercise from each group
                exercises.push({
                    name: exercise.name,
                    sets: '3',
                    reps: '10-12',
                    notes: exercise.description
                });
            }
        });
        
        return exercises;
    }
    
    // Fallback to original templates
    const exerciseTemplates = {
        'gym': [
            { name: 'Bench Press', sets: '3', reps: '8-10', notes: 'Focus on form' },
            { name: 'Squats', sets: '4', reps: '12', notes: 'Full depth' },
            { name: 'Deadlifts', sets: '3', reps: '6-8', notes: 'Heavy weight' },
            { name: 'Overhead Press', sets: '3', reps: '8-10', notes: 'Control the movement' },
            { name: 'Rows', sets: '3', reps: '10-12', notes: 'Squeeze shoulder blades' }
        ],
        'yoga': [
            { name: 'Sun Salutation', sets: '3', reps: '5 rounds', notes: 'Flow sequence' },
            { name: 'Warrior Poses', sets: '1', reps: '15 min', notes: 'Hold each pose' },
            { name: 'Balance Poses', sets: '1', reps: '10 min', notes: 'Tree, eagle poses' },
            { name: 'Meditation', sets: '1', reps: '10 min', notes: 'Mindfulness practice' }
        ],
        'hiit': [
            { name: 'Burpees', sets: '4', reps: '30 sec', notes: 'High intensity' },
            { name: 'Mountain Climbers', sets: '3', reps: '45 sec', notes: 'Keep core tight' },
            { name: 'Jump Squats', sets: '4', reps: '20 reps', notes: 'Explosive movement' },
            { name: 'Push-ups', sets: '3', reps: '15 reps', notes: 'Full range of motion' }
        ],
        'aerobics': [
            { name: 'Running', sets: '1', reps: '20 min', notes: 'Moderate pace' },
            { name: 'Cycling', sets: '1', reps: '10 min', notes: 'High resistance' },
            { name: 'Rowing', sets: '1', reps: '5 min', notes: 'Full body cardio' }
        ],
        'calisthenics': [
            { name: 'Push-ups', sets: '3', reps: '15-20', notes: 'Full range of motion' },
            { name: 'Pull-ups', sets: '3', reps: '8-12', notes: 'Control the movement' },
            { name: 'Dips', sets: '3', reps: '10-15', notes: 'Keep elbows close' },
            { name: 'Squats', sets: '4', reps: '20-25', notes: 'Full depth' }
        ],
        'stretching': [
            { name: 'Hamstring Stretch', sets: '3', reps: '30 sec', notes: 'Hold each side' },
            { name: 'Hip Flexor Stretch', sets: '3', reps: '30 sec', notes: 'Deep breathing' },
            { name: 'Shoulder Stretch', sets: '3', reps: '30 sec', notes: 'Gentle pressure' },
            { name: 'Chest Stretch', sets: '3', reps: '30 sec', notes: 'Open chest' }
        ]
    };

    // Return exercises based on type, or default to gym exercises
    return exerciseTemplates[type] || exerciseTemplates['gym'];
}

function addWorkoutToDate(dateString) {
    const addWorkoutModal = document.getElementById('add-workout-modal');
    const modalTitle = document.getElementById('add-workout-modal-title');
    const date = new Date(dateString);
    
    // Update modal title with the selected date
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    modalTitle.textContent = `Add Workout for ${date.toLocaleDateString('en-US', options)}`;
    
    // Store the target date for saving
    addWorkoutModal.dataset.targetDate = dateString;
    
    // Reset form
    document.getElementById('add-workout-form').reset();
    
    // Reset exercises container to just one exercise input
    const exercisesContainer = document.getElementById('exercises-container');
    exercisesContainer.innerHTML = `
        <div class="exercise-input-group">
            <input type="text" class="form-input exercise-name" placeholder="Exercise name" required>
            <input type="text" class="form-input exercise-sets" placeholder="Sets" required>
            <input type="text" class="form-input exercise-reps" placeholder="Reps/Duration" required>
            <button type="button" class="btn btn-outline btn-sm remove-exercise">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `;
    
    // Show modal
    addWorkoutModal.style.display = 'flex';
}

function setupAddWorkoutForm() {
    const addExerciseBtn = document.getElementById('add-exercise-btn');
    const saveWorkoutBtn = document.getElementById('save-workout-btn');
    const exercisesContainer = document.getElementById('exercises-container');
    
    // Add exercise button
    if (addExerciseBtn) {
        addExerciseBtn.addEventListener('click', () => {
            const exerciseGroup = document.createElement('div');
            exerciseGroup.className = 'exercise-input-group';
            exerciseGroup.innerHTML = `
                <input type="text" class="form-input exercise-name" placeholder="Exercise name" required>
                <input type="text" class="form-input exercise-sets" placeholder="Sets" required>
                <input type="text" class="form-input exercise-reps" placeholder="Reps/Duration" required>
                <button type="button" class="btn btn-outline btn-sm remove-exercise">
                    <i class="fas fa-trash"></i>
                </button>
            `;
            exercisesContainer.appendChild(exerciseGroup);
            
            // Add event listener to new remove button
            exerciseGroup.querySelector('.remove-exercise').addEventListener('click', () => {
                exerciseGroup.remove();
            });
        });
    }
    
    // Save workout button
    if (saveWorkoutBtn) {
        saveWorkoutBtn.addEventListener('click', () => {
            saveWorkout();
        });
    }
    
    // Add event listener to initial remove button
    const initialRemoveBtn = exercisesContainer.querySelector('.remove-exercise');
    if (initialRemoveBtn) {
        initialRemoveBtn.addEventListener('click', () => {
            // Don't remove the last exercise input
            if (exercisesContainer.children.length > 1) {
                initialRemoveBtn.closest('.exercise-input-group').remove();
            }
        });
    }
}

function setupAddWorkoutButton() {
    const addWorkoutBtn = document.getElementById('add-workout-btn');
    
    if (addWorkoutBtn) {
        addWorkoutBtn.addEventListener('click', () => {
            // Only open modal if a date is selected
            if (selectedDate) {
                const targetDate = selectedDate.toISOString().split('T')[0];
                addWorkoutToDate(targetDate);
            } else {
                showNotification('Please select a date first', 'warning');
            }
        });
    }
}

function saveWorkout() {
    const form = document.getElementById('add-workout-form');
    const addWorkoutModal = document.getElementById('add-workout-modal');
    const targetDate = addWorkoutModal.dataset.targetDate;
    
    // Validate form
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }
    
    // Collect form data
    const workoutData = {
        id: Date.now().toString(), // Generate unique ID
        name: document.getElementById('workout-name').value,
        time: document.getElementById('workout-time').value,
        duration: document.getElementById('workout-duration').value + ' min',
        type: document.getElementById('workout-type').value,
        notes: document.getElementById('workout-notes').value,
        exercises: []
    };
    
    // Collect exercises
    const exerciseGroups = document.querySelectorAll('.exercise-input-group');
    exerciseGroups.forEach(group => {
        const name = group.querySelector('.exercise-name').value;
        const sets = group.querySelector('.exercise-sets').value;
        const reps = group.querySelector('.exercise-reps').value;
        
        if (name && sets && reps) {
            workoutData.exercises.push({
                name: name,
                sets: sets,
                reps: reps,
                notes: ''
            });
        }
    });
    
    // Validate exercises
    if (workoutData.exercises.length === 0) {
        showNotification('Please add at least one exercise', 'error');
        return;
    }
    
    // Save workout to the selected date
    saveWorkoutToDate(targetDate, workoutData);
    
    // Close modal
    addWorkoutModal.style.display = 'none';
    
    // Ensure planner content is visible
    const plannerTab = document.getElementById('planner');
    if (plannerTab) {
        plannerTab.style.display = 'block';
    }
    
    // Show success message
    showNotification('Workout saved successfully!', 'success');
    
    // Refresh the calendar to show the new workout
    renderMonthlyCalendar();
    
    // Select the date to show the new workout
    const date = new Date(targetDate);
    selectDate(date);
}

function saveWorkoutToDate(dateString, workoutData) {
    // In a real application, this would save to a database
    // For now, we'll store in localStorage for demonstration
    
    // Save by specific date instead of day name
    let existingWorkouts = JSON.parse(localStorage.getItem(`workouts_${dateString}`) || '[]');
    
    // Add new workout
    existingWorkouts.push(workoutData);
    
    // Save back to localStorage
    localStorage.setItem(`workouts_${dateString}`, JSON.stringify(existingWorkouts));
    
    console.log(`✅ Workout saved for ${dateString}:`, workoutData);
}

// Update getWorkoutsForDate to include localStorage data
function getWorkoutsForDate(date) {
    const dayName = date.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    
    // Get workouts from localStorage
    const savedWorkouts = JSON.parse(localStorage.getItem(`workouts_${dayName}`) || '[]');
    
    // If we have saved workouts, return them
    if (savedWorkouts.length > 0) {
        return savedWorkouts;
    }
    
    // Use planner data if available
    if (plannerData?.scheduledWorkouts) {
        const dayWorkouts = plannerData.scheduledWorkouts[dayName] || [];
        
        // Add exercises to each workout
        return dayWorkouts.map(workout => ({
            ...workout,
            exercises: getExercisesForWorkoutType(workout.type, workout.name)
        }));
    }
    
    // Otherwise, return sample data
    const dayOfWeek = date.getDay();
    const dayOfMonth = date.getDate();
    
    const sampleWorkouts = [
        { id: '1', name: 'Morning Cardio', time: '07:00 AM', duration: '30 min', exercises: [
            { name: 'Running', sets: '1', reps: '30 min', notes: 'Moderate pace' },
            { name: 'Jump Rope', sets: '3', reps: '5 min', notes: 'High intensity intervals' }
        ]},
        { id: '2', name: 'Strength Training', time: '06:00 PM', duration: '45 min', exercises: [
            { name: 'Bench Press', sets: '3', reps: '8-10', notes: 'Focus on form' },
            { name: 'Squats', sets: '4', reps: '12', notes: 'Full depth' },
            { name: 'Deadlifts', sets: '3', reps: '6-8', notes: 'Heavy weight' }
        ]},
        { id: '3', name: 'Yoga Session', time: '08:00 AM', duration: '60 min', exercises: [
            { name: 'Sun Salutation', sets: '3', reps: '5 rounds', notes: 'Flow sequence' },
            { name: 'Balance Poses', sets: '1', reps: '20 min', notes: 'Tree, warrior poses' },
            { name: 'Meditation', sets: '1', reps: '10 min', notes: 'Mindfulness practice' }
        ]}
    ];
    
    // Create patterns: Monday/Wednesday/Friday workouts, plus some weekend sessions
    const hasWorkout = (dayOfWeek === 1 || dayOfWeek === 3 || dayOfWeek === 5) || 
                      (dayOfWeek === 0 && dayOfMonth % 7 === 0) || // Every 7th day of month on Sunday
                      (dayOfWeek === 6 && dayOfMonth % 5 === 0);   // Every 5th day of month on Saturday
    
    if (hasWorkout) {
        const workoutIndex = dayOfMonth % sampleWorkouts.length;
        return [sampleWorkouts[workoutIndex]];
    }
    
    return [];
}

// ===== TRAINING CENTER FUNCTIONS =====
function updateTrainingCenter() {
    updateTrainingModes();
    updateExerciseLibrary();
    updateRoutineBuilder();
    setupExerciseFilters();
    
            // Auto-select the first mode (Gym) to show exercises
        setTimeout(() => {
            selectMode('gym');
        }, 100);
        
        // Force populate exercise library with all exercises
        setTimeout(() => {
            populateAllExercises();
        }, 500);
}

async function selectMode(modeId) {
    // Allow mode selection even when data is loading
    // The exercise library will handle its own data loading check
    
    try {
        // Update UI to show selected mode
        document.querySelectorAll('.mode-card').forEach(card => {
            card.classList.remove('selected');
        });
        
        const selectedCard = document.querySelector(`[data-mode="${modeId}"]`);
        if (selectedCard) {
            selectedCard.classList.add('selected');
        }

        // Update exercise library for selected mode
        await updateExerciseLibrary(modeId);
        
        console.log(`✅ Selected training mode: ${modeId}`);
        showNotification(`Selected ${modeId} training mode`, 'info');
    } catch (error) {
        console.error('❌ Error selecting mode:', error);
    }
}

// Utility: Group exercises by main group and sub-group
function groupExercisesTree(exercises) {
    const tree = {};
    
    exercises.forEach(ex => {
        // Handle different property names for body parts and targets
        const main = ex.bodyPart || ex.muscleGroup || 'Other';
        const sub = ex.target || ex.activated?.[0] || ex.equipment || 'General';
        
        // Clean up the names for better display
        const cleanMain = main.charAt(0).toUpperCase() + main.slice(1).replace(/_/g, ' ');
        const cleanSub = sub.charAt(0).toUpperCase() + sub.slice(1).replace(/_/g, ' ');
        
        if (!tree[cleanMain]) tree[cleanMain] = {};
        if (!tree[cleanMain][cleanSub]) tree[cleanMain][cleanSub] = [];
        tree[cleanMain][cleanSub].push(ex);
    });
    
    console.log('🌳 Grouped exercises tree:', tree);
    return tree;
}

// Render tree-structured exercise library (collapsed by default)
function renderExerciseTree(tree, container, totalCount = null) {
    console.log('🎨 Rendering exercise tree...');
    console.log('📦 Container:', container);
    console.log('🌳 Tree data:', tree);
    console.log('📊 Total count:', totalCount);
    
    if (!container) {
        console.error('❌ Container is null or undefined');
        return;
    }
    
    container.innerHTML = '';
    
    const entries = Object.entries(tree);
    console.log('📋 Tree entries:', entries);
    
    if (entries.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-exclamation-triangle"></i>
                <p>No exercises found to display</p>
            </div>
        `;
        return;
    }
    
    entries.forEach(([main, subGroups]) => {
        console.log(`🌳 Processing main group: ${main}`, subGroups);
        
        // Main group node
        const mainNode = document.createElement('div');
        mainNode.className = 'tree-main-group';
        
        // Calculate total exercises for this main group
        const totalExercisesInGroup = Object.values(subGroups).reduce((sum, exercises) => {
            if (Array.isArray(exercises)) {
                return sum + exercises.length;
            } else {
                console.error('❌ Non-array exercises in group:', exercises);
                return sum;
            }
        }, 0);
        
        // If we have a total count and this is the only main group, use the total count
        let displayCount = totalExercisesInGroup;
        if (totalCount && entries.length === 1) {
            displayCount = totalCount;
        }
        
        mainNode.innerHTML = `
            <span class="tree-toggle collapsed">▶</span> 
            <span class="tree-label">${main} (${displayCount})</span>
        `;
        mainNode.dataset.group = main;
        mainNode.style.cursor = 'pointer';
        
        // Sub-group container (hidden by default)
        const subContainer = document.createElement('div');
        subContainer.className = 'tree-sub-container';
        subContainer.style.display = 'none';
        
        Object.entries(subGroups).forEach(([sub, exercises]) => {
            // Ensure exercises is an array
            if (!Array.isArray(exercises)) {
                console.error('❌ Exercises is not an array:', exercises);
                return;
            }
            
            // Sub-group node
            const subNode = document.createElement('div');
            subNode.className = 'tree-sub-group';
            subNode.innerHTML = `
                <span class="tree-toggle collapsed">▶</span> 
                <span class="tree-label">${sub} (${exercises.length})</span>
            `;
            subNode.dataset.sub = sub;
            subNode.style.cursor = 'pointer';
            
            // Exercise list (hidden by default)
            const exList = document.createElement('div');
            exList.className = 'tree-exercise-list';
            exList.style.display = 'none';
            
            exercises.forEach(ex => {
                const exItem = document.createElement('div');
                exItem.className = 'tree-exercise-item';
                exItem.draggable = true;
                exItem.dataset.exerciseId = ex.id;
                exItem.innerHTML = `
                    <div class="exercise-image-container">
                        <img src="${ex.gifUrl || ex.imageUrl || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9IiMzMzMiLz4KPHN2ZyB4PSIxMCIgeT0iMTAiIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIj4KPHBhdGggZD0iTTEyIDJDNi40OCAyIDIgNi40OCAyIDEyczQuNDggMTAgMTAgMTAgMTAtNC40OCAxMC0xMFMxNy41MiAyIDEyIDJ6bTAgMThjLTQuNDEgMC04LTMuNTktOC04czMuNTktOCA4LTggOCAzLjU5IDggOC0zLjU5IDgtOCA4eiIgZmlsbD0iIzk5OSIvPgo8cGF0aCBkPSJNMTIgNkM5Ljc5IDYgOCA3Ljc5IDggMTBzMS43OSA0IDQgNCA0LTEuNzkgNC00LTEuNzktNC00LTR6bTAgNmMtMS4xIDAtMi0uOS0yLTJzLjktMiAyLTIgMiAuOSAyIDItLjkgMi0yIDJ6IiBmaWxsPSIjOTk5Ii8+Cjwvc3ZnPgo8L3N2Zz4K'}" 
                             alt="${ex.name}" 
                             class="exercise-image" 
                             onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9IiMzMzMiLz4KPHN2ZyB4PSIxMCIgeT0iMTAiIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIj4KPHBhdGggZD0iTTEyIDJDNi40OCAyIDIgNi40OCAyIDEyczQuNDggMTAgMTAgMTAgMTAtNC40OCAxMC0xMFMxNy41MiAyIDEyIDJ6bTAgMThjLTQuNDEgMC04LTMuNTktOC04czMuNTktOCA4LTggOCAzLjU5IDggOC0zLjU5IDgtOCA4eiIgZmlsbD0iIzk5OSIvPgo8cGF0aCBkPSJNMTIgNkM5Ljc5IDYgOCA3Ljc5IDggMTBzMS43OSA0IDQgNCA0LTEuNzkgNC00LTEuNzktNC00LTR6bTAgNmMtMS4xIDAtMi0uOS0yLTJzLjktMiAyLTIgMiAuOSAyIDItLjkgMi0yIDJ6IiBmaWxsPSIjOTk5Ii8+Cjwvc3ZnPgo8L3N2Zz4K';" />
                    </div>
                    <span class="exercise-name">${ex.name}</span>
                    <div class="exercise-buttons">
                        <button class="tree-info-btn" title="Exercise details">ℹ️</button>
                        <button class="tree-plus-btn" title="Add to routine">+</button>
                    </div>
                `;
                
                // Drag event
                exItem.addEventListener('dragstart', e => {
                    e.dataTransfer.setData('text/plain', ex.id);
                    exItem.classList.add('dragging');
                });
                
                exItem.addEventListener('dragend', e => {
                    exItem.classList.remove('dragging');
                });
                
                // Plus button event
                exItem.querySelector('.tree-plus-btn').addEventListener('click', async e => {
                    e.stopPropagation();
                    await addExerciseToRoutine(ex.id, ex); // Pass the exercise data directly
                });
                
                // Info button event
                exItem.querySelector('.tree-info-btn').addEventListener('click', async e => {
                    e.stopPropagation();
                    console.log('ℹ️ Info button clicked for exercise:', ex.id);
                    await showExerciseDetails(ex.id);
                });
                
                // Click on exercise name to show details
                exItem.querySelector('.exercise-name').addEventListener('click', e => {
                    e.stopPropagation();
                    showExerciseDetails(ex.id);
                });
                
                exList.appendChild(exItem);
            });
            
            // Expand/collapse sub-group
            subNode.querySelector('.tree-toggle').addEventListener('click', e => {
                e.stopPropagation();
                const toggle = subNode.querySelector('.tree-toggle');
                const collapsed = toggle.classList.toggle('collapsed');
                exList.style.display = collapsed ? 'none' : 'block';
                toggle.textContent = collapsed ? '▶' : '▼';
            });
            
            subContainer.appendChild(subNode);
            subNode.appendChild(exList);
        });
        
        // Expand/collapse main group
        mainNode.querySelector('.tree-toggle').addEventListener('click', e => {
            e.stopPropagation();
            const toggle = mainNode.querySelector('.tree-toggle');
            const collapsed = toggle.classList.toggle('collapsed');
            subContainer.style.display = collapsed ? 'none' : 'block';
            toggle.textContent = collapsed ? '▶' : '▼';
        });
        
        container.appendChild(mainNode);
        container.appendChild(subContainer);
    });
}

// Update updateExerciseLibrary to use the tree renderer
async function updateExerciseLibrary(selectedMode = null) {
    try {
        const exerciseLibrary = document.getElementById('exercise-library');
        if (!exerciseLibrary) {
            console.warn('⚠️ Exercise library container not found');
            return;
        }

        console.log('🔍 Updating exercise library for mode:', selectedMode);

        // Show loading state
        exerciseLibrary.innerHTML = `
            <div class="loading-state">
                <i class="fas fa-spinner fa-spin"></i>
                <p>Loading exercises...</p>
            </div>
        `;

        let exercises = [];

        // Only use ExerciseDB API for gym mode
        if (exerciseDBService && selectedMode === 'gym') {
            try {
                console.log('🌐 Using ExerciseDB v2 API for gym mode');
                console.log('🌐 v2 API configured');
                console.log('🌐 Base URL:', exerciseDBService.baseUrl);
                
                // Map gym exercises to ExerciseDB body parts
                const gymBodyParts = ['chest', 'upper arms', 'upper legs', 'lower legs', 'shoulders', 'back', 'waist'];

                // Check if there's a muscle group filter active
                const muscleGroupFilter = document.getElementById('muscle-group-filter');
                let targetBodyParts;
                
                if (muscleGroupFilter && muscleGroupFilter.value && muscleGroupFilter.value !== 'all') {
                    // Use filter-specific body parts
                    const filterToBodyParts = {
                        'chest': ['chest'],
                        'shoulders': ['shoulders'],
                        'legs': ['upper legs', 'lower legs'],
                        'biceps': ['upper arms'],
                        'triceps': ['upper arms'],
                        'back': ['back'],
                        'abs': ['waist'],
                        'calves': ['lower legs'],
                        'forearms': ['lower arms']
                    };
                    targetBodyParts = filterToBodyParts[muscleGroupFilter.value] || ['chest', 'upper arms', 'upper legs'];
                } else {
                    // Use all gym body parts
                    targetBodyParts = gymBodyParts;
                }
                console.log('🎯 Target body parts for gym:', targetBodyParts);

                // Fetch exercises for each body part
                const exercisePromises = targetBodyParts.map(async (bodyPart) => {
                    try {
                        console.log(`🔍 Fetching gym exercises for ${bodyPart}...`);
                        // Fetch all exercises for this body part (no limit)
                        const result = await exerciseDBService.getExercisesByBodyPart(bodyPart);
                        const bodyPartExercises = result.exercises || result;
                        const totalExercises = result.totalExercises || bodyPartExercises.length;
                        
                        console.log(`✅ Got ${bodyPartExercises.length} exercises for ${bodyPart} (Total available: ${totalExercises})`);
                        const transformed = exerciseDBService.transformExercises(bodyPartExercises);
                        console.log(`🔄 Transformed to ${transformed.length} exercises for ${bodyPart}`);
                        
                        return {
                            exercises: transformed,
                            totalExercises: totalExercises,
                            bodyPart: bodyPart
                        };
                    } catch (error) {
                        console.warn(`⚠️ Failed to fetch exercises for ${bodyPart}:`, error);
                        return {
                            exercises: [],
                            totalExercises: 0,
                            bodyPart: bodyPart
                        };
                    }
                });

                const exerciseResults = await Promise.all(exercisePromises);
                
                        // Extract exercises and calculate total counts
        exercises = exerciseResults.flatMap(result => result.exercises);
        const totalExercisesByBodyPart = exerciseResults.reduce((acc, result) => {
            acc[result.bodyPart] = result.totalExercises;
            return acc;
        }, {});
        
        const totalExercises = Object.values(totalExercisesByBodyPart).reduce((sum, count) => sum + count, 0);

        console.log(`📊 Fetched ${exercises.length} gym exercises from ExerciseDB v2 API`);
        console.log(`📊 Total exercises available: ${totalExercises}`);
        console.log(`📊 Exercises by body part:`, totalExercisesByBodyPart);
        
        // Store total exercises for display
        window.totalExercisesAvailable = totalExercises;
        
        // Store current API exercises for lookup
        currentApiExercises = exercises;

            } catch (error) {
                console.warn('⚠️ ExerciseDB v2 API failed, falling back to local data:', error);
                exercises = [];
            }
        } else {
            console.log(`📋 Using local exercise data for mode: ${selectedMode}`);
        }

        // Fallback to local exercise data if API fails or no exercises found
        if (exercises.length === 0 && exerciseListData) {
            console.log('📋 Using fallback local exercise data');
            
            const modeToMuscleGroups = {
                'gym': ['chest', 'shoulders', 'legs', 'biceps', 'triceps'],
                'calisthenics': ['chest', 'shoulders', 'legs', 'biceps', 'triceps'],
                'hiit': ['chest', 'shoulders', 'legs', 'biceps', 'triceps'],
                'aerobics': ['chest', 'shoulders', 'legs', 'biceps', 'triceps'],
                'yoga': ['chest', 'shoulders', 'legs', 'biceps', 'triceps'],
                'stretching': ['chest', 'shoulders', 'legs', 'biceps', 'triceps']
            };

            const targetMuscleGroups = modeToMuscleGroups[selectedMode] || Object.keys(exerciseListData);
            
            targetMuscleGroups.forEach(muscleGroup => {
                if (exerciseListData[muscleGroup]?.exercises) {
                    exerciseListData[muscleGroup].exercises.forEach(exercise => {
                        exercises.push({
                            id: `${muscleGroup}_${exercise.name.replace(/\s+/g, '_').toLowerCase()}`,
                            name: exercise.name,
                            muscleGroup: muscleGroup,
                            activated: exercise.activated,
                            description: exercise.description,
                            images: exercise.images,
                            commonMistakes: exercise.common_mistakes,
                            gifUrl: exercise.images?.[0] // Use first image as gifUrl for compatibility
                        });
                    });
                }
            });
        }

        // Apply muscle group filter if set
        const muscleGroupFilter = document.getElementById('muscle-group-filter');
        if (muscleGroupFilter && muscleGroupFilter.value && muscleGroupFilter.value !== 'all') {
            const selectedMuscleGroup = muscleGroupFilter.value;
            
            // Map filter values to API body parts
            const filterToBodyParts = {
                'chest': ['chest'],
                'shoulders': ['shoulders'],
                'legs': ['upper legs', 'lower legs'],
                'biceps': ['upper arms'],
                'triceps': ['upper arms'],
                'back': ['back'],
                'abs': ['waist'],
                'calves': ['lower legs'],
                'forearms': ['lower arms']
            };
            
            const targetBodyParts = filterToBodyParts[selectedMuscleGroup] || [selectedMuscleGroup];
            
            exercises = exercises.filter(exercise => {
                const exerciseBodyPart = exercise.bodyPart || exercise.muscleGroup;
                return targetBodyParts.includes(exerciseBodyPart) || 
                       exercise.muscleGroup === selectedMuscleGroup;
            });
            
            console.log(`🔍 Filtered to ${exercises.length} exercises for muscle group: ${selectedMuscleGroup} (mapped to: ${targetBodyParts.join(', ')})`);
        }

        console.log(`📊 Total exercises found: ${exercises.length}`);
        console.log('📋 Sample exercises:', exercises.slice(0, 3));

        if (exercises.length === 0) {
            exerciseLibrary.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-dumbbell"></i>
                    <p>No exercises found for ${selectedMode || 'this category'}</p>
                    <button class="btn btn-outline btn-sm" onclick="updateExerciseLibrary('${selectedMode}')">
                        <i class="fas fa-refresh"></i>
                        Try Again
                    </button>
                </div>
            `;
            return;
        }

        // Group and render as tree
        console.log('🌳 Grouping exercises into tree structure...');
        console.log('📊 Exercises to group:', exercises);
        const tree = groupExercisesTree(exercises);
        console.log('🌳 Tree structure created:', tree);
        
        // Get total exercises count for display
        const totalExercises = window.totalExercisesAvailable || exercises.length;
        renderExerciseTree(tree, exerciseLibrary, totalExercises);
        
        // Display total exercise count
        displayTotalExerciseCount(exercises.length, window.totalExercisesAvailable);
        
        console.log(`✅ Exercise library updated with ${exercises.length} exercises for ${selectedMode}`);
    } catch (error) {
        console.error('❌ Error updating exercise library:', error);
        
        const exerciseLibrary = document.getElementById('exercise-library');
        if (exerciseLibrary) {
            exerciseLibrary.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>Failed to load exercises</p>
                    <button class="btn btn-outline btn-sm" onclick="updateExerciseLibrary('${selectedMode}')">
                        <i class="fas fa-refresh"></i>
                        Try Again
                    </button>
                </div>
            `;
        }
    }
}

// Force populate all exercises from the API
async function populateAllExercises() {
    try {
        console.log('🚀 Force populating all exercises...');
        
        if (!exerciseDBService) {
            console.warn('⚠️ ExerciseDB service not initialized');
            return;
        }

        const exerciseLibrary = document.getElementById('exercise-library');
        if (!exerciseLibrary) {
            console.warn('⚠️ Exercise library container not found');
            return;
        }

        // Show loading state
        exerciseLibrary.innerHTML = `
            <div class="loading-state">
                <i class="fas fa-spinner fa-spin"></i>
                <p>Loading all exercises from API...</p>
            </div>
        `;

        // Fetch all exercises from the API with pagination
        console.log('🔄 Fetching all exercises from v2 API with pagination...');
        const allExercisesResult = await exerciseDBService.getFilteredExercises({ fetchAll: true });
        const allExercises = allExercisesResult.exercises || [];
        const totalExercises = allExercisesResult.totalExercises || allExercises.length;
        
        if (!allExercises || allExercises.length === 0) {
            console.warn('⚠️ No exercises returned from v2 API');
            exerciseLibrary.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>No exercises found in v2 API</p>
                    <button class="btn btn-outline btn-sm" onclick="populateAllExercises()">
                        <i class="fas fa-refresh"></i>
                        Try Again
                    </button>
                </div>
            `;
            return;
        }

        console.log(`✅ Fetched ${allExercises.length} exercises from v2 API`);
        console.log('📋 Sample exercises:', allExercises.slice(0, 3));

        // Transform exercises to our format
        const transformedExercises = exerciseDBService.transformExercises(allExercises);
        console.log(`🔄 Transformed ${transformedExercises.length} exercises`);

        // Store current API exercises for lookup
        currentApiExercises = allExercises;

        // Group and render as tree
        console.log('🌳 Grouping exercises into tree structure...');
        const tree = groupExercisesTree(transformedExercises);
        console.log('🌳 Tree structure created:', tree);
        renderExerciseTree(tree, exerciseLibrary, totalExercises);
        
        console.log(`✅ Exercise library populated with ${transformedExercises.length} exercises (Total available: ${totalExercises})`);
        showNotification(`Loaded ${transformedExercises.length} exercises (Total: ${totalExercises})`, 'success');
        
    } catch (error) {
        console.error('❌ Error populating exercises:', error);
        
        const exerciseLibrary = document.getElementById('exercise-library');
        if (exerciseLibrary) {
            exerciseLibrary.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>Failed to load exercises: ${error.message}</p>
                    <button class="btn btn-outline btn-sm" onclick="populateAllExercises()">
                        <i class="fas fa-refresh"></i>
                        Try Again
                    </button>
                </div>
            `;
        }
    }
}

function updateRoutineBuilder() {
    const routineBuilder = document.getElementById('routine-builder');
    if (!routineBuilder) return;

    routineBuilder.innerHTML = `
        <div class="routine-canvas" id="routine-canvas">
            <div class="routine-steps" id="routine-steps">
                <div class="empty-routine text-center text-muted">
                    <i class="fas fa-plus-circle"></i>
                    <p>Drag exercises here to build your routine</p>
                </div>
                </div>
            </div>
            <div class="routine-actions">
                <button class="btn btn-outline" id="clear-routine">
                    <i class="fas fa-trash"></i>
                    Clear
                </button>
                <button class="btn btn-primary" id="save-routine">
                    <i class="fas fa-save"></i>
                    Save Routine
                </button>
        </div>
    `;

    // Setup routine builder functionality
    setupRoutineBuilder();
}

// Initialize exercise filters with API data
async function initializeExerciseFilters() {
    try {
        console.log('🔍 Initializing exercise filters...');
        
        // Initialize filter dropdowns
        await populateFilterOptions();
        
        // Setup filter event handlers
        setupFilterEventHandlers();
        
        // Setup search functionality
        setupSearchFunctionality();
        
        console.log('✅ Exercise filters initialized');
    } catch (error) {
        console.error('❌ Error initializing exercise filters:', error);
    }
}

// Populate filter options from API
async function populateFilterOptions() {
    try {
        if (!exerciseDBService) {
            console.warn('⚠️ ExerciseDB service not available');
            return;
        }
        
        // Fetch filter options from API
        const [bodyParts, muscles, equipment] = await Promise.all([
            exerciseDBService.getBodyParts(),
            exerciseDBService.getTargetMuscles(),
            exerciseDBService.getEquipment()
        ]);
        
        // Populate body parts filter (with counts)
        await populateFilterDropdown('bodypart', bodyParts);
        
        // Populate muscle groups filter
        await populateFilterDropdown('muscle', muscles);
        
        // Populate equipment filter
        await populateFilterDropdown('equipment', equipment);
        
        console.log('✅ Filter options populated');
    } catch (error) {
        console.error('❌ Error populating filter options:', error);
    }
}

// Populate a specific filter dropdown
async function populateFilterDropdown(filterType, options) {
    const container = document.getElementById(`${filterType}-options`);
    if (!container) return;
    
    if (!options || options.length === 0) {
        container.innerHTML = '<div class="filter-loading">No options available</div>';
        return;
    }
    
    container.innerHTML = '';
    
    // For body parts, fetch all exercises to get accurate counts
    if (filterType === 'bodypart' && exerciseDBService) {
        try {
            console.log('🔄 Fetching all exercises to get body part counts...');
            const allExercisesResult = await exerciseDBService.getFilteredExercises({ fetchAll: true });
            const allExercises = allExercisesResult.exercises || [];
            
            // Count exercises per body part
            const bodyPartCounts = {};
            allExercises.forEach(exercise => {
                if (exercise.bodyParts && Array.isArray(exercise.bodyParts)) {
                    exercise.bodyParts.forEach(bodyPart => {
                        if (bodyPart && bodyPart.trim()) {
                            const cleanBodyPart = bodyPart.trim();
                            bodyPartCounts[cleanBodyPart] = (bodyPartCounts[cleanBodyPart] || 0) + 1;
                        }
                    });
                }
            });
            
            console.log('📊 Body part counts:', bodyPartCounts);
            
            // Populate with counts
            options.forEach(option => {
                const count = bodyPartCounts[option] || 0;
                const optionDiv = document.createElement('div');
                optionDiv.className = 'filter-option';
                optionDiv.innerHTML = `
                    <input type="checkbox" id="${filterType}-${option.toLowerCase().replace(/\s+/g, '-')}" 
                           class="${filterType}-checkbox" value="${option}">
                    <label for="${filterType}-${option.toLowerCase().replace(/\s+/g, '-')}">${option} (${count})</label>
                `;
                container.appendChild(optionDiv);
            });
            
            return;
        } catch (error) {
            console.error('❌ Error fetching body part counts:', error);
            // Fall back to original method
        }
    }
    
    // Default population without counts
    options.forEach(option => {
        const optionDiv = document.createElement('div');
        optionDiv.className = 'filter-option';
        optionDiv.innerHTML = `
            <input type="checkbox" id="${filterType}-${option.toLowerCase().replace(/\s+/g, '-')}" 
                   class="${filterType}-checkbox" value="${option}">
            <label for="${filterType}-${option.toLowerCase().replace(/\s+/g, '-')}">${option}</label>
        `;
        container.appendChild(optionDiv);
    });
}

// Setup filter event handlers
function setupFilterEventHandlers() {
    // Filter toggle buttons
    const filterToggles = document.querySelectorAll('.filter-toggle');
    filterToggles.forEach(toggle => {
        toggle.addEventListener('click', (e) => {
            e.stopPropagation();
            const dropdown = toggle.closest('.filter-dropdown');
            const isActive = dropdown.classList.contains('active');
            
            // Close all other dropdowns
            document.querySelectorAll('.filter-dropdown').forEach(d => {
                d.classList.remove('active');
                d.querySelector('.filter-toggle').classList.remove('active');
            });
            
            // Toggle current dropdown
            if (!isActive) {
                dropdown.classList.add('active');
                toggle.classList.add('active');
            }
        });
    });
    
    // Close dropdowns when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.filter-dropdown')) {
            document.querySelectorAll('.filter-dropdown').forEach(d => {
                d.classList.remove('active');
                d.querySelector('.filter-toggle').classList.remove('active');
            });
        }
    });
    
    // Filter checkbox changes
    document.addEventListener('change', (e) => {
        if (e.target.matches('.bodypart-checkbox, .muscle-checkbox, .equipment-checkbox')) {
            applyFilters();
        }
        
        // Handle body part equipment filter changes
        if (e.target.matches('.bodypart-equipment-checkbox')) {
            applyFilters();
        }
    });
    
    // Handle body part selection to show/hide equipment filters
    document.addEventListener('change', (e) => {
        if (e.target.matches('.bodypart-checkbox')) {
            updateBodyPartEquipmentFilters();
        }
    });
}

// Setup search functionality
function setupSearchFunctionality() {
    const searchInput = document.getElementById('exercise-search');
    if (!searchInput) return;
    
    let searchTimeout;
    
    searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            // Make individual API request for search term
            const searchTerm = e.target.value.toLowerCase();
            if (searchTerm.length >= 2) { // Only search if 2+ characters
                console.log(`🔍 Making individual search API request for: "${searchTerm}"`);
                applyIndividualSearchRequest(searchTerm);
            } else if (searchTerm.length === 0) {
                // If search is cleared, apply all other filters
                applyFilters();
            }
        }, 500); // Increased debounce for better performance
    });
}

// Apply all filters
async function applyFilters() {
    try {
        const searchTerm = document.getElementById('exercise-search')?.value.toLowerCase() || '';
        const selectedBodyParts = getSelectedValues('bodypart-checkbox');
        const selectedMuscles = getSelectedValues('muscle-checkbox');
        const selectedEquipment = getSelectedValues('equipment-checkbox');
        
        // Update filter status
        updateFilterStatus(searchTerm, selectedBodyParts, selectedMuscles, selectedEquipment);
        
        // Apply individual API requests for each filter selection
        await applyIndividualFilterRequests(searchTerm, selectedBodyParts, selectedMuscles, selectedEquipment);
        
    } catch (error) {
        console.error('❌ Error applying filters:', error);
    }
}

// Get selected values from checkboxes
function getSelectedValues(checkboxClass) {
    const checkboxes = document.querySelectorAll(`.${checkboxClass}:checked`);
    return Array.from(checkboxes).map(cb => cb.value);
}

// Update filter status display
function updateFilterStatus(searchTerm, bodyParts, muscles, equipment) {
    const filterStatus = document.getElementById('filter-status');
    const activeFiltersCount = document.getElementById('active-filters-count');
    
    if (!filterStatus || !activeFiltersCount) return;
    
    const totalActive = (searchTerm ? 1 : 0) + bodyParts.length + muscles.length + equipment.length;
    
    if (totalActive > 0) {
        activeFiltersCount.textContent = totalActive;
        filterStatus.style.display = 'flex';
    } else {
        filterStatus.style.display = 'none';
    }
}

// Clear all filters
function clearAllFilters() {
    // Clear search
    const searchInput = document.getElementById('exercise-search');
    if (searchInput) searchInput.value = '';
    
    // Clear checkboxes
    document.querySelectorAll('.bodypart-checkbox, .muscle-checkbox, .equipment-checkbox, .bodypart-equipment-checkbox').forEach(cb => {
        cb.checked = false;
    });
    
    // Hide all body part equipment filters
    hideAllBodyPartEquipmentFilters();
    
    // Update filter status
    updateFilterStatus('', [], [], []);
    
    // Refresh exercise library
    const selectedModeCard = document.querySelector('.mode-card.selected');
    const currentMode = selectedModeCard ? selectedModeCard.dataset.mode : 'gym';
    updateExerciseLibrary(currentMode);
}

// Update body part equipment filters based on selected body parts
async function updateBodyPartEquipmentFilters() {
    const selectedBodyParts = getSelectedValues('bodypart-checkbox');
    const bodypartEquipmentFilters = document.getElementById('bodypart-equipment-filters');
    
    if (!bodypartEquipmentFilters) return;
    
    // Hide all body part equipment filters first
    hideAllBodyPartEquipmentFilters();
    
    if (selectedBodyParts.length === 0) {
        bodypartEquipmentFilters.style.display = 'none';
        return;
    }
    
    // Show body part equipment filters for selected body parts
    bodypartEquipmentFilters.style.display = 'flex';
    
    for (const bodyPart of selectedBodyParts) {
        const equipmentFilter = document.querySelector(`.bodypart-equipment[data-bodypart="${bodyPart}"]`);
        if (equipmentFilter) {
            equipmentFilter.style.display = 'block';
            
            // Populate equipment options for this body part
            await populateBodyPartEquipmentOptions(bodyPart);
        }
    }
}

// Hide all body part equipment filters
function hideAllBodyPartEquipmentFilters() {
    const bodypartEquipmentFilters = document.getElementById('bodypart-equipment-filters');
    if (bodypartEquipmentFilters) {
        bodypartEquipmentFilters.style.display = 'none';
    }
    
    document.querySelectorAll('.bodypart-equipment').forEach(filter => {
        filter.style.display = 'none';
        filter.classList.remove('active');
        const toggle = filter.querySelector('.filter-toggle');
        if (toggle) toggle.classList.remove('active');
    });
}

// Populate equipment options for a specific body part
async function populateBodyPartEquipmentOptions(bodyPart) {
    try {
        if (!exerciseDBService) {
            console.warn('⚠️ ExerciseDB service not available');
            return;
        }
        
        const optionsContainer = document.getElementById(`${bodyPart.replace(/\s+/g, '-')}-equipment-options`);
        if (!optionsContainer) return;
        
        // Show loading state
        optionsContainer.innerHTML = `
            <div class="filter-loading">
                <i class="fas fa-spinner fa-spin"></i>
                Loading...
            </div>
        `;
        
        console.log(`🔧 Fetching equipment for ${bodyPart}...`);
        
        // Fetch ALL exercises for this body part to get accurate equipment counts
        const result = await exerciseDBService.getExercisesByBodyPart(bodyPart, 100, true); // fetchAll = true
        const exercises = result.exercises || result;
        
        // Extract unique equipment from exercises
        const equipmentSet = new Set();
        exercises.forEach(exercise => {
            if (exercise.equipments && Array.isArray(exercise.equipments)) {
                exercise.equipments.forEach(equipment => {
                    if (equipment && equipment.trim()) {
                        equipmentSet.add(equipment.trim());
                    }
                });
            }
        });
        
        const equipmentList = Array.from(equipmentSet).sort();
        
        console.log(`✅ Found ${equipmentList.length} equipment types for ${bodyPart}:`, equipmentList);
        
        // Populate equipment options with counts
        if (equipmentList.length > 0) {
            // Get exercise counts for each equipment type
            const equipmentCounts = {};
            exercises.forEach(exercise => {
                if (exercise.equipments && Array.isArray(exercise.equipments)) {
                    exercise.equipments.forEach(equipment => {
                        if (equipment && equipment.trim()) {
                            const cleanEquipment = equipment.trim();
                            equipmentCounts[cleanEquipment] = (equipmentCounts[cleanEquipment] || 0) + 1;
                        }
                    });
                }
            });
            
            optionsContainer.innerHTML = equipmentList.map(equipment => {
                const count = equipmentCounts[equipment] || 0;
                return `
                    <div class="filter-option">
                        <input type="checkbox" 
                               id="${bodyPart.replace(/\s+/g, '-')}-equipment-${equipment.replace(/\s+/g, '-')}" 
                               class="bodypart-equipment-checkbox" 
                               value="${equipment}" 
                               data-bodypart="${bodyPart}">
                        <label for="${bodyPart.replace(/\s+/g, '-')}-equipment-${equipment.replace(/\s+/g, '-')}">
                            ${equipment} (${count})
                        </label>
                    </div>
                `;
            }).join('');
        } else {
            optionsContainer.innerHTML = `
                <div class="filter-loading">
                    <i class="fas fa-info-circle"></i>
                    No equipment found
                </div>
            `;
        }
        
    } catch (error) {
        console.error(`❌ Error populating equipment options for ${bodyPart}:`, error);
        
        const optionsContainer = document.getElementById(`${bodyPart.replace(/\s+/g, '-')}-equipment-options`);
        if (optionsContainer) {
            optionsContainer.innerHTML = `
                <div class="filter-loading">
                    <i class="fas fa-exclamation-triangle"></i>
                    Failed to load equipment
                </div>
            `;
        }
    }
}

// Apply individual search API request
async function applyIndividualSearchRequest(searchTerm) {
    try {
        if (!exerciseDBService) {
            console.warn('⚠️ ExerciseDB service not available');
            return;
        }
        
        const exerciseLibrary = document.getElementById('exercise-library');
        if (!exerciseLibrary) return;
        
        // Show loading state
        exerciseLibrary.innerHTML = `
            <div class="loading-state">
                <i class="fas fa-spinner fa-spin"></i>
                <p>Searching exercises...</p>
            </div>
        `;
        
        console.log(`🔍 Making individual search API request for: "${searchTerm}"`);
        
        // Make individual search API request
        const result = await exerciseDBService.getFilteredExercises({
            search: searchTerm,
            limit: 100,
            sortBy: 'name',
            sortOrder: 'asc'
        });
        
        const exercises = result.exercises || result;
        const totalExercises = result.totalExercises || exercises.length;
        
        console.log(`✅ Search results: ${exercises.length} exercises for "${searchTerm}"`);
        
        // Group exercises by body part
        const exerciseTree = {};
        exercises.forEach(exercise => {
            const bodyPart = exercise.bodyParts?.[0] || 'other';
            
            if (!exerciseTree[bodyPart]) {
                exerciseTree[bodyPart] = {
                    name: bodyPart,
                    exercises: []
                };
            }
            
            exerciseTree[bodyPart].exercises.push({
                id: exercise.exerciseId || exercise.name?.replace(/\s+/g, '_').toLowerCase(),
                name: exercise.name,
                bodyPart: exercise.bodyParts?.[0] || bodyPart,
                bodyParts: exercise.bodyParts || [bodyPart],
                equipment: exercise.equipments?.[0] || 'body weight',
                equipments: exercise.equipments || [],
                target: exercise.targetMuscles?.[0] || 'general',
                targetMuscles: exercise.targetMuscles || [],
                secondaryMuscles: exercise.secondaryMuscles || [],
                gifUrl: exercise.gifUrl,
                instructions: exercise.instructions || []
            });
        });
        
        // Render the search results
        renderExerciseTree(exerciseTree, exerciseLibrary, totalExercises);
        
        // Update exercise count
        displayTotalExerciseCount(exercises.length, totalExercises);
        
        // Store current API exercises for lookup
        currentApiExercises = exercises;
        
        console.log(`✅ Individual search request complete: ${exercises.length} exercises found`);
        
    } catch (error) {
        console.error('❌ Error applying individual search request:', error);
        
        const exerciseLibrary = document.getElementById('exercise-library');
        if (exerciseLibrary) {
            exerciseLibrary.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>Search failed</p>
                    <button class="btn btn-outline btn-sm" onclick="clearAllFilters()">
                        <i class="fas fa-refresh"></i>
                        Clear Search
                    </button>
                </div>
            `;
        }
    }
}

// Apply individual API requests for each filter selection
async function applyIndividualFilterRequests(searchTerm, bodyParts, muscles, equipment) {
    try {
        if (!exerciseDBService) {
            console.warn('⚠️ ExerciseDB service not available');
            return;
        }
        
        const exerciseLibrary = document.getElementById('exercise-library');
        if (!exerciseLibrary) return;
        
        // Show loading state
        exerciseLibrary.innerHTML = `
            <div class="loading-state">
                <i class="fas fa-spinner fa-spin"></i>
                <p>Fetching exercises...</p>
            </div>
        `;
        
        let allExercises = [];
        let totalExercises = 0;
        
        // Make individual API requests for each filter type
        const apiRequests = [];
        
        // 1. Search request (if search term exists)
        if (searchTerm) {
            console.log(`🔍 Making search API request for: "${searchTerm}"`);
            apiRequests.push(
                exerciseDBService.getFilteredExercises({
                    search: searchTerm,
                    limit: 100,
                    sortBy: 'name',
                    sortOrder: 'asc'
                }).then(result => {
                    const exercises = result.exercises || result;
                    console.log(`✅ Search results: ${exercises.length} exercises for "${searchTerm}"`);
                    return { type: 'search', exercises, total: result.totalExercises || exercises.length };
                })
            );
        }
        
        // 2. Body parts requests (individual request for each selected body part)
        if (bodyParts.length > 0) {
            bodyParts.forEach(bodyPart => {
                console.log(`🏃 Making body part API request for: "${bodyPart}"`);
                apiRequests.push(
                    exerciseDBService.getFilteredExercises({
                        bodyParts: [bodyPart],
                        limit: 100,
                        sortBy: 'name',
                        sortOrder: 'asc'
                    }).then(result => {
                        const exercises = result.exercises || result;
                        console.log(`✅ Body part results: ${exercises.length} exercises for "${bodyPart}"`);
                        return { type: 'bodyPart', bodyPart, exercises, total: result.totalExercises || exercises.length };
                    })
                );
            });
        }
        
        // 3. Muscle groups requests (individual request for each selected muscle)
        if (muscles.length > 0) {
            muscles.forEach(muscle => {
                console.log(`💪 Making muscle API request for: "${muscle}"`);
                apiRequests.push(
                    exerciseDBService.getFilteredExercises({
                        muscles: [muscle],
                        limit: 100,
                        sortBy: 'name',
                        sortOrder: 'asc'
                    }).then(result => {
                        const exercises = result.exercises || result;
                        console.log(`✅ Muscle results: ${exercises.length} exercises for "${muscle}"`);
                        return { type: 'muscle', muscle, exercises, total: result.totalExercises || exercises.length };
                    })
                );
            });
        }
        
        // 4. Equipment requests (individual request for each selected equipment)
        if (equipment.length > 0) {
            equipment.forEach(equip => {
                console.log(`🏋️ Making equipment API request for: "${equip}"`);
                apiRequests.push(
                    exerciseDBService.getFilteredExercises({
                        equipment: [equip],
                        limit: 100,
                        sortBy: 'name',
                        sortOrder: 'asc'
                    }).then(result => {
                        const exercises = result.exercises || result;
                        console.log(`✅ Equipment results: ${exercises.length} exercises for "${equip}"`);
                        return { type: 'equipment', equipment: equip, exercises, total: result.totalExercises || exercises.length };
                    })
                );
            });
        }
        
        // 5. Body part equipment requests (individual request for each selected body part + equipment combination)
        const selectedBodyPartEquipment = getSelectedBodyPartEquipment();
        if (selectedBodyPartEquipment.length > 0) {
            selectedBodyPartEquipment.forEach(({ bodyPart, equipmentType }) => {
                console.log(`🔧 Making body part equipment API request for: "${bodyPart}" + "${equipmentType}"`);
                apiRequests.push(
                    exerciseDBService.getFilteredExercises({
                        bodyParts: [bodyPart],
                        equipment: [equipmentType],
                        limit: 100,
                        sortBy: 'name',
                        sortOrder: 'asc'
                    }).then(result => {
                        const exercises = result.exercises || result;
                        console.log(`✅ Body part equipment results: ${exercises.length} exercises for "${bodyPart}" + "${equipmentType}"`);
                        return { type: 'bodyPartEquipment', bodyPart, equipment: equipmentType, exercises, total: result.totalExercises || exercises.length };
                    })
                );
            });
        }
        
        // If no filters are selected, load all exercises
        if (apiRequests.length === 0) {
            console.log('🔄 No filters selected, loading all exercises...');
            const result = await exerciseDBService.getFilteredExercises({
                limit: 100,
                sortBy: 'name',
                sortOrder: 'asc'
            });
            allExercises = result.exercises || result;
            totalExercises = result.totalExercises || allExercises.length;
        } else {
            // Execute all API requests in parallel
            console.log(`🚀 Executing ${apiRequests.length} API requests in parallel...`);
            const results = await Promise.all(apiRequests);
            
            // Combine all results and remove duplicates
            const exerciseMap = new Map();
            
            results.forEach(result => {
                result.exercises.forEach(exercise => {
                    const exerciseId = exercise.exerciseId || exercise.name?.replace(/\s+/g, '_').toLowerCase();
                    if (!exerciseMap.has(exerciseId)) {
                        exerciseMap.set(exerciseId, exercise);
                    }
                });
                totalExercises += result.total;
            });
            
            allExercises = Array.from(exerciseMap.values());
        }
        
        console.log(`📊 Combined results: ${allExercises.length} unique exercises from ${apiRequests.length} API requests`);
        
        // Store current API exercises for lookup
        currentApiExercises = allExercises;
        
        // Check if we have exercises to display
        if (allExercises.length === 0) {
            exerciseLibrary.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-search"></i>
                    <p>No exercises found with the selected filters</p>
                    <button class="btn btn-outline btn-sm" onclick="clearAllFilters()">
                        <i class="fas fa-refresh"></i>
                        Clear Filters
                    </button>
                </div>
            `;
            return;
        }
        
        // Transform exercises to the expected format
        const transformedExercises = allExercises.map(exercise => ({
            id: exercise.exerciseId || exercise.name?.replace(/\s+/g, '_').toLowerCase(),
            name: exercise.name,
            bodyPart: exercise.bodyParts?.[0] || 'other',
            bodyParts: exercise.bodyParts || [],
            equipment: exercise.equipments?.[0] || 'body weight',
            equipments: exercise.equipments || [],
            target: exercise.targetMuscles?.[0] || 'general',
            targetMuscles: exercise.targetMuscles || [],
            secondaryMuscles: exercise.secondaryMuscles || [],
            gifUrl: exercise.gifUrl,
            instructions: exercise.instructions || []
        }));
        
        // Group exercises using the existing groupExercisesTree function
        const exerciseTree = groupExercisesTree(transformedExercises);
        
        console.log('🌳 Exercise tree created:', exerciseTree);
        
        // Render the filtered exercise tree
        renderExerciseTree(exerciseTree, exerciseLibrary, totalExercises);
        
        // Update exercise count
        displayTotalExerciseCount(allExercises.length, totalExercises);
        
        console.log(`✅ Individual filter requests complete: ${allExercises.length} exercises loaded`);
        
    } catch (error) {
        console.error('❌ Error applying individual filter requests:', error);
        console.error('Error details:', {
            message: error.message,
            stack: error.stack,
            searchTerm,
            bodyParts,
            muscles,
            equipment
        });
        
        const exerciseLibrary = document.getElementById('exercise-library');
        if (exerciseLibrary) {
            exerciseLibrary.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>Failed to apply filters: ${error.message}</p>
                    <button class="btn btn-outline btn-sm" onclick="clearAllFilters()">
                        <i class="fas fa-refresh"></i>
                        Clear Filters
                    </button>
                </div>
            `;
        }
    }
}

// Get selected body part equipment filters
function getSelectedBodyPartEquipment() {
    const checkboxes = document.querySelectorAll('.bodypart-equipment-checkbox:checked');
    return Array.from(checkboxes).map(cb => ({
        bodyPart: cb.dataset.bodypart,
        equipmentType: cb.value
    }));
}

function setupExerciseFilters() {
    const muscleGroupFilter = document.getElementById('muscle-group-filter');
    if (!muscleGroupFilter) return;

    // Add event listener for filter changes
    muscleGroupFilter.addEventListener('change', () => {
        console.log('🔍 Muscle group filter changed to:', muscleGroupFilter.value);
        
        // Get current selected training mode
        const selectedModeCard = document.querySelector('.mode-card.selected');
        const currentMode = selectedModeCard ? selectedModeCard.dataset.mode : 'gym';
        
        // Update exercise library with current mode and new filter
        updateExerciseLibrary(currentMode);
    });

    console.log('✅ Exercise filters setup complete');
}

// Global variables
let currentRoutine = [];
let currentApiExercises = []; // Store current API exercises for lookup

function setupExerciseDragAndDrop() {
    const exerciseItems = document.querySelectorAll('.exercise-item[draggable="true"]');
    
    exerciseItems.forEach(item => {
        item.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', item.dataset.exerciseId);
            item.classList.add('dragging');
        });
        
        item.addEventListener('dragend', (e) => {
            item.classList.remove('dragging');
        });
    });
}

function setupExerciseClickHandlers() {
    const exerciseItems = document.querySelectorAll('.exercise-item');
    
    exerciseItems.forEach(item => {
        item.addEventListener('click', (e) => {
            // Don't open details if clicking on drag handle
            if (e.target.closest('.exercise-drag-handle')) {
                return;
            }
            
            const exerciseId = item.dataset.exerciseId;
            showExerciseDetails(exerciseId);
        });
    });
}

async function showExerciseDetails(exerciseId) {
    console.log('🔍 Showing exercise details for:', exerciseId);
    
    // Store current exercise ID for playlist functionality
    currentExerciseId = exerciseId;
    
    // Find exercise data
    let exerciseData = null;
    
    // Try to get exercise from ExerciseDB API first (only for gym exercises)
    if (exerciseDBService && exerciseId && !exerciseId.includes('_')) {
        try {
            console.log('🔍 Looking up gym exercise in API with ID:', exerciseId);
            const apiExercise = await exerciseDBService.getExerciseById(exerciseId);
            if (apiExercise) {
                exerciseData = exerciseDBService.transformExercise(apiExercise);
                exerciseData.id = exerciseId; // Keep the original ID for compatibility
                console.log('✅ Found gym exercise in API:', exerciseData.name);
                
                // Extract image URL from exercise data (already fetched)
                if (apiExercise && apiExercise.gifUrl) {
                    exerciseData.imageUrl = apiExercise.gifUrl;
                    console.log('✅ Exercise image URL extracted:', apiExercise.gifUrl);
                } else {
                    // Try to fetch image separately if not in exercise data
                    try {
                        console.log('🖼️ Fetching exercise image separately...');
                        const imageUrl = await exerciseDBService.getExerciseImage(exerciseId);
                        if (imageUrl) {
                            exerciseData.imageUrl = imageUrl;
                            console.log('✅ Exercise image fetched separately:', imageUrl);
                        }
                    } catch (imageError) {
                        console.warn('⚠️ Failed to fetch exercise image:', imageError);
                    }
                }
            }
        } catch (error) {
            console.warn('⚠️ Failed to get exercise from API:', error);
        }
    }
    
    // Fallback: Look up exercise in current API exercises
    if (!exerciseData && currentApiExercises.length > 0) {
        console.log('🔍 Looking up exercise in current API exercises...');
        const apiExercise = currentApiExercises.find(ex => ex.id === exerciseId || ex.exerciseId === exerciseId);
        if (apiExercise) {
            exerciseData = exerciseDBService.transformExercise(apiExercise);
            exerciseData.id = exerciseId; // Keep the original ID for compatibility
            
            // Ensure muscle group data is preserved
            if (apiExercise.targetMuscles) {
                exerciseData.targetMuscles = apiExercise.targetMuscles;
            }
            if (apiExercise.secondaryMuscles) {
                exerciseData.secondaryMuscles = apiExercise.secondaryMuscles;
            }
            if (apiExercise.bodyParts) {
                exerciseData.bodyParts = apiExercise.bodyParts;
            }
            
            // Extract image URL
            if (apiExercise.gifUrl) {
                exerciseData.imageUrl = apiExercise.gifUrl;
                console.log('✅ Exercise image URL extracted:', apiExercise.gifUrl);
            }
            
            console.log('✅ Found exercise in current API exercises:', exerciseData.name);
        }
    }
    
    // Final fallback to local exercise data if API lookup fails
    if (!exerciseData && exerciseListData) {
        console.log('🔍 Looking up exercise in local data...');
        // Search through all muscle groups
        Object.keys(exerciseListData).forEach(muscleGroup => {
            if (exerciseListData[muscleGroup]?.exercises) {
                const exercise = exerciseListData[muscleGroup].exercises.find(ex => 
                    `${muscleGroup}_${ex.name.replace(/\s+/g, '_').toLowerCase()}` === exerciseId
                );
                if (exercise) {
                    exerciseData = {
                        id: exerciseId,
                        name: exercise.name,
                        muscleGroup: muscleGroup,
                        activated: exercise.activated,
                        description: exercise.description,
                        images: exercise.images,
                        imageUrl: exercise.images?.[0], // Use first image if available
                        commonMistakes: exercise.common_mistakes
                    };
                    console.log('✅ Found exercise in local data:', exerciseData.name);
                }
            }
        });
    }

    if (!exerciseData) {
        console.warn('❌ Exercise not found:', exerciseId);
        showNotification('Exercise details not available', 'error');
        return;
    }

    // Show enhanced bottom sheet
    console.log('📋 Showing bottom sheet for:', exerciseData.name);
    showExerciseBottomSheet(exerciseData);
}

// Enhanced bottom sheet for exercise details
function showExerciseBottomSheet(exerciseData) {
    console.log('🎯 showExerciseBottomSheet called with:', exerciseData);
    
    // Create or get bottom sheet
    let bottomSheet = document.getElementById('exercise-bottom-sheet');
    if (!bottomSheet) {
        console.log('📦 Creating new bottom sheet element');
        bottomSheet = document.createElement('div');
        bottomSheet.id = 'exercise-bottom-sheet';
        bottomSheet.className = 'bottom-sheet';
        document.body.appendChild(bottomSheet);
    } else {
        console.log('📦 Using existing bottom sheet element');
    }
    
    // Create overlay
    const overlay = document.createElement('div');
    overlay.className = 'bottom-sheet-overlay';
    overlay.addEventListener('click', closeExerciseBottomSheet);
    
    // Create content
    const content = document.createElement('div');
    content.className = 'bottom-sheet-content';
    
    content.innerHTML = `
        <div class="bottom-sheet-header">
            <div class="bottom-sheet-handle"></div>
            <h3>${exerciseData.name}</h3>
            <button class="close-bottom-sheet" onclick="closeExerciseBottomSheet()">
                <i class="fas fa-times"></i>
            </button>
        </div>
        <div class="bottom-sheet-body">
            <div class="exercise-details-container">
                <div class="exercise-details-left">
                    <div class="exercise-detail-section">
                        <h4><i class="fas fa-info-circle"></i> Description</h4>
                        <p>${exerciseData.description || `Exercise targeting ${exerciseData.targetMuscles?.join(', ') || exerciseData.activated?.join(', ') || 'multiple muscle groups'}`}</p>
                    </div>
                    
                    <div class="exercise-detail-section">
                        <h4><i class="fas fa-target"></i> Target Muscles</h4>
                        <p>${exerciseData.targetMuscles?.join(', ') || exerciseData.target || exerciseData.activated?.join(', ') || exerciseData.muscleGroup || 'General'}</p>
                    </div>
                    
                    ${exerciseData.secondaryMuscles && exerciseData.secondaryMuscles.length > 0 ? `
                    <div class="exercise-detail-section">
                        <h4><i class="fas fa-dumbbell"></i> Secondary Muscles</h4>
                        <p>${exerciseData.secondaryMuscles.join(', ')}</p>
                    </div>
                    ` : ''}
                    
                    ${exerciseData.equipments && exerciseData.equipments.length > 0 ? `
                    <div class="exercise-detail-section">
                        <h4><i class="fas fa-dumbbell"></i> Equipment</h4>
                        <p>${exerciseData.equipments.join(', ')}</p>
                    </div>
                    ` : ''}
                    
                    ${exerciseData.instructions && exerciseData.instructions.length > 0 ? `
                    <div class="exercise-detail-section">
                        <h4><i class="fas fa-list-ol"></i> Instructions</h4>
                        <ol>
                            ${exerciseData.instructions.map(instruction => `<li>${instruction}</li>`).join('')}
                        </ol>
                    </div>
                    ` : ''}
                    
                    <div class="exercise-detail-section">
                        <h4><i class="fas fa-plus-circle"></i> Add to Routine</h4>
                        <button class="btn btn-primary" onclick="addExerciseToRoutine('${exerciseData.id}').then(() => closeExerciseBottomSheet());">
                            <i class="fas fa-plus"></i> Add Exercise
                        </button>
                    </div>
                </div>
                
                <div class="exercise-details-right">
                    ${exerciseData.imageUrl || exerciseData.gifUrl ? `
                    <div class="exercise-image-section">
                        <div class="exercise-image-container">
                            <img src="${exerciseData.imageUrl || exerciseData.gifUrl}" 
                                 alt="${exerciseData.name}" 
                                 class="exercise-image" 
                                 onerror="this.style.display='none'; this.nextElementSibling.style.display='block';" />
                            <div class="exercise-image-placeholder" style="display: none;">
                                <i class="fas fa-image"></i>
                                <p>Image not available</p>
                            </div>
                        </div>
                    </div>
                    ` : `
                    <div class="exercise-image-section">
                        <div class="exercise-image-container">
                            <div class="exercise-image-placeholder">
                                <i class="fas fa-image"></i>
                                <p>No image available</p>
                            </div>
                        </div>
                    </div>
                    `}
                </div>
            </div>
        </div>
    `;
    
    console.log('📝 Setting bottom sheet content');
    bottomSheet.innerHTML = '';
    bottomSheet.appendChild(overlay);
    bottomSheet.appendChild(content);
    
    // Show bottom sheet
    console.log('🎬 Activating bottom sheet');
    bottomSheet.classList.add('active');
    document.body.style.overflow = 'hidden';
    console.log('✅ Bottom sheet should now be visible');
}

// Close exercise bottom sheet
function closeExerciseBottomSheet() {
    const bottomSheet = document.getElementById('exercise-bottom-sheet');
    if (bottomSheet) {
        bottomSheet.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
}

function setupBottomSheet() {
    const bottomSheet = document.getElementById('exercise-details-sheet');
    const overlay = document.getElementById('bottom-sheet-overlay');
    const closeBtn = document.getElementById('close-bottom-sheet');
    const addToPlaylistBtn = document.getElementById('add-to-playlist-btn');
    
    if (!bottomSheet) return;

    // Close on overlay click
    if (overlay) {
        overlay.addEventListener('click', closeBottomSheet);
    }

    // Close on close button click
    if (closeBtn) {
        closeBtn.addEventListener('click', closeBottomSheet);
    }

    // Add to playlist button click
    if (addToPlaylistBtn) {
        addToPlaylistBtn.addEventListener('click', () => {
            if (currentExerciseId) {
                addExerciseToRoutine(currentExerciseId);
                showNotification('Exercise added to playlist!', 'success');
                closeBottomSheet();
            }
        });
    }

    // Close on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && bottomSheet.classList.contains('active')) {
            closeBottomSheet();
        }
    });

    // Close on swipe down (optional)
    let startY = 0;
    let currentY = 0;
    
    bottomSheet.addEventListener('touchstart', (e) => {
        startY = e.touches[0].clientY;
    });
    
    bottomSheet.addEventListener('touchmove', (e) => {
        currentY = e.touches[0].clientY;
        const diff = currentY - startY;
        
        if (diff > 50) { // Swipe down threshold
            closeBottomSheet();
        }
    });
}

function closeBottomSheet() {
    const bottomSheet = document.getElementById('exercise-details-sheet');
    if (bottomSheet) {
        bottomSheet.classList.remove('active');
        document.body.style.overflow = '';
    }
}

function setupRoutineBuilder() {
    const routineCanvas = document.getElementById('routine-canvas');
    const routineSteps = document.getElementById('routine-steps');
    const clearBtn = document.getElementById('clear-routine');
    const saveBtn = document.getElementById('save-routine');

    if (!routineCanvas || !routineSteps) return;

    // Setup drop zone
    routineCanvas.addEventListener('dragover', (e) => {
        e.preventDefault();
        routineCanvas.classList.add('drag-over');
    });

    routineCanvas.addEventListener('dragleave', (e) => {
        e.preventDefault();
        routineCanvas.classList.remove('drag-over');
    });

    routineCanvas.addEventListener('drop', async (e) => {
        e.preventDefault();
        routineCanvas.classList.remove('drag-over');
        
        const exerciseId = e.dataTransfer.getData('text/plain');
        
        // Check if this exercise is already in the routine (reordering)
        const existingIndex = currentRoutine.findIndex(ex => ex.id === exerciseId);
        if (existingIndex !== -1) {
            // This is a reorder operation, not adding a new exercise
            // The reordering is handled by the individual exercise drag events
            return;
        }
        
        // This is a new exercise being added
        await addExerciseToRoutine(exerciseId);
    });

    // Setup clear button
    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            clearRoutine();
        });
    }

    // Setup save button
    if (saveBtn) {
        saveBtn.addEventListener('click', () => {
            saveRoutine();
        });
    }
}

async function addExerciseToRoutine(exerciseId, exerciseData = null) {
    console.log('➕ Adding exercise to routine:', exerciseId);
    console.log('📋 Exercise data provided:', exerciseData);
    
    // If exercise data is provided directly, use it
    if (exerciseData) {
        console.log('✅ Using provided exercise data:', exerciseData.name);
        console.log('💪 Target muscles:', exerciseData.targetMuscles);
        console.log('💪 Secondary muscles:', exerciseData.secondaryMuscles);
        
        // Add to current routine
        currentRoutine.push(exerciseData);
        
        // Update routine display
        updateRoutineDisplay();
        
        console.log('✅ Exercise added to routine:', exerciseData.name);
        showNotification(`Added ${exerciseData.name} to routine`, 'success');
        return;
    }
    
    // Fallback: Find exercise data if not provided
    let foundExerciseData = null;
    
    // Try to get exercise from API first (only for gym exercises)
    if (exerciseDBService && exerciseId && !exerciseId.includes('_')) {
        try {
            console.log('🔍 Looking up gym exercise in API with ID:', exerciseId);
            const apiExercise = await exerciseDBService.getExerciseById(exerciseId);
            if (apiExercise) {
                foundExerciseData = exerciseDBService.transformExercise(apiExercise);
                foundExerciseData.id = exerciseId; // Keep the original ID for compatibility
                
                // Ensure muscle group data is preserved
                if (apiExercise.targetMuscles) {
                    foundExerciseData.targetMuscles = apiExercise.targetMuscles;
                }
                if (apiExercise.secondaryMuscles) {
                    foundExerciseData.secondaryMuscles = apiExercise.secondaryMuscles;
                }
                if (apiExercise.bodyParts) {
                    foundExerciseData.bodyParts = apiExercise.bodyParts;
                }
                
                console.log('✅ Found gym exercise in API:', foundExerciseData.name);
                console.log('💪 Target muscles:', foundExerciseData.targetMuscles);
                console.log('💪 Secondary muscles:', foundExerciseData.secondaryMuscles);
            }
        } catch (error) {
            console.warn('⚠️ Failed to get exercise from API:', error);
        }
    }
    
    // Fallback: Look up exercise in current API exercises
    if (!foundExerciseData && currentApiExercises.length > 0) {
        console.log('🔍 Looking up exercise in current API exercises...');
        const apiExercise = currentApiExercises.find(ex => ex.id === exerciseId || ex.exerciseId === exerciseId);
        if (apiExercise) {
            foundExerciseData = exerciseDBService.transformExercise(apiExercise);
            foundExerciseData.id = exerciseId; // Keep the original ID for compatibility
            
            // Ensure muscle group data is preserved
            if (apiExercise.targetMuscles) {
                foundExerciseData.targetMuscles = apiExercise.targetMuscles;
            }
            if (apiExercise.secondaryMuscles) {
                foundExerciseData.secondaryMuscles = apiExercise.secondaryMuscles;
            }
            if (apiExercise.bodyParts) {
                foundExerciseData.bodyParts = apiExercise.bodyParts;
            }
            
            console.log('✅ Found exercise in current API exercises:', foundExerciseData.name);
        }
    }
    
    // Final fallback to local exercise data if API lookup fails
    if (!foundExerciseData && exerciseListData) {
        console.log('🔍 Looking up exercise in local data...');
        // Search through all muscle groups
        Object.keys(exerciseListData).forEach(muscleGroup => {
            if (exerciseListData[muscleGroup]?.exercises) {
                const exercise = exerciseListData[muscleGroup].exercises.find(ex => 
                    `${muscleGroup}_${ex.name.replace(/\s+/g, '_').toLowerCase()}` === exerciseId
                );
                if (exercise) {
                    foundExerciseData = {
                        id: exerciseId,
                        name: exercise.name,
                        muscleGroup: muscleGroup,
                        activated: exercise.activated,
                        description: exercise.description
                    };
                    console.log('✅ Found exercise in local data:', foundExerciseData.name);
                }
            }
        });
    }

    if (!foundExerciseData) {
        console.warn('❌ Exercise not found:', exerciseId);
        console.log('🔍 Available exercise data:', exerciseListData);
        showNotification('Exercise not found', 'error');
        return;
    }

    // Add to current routine
    currentRoutine.push(foundExerciseData);
    
    // Update routine display
    updateRoutineDisplay();
    
    console.log('✅ Exercise added to routine:', foundExerciseData.name);
    showNotification(`Added ${foundExerciseData.name} to routine`, 'success');
}

function updateRoutineDisplay() {
    const routineSteps = document.getElementById('routine-steps');
    if (!routineSteps) return;

    if (currentRoutine.length === 0) {
        routineSteps.innerHTML = `
            <div class="empty-routine text-center text-muted">
                <i class="fas fa-plus-circle"></i>
                <p>Drag exercises here to build your routine</p>
            </div>
        `;
        return;
    }

    routineSteps.innerHTML = currentRoutine.map((exercise, index) => {
        const hasWeights = exercise.hasWeights;
        const sets = exercise.sets || 3;
        const reps = exercise.reps || (hasWeights ? 12 : 15);
        const weight = exercise.weight || 0;
        const duration = exercise.duration || 30;
        
        // Get muscle groups for tags
        let targetMuscles = exercise.targetMuscles && Array.isArray(exercise.targetMuscles) ? exercise.targetMuscles : [];
        let secondaryMuscles = exercise.secondaryMuscles && Array.isArray(exercise.secondaryMuscles) ? exercise.secondaryMuscles : [];
        
        // Fallback to activated muscles if no target/secondary muscles found
        if (targetMuscles.length === 0 && exercise.activated && Array.isArray(exercise.activated)) {
            targetMuscles = exercise.activated;
        }
        
        // Debug logging for muscle data
        console.log(`🏋️ Exercise: ${exercise.name}`);
        console.log(`💪 Target muscles:`, targetMuscles);
        console.log(`💪 Secondary muscles:`, secondaryMuscles);
        console.log(`💪 Activated muscles:`, exercise.activated);
        console.log(`💪 Full exercise data:`, exercise);
        
        // Combine and limit to 4 tags (2 target + 2 secondary max)
        const muscleTags = [];
        
        // Add target muscles first (primary)
        targetMuscles.slice(0, 2).forEach(muscle => {
            muscleTags.push({ name: muscle, type: 'primary' });
        });
        
        // Add secondary muscles (secondary)
        secondaryMuscles.slice(0, 2).forEach(muscle => {
            if (!targetMuscles.includes(muscle)) { // Avoid duplicates
                muscleTags.push({ name: muscle, type: 'secondary' });
            }
        });
        
        // If no muscle tags found, add a fallback tag
        if (muscleTags.length === 0 && exercise.muscleGroup) {
            muscleTags.push({ name: exercise.muscleGroup, type: 'primary' });
        }
        
        return `
        <div class="routine-exercise" data-index="${index}" draggable="true">
            <div class="exercise-content">
                <div class="exercise-header">
                    <div class="exercise-number-badge">${index + 1}</div>
                    <h5 class="exercise-title">${exercise.name}</h5>
                </div>
                ${muscleTags.length > 0 ? `
                <div class="muscle-group-tags">
                    ${muscleTags.map(tag => `
                        <span class="muscle-tag ${tag.type}" title="${tag.type === 'primary' ? 'Target muscle' : 'Secondary muscle'}">${tag.name}</span>
                    `).join('')}
                </div>
                ` : ''}
                <div class="exercise-params">
                    <span class="param-item">${sets} sets</span>
                    <span class="param-item">${reps} reps</span>
                    <span class="param-item">${hasWeights ? `${weight}kg` : `${duration}s`}</span>
                    <button class="btn btn-sm btn-outline routine-edit-btn" data-index="${index}" title="Edit exercise">
                        <i class="fas fa-pen"></i>
                    </button>
                </div>
            </div>
            <div class="exercise-image-section">
                <div class="exercise-image-container">
                    <img src="${exercise.imageUrl || exercise.gifUrl || ''}" 
                         alt="${exercise.name}" 
                         class="exercise-image" 
                         onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" />
                    <div class="exercise-image-placeholder" style="display: none;">
                        <i class="fas fa-dumbbell"></i>
                    </div>
                </div>
            </div>
        </div>
        `;
    }).join('');

    // Add event listeners for remove buttons
    routineSteps.querySelectorAll('.remove-exercise').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const index = parseInt(e.target.closest('.remove-exercise').dataset.index);
            removeExerciseFromRoutine(index);
        });
    });

    // Add event listeners for edit buttons
    routineSteps.querySelectorAll('.routine-edit-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const index = parseInt(e.target.closest('.routine-edit-btn').dataset.index);
            openEditExerciseModal(index);
        });
    });

    // Drag-and-drop reordering
    let dragSrcIndex = null;
    routineSteps.querySelectorAll('.routine-exercise').forEach(item => {
        item.addEventListener('dragstart', (e) => {
            dragSrcIndex = parseInt(item.dataset.index);
            item.classList.add('dragging');
        });
        item.addEventListener('dragend', (e) => {
            item.classList.remove('dragging');
        });
        item.addEventListener('dragover', (e) => {
            e.preventDefault();
            item.classList.add('drag-over');
        });
        item.addEventListener('dragleave', (e) => {
            item.classList.remove('drag-over');
        });
        item.addEventListener('drop', (e) => {
            e.preventDefault();
            item.classList.remove('drag-over');
            const dropIndex = parseInt(item.dataset.index);
            if (dragSrcIndex !== null && dragSrcIndex !== dropIndex) {
                const moved = currentRoutine.splice(dragSrcIndex, 1)[0];
                currentRoutine.splice(dropIndex, 0, moved);
                updateRoutineDisplay();
            }
            dragSrcIndex = null;
        });
    });
}

function openEditExerciseModal(index) {
    const exercise = currentRoutine[index];
    if (!exercise) return;

    // Create modal HTML
    const modalHTML = `
        <div class="modal" id="edit-exercise-modal">
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Edit ${exercise.name}</h3>
                    <button class="close-btn" id="close-edit-exercise-modal">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <form id="edit-exercise-form">
                        <div class="form-group">
                            <label class="form-label" for="edit-sets">Sets</label>
                            <input type="number" id="edit-sets" class="form-input" value="${exercise.sets || 3}" min="1" max="10" required>
                        </div>
                        <div class="form-group">
                            <label class="form-label" for="edit-reps">Reps</label>
                            <input type="number" id="edit-reps" class="form-input" value="${exercise.reps || (exercise.hasWeights ? 12 : 15)}" min="1" max="50" required>
                        </div>
                        ${exercise.hasWeights ? `
                        <div class="form-group">
                            <label class="form-label" for="edit-weight">Weight (kg)</label>
                            <input type="number" id="edit-weight" class="form-input" value="${exercise.weight || 0}" min="0" max="999" step="0.5">
                        </div>
                        ` : `
                        <div class="form-group">
                            <label class="form-label" for="edit-duration">Duration (seconds)</label>
                            <input type="number" id="edit-duration" class="form-input" value="${exercise.duration || 30}" min="1" max="600">
                        </div>
                        `}
                    </form>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-outline" id="cancel-edit-exercise">
                        Cancel
                    </button>
                    <button class="btn btn-primary" id="save-edit-exercise" data-index="${index}">
                        <i class="fas fa-save"></i>
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    `;

    // Remove existing modal if present
    const existingModal = document.getElementById('edit-exercise-modal');
    if (existingModal) {
        existingModal.remove();
    }

    // Add modal to body
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // Show modal
    const modal = document.getElementById('edit-exercise-modal');
    modal.style.display = 'flex';

    // Setup modal event listeners
    const closeBtn = document.getElementById('close-edit-exercise-modal');
    const cancelBtn = document.getElementById('cancel-edit-exercise');
    const saveBtn = document.getElementById('save-edit-exercise');

    function closeModal() {
        modal.remove();
    }

    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (cancelBtn) cancelBtn.addEventListener('click', closeModal);

    if (saveBtn) {
        saveBtn.addEventListener('click', () => {
            const sets = parseInt(document.getElementById('edit-sets').value);
            const reps = parseInt(document.getElementById('edit-reps').value);
            
            currentRoutine[index].sets = sets;
            currentRoutine[index].reps = reps;
            
            if (exercise.hasWeights) {
                const weight = parseFloat(document.getElementById('edit-weight').value);
                currentRoutine[index].weight = weight;
            } else {
                const duration = parseInt(document.getElementById('edit-duration').value);
                currentRoutine[index].duration = duration;
            }
            
            closeModal();
            updateRoutineDisplay();
            showNotification('Exercise updated successfully!', 'success');
        });
    }

    // Close on outside click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });

    // Close on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeModal();
        }
    });
}

function removeExerciseFromRoutine(index) {
    if (index >= 0 && index < currentRoutine.length) {
        const removedExercise = currentRoutine.splice(index, 1)[0];
        updateRoutineDisplay();
        console.log('✅ Exercise removed from routine:', removedExercise.name);
        showNotification(`Removed ${removedExercise.name} from routine`, 'info');
    }
}

function clearRoutine() {
    currentRoutine = [];
    updateRoutineDisplay();
    console.log('✅ Routine cleared');
    showNotification('Routine cleared', 'info');
}

function saveRoutine() {
    if (currentRoutine.length === 0) {
        showNotification('No exercises in routine to save', 'warning');
        return;
    }

    showSaveRoutineModal();
}

function showSaveRoutineModal() {
    // Create modal HTML
    const modalHTML = `
        <div class="modal" id="save-routine-modal">
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Save Routine</h3>
                    <button class="close-btn" onclick="closeSaveRoutineModal()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label class="form-label" for="routine-name">Routine Name</label>
                        <input type="text" id="routine-name" class="form-input" placeholder="Enter routine name" required>
                    </div>
                    
                    <div class="rest-time-settings">
                        <h4>Rest Time Settings</h4>
                        <div class="rest-time-grid">
                            <div class="form-group">
                                <label class="form-label" for="rest-between-sets">
                                    <i class="fas fa-clock"></i>
                                    Rest Between Sets (seconds)
                                </label>
                                <input type="number" id="rest-between-sets" class="form-input" value="60" min="10" max="600" step="5" placeholder="60">
                            </div>
                            
                            <div class="form-group">
                                <label class="form-label" for="rest-between-exercises">
                                    <i class="fas fa-stopwatch"></i>
                                    Rest Between Exercises (seconds)
                                </label>
                                <input type="number" id="rest-between-exercises" class="form-input" value="90" min="30" max="1200" step="10" placeholder="90">
                            </div>
                            
                            <div class="form-group">
                                <label class="form-label" for="rest-between-circuits">
                                    <i class="fas fa-redo"></i>
                                    Rest Between Circuits (seconds)
                                </label>
                                <input type="number" id="rest-between-circuits" class="form-input" value="180" min="60" max="1800" step="30" placeholder="180">
                            </div>
                        </div>
                    </div>
                    
                    <div class="routine-summary">
                        <h4>Exercise List (${currentRoutine.length} exercises)</h4>
                                                    <div class="exercise-list">
                                ${currentRoutine.map((exercise, index) => {
                                    const hasWeights = exercise.hasWeights;
                                    const sets = exercise.sets || 3;
                                    const reps = exercise.reps || (hasWeights ? 12 : 15);
                                    const weight = exercise.weight || 0;
                                    const duration = exercise.duration || 30;
                                    
                                        return `
        <div class="exercise-summary-item" data-index="${index}" draggable="true">
            <div class="exercise-drag-handle" title="Drag to reorder">
                <i class="fas fa-grip-vertical"></i>
            </div>
            <div class="exercise-content">
                <div class="exercise-header">
                    <div class="exercise-number-badge">${index + 1}</div>
                    <h5 class="exercise-title">${exercise.name}</h5>
                </div>
                <div class="exercise-muscle-tags">
                    <span class="muscle-tag primary">${exercise.muscleGroup || 'Unknown'}</span>
                    ${exercise.activated && exercise.activated.length > 0 ? 
                        exercise.activated.slice(0, 2).map(muscle => 
                            `<span class="muscle-tag secondary">${muscle}</span>`
                        ).join('') : ''
                    }
                </div>
                <div class="exercise-params">
                    <div class="param-group">
                        <label class="param-label">Sets</label>
                        <input type="number" class="param-input sets-input" value="${sets}" min="1" max="20" data-field="sets">
                    </div>
                    <div class="param-group">
                        <label class="param-label">${hasWeights ? 'Reps' : 'Duration'}</label>
                        <input type="number" class="param-input reps-input" value="${hasWeights ? reps : duration}" min="1" max="999" data-field="${hasWeights ? 'reps' : 'duration'}">
                    </div>
                    ${hasWeights ? `
                        <div class="param-group">
                            <label class="param-label">Weight</label>
                            <input type="number" class="param-input weight-input" value="${weight}" min="0" max="500" step="0.5" data-field="weight">
                        </div>
                    ` : ''}
                </div>
            </div>
            <div class="exercise-image-section">
                <div class="exercise-image-placeholder">
                    ${exercise.gifUrl ? `<img src="${exercise.gifUrl}" alt="${exercise.name}" class="exercise-image">` : '<i class="fas fa-dumbbell"></i>'}
                </div>
            </div>
            <button class="btn btn-sm btn-outline remove-exercise-btn" onclick="removeExerciseFromModal(${index})">
                <i class="fas fa-trash"></i>
            </button>
        </div>
        `;
                            }).join('')}
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-outline" onclick="closeSaveRoutineModal()">
                        Cancel
                    </button>
                    <button class="btn btn-primary" onclick="confirmSaveRoutine()">
                        <i class="fas fa-save"></i>
                        Save Routine
                    </button>
                </div>
            </div>
        </div>
    `;

    // Add modal to body
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Show modal
    const modal = document.getElementById('save-routine-modal');
    modal.style.display = 'flex';
    
    // Focus on input
    setTimeout(() => {
        document.getElementById('routine-name').focus();
    }, 100);
    
    // Setup drag and drop for exercise reordering
    setupModalExerciseDragAndDrop();
}

function closeSaveRoutineModal() {
    const modal = document.getElementById('save-routine-modal');
    if (modal) {
        modal.remove();
    }
}

function confirmSaveRoutine() {
    const routineName = document.getElementById('routine-name').value.trim();
    
    if (!routineName) {
        showNotification('Please enter a routine name', 'warning');
        return;
    }

    // Get rest time settings
    const restBetweenSets = parseInt(document.getElementById('rest-between-sets').value);
    const restBetweenExercises = parseInt(document.getElementById('rest-between-exercises').value);
    const restBetweenCircuits = parseInt(document.getElementById('rest-between-circuits').value);

    // Update currentRoutine with edited values from modal
    const exerciseItems = document.querySelectorAll('.exercise-summary-item');
    exerciseItems.forEach((item, index) => {
        const exerciseIndex = parseInt(item.dataset.index);
        if (exerciseIndex < currentRoutine.length) {
            const exercise = currentRoutine[exerciseIndex];
            
            // Get edited values
            const setsInput = item.querySelector('.sets-input');
            const repsInput = item.querySelector('.reps-input');
            const weightInput = item.querySelector('.weight-input');
            
            if (setsInput) exercise.sets = parseInt(setsInput.value) || 3;
            if (repsInput) {
                if (exercise.hasWeights) {
                    exercise.reps = parseInt(repsInput.value) || 12;
                } else {
                    exercise.duration = parseInt(repsInput.value) || 30;
                }
            }
            if (weightInput) exercise.weight = parseFloat(weightInput.value) || 0;
        }
    });

    const routineData = {
        id: Date.now().toString(),
        name: routineName,
        exercises: currentRoutine,
        restTimes: {
            betweenSets: restBetweenSets,
            betweenExercises: restBetweenExercises,
            betweenCircuits: restBetweenCircuits
        },
        createdAt: new Date().toISOString(),
        trainingMode: document.querySelector('.mode-card.selected')?.dataset.mode || 'gym'
    };

    // Save to localStorage
    const savedRoutines = JSON.parse(localStorage.getItem('savedRoutines') || '[]');
    savedRoutines.push(routineData);
    localStorage.setItem('savedRoutines', JSON.stringify(savedRoutines));

    console.log('✅ Routine saved:', routineData);
    showNotification(`Routine "${routineName}" saved successfully!`, 'success');
    
    // Clear the routine builder
    currentRoutine = [];
    updateRoutineDisplay();
    
    // Close modal
    closeSaveRoutineModal();
}

function setupModalExerciseDragAndDrop() {
    const exerciseItems = document.querySelectorAll('.exercise-summary-item');
    let dragSrcIndex = null;
    
    exerciseItems.forEach(item => {
        item.addEventListener('dragstart', (e) => {
            dragSrcIndex = parseInt(item.dataset.index);
            item.classList.add('dragging');
            e.dataTransfer.effectAllowed = 'move';
        });
        
        item.addEventListener('dragend', (e) => {
            item.classList.remove('dragging');
        });
        
        item.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            item.classList.add('drag-over');
        });
        
        item.addEventListener('dragleave', (e) => {
            item.classList.remove('drag-over');
        });
        
        item.addEventListener('drop', (e) => {
            e.preventDefault();
            item.classList.remove('drag-over');
            const dropIndex = parseInt(item.dataset.index);
            
            if (dragSrcIndex !== null && dragSrcIndex !== dropIndex) {
                // Reorder the exercises in currentRoutine
                const moved = currentRoutine.splice(dragSrcIndex, 1)[0];
                currentRoutine.splice(dropIndex, 0, moved);
                
                // Refresh the modal with reordered exercises
                refreshModalExerciseList();
            }
            dragSrcIndex = null;
        });
    });
}

function refreshModalExerciseList() {
    const exerciseList = document.querySelector('#save-routine-modal .exercise-list');
    if (!exerciseList) return;
    
    const routineName = document.getElementById('routine-name').value;
    const restBetweenSets = document.getElementById('rest-between-sets').value;
    const restBetweenExercises = document.getElementById('rest-between-exercises').value;
    const restBetweenCircuits = document.getElementById('rest-between-circuits').value;
    
    exerciseList.innerHTML = currentRoutine.map((exercise, index) => {
        const hasWeights = exercise.hasWeights;
        const sets = exercise.sets || 3;
        const reps = exercise.reps || (hasWeights ? 12 : 15);
        const weight = exercise.weight || 0;
        const duration = exercise.duration || 30;
        
        return `
        <div class="exercise-summary-item" data-index="${index}" draggable="true">
            <div class="exercise-drag-handle" title="Drag to reorder">
                <i class="fas fa-grip-vertical"></i>
            </div>
            <div class="exercise-content">
                <div class="exercise-header">
                    <div class="exercise-number-badge">${index + 1}</div>
                    <h5 class="exercise-title">${exercise.name}</h5>
                </div>
                <div class="exercise-muscle-tags">
                    <span class="muscle-tag primary">${exercise.muscleGroup || 'Unknown'}</span>
                    ${exercise.activated && exercise.activated.length > 0 ? 
                        exercise.activated.slice(0, 2).map(muscle => 
                            `<span class="muscle-tag secondary">${muscle}</span>`
                        ).join('') : ''
                    }
                </div>
                <div class="exercise-params">
                    <div class="param-group">
                        <label class="param-label">Sets</label>
                        <input type="number" class="param-input sets-input" value="${sets}" min="1" max="20" data-field="sets">
                    </div>
                    <div class="param-group">
                        <label class="param-label">${hasWeights ? 'Reps' : 'Duration'}</label>
                        <input type="number" class="param-input reps-input" value="${hasWeights ? reps : duration}" min="1" max="999" data-field="${hasWeights ? 'reps' : 'duration'}">
                    </div>
                    ${hasWeights ? `
                        <div class="param-group">
                            <label class="param-label">Weight</label>
                            <input type="number" class="param-input weight-input" value="${weight}" min="0" max="500" step="0.5" data-field="weight">
                        </div>
                    ` : ''}
                </div>
            </div>
            <div class="exercise-image-section">
                <div class="exercise-image-placeholder">
                    ${exercise.gifUrl ? `<img src="${exercise.gifUrl}" alt="${exercise.name}" class="exercise-image">` : '<i class="fas fa-dumbbell"></i>'}
                </div>
            </div>
            <button class="btn btn-sm btn-outline remove-exercise-btn" onclick="removeExerciseFromModal(${index})">
                <i class="fas fa-trash"></i>
            </button>
        </div>
        `;
    }).join('');
    
    // Re-setup drag and drop after refreshing
    setupModalExerciseDragAndDrop();
}

function removeExerciseFromModal(index) {
    if (index >= 0 && index < currentRoutine.length) {
        currentRoutine.splice(index, 1);
        
        // Refresh the modal with updated exercise list
        const modalBody = document.querySelector('#save-routine-modal .modal-body');
        const routineName = document.getElementById('routine-name').value;
        const restBetweenSets = document.getElementById('rest-between-sets').value;
        const restBetweenExercises = document.getElementById('rest-between-exercises').value;
        const restBetweenCircuits = document.getElementById('rest-between-circuits').value;
        
        // Recreate the modal content
        modalBody.innerHTML = `
            <div class="form-group">
                <label class="form-label" for="routine-name">Routine Name</label>
                <input type="text" id="routine-name" class="form-input" placeholder="Enter routine name" value="${routineName}" required>
            </div>
            
            <div class="rest-time-settings">
                <h4>Rest Time Settings</h4>
                <div class="rest-time-grid">
                    <div class="form-group">
                        <label class="form-label" for="rest-between-sets">
                            <i class="fas fa-clock"></i>
                            Rest Between Sets (seconds)
                        </label>
                        <input type="number" id="rest-between-sets" class="form-input" value="${restBetweenSets}" min="10" max="600" step="5" placeholder="60">
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label" for="rest-between-exercises">
                            <i class="fas fa-stopwatch"></i>
                            Rest Between Exercises (seconds)
                        </label>
                        <input type="number" id="rest-between-exercises" class="form-input" value="${restBetweenExercises}" min="30" max="1200" step="10" placeholder="90">
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label" for="rest-between-circuits">
                            <i class="fas fa-redo"></i>
                            Rest Between Circuits (seconds)
                        </label>
                        <input type="number" id="rest-between-circuits" class="form-input" value="${restBetweenCircuits}" min="60" max="1800" step="30" placeholder="180">
                    </div>
                </div>
            </div>
            
            <div class="routine-summary">
                <h4>Exercise List (${currentRoutine.length} exercises)</h4>
                <div class="exercise-list">
                    ${currentRoutine.map((exercise, newIndex) => {
                        const hasWeights = exercise.hasWeights;
                        const sets = exercise.sets || 3;
                        const reps = exercise.reps || (hasWeights ? 12 : 15);
                        const weight = exercise.weight || 0;
                        const duration = exercise.duration || 30;
                        
                        return `
                        <div class="exercise-summary-item" data-index="${newIndex}" draggable="true">
                            <div class="exercise-drag-handle" title="Drag to reorder">
                                <i class="fas fa-grip-vertical"></i>
                            </div>
                            <div class="exercise-number">${newIndex + 1}</div>
                            <div class="exercise-details">
                                <div class="exercise-name">${exercise.name}</div>
                                <div class="exercise-muscle">${exercise.activated?.join(', ') || exercise.muscleGroup}</div>
                                <div class="exercise-edit-fields">
                                    <div class="edit-field-group">
                                        <label class="edit-label">
                                            <i class="fas fa-layer-group"></i>
                                            Sets
                                        </label>
                                        <input type="number" class="edit-input sets-input" value="${sets}" min="1" max="20" data-field="sets">
                                    </div>
                                    <div class="edit-field-group">
                                        <label class="edit-label">
                                            <i class="fas fa-repeat"></i>
                                            ${hasWeights ? 'Reps' : 'Duration (sec)'}
                                        </label>
                                        <input type="number" class="edit-input reps-input" value="${hasWeights ? reps : duration}" min="1" max="999" data-field="${hasWeights ? 'reps' : 'duration'}">
                                    </div>
                                    ${hasWeights ? `
                                        <div class="edit-field-group">
                                            <label class="edit-label">
                                                <i class="fas fa-weight-hanging"></i>
                                                Weight (kg)
                                            </label>
                                            <input type="number" class="edit-input weight-input" value="${weight}" min="0" max="500" step="0.5" data-field="weight">
                                        </div>
                                    ` : ''}
                                </div>
                            </div>
                            <button class="btn btn-sm btn-outline remove-exercise-btn" onclick="removeExerciseFromModal(${newIndex})">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
        
        showNotification(`Exercise removed from routine`, 'success');
    }
}

// ===== PROGRESS FUNCTIONS =====
async function updateProgressCharts() {
    // Initialize dropdown first, then charts
    await initializeStrengthProgressDropdown();
    await initializeCharts();
    updateProgressPhotos();
}

async function initializeCharts() {
    try {
        // Strength Progress Chart will be initialized after dropdown setup
        await initializeStrengthProgressChart();

        // Body Measurements Chart
        const bodyCtx = document.getElementById('body-chart');
        if (bodyCtx && progressData?.bodyMeasurements) {
            new Chart(bodyCtx, {
                type: 'line',
                data: {
                    labels: progressData.bodyMeasurements.labels,
                    datasets: progressData.bodyMeasurements.datasets
                },
                options: {
                    responsive: true,
                    plugins: {
                        title: {
                            display: true,
                            text: 'Body Measurements'
                        }
                    }
                }
            });
        }

        console.log('✅ Charts initialized');
    } catch (error) {
        console.error('❌ Error initializing charts:', error);
    }
}

// Initialize strength progress dropdown with body parts from API
async function initializeStrengthProgressDropdown() {
    try {
        const bodyPartSelect = document.getElementById('body-part-select');
        if (!bodyPartSelect) return;

        // Clear existing options except the first one
        bodyPartSelect.innerHTML = '<option value="">Overall Progress</option>';

        // Fetch body parts from ExerciseDB API
        const bodyParts = await exerciseDBService.getBodyParts();
        
        if (bodyParts && bodyParts.length > 0) {
            bodyParts.forEach(bodyPart => {
                const option = document.createElement('option');
                option.value = bodyPart;
                option.textContent = bodyPart.charAt(0).toUpperCase() + bodyPart.slice(1);
                bodyPartSelect.appendChild(option);
            });
            
            console.log('✅ Body parts loaded:', bodyParts.length);
        } else {
            // Fallback body parts if API fails
            const fallbackBodyParts = ['chest', 'back', 'shoulders', 'upper arms', 'lower arms', 'upper legs', 'lower legs', 'waist'];
            fallbackBodyParts.forEach(bodyPart => {
                const option = document.createElement('option');
                option.value = bodyPart;
                option.textContent = bodyPart.charAt(0).toUpperCase() + bodyPart.slice(1);
                bodyPartSelect.appendChild(option);
            });
            console.log('⚠️ Using fallback body parts');
        }

        // Add event listener for dropdown change
        bodyPartSelect.addEventListener('change', function() {
            const selectedBodyPart = this.value;
            updateStrengthProgressChart(selectedBodyPart);
            if (selectedBodyPart) {
                showBodyPartDetails(selectedBodyPart);
            } else {
                hideBodyPartDetails();
            }
        });

    } catch (error) {
        console.error('❌ Error initializing strength progress dropdown:', error);
    }
}

// Initialize strength progress chart
async function initializeStrengthProgressChart() {
    const strengthCtx = document.getElementById('strength-chart');
    if (!strengthCtx) return;

    // Create initial chart with overall progress data
    const initialData = await generateOverallProgressData();
    window.strengthChart = new Chart(strengthCtx, {
        type: 'line',
        data: {
            labels: initialData.labels,
            datasets: initialData.datasets
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Overall Strength Progress'
                },
                legend: {
                    display: true,
                    position: 'top',
                    onClick: (event, legendItem, legend) => {
                        const datasetIndex = legendItem.datasetIndex;
                        const bodyPartName = initialData.datasets[datasetIndex].label.replace(' (Average)', '');
                        const bodyPartLower = bodyPartName.toLowerCase();
                        
                        // Update dropdown to match clicked legend item
                        const bodyPartSelect = document.getElementById('body-part-select');
                        if (bodyPartSelect) {
                            bodyPartSelect.value = bodyPartLower;
                        }
                        
                        // Update chart to show muscle group breakdown
                        updateStrengthProgressChart(bodyPartLower);
                        
                        // Show detailed information
                        showBodyPartDetails(bodyPartLower);
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Weight (lbs)'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Date'
                    }
                }
            },
            onClick: (event, elements) => {
                if (elements.length > 0) {
                    const datasetIndex = elements[0].datasetIndex;
                    const bodyPartName = initialData.datasets[datasetIndex].label.replace(' (Average)', '');
                    const bodyPartLower = bodyPartName.toLowerCase();
                    
                    // Update dropdown to match clicked body part
                    const bodyPartSelect = document.getElementById('body-part-select');
                    if (bodyPartSelect) {
                        bodyPartSelect.value = bodyPartLower;
                    }
                    
                    // Update chart to show muscle group breakdown
                    updateStrengthProgressChart(bodyPartLower);
                    
                    // Show detailed information
                    showBodyPartDetails(bodyPartLower);
                }
            }
        }
    });
}

// Update strength progress chart based on selected body part
async function updateStrengthProgressChart(selectedBodyPart) {
    try {
        if (!window.strengthChart) {
            initializeStrengthProgressChart();
        }

        if (!selectedBodyPart) {
            // Show overall progress data for all body parts when none selected
            const overallProgressData = await generateOverallProgressData();
            window.strengthChart.data.labels = overallProgressData.labels;
            window.strengthChart.data.datasets = overallProgressData.datasets;
            window.strengthChart.options.plugins.title.text = 'Overall Strength Progress';
            window.strengthChart.options.scales.y.title.text = 'Weight (lbs)';
            window.strengthChart.update();
            return;
        }

        // Get exercises for the selected body part
        const exerciseData = await exerciseDBService.getExercisesByBodyPart(selectedBodyPart, 10);
        
        if (!exerciseData || !exerciseData.exercises || exerciseData.exercises.length === 0) {
            showNotification(`No exercises found for ${selectedBodyPart}`, 'warning');
            return;
        }

        // Generate average progress data for the body part
        const progressData = generateAverageProgressData(selectedBodyPart);
        
        // Update chart data
        window.strengthChart.data.labels = progressData.labels;
        window.strengthChart.data.datasets = progressData.datasets;
        window.strengthChart.options.plugins.title.text = `${selectedBodyPart.charAt(0).toUpperCase() + selectedBodyPart.slice(1)} Strength Progress`;
        
        // Update Y-axis label based on body part
        const yAxisLabel = getYAxisLabel(selectedBodyPart);
        window.strengthChart.options.scales.y.title.text = yAxisLabel;
        
        // Update click handlers for the new chart data
        window.strengthChart.options.onClick = (event, elements) => {
            if (elements.length > 0) {
                const datasetIndex = elements[0].datasetIndex;
                const muscleGroupName = progressData.datasets[datasetIndex].label;
                showMuscleGroupDetails(selectedBodyPart, muscleGroupName);
            }
        };
        
        // Update legend click handler
        window.strengthChart.options.plugins.legend.onClick = (event, legendItem, legend) => {
            const datasetIndex = legendItem.datasetIndex;
            const muscleGroupName = progressData.datasets[datasetIndex].label;
            showMuscleGroupDetails(selectedBodyPart, muscleGroupName);
        };
        
        window.strengthChart.update();

        console.log(`✅ Updated strength chart for ${selectedBodyPart} with ${exerciseData.exercises.length} exercises`);

    } catch (error) {
        console.error('❌ Error updating strength progress chart:', error);
        showNotification('Failed to update strength chart', 'error');
    }
}

// Demo function to show sample charts for all body parts
function showAllBodyPartSamples() {
    const bodyParts = [
        'chest', 'back', 'shoulders', 'upper arms', 'lower arms', 
        'upper legs', 'lower legs', 'waist', 'cardio', 'neck'
    ];
    
    console.log('📊 Sample Charts for All Body Parts:');
    bodyParts.forEach(bodyPart => {
        const sampleData = getBodyPartSampleData(bodyPart);
        console.log(`\n${bodyPart.toUpperCase()}:`);
        sampleData.exercises.forEach((exercise, index) => {
            const finalWeight = Math.round(exercise.baseWeight * (1 + (5 * exercise.improvementRate)));
            console.log(`  ${index + 1}. ${exercise.name}: ${exercise.baseWeight} → ${finalWeight} ${getYAxisLabel(bodyPart).split(' ')[1] || 'lbs'}`);
        });
    });
}

// Generate overall progress data for all body parts
async function generateOverallProgressData() {
    const labels = [];
    const datasets = [];
    
    // Generate dates for the last 6 months
    const today = new Date();
    for (let i = 5; i >= 0; i--) {
        const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
        labels.push(date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }));
    }

    // Get body parts from API or use fallback
    let bodyParts = [];
    try {
        bodyParts = await exerciseDBService.getBodyParts();
    } catch (error) {
        console.error('Failed to get body parts for overall progress:', error);
        // Fallback body parts
        bodyParts = ['chest', 'back', 'shoulders', 'upper arms', 'lower arms', 'upper legs', 'lower legs', 'waist'];
    }

    // Create datasets for each body part (averaged across all exercises)
    bodyParts.forEach((bodyPart, index) => {
        const averageData = calculateAverageProgressForBodyPart(bodyPart, labels);
        
        datasets.push({
            label: `${bodyPart.charAt(0).toUpperCase() + bodyPart.slice(1)} (Average)`,
            data: averageData,
            borderColor: getChartColor(index),
            backgroundColor: getChartColor(index, 0.1),
            borderWidth: 2,
            fill: false,
            tension: 0.4
        });
    });

    return { labels, datasets };
}

// Calculate average progress for a specific body part
function calculateAverageProgressForBodyPart(bodyPartName, labels) {
    const bodyPartData = getBodyPartSampleData(bodyPartName.toLowerCase());
    const allExercisesData = [];
    
    // Generate data for all exercises in this body part
    bodyPartData.exercises.forEach(exercise => {
        const exerciseData = labels.map((_, i) => {
            const progress = i * exercise.improvementRate;
            const variation = (Math.random() - 0.5) * 0.1; // ±5% variation
            return Math.round(exercise.baseWeight * (1 + progress + variation));
        });
        allExercisesData.push(exerciseData);
    });
    
    // Calculate average for each month
    const averageData = labels.map((_, monthIndex) => {
        const monthValues = allExercisesData.map(exerciseData => exerciseData[monthIndex]);
        const sum = monthValues.reduce((acc, val) => acc + val, 0);
        return Math.round(sum / monthValues.length);
    });
    
    return averageData;
}

// Show detailed information for a specific muscle group
function showMuscleGroupDetails(bodyPart, muscleGroupName) {
    // Remove existing details panel
    hideBodyPartDetails();
    
    // Create details panel
    const detailsPanel = document.createElement('div');
    detailsPanel.id = 'body-part-details';
    detailsPanel.className = 'body-part-details';
    
    const muscleGroups = getMuscleGroupsForBodyPart(bodyPart);
    const selectedMuscle = muscleGroups.find(mg => mg.name === muscleGroupName);
    const bodyPartInfo = getBodyPartInfo(bodyPart);
    
    if (!selectedMuscle) return;
    
    detailsPanel.innerHTML = `
        <div class="details-header">
            <h3>${muscleGroupName} Details</h3>
            <button class="close-details" onclick="hideBodyPartDetails()">
                <i class="fas fa-times"></i>
            </button>
        </div>
        <div class="details-content">
            <div class="body-part-info">
                <div class="info-section">
                    <h4><i class="fas fa-info-circle"></i> Muscle Overview</h4>
                    <p>${getMuscleGroupDescription(muscleGroupName)}</p>
                </div>
                <div class="info-section">
                    <h4><i class="fas fa-dumbbell"></i> Performance Data</h4>
                    <div class="progress-summary">
                        <div class="progress-item">
                            <span class="progress-label">Starting Weight:</span>
                            <span class="progress-value">${selectedMuscle.baseWeight} ${getYAxisLabel(bodyPart).split(' ')[1] || 'lbs'}</span>
                        </div>
                        <div class="progress-item">
                            <span class="progress-label">6-Month Projection:</span>
                            <span class="progress-value">${Math.round(selectedMuscle.baseWeight * (1 + (5 * selectedMuscle.improvementRate)))} ${getYAxisLabel(bodyPart).split(' ')[1] || 'lbs'}</span>
                        </div>
                        <div class="progress-item">
                            <span class="progress-label">Monthly Improvement:</span>
                            <span class="progress-value">+${(selectedMuscle.improvementRate * 100).toFixed(1)}%</span>
                        </div>
                        <div class="progress-item">
                            <span class="progress-label">Total Expected Gain:</span>
                            <span class="progress-value">+${Math.round((selectedMuscle.improvementRate * 5 * 100))}%</span>
                        </div>
                    </div>
                </div>
                <div class="info-section">
                    <h4><i class="fas fa-lightbulb"></i> Training Focus</h4>
                    <ul>
                        ${getMuscleGroupTips(muscleGroupName).map(tip => `<li>${tip}</li>`).join('')}
                    </ul>
                </div>
                <div class="info-section">
                    <h4><i class="fas fa-chart-line"></i> Related Muscle Groups</h4>
                    <ul>
                        ${muscleGroups.filter(mg => mg.name !== muscleGroupName).map(mg => `
                            <li>
                                <strong>${mg.name}</strong>
                                <span class="exercise-stats">
                                    Base: ${mg.baseWeight} ${getYAxisLabel(bodyPart).split(' ')[1] || 'lbs'} | 
                                    Improvement: ${(mg.improvementRate * 100).toFixed(1)}%/month
                                </span>
                            </li>
                        `).join('')}
                    </ul>
                </div>
            </div>
        </div>
    `;
    
    // Insert after the chart
    const chartContainer = document.getElementById('strength-chart').parentElement;
    chartContainer.appendChild(detailsPanel);
    
    // Add animation
    setTimeout(() => {
        detailsPanel.classList.add('active');
    }, 10);
}

// Get muscle group description
function getMuscleGroupDescription(muscleGroupName) {
    const descriptions = {
        'Upper Chest': 'The upper chest (clavicular head of pectoralis major) is crucial for incline movements and overall chest development. It\'s often the most challenging area to develop.',
        'Middle Chest': 'The middle chest (sternal head of pectoralis major) is the largest portion of the chest and responds well to compound movements like bench press.',
        'Lower Chest': 'The lower chest is developed through decline movements and helps create a complete, well-rounded chest appearance.',
        'Lats': 'The latissimus dorsi are the largest back muscles, responsible for pulling movements and creating the V-taper physique.',
        'Rhomboids': 'The rhomboids are deep back muscles that retract the shoulder blades and are crucial for posture and pulling strength.',
        'Trapezius': 'The trapezius muscles support shoulder movement and neck stability, with upper, middle, and lower portions.',
        'Anterior Deltoids': 'The front deltoids are primarily used in pushing movements and overhead pressing exercises.',
        'Lateral Deltoids': 'The side deltoids create shoulder width and are targeted through lateral raise variations.',
        'Posterior Deltoids': 'The rear deltoids are crucial for posture and shoulder health, often neglected in training.',
        'Biceps': 'The biceps brachii are responsible for elbow flexion and forearm supination, key for pulling movements.',
        'Triceps': 'The triceps brachii are the primary elbow extensors and assist in all pushing movements.',
        'Brachialis': 'The brachialis is a deep muscle that contributes to elbow flexion and overall arm development.',
        'Forearm Flexors': 'The forearm flexors control wrist flexion and grip strength.',
        'Forearm Extensors': 'The forearm extensors control wrist extension and are important for balance.',
        'Grip Strength': 'Overall grip strength involves multiple forearm muscles and is crucial for compound movements.',
        'Quadriceps': 'The quadriceps are the primary knee extensors and the largest muscle group in the body.',
        'Hamstrings': 'The hamstrings are responsible for knee flexion and hip extension, crucial for lower body strength.',
        'Glutes': 'The gluteal muscles are the largest muscle group and essential for hip movement and power.',
        'Gastrocnemius': 'The gastrocnemius is the larger calf muscle, responsible for plantar flexion and ankle stability.',
        'Soleus': 'The soleus is a deep calf muscle that works with the gastrocnemius for ankle movement.',
        'Tibialis Anterior': 'The tibialis anterior is responsible for dorsiflexion and shin development.',
        'Rectus Abdominis': 'The rectus abdominis is the "six-pack" muscle, responsible for trunk flexion.',
        'Obliques': 'The obliques are responsible for trunk rotation and lateral flexion.',
        'Transverse Abdominis': 'The transverse abdominis is a deep core muscle that provides stability and support.',
        'Aerobic Capacity': 'Aerobic capacity measures your body\'s ability to use oxygen during sustained exercise.',
        'Anaerobic Threshold': 'Anaerobic threshold is the point where your body switches from aerobic to anaerobic energy systems.',
        'Recovery Rate': 'Recovery rate measures how quickly your body recovers between exercise sessions.',
        'Neck Flexors': 'The neck flexors control forward head movement and are important for posture.',
        'Neck Extensors': 'The neck extensors control backward head movement and neck stability.',
        'Neck Rotators': 'The neck rotators control head rotation and are important for neck mobility.'
    };
    
    return descriptions[muscleGroupName] || 'This muscle group is important for overall strength and function.';
}

// Get muscle group training tips
function getMuscleGroupTips(muscleGroupName) {
    const tips = {
        'Upper Chest': [
            'Focus on incline movements (15-30 degrees)',
            'Include incline dumbbell press and incline flyes',
            'Use a slightly wider grip for better activation',
            'Don\'t neglect this area - it\'s often underdeveloped'
        ],
        'Middle Chest': [
            'Prioritize compound movements like bench press',
            'Include both barbell and dumbbell variations',
            'Focus on proper form and full range of motion',
            'Allow adequate recovery between chest workouts'
        ],
        'Lower Chest': [
            'Include decline movements in your routine',
            'Use decline bench press and decline push-ups',
            'Focus on the mind-muscle connection',
            'Don\'t overdo decline work to avoid shoulder strain'
        ],
        'Lats': [
            'Focus on compound pulling movements',
            'Include both vertical and horizontal pulls',
            'Use a full range of motion in all exercises',
            'Focus on pulling with your elbows, not your arms'
        ],
        'Rhomboids': [
            'Include rowing movements in your routine',
            'Focus on retracting your shoulder blades',
            'Use lighter weights with perfect form',
            'Don\'t neglect this muscle for posture'
        ],
        'Trapezius': [
            'Include shrugs and upright rows',
            'Focus on the mind-muscle connection',
            'Don\'t overdo trap work to avoid neck strain',
            'Balance upper, middle, and lower trap development'
        ],
        'Anterior Deltoids': [
            'Include overhead press variations',
            'Focus on proper shoulder positioning',
            'Don\'t overdo front delt work',
            'Balance with rear delt training'
        ],
        'Lateral Deltoids': [
            'Include lateral raise variations',
            'Use lighter weights with perfect form',
            'Focus on the mind-muscle connection',
            'Don\'t swing the weights - control the movement'
        ],
        'Posterior Deltoids': [
            'Include rear delt flyes and face pulls',
            'Focus on retracting your shoulder blades',
            'Use lighter weights with perfect form',
            'Don\'t neglect this muscle for shoulder health'
        ],
        'Biceps': [
            'Include both compound and isolation movements',
            'Focus on proper form over heavy weights',
            'Use a full range of motion',
            'Don\'t overdo bicep training'
        ],
        'Triceps': [
            'Include both compound and isolation movements',
            'Focus on proper form and full extension',
            'Include both pressing and extension movements',
            'Don\'t neglect this muscle for pushing strength'
        ],
        'Brachialis': [
            'Include hammer curl variations',
            'Focus on the mind-muscle connection',
            'Use moderate weights with perfect form',
            'This muscle contributes to overall arm development'
        ],
        'Forearm Flexors': [
            'Include wrist curl variations',
            'Use lighter weights with higher reps',
            'Focus on the mind-muscle connection',
            'Don\'t overdo forearm training'
        ],
        'Forearm Extensors': [
            'Include reverse wrist curl variations',
            'Use lighter weights with higher reps',
            'Focus on proper form',
            'Balance with flexor training'
        ],
        'Grip Strength': [
            'Include farmer\'s walks and dead hangs',
            'Use thick bars and grip trainers',
            'Focus on functional strength',
            'Don\'t neglect this for compound movements'
        ],
        'Quadriceps': [
            'Focus on compound movements like squats',
            'Include both high and low rep ranges',
            'Focus on proper form and depth',
            'Allow adequate recovery due to muscle size'
        ],
        'Hamstrings': [
            'Include both knee flexion and hip extension',
            'Focus on deadlift variations',
            'Include both high and low rep ranges',
            'Don\'t neglect this muscle for knee health'
        ],
        'Glutes': [
            'Include hip thrust and bridge variations',
            'Focus on mind-muscle connection',
            'Include both strength and endurance work',
            'Don\'t neglect this muscle for power'
        ],
        'Gastrocnemius': [
            'Include standing calf raise variations',
            'Use higher rep ranges (15-20+)',
            'Focus on full range of motion',
            'Don\'t bounce at the bottom'
        ],
        'Soleus': [
            'Include seated calf raise variations',
            'Use higher rep ranges (15-20+)',
            'Focus on the mind-muscle connection',
            'This muscle works with the gastrocnemius'
        ],
        'Tibialis Anterior': [
            'Include dorsiflexion exercises',
            'Use lighter weights with higher reps',
            'Focus on proper form',
            'Don\'t neglect this for ankle health'
        ],
        'Rectus Abdominis': [
            'Include both crunches and leg raises',
            'Focus on proper form over reps',
            'Don\'t just do crunches',
            'Include anti-extension work'
        ],
        'Obliques': [
            'Include rotational movements',
            'Focus on both internal and external rotation',
            'Use moderate weights with perfect form',
            'Don\'t overdo oblique work'
        ],
        'Transverse Abdominis': [
            'Include plank variations',
            'Focus on breathing and bracing',
            'Include anti-rotation work',
            'This muscle provides core stability'
        ],
        'Aerobic Capacity': [
            'Include steady-state cardio',
            'Aim for 150 minutes per week',
            'Gradually increase duration',
            'Listen to your body'
        ],
        'Anaerobic Threshold': [
            'Include interval training',
            'Work at 80-90% of max heart rate',
            'Allow adequate recovery',
            'Don\'t overdo high-intensity work'
        ],
        'Recovery Rate': [
            'Focus on sleep and nutrition',
            'Include active recovery days',
            'Listen to your body',
            'Don\'t train through fatigue'
        ],
        'Neck Flexors': [
            'Start with light weights',
            'Focus on proper form',
            'Don\'t overdo neck training',
            'Include all directions of movement'
        ],
        'Neck Extensors': [
            'Start with light weights',
            'Focus on proper form',
            'Don\'t overdo neck training',
            'Include all directions of movement'
        ],
        'Neck Rotators': [
            'Start with light weights',
            'Focus on proper form',
            'Don\'t overdo neck training',
            'Include all directions of movement'
        ]
    };
    
    return tips[muscleGroupName] || [
        'Focus on proper form in all exercises',
        'Include both compound and isolation movements',
        'Allow adequate recovery between workouts',
        'Listen to your body and adjust intensity as needed'
    ];
}

// Show detailed information for a specific body part
function showBodyPartDetails(bodyPart) {
    // Remove existing details panel
    hideBodyPartDetails();
    
    // Create details panel
    const detailsPanel = document.createElement('div');
    detailsPanel.id = 'body-part-details';
    detailsPanel.className = 'body-part-details';
    
    const bodyPartData = getBodyPartSampleData(bodyPart);
    const bodyPartInfo = getBodyPartInfo(bodyPart);
    
    detailsPanel.innerHTML = `
        <div class="details-header">
            <h3>${bodyPartInfo.name} Details</h3>
            <button class="close-details" onclick="hideBodyPartDetails()">
                <i class="fas fa-times"></i>
            </button>
        </div>
        <div class="details-content">
            <div class="body-part-info">
                <div class="info-section">
                    <h4><i class="fas fa-info-circle"></i> Overview</h4>
                    <p>${bodyPartInfo.description}</p>
                </div>
                <div class="info-section">
                    <h4><i class="fas fa-dumbbell"></i> Muscle Groups</h4>
                    <ul>
                        ${getMuscleGroupsForBodyPart(bodyPart).map(muscleGroup => `
                            <li>
                                <strong>${muscleGroup.name}</strong>
                                <span class="exercise-stats">
                                    Base: ${muscleGroup.baseWeight} ${getYAxisLabel(bodyPart).split(' ')[1] || 'lbs'} | 
                                    Improvement: ${(muscleGroup.improvementRate * 100).toFixed(1)}%/month
                                </span>
                            </li>
                        `).join('')}
                    </ul>
                </div>
                <div class="info-section">
                    <h4><i class="fas fa-chart-line"></i> Progress Summary</h4>
                    <div class="progress-summary">
                        ${getMuscleGroupsForBodyPart(bodyPart).map(muscleGroup => `
                            <div class="progress-item">
                                <span class="progress-label">${muscleGroup.name}:</span>
                                <span class="progress-value">${muscleGroup.baseWeight} → ${Math.round(muscleGroup.baseWeight * (1 + (5 * muscleGroup.improvementRate)))} ${getYAxisLabel(bodyPart).split(' ')[1] || 'lbs'}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
                <div class="info-section">
                    <h4><i class="fas fa-lightbulb"></i> Training Tips</h4>
                    <ul>
                        ${bodyPartInfo.tips.map(tip => `<li>${tip}</li>`).join('')}
                    </ul>
                </div>
            </div>
        </div>
    `;
    
    // Insert after the chart
    const chartContainer = document.getElementById('strength-chart').parentElement;
    chartContainer.appendChild(detailsPanel);
    
    // Add animation
    setTimeout(() => {
        detailsPanel.classList.add('active');
    }, 10);
}

// Hide body part details panel
function hideBodyPartDetails() {
    const existingPanel = document.getElementById('body-part-details');
    if (existingPanel) {
        existingPanel.classList.remove('active');
        setTimeout(() => {
            if (existingPanel.parentNode) {
                existingPanel.parentNode.removeChild(existingPanel);
            }
        }, 300);
    }
}

// Get detailed information for each body part
function getBodyPartInfo(bodyPart) {
    const bodyPartInfo = {
        'chest': {
            name: 'Chest',
            description: 'The chest muscles (pectoralis major and minor) are crucial for pushing movements and upper body strength. They consist of upper, middle, and lower chest regions.',
            tips: [
                'Focus on compound movements like bench press and push-ups',
                'Include both flat and incline variations for complete development',
                'Maintain proper form to avoid shoulder strain',
                'Aim for 2-3 chest workouts per week with adequate rest'
            ]
        },
        'back': {
            name: 'Back',
            description: 'The back muscles include the latissimus dorsi, rhomboids, and trapezius. They are essential for pulling movements, posture, and overall upper body strength.',
            tips: [
                'Prioritize compound movements like deadlifts and rows',
                'Include both vertical and horizontal pulling movements',
                'Focus on mind-muscle connection during exercises',
                'Balance pushing and pulling movements in your routine'
            ]
        },
        'shoulders': {
            name: 'Shoulders',
            description: 'The deltoid muscles consist of anterior, lateral, and posterior heads. They are crucial for overhead movements and shoulder stability.',
            tips: [
                'Train all three deltoid heads for balanced development',
                'Include overhead press variations for strength',
                'Add lateral raises for shoulder width',
                'Don\'t neglect rear delt work for posture'
            ]
        },
        'upper arms': {
            name: 'Upper Arms',
            description: 'The biceps and triceps are the primary muscles of the upper arms. Biceps handle pulling movements while triceps assist in pushing.',
            tips: [
                'Train biceps and triceps with equal attention',
                'Include both compound and isolation movements',
                'Focus on proper form over heavy weights',
                'Allow adequate recovery between arm workouts'
            ]
        },
        'lower arms': {
            name: 'Lower Arms',
            description: 'The forearms contain multiple muscle groups responsible for grip strength, wrist movement, and hand control.',
            tips: [
                'Include grip training in your routine',
                'Add wrist curls and reverse wrist curls',
                'Use farmer\'s walks for functional strength',
                'Don\'t overdo forearm training to avoid overuse'
            ]
        },
        'upper legs': {
            name: 'Upper Legs',
            description: 'The quadriceps, hamstrings, and glutes make up the upper legs. They are the largest muscle group and crucial for overall strength.',
            tips: [
                'Focus on compound movements like squats and deadlifts',
                'Include both quad and hamstring focused exercises',
                'Don\'t neglect glute training for overall strength',
                'Allow adequate recovery due to muscle group size'
            ]
        },
        'lower legs': {
            name: 'Lower Legs',
            description: 'The calves (gastrocnemius and soleus) are responsible for ankle movement and lower leg stability.',
            tips: [
                'Train calves with both seated and standing variations',
                'Include higher rep ranges for calf development',
                'Don\'t skip calf training despite being "small" muscles',
                'Focus on full range of motion in calf exercises'
            ]
        },
        'waist': {
            name: 'Core/Waist',
            description: 'The core muscles include the rectus abdominis, obliques, and transverse abdominis. They provide stability and support for all movements.',
            tips: [
                'Focus on stability exercises like planks',
                'Include rotational movements for oblique development',
                'Don\'t just do crunches - include anti-rotation work',
                'Train core 2-3 times per week for best results'
            ]
        },
        'cardio': {
            name: 'Cardiovascular',
            description: 'Cardiovascular fitness improves heart health, endurance, and overall fitness levels.',
            tips: [
                'Include both steady-state and interval training',
                'Aim for 150 minutes of moderate cardio per week',
                'Vary your cardio activities to prevent boredom',
                'Listen to your body and don\'t overdo cardio'
            ]
        },
        'neck': {
            name: 'Neck',
            description: 'The neck muscles provide support for the head and are important for posture and injury prevention.',
            tips: [
                'Start with light weights and focus on form',
                'Include all directions of movement',
                'Don\'t overdo neck training to avoid strain',
                'Consider neck training for injury prevention'
            ]
        }
    };
    
    return bodyPartInfo[bodyPart.toLowerCase()] || {
        name: bodyPart.charAt(0).toUpperCase() + bodyPart.slice(1),
        description: 'This body part is important for overall fitness and strength development.',
        tips: [
            'Focus on proper form in all exercises',
            'Include both compound and isolation movements',
            'Allow adequate recovery between workouts',
            'Listen to your body and adjust intensity as needed'
        ]
    };
}

// Generate detailed progress data for each muscle group within a body part
function generateAverageProgressData(bodyPart) {
    const labels = [];
    const datasets = [];
    
    // Generate dates for the last 6 months
    const today = new Date();
    for (let i = 5; i >= 0; i--) {
        const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
        labels.push(date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }));
    }

    // Get muscle groups for the selected body part
    const muscleGroups = getMuscleGroupsForBodyPart(bodyPart);
    
    // Create datasets for each muscle group
    muscleGroups.forEach((muscleGroup, index) => {
        const muscleData = generateMuscleGroupProgress(muscleGroup, labels);
        
        datasets.push({
            label: muscleGroup.name,
            data: muscleData,
            borderColor: getChartColor(index),
            backgroundColor: getChartColor(index, 0.1),
            borderWidth: 2,
            fill: false,
            tension: 0.4
        });
    });

    return { labels, datasets };
}

// Get muscle groups for each body part
function getMuscleGroupsForBodyPart(bodyPart) {
    const muscleGroups = {
        'chest': [
            { name: 'Upper Chest', baseWeight: 45, improvementRate: 0.10 },
            { name: 'Middle Chest', baseWeight: 135, improvementRate: 0.12 },
            { name: 'Lower Chest', baseWeight: 85, improvementRate: 0.11 }
        ],
        'back': [
            { name: 'Lats', baseWeight: 185, improvementRate: 0.15 },
            { name: 'Rhomboids', baseWeight: 95, improvementRate: 0.11 },
            { name: 'Trapezius', baseWeight: 125, improvementRate: 0.13 }
        ],
        'shoulders': [
            { name: 'Anterior Deltoids', baseWeight: 85, improvementRate: 0.10 },
            { name: 'Lateral Deltoids', baseWeight: 15, improvementRate: 0.08 },
            { name: 'Posterior Deltoids', baseWeight: 12, improvementRate: 0.07 }
        ],
        'upper arms': [
            { name: 'Biceps', baseWeight: 45, improvementRate: 0.09 },
            { name: 'Triceps', baseWeight: 65, improvementRate: 0.10 },
            { name: 'Brachialis', baseWeight: 35, improvementRate: 0.08 }
        ],
        'lower arms': [
            { name: 'Forearm Flexors', baseWeight: 30, improvementRate: 0.06 },
            { name: 'Forearm Extensors', baseWeight: 25, improvementRate: 0.06 },
            { name: 'Grip Strength', baseWeight: 40, improvementRate: 0.05 }
        ],
        'upper legs': [
            { name: 'Quadriceps', baseWeight: 155, improvementRate: 0.13 },
            { name: 'Hamstrings', baseWeight: 125, improvementRate: 0.12 },
            { name: 'Glutes', baseWeight: 145, improvementRate: 0.14 }
        ],
        'lower legs': [
            { name: 'Gastrocnemius', baseWeight: 135, improvementRate: 0.08 },
            { name: 'Soleus', baseWeight: 90, improvementRate: 0.07 },
            { name: 'Tibialis Anterior', baseWeight: 45, improvementRate: 0.06 }
        ],
        'waist': [
            { name: 'Rectus Abdominis', baseWeight: 60, improvementRate: 0.05 },
            { name: 'Obliques', baseWeight: 25, improvementRate: 0.08 },
            { name: 'Transverse Abdominis', baseWeight: 40, improvementRate: 0.06 }
        ],
        'cardio': [
            { name: 'Aerobic Capacity', baseWeight: 25, improvementRate: 0.10 },
            { name: 'Anaerobic Threshold', baseWeight: 45, improvementRate: 0.08 },
            { name: 'Recovery Rate', baseWeight: 20, improvementRate: 0.09 }
        ],
        'neck': [
            { name: 'Neck Flexors', baseWeight: 15, improvementRate: 0.06 },
            { name: 'Neck Extensors', baseWeight: 12, improvementRate: 0.06 },
            { name: 'Neck Rotators', baseWeight: 10, improvementRate: 0.05 }
        ]
    };

    return muscleGroups[bodyPart.toLowerCase()] || [
        { name: 'General Strength', baseWeight: 50, improvementRate: 0.10 },
        { name: 'Endurance', baseWeight: 35, improvementRate: 0.08 },
        { name: 'Stability', baseWeight: 40, improvementRate: 0.07 }
    ];
}

// Generate progress data for a specific muscle group
function generateMuscleGroupProgress(muscleGroup, labels) {
    return labels.map((_, i) => {
        const progress = i * muscleGroup.improvementRate;
        const variation = (Math.random() - 0.5) * 0.1; // ±5% variation
        return Math.round(muscleGroup.baseWeight * (1 + progress + variation));
    });
}

// Generate sample progress data for exercises (kept for reference)
function generateSampleProgressData(exercises, bodyPart) {
    const labels = [];
    const datasets = [];
    
    // Generate dates for the last 6 months
    const today = new Date();
    for (let i = 5; i >= 0; i--) {
        const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
        labels.push(date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }));
    }

    // Get body part specific sample data
    const bodyPartData = getBodyPartSampleData(bodyPart);
    
    // Create datasets for each exercise
    exercises.slice(0, 3).forEach((exercise, index) => {
        const exerciseData = bodyPartData.exercises[index] || bodyPartData.exercises[0];
        const baseWeight = exerciseData.baseWeight;
        const improvementRate = exerciseData.improvementRate;
        
        const data = labels.map((_, i) => {
            // Simulate progressive overload with realistic variations
            const progress = i * improvementRate;
            const variation = (Math.random() - 0.5) * 0.1; // ±5% variation
            return Math.round(baseWeight * (1 + progress + variation));
        });

        datasets.push({
            label: exercise.name || exercise.exercise_name || exerciseData.name,
            data: data,
            borderColor: getChartColor(index),
            backgroundColor: getChartColor(index, 0.1),
            borderWidth: 2,
            fill: false,
            tension: 0.4
        });
    });

    return { labels, datasets };
}

// Get realistic sample data for each body part
function getBodyPartSampleData(bodyPart) {
    const sampleData = {
        'chest': {
            exercises: [
                { name: 'Bench Press', baseWeight: 135, improvementRate: 0.12 },
                { name: 'Incline Dumbbell Press', baseWeight: 45, improvementRate: 0.10 },
                { name: 'Push-Ups', baseWeight: 15, improvementRate: 0.08 }
            ]
        },
        'back': {
            exercises: [
                { name: 'Deadlift', baseWeight: 185, improvementRate: 0.15 },
                { name: 'Barbell Rows', baseWeight: 95, improvementRate: 0.11 },
                { name: 'Pull-Ups', baseWeight: 8, improvementRate: 0.09 }
            ]
        },
        'shoulders': {
            exercises: [
                { name: 'Overhead Press', baseWeight: 85, improvementRate: 0.10 },
                { name: 'Lateral Raises', baseWeight: 15, improvementRate: 0.08 },
                { name: 'Rear Delt Flyes', baseWeight: 12, improvementRate: 0.07 }
            ]
        },
        'upper arms': {
            exercises: [
                { name: 'Barbell Curls', baseWeight: 45, improvementRate: 0.09 },
                { name: 'Tricep Dips', baseWeight: 20, improvementRate: 0.08 },
                { name: 'Hammer Curls', baseWeight: 25, improvementRate: 0.07 }
            ]
        },
        'lower arms': {
            exercises: [
                { name: 'Wrist Curls', baseWeight: 30, improvementRate: 0.06 },
                { name: 'Reverse Wrist Curls', baseWeight: 25, improvementRate: 0.06 },
                { name: 'Farmer\'s Walks', baseWeight: 40, improvementRate: 0.05 }
            ]
        },
        'upper legs': {
            exercises: [
                { name: 'Squats', baseWeight: 155, improvementRate: 0.13 },
                { name: 'Leg Press', baseWeight: 225, improvementRate: 0.12 },
                { name: 'Lunges', baseWeight: 65, improvementRate: 0.10 }
            ]
        },
        'lower legs': {
            exercises: [
                { name: 'Calf Raises', baseWeight: 135, improvementRate: 0.08 },
                { name: 'Seated Calf Raises', baseWeight: 90, improvementRate: 0.07 },
                { name: 'Standing Calf Raises', baseWeight: 185, improvementRate: 0.06 }
            ]
        },
        'waist': {
            exercises: [
                { name: 'Planks', baseWeight: 60, improvementRate: 0.05 }, // Duration in seconds
                { name: 'Russian Twists', baseWeight: 25, improvementRate: 0.08 },
                { name: 'Leg Raises', baseWeight: 15, improvementRate: 0.07 }
            ]
        },
        'cardio': {
            exercises: [
                { name: 'Running (5K)', baseWeight: 25, improvementRate: 0.10 }, // Minutes
                { name: 'Cycling', baseWeight: 45, improvementRate: 0.08 }, // Minutes
                { name: 'Rowing', baseWeight: 20, improvementRate: 0.09 } // Minutes
            ]
        },
        'neck': {
            exercises: [
                { name: 'Neck Flexion', baseWeight: 15, improvementRate: 0.06 },
                { name: 'Neck Extension', baseWeight: 12, improvementRate: 0.06 },
                { name: 'Neck Rotation', baseWeight: 10, improvementRate: 0.05 }
            ]
        }
    };

    // Return default data if body part not found
    return sampleData[bodyPart.toLowerCase()] || {
        exercises: [
            { name: 'General Exercise', baseWeight: 50, improvementRate: 0.10 },
            { name: 'Strength Training', baseWeight: 75, improvementRate: 0.09 },
            { name: 'Functional Movement', baseWeight: 35, improvementRate: 0.08 }
        ]
    };
}

// Get appropriate Y-axis label based on body part
function getYAxisLabel(bodyPart) {
    const bodyPartLower = bodyPart.toLowerCase();
    
    if (bodyPartLower === 'waist') {
        return 'Duration (seconds)';
    } else if (bodyPartLower === 'cardio') {
        return 'Time (minutes)';
    } else if (bodyPartLower === 'neck') {
        return 'Weight (lbs)';
    } else {
        return 'Weight (lbs)';
    }
}

// Get chart colors
function getChartColor(index, alpha = 1) {
    const colors = [
        `rgba(59, 130, 246, ${alpha})`,   // Blue
        `rgba(16, 185, 129, ${alpha})`,   // Green
        `rgba(245, 101, 101, ${alpha})`,  // Red
        `rgba(251, 146, 60, ${alpha})`,   // Orange
        `rgba(139, 92, 246, ${alpha})`,   // Purple
        `rgba(236, 72, 153, ${alpha})`    // Pink
    ];
    return colors[index % colors.length];
}

// ===== UTILITY FUNCTIONS =====
function showLoadingOverlay(message = 'Loading...') {
    let overlay = document.getElementById('loading-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'loading-overlay';
        overlay.className = 'loading-overlay';
        document.body.appendChild(overlay);
    }
    
    overlay.innerHTML = `
        <div class="loading-content">
            <div class="loading-spinner"></div>
            <p class="loading-message">${message}</p>
        </div>
    `;
    
    overlay.style.display = 'flex';
    disableUI();
}

function hideLoadingOverlay() {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) {
        overlay.style.display = 'none';
    }
    enableUI();
}

function disableUI() {
    document.body.style.pointerEvents = 'none';
    document.body.style.opacity = '0.7';
}

function enableUI() {
    document.body.style.pointerEvents = 'auto';
    document.body.style.opacity = '1';
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${getNotificationIcon(type)}"></i>
            <span>${message}</span>
        </div>
        <button class="notification-close" onclick="closeNotification(this)">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 5000);
}

function closeNotification(closeBtn) {
    const notification = closeBtn.closest('.notification');
    if (notification && notification.parentNode) {
        notification.parentNode.removeChild(notification);
    }
}

function getNotificationIcon(type) {
    const icons = {
        success: 'check-circle',
        error: 'exclamation-circle',
        warning: 'exclamation-triangle',
        info: 'info-circle'
    };
    return icons[type] || 'info-circle';
}

// ===== WORKOUT FUNCTIONS =====
function startWorkout() {
    if (!dataLoaded) {
        showNotification('Loading workout data... Please try again in a moment.', 'info');
        return;
    }
    
    showNotification('Starting your workout! 💪', 'success');
    // Implementation for starting workout
}

function openAddWorkoutModal(day = null) {
    if (!dataLoaded) {
        showNotification('Loading planner data... Please try again in a moment.', 'info');
        return;
    }
    
    // Implementation for add workout modal
    showNotification('Add workout modal - Coming soon!', 'info');
}

// ===== PLACEHOLDER UPDATE FUNCTIONS =====
function updateBodyVisualization() {
    // Placeholder - body visualization will be loaded from data
}

function updateRecommendations() {
    const recommendationsList = document.getElementById('recommendations-list');
    if (!recommendationsList) return;
    
    recommendationsList.innerHTML = `
        <div class="recommendation">
            <i class="fas fa-lightbulb text-primary"></i>
            <div>
                <strong>Increase leg training</strong>
                <p class="text-muted">Your upper body is progressing well, but legs need attention</p>
            </div>
        </div>
        <div class="recommendation">
            <i class="fas fa-bed text-primary"></i>
            <div>
                <strong>Optimize recovery</strong>
                <p class="text-muted">Consider adding 15min stretching after workouts</p>
            </div>
        </div>
    `;
}

function updateNextWorkout() {
    const nextWorkout = document.getElementById('next-workout');
    if (!nextWorkout) return;
    
    nextWorkout.innerHTML = `
        <div class="workout-preview">
            <h4>Upper Body HIIT</h4>
            <p class="text-muted">45 minutes • 12 exercises</p>
            <div class="workout-tags flex gap-sm">
                <span class="tag">Strength</span>
                <span class="tag">HIIT</span>
            </div>
        </div>
    `;
}

function updateNutritionCenter() {
    // Placeholder for nutrition center updates
    console.log('📊 Updating nutrition center...');
}

function updateCoachCenter() {
    // Placeholder for coach center updates
    console.log('👨‍🏫 Updating coach center...');
}

function updateWellnessCenter() {
    // Placeholder for wellness center updates
    console.log('💚 Updating wellness center...');
}

function updateProfileCenter() {
    // Placeholder for profile center updates
    console.log('👤 Updating profile center...');
}

function updateProgressPhotos() {
    // Placeholder for progress photos
    console.log('📸 Updating progress photos...');
}

// ===== TESTING FUNCTIONS =====
function testDataLoading() {
    console.group('🧪 Testing Data Loading');
    
    console.log('Data loaded status:', dataLoaded);
    console.log('User data:', userData);
    console.log('Workout data:', workoutData);
    console.log('Exercise list data:', exerciseListData);
    console.log('Nutrition data:', nutritionData);
    console.log('Wellness data:', wellnessData);
    console.log('Social data:', socialData);
    console.log('Coach data:', coachData);
    console.log('Progress data:', progressData);
    console.log('Planner data:', plannerData);
    
    // Test exercise list data specifically
    if (exerciseListData) {
        console.log('✅ Exercise list data loaded successfully');
        console.log('Exercise count:', exerciseListData.length);
    } else {
        console.log('❌ Exercise list data not loaded');
    }
    
    console.groupEnd();
}

// Global test function for navigation
window.testNavigation = function() {
    console.log('🧪 Testing navigation manually...');
    
    // Force enable UI
    enableUI();
    
    // Test if navigation items are clickable
    const navItems = document.querySelectorAll('.nav-item');
    console.log('Found nav items:', navItems.length);
    
    navItems.forEach((item, index) => {
        console.log(`Nav item ${index}:`, {
            tab: item.dataset.tab,
            classes: item.className,
            pointerEvents: window.getComputedStyle(item).pointerEvents,
            cursor: window.getComputedStyle(item).cursor
        });
        
        // Add a test click handler
        item.onclick = function(e) {
            console.log('🎯 Manual test click:', this.dataset.tab);
            alert(`Navigation test: ${this.dataset.tab} clicked!`);
        };
    });
    
    console.log('✅ Navigation test complete. Try clicking nav items now.');
};

// Global function to force enable UI
window.enableUI = function() {
    document.body.style.pointerEvents = 'auto';
    document.body.style.opacity = '1';
    console.log('🔓 UI manually enabled');
};

// Global test function for ExerciseDB API
window.testExerciseDB = async function() {
    console.log('🧪 Testing ExerciseDB API...');
    
    if (!exerciseDBService) {
        console.error('❌ ExerciseDB service not initialized');
        return;
    }
    
    try {
                    console.log('🏠 Local API Status: Active');
        console.log('🌐 Base URL:', exerciseDBService.baseUrl);
        
        // Test getting body parts
        console.log('📋 Testing getBodyParts()...');
        const bodyParts = await exerciseDBService.getBodyParts();
        console.log('✅ Body parts:', bodyParts);
        
        // Test getting exercises for chest
        console.log('💪 Testing getExercisesByBodyPart("chest", 5)...');
        const chestExercises = await exerciseDBService.getExercisesByBodyPart('chest', 5);
        console.log('✅ Chest exercises:', chestExercises);
        
        if (chestExercises.length > 0) {
            console.log('📊 First exercise:', chestExercises[0]);
        }
        
    } catch (error) {
        console.error('❌ ExerciseDB API test failed:', error);
        
        // Check if it's a CORS error
        if (error.message.includes('CORS') || error.message.includes('cross-origin')) {
            console.error('🚫 CORS Error detected! This is likely the issue.');
            console.log('💡 Solution: Use a CORS proxy or run the app from a local server');
        }
    }
};

// Test CORS directly
window.testCORS = async function() {
    console.log('🧪 Testing CORS directly...');
    
    try {
        const response = await fetch('https://exercisedb.p.rapidapi.com/status', {
            method: 'GET',
            headers: {
                'X-RapidAPI-Key': 'beadcc0c65msh2074d0c2da483efp150d3ajsn68493a6d17f5',
                'X-RapidAPI-Host': 'exercisedb.p.rapidapi.com'
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            console.log('✅ CORS test successful:', data);
        } else {
            console.error('❌ CORS test failed with status:', response.status);
        }
    } catch (error) {
        console.error('❌ CORS test failed:', error);
        console.log('🚫 This confirms CORS is blocking the API requests');
        console.log('💡 Solutions:');
        console.log('   1. Use a CORS proxy');
        console.log('   2. Run the app from a local server (http://localhost)');
        console.log('   3. Use a browser extension to disable CORS');
    }
};

// Test legs exercises specifically
window.testLegsExercises = async function() {
    console.log('🧪 Testing legs exercises specifically...');
    
    if (!exerciseDBService) {
        console.error('❌ ExerciseDB service not initialized');
        return;
    }
    
    try {
        // Test upper legs
        console.log('🦵 Testing upper legs...');
        const upperLegs = await exerciseDBService.getExercisesByBodyPart('upper legs', 5);
        console.log('✅ Upper legs exercises:', upperLegs.length);
        
        // Test lower legs
        console.log('🦵 Testing lower legs...');
        const lowerLegs = await exerciseDBService.getExercisesByBodyPart('lower legs', 5);
        console.log('✅ Lower legs exercises:', lowerLegs.length);
        
        // Show sample exercises
        if (upperLegs.length > 0) {
            console.log('📊 Sample upper leg exercise:', upperLegs[0]);
        }
        if (lowerLegs.length > 0) {
            console.log('📊 Sample lower leg exercise:', lowerLegs[0]);
        }
        
        console.log(`📊 Total legs exercises: ${upperLegs.length + lowerLegs.length}`);
        
    } catch (error) {
        console.error('❌ Legs exercises test failed:', error);
    }
};

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 FitAI Pro - Initializing...');
    
    try {
        // Initialize theme manager
        const themeManager = new ThemeManager();
        window.themeManager = themeManager; // Make available globally
        
        // Initialize navigation
        initializeNavigation();
        
        // Setup workout modals
        setupWorkoutModal();
        
        // Setup bottom sheet
        setupBottomSheet();
        
        // Load all application data
        await loadAllData();
        
        // Add CSS for loading overlay and notifications
        addDynamicStyles();
        
        console.log('✅ FitAI Pro - Initialization complete');
        
        // Test data loading
        testDataLoading();
        
    } catch (error) {
        console.error('❌ FitAI Pro - Initialization failed:', error);
        showNotification('Application failed to initialize. Please refresh the page.', 'error');
    }
});

// ===== DYNAMIC STYLES =====
function addDynamicStyles() {
    const style = document.createElement('style');
    style.textContent = `
        .loading-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: none;
            align-items: center;
            justify-content: center;
            z-index: 9999;
            backdrop-filter: blur(5px);
        }
        
        .loading-content {
            text-align: center;
            color: var(--foreground);
        }
        
        .loading-spinner {
            width: 40px;
            height: 40px;
            border: 4px solid var(--muted);
            border-top: 4px solid var(--primary);
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin: 0 auto 1rem;
        }
        
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        
        .loading-message {
            font-size: var(--font-size-lg);
            font-weight: var(--font-weight-medium);
        }
        
        .muscle-groups-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: var(--spacing-md);
            margin-top: var(--spacing-lg);
        }
        
        .muscle-group {
            padding: var(--spacing-lg);
            border-radius: var(--radius-lg);
            text-align: center;
            font-weight: var(--font-weight-medium);
            cursor: pointer;
            transition: all var(--animation-normal) ease;
        }
        
        .muscle-group:hover {
            transform: scale(1.05);
            box-shadow: var(--shadow-medium);
        }
        
        .muscle-group.trained {
            background: linear-gradient(135deg, var(--chart-2), #399d66);
            color: white;
        }
        
        .muscle-group.moderate {
            background: linear-gradient(135deg, var(--chart-3), #f39c12);
            color: white;
        }
        
        .muscle-group.neglected {
            background: linear-gradient(135deg, var(--destructive), #e74c3c);
            color: white;
        }
        
        .muscle-status {
            font-size: var(--font-size-sm);
            opacity: 0.9;
            margin-top: var(--spacing-xs);
        }
        
        .recommendation {
            display: flex;
            align-items: flex-start;
            gap: var(--spacing-md);
            padding: var(--spacing-lg);
            background: var(--muted);
            border-radius: var(--radius-lg);
            margin-bottom: var(--spacing-md);
            transition: all var(--animation-normal) ease;
        }
        
        .recommendation:hover {
            transform: translateX(5px);
            background: var(--accent);
        }
        
        .recommendation i {
            font-size: var(--font-size-lg);
            margin-top: var(--spacing-xs);
        }
        
        .workout-preview h4 {
            margin-bottom: var(--spacing-sm);
            color: var(--card-foreground);
        }
        
        .workout-tags {
            margin-top: var(--spacing-md);
        }
        
        .tag {
            background: var(--accent);
            color: var(--accent-foreground);
            padding: var(--spacing-xs) var(--spacing-md);
            border-radius: var(--radius-full);
            font-size: var(--font-size-sm);
            font-weight: var(--font-weight-medium);
        }
        
        .day-workouts {
            min-height: 200px;
        }
        
        .workout-card {
            background: var(--accent);
            border-radius: var(--radius-md);
            padding: var(--spacing-md);
            margin-bottom: var(--spacing-sm);
            border-left: 3px solid var(--primary);
        }
        
        .workout-time {
            font-size: var(--font-size-sm);
            color: var(--muted-foreground);
        }
        
        .workout-name {
            font-weight: var(--font-weight-semibold);
            color: var(--foreground);
            margin: var(--spacing-xs) 0;
        }
        
        .workout-duration {
            font-size: var(--font-size-sm);
            color: var(--primary);
        }
        
        .add-workout-slot {
            width: 100%;
            margin-top: var(--spacing-md);
        }
        
        .exercise-item {
            margin-bottom: var(--spacing-sm);
            cursor: pointer;
        }
        
        .exercise-item:hover {
            border-color: var(--primary);
        }
        
        .exercise-info h5 {
            margin-bottom: var(--spacing-xs);
            color: var(--card-foreground);
        }
        
        .routine-canvas {
            min-height: 300px;
            border: 2px dashed var(--border);
            border-radius: var(--radius-lg);
            padding: var(--spacing-lg);
            text-align: center;
        }
        
        .empty-routine {
            padding: var(--spacing-xxl);
        }
        
        .empty-routine i {
            font-size: var(--font-size-xxxl);
            margin-bottom: var(--spacing-md);
            opacity: 0.5;
        }
    `;
    
    document.head.appendChild(style);
}

// ===== GIF GALLERY FUNCTIONALITY =====
function initializeGifGallery() {
    setupGifUpload();
    setupGifRefresh();
    setupGifDownload();
}

function setupGifUpload() {
    const uploadArea = document.getElementById('upload-area');
    const fileInput = document.getElementById('gif-upload');
    const uploadPreview = document.getElementById('upload-preview');
    const previewImage = document.getElementById('preview-image');
    const saveGifBtn = document.getElementById('save-gif');
    const cancelUploadBtn = document.getElementById('cancel-upload');

    if (!uploadArea || !fileInput) return;

    // Click to upload
    uploadArea.addEventListener('click', () => {
        fileInput.click();
    });

    // File selection
    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file && file.type === 'image/gif') {
            previewGif(file);
        } else {
            showNotification('Please select a valid GIF file', 'error');
        }
    });

    // Drag and drop
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('drag-over');
    });

    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('drag-over');
    });

    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('drag-over');
        
        const file = e.dataTransfer.files[0];
        if (file && file.type === 'image/gif') {
            previewGif(file);
        } else {
            showNotification('Please drop a valid GIF file', 'error');
        }
    });

    function previewGif(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            previewImage.src = e.target.result;
            uploadArea.style.display = 'none';
            uploadPreview.style.display = 'block';
        };
        reader.readAsDataURL(file);
    }

    // Save GIF
    if (saveGifBtn) {
        saveGifBtn.addEventListener('click', () => {
            const gifData = {
                id: Date.now(),
                title: `Custom GIF ${Date.now()}`,
                src: previewImage.src,
                uploadedAt: new Date().toISOString()
            };
            
            saveGifToGallery(gifData);
            resetUploadForm();
            showNotification('GIF saved successfully!', 'success');
        });
    }

    // Cancel upload
    if (cancelUploadBtn) {
        cancelUploadBtn.addEventListener('click', resetUploadForm);
    }

    function resetUploadForm() {
        uploadArea.style.display = 'block';
        uploadPreview.style.display = 'none';
        previewImage.src = '';
        fileInput.value = '';
    }
}

function setupGifRefresh() {
    const refreshBtn = document.getElementById('refresh-gif');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', () => {
            refreshBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Refreshing...';
            setTimeout(() => {
                refreshBtn.innerHTML = '<i class="fas fa-sync-alt"></i> Refresh';
                showNotification('GIF gallery refreshed!', 'success');
            }, 1000);
        });
    }
}

function setupGifDownload() {
    // This function will be called when download buttons are clicked
    window.downloadGif = function(button) {
        const gifItem = button.closest('.gif-item');
        const gifImage = gifItem.querySelector('.gif-image');
        const gifTitle = gifItem.querySelector('.gif-title').textContent;
        
        // Create a temporary link to download the GIF
        const link = document.createElement('a');
        link.href = gifImage.src;
        link.download = `${gifTitle.replace(/\s+/g, '_')}.gif`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        showNotification('Download started!', 'success');
    };
}

function saveGifToGallery(gifData) {
    // Get existing GIFs from localStorage
    let savedGifs = JSON.parse(localStorage.getItem('fitai-gifs') || '[]');
    
    // Add new GIF
    savedGifs.push(gifData);
    
    // Save back to localStorage
    localStorage.setItem('fitai-gifs', JSON.stringify(savedGifs));
    
    // Optionally refresh the gallery display
    // This could be implemented to show user-uploaded GIFs
}

function loadUserGifs() {
    const savedGifs = JSON.parse(localStorage.getItem('fitai-gifs') || '[]');
    return savedGifs;
}

// Display total exercise count in the UI
function displayTotalExerciseCount(currentCount, totalCount) {
    // Find or create exercise count display
    let countDisplay = document.querySelector('.exercise-count-display');
    
    if (!countDisplay) {
        countDisplay = document.createElement('div');
        countDisplay.className = 'exercise-count-display';
        countDisplay.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--card-bg, #2a2a2a);
            color: var(--text, #fff);
            padding: 10px 15px;
            border-radius: 8px;
            font-size: 14px;
            z-index: 1000;
            border: 1px solid var(--border, #333);
            box-shadow: 0 2px 10px rgba(0,0,0,0.3);
        `;
        document.body.appendChild(countDisplay);
    }
    
    if (totalCount && totalCount > currentCount) {
        countDisplay.innerHTML = `
            <div style="display: flex; align-items: center; gap: 8px;">
                <i class="fas fa-dumbbell" style="color: var(--primary, #4693c6);"></i>
                <span>Showing ${currentCount} of ${totalCount} exercises</span>
                <button onclick="loadAllExercises()" style="
                    background: var(--primary, #4693c6);
                    color: white;
                    border: none;
                    padding: 4px 8px;
                    border-radius: 4px;
                    font-size: 12px;
                    cursor: pointer;
                ">Load All</button>
            </div>
        `;
    } else {
        countDisplay.innerHTML = `
            <div style="display: flex; align-items: center; gap: 8px;">
                <i class="fas fa-dumbbell" style="color: var(--primary, #4693c6);"></i>
                <span>${currentCount} exercises loaded</span>
            </div>
        `;
    }
}

// Load all exercises function
async function loadAllExercises() {
    const exerciseLibrary = document.getElementById('exercise-library');
    if (!exerciseLibrary) return;
    
    // Show loading state
    exerciseLibrary.innerHTML = `
        <div class="loading-state">
            <i class="fas fa-spinner fa-spin"></i>
            <p>Loading all exercises...</p>
        </div>
    `;
    
    try {
        // Use the filter API to get all exercises
        const params = new URLSearchParams({
            limit: '1000', // Large limit to get all exercises
            offset: '0',
            sortBy: 'name',
            sortOrder: 'asc'
        });

        const url = `http://localhost/api/v1/exercises/filter?${params.toString()}`;
        console.log('🔄 Loading all exercises from:', url);

        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`API request failed: ${response.status} ${response.statusText}`);
        }

        const result = await response.json();
        const exercises = result.data ? result.data : result;
        const totalExercises = result.metadata?.totalExercises || result.totalExercises || exercises.length;
        
        console.log(`✅ Loaded all ${exercises.length} exercises (Total available: ${totalExercises})`);
        
        // Transform exercises
        const transformed = exerciseDBService.transformExercises(exercises);
        
        // Group and render as tree
        const tree = groupExercisesTree(transformed);
        renderExerciseTree(tree, exerciseLibrary, totalExercises);
        
        // Update count display
        displayTotalExerciseCount(exercises.length, totalExercises);
        
        showNotification(`Loaded all ${exercises.length} exercises!`, 'success');
        
    } catch (error) {
        console.error('❌ Error loading all exercises:', error);
        showNotification('Failed to load all exercises', 'error');
        
        // Reset to previous state
        updateExerciseLibrary('gym');
    }
}

// ===== GLOBAL EXPORTS =====
window.FitAI = {
    loadAllData,
    testDataLoading,
    showNotification,
    updateDashboard,
    selectMode,
    startWorkout,
    openAddWorkoutModal
}; 