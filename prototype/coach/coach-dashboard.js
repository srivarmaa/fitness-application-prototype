// Coach Dashboard JavaScript
// Independent coach module that connects with the main prototype

// ===== GLOBAL VARIABLES =====
let currentUser = null;
let currentRole = null; // 'coach' or 'client'
let coachesData = null;
let coachRequestsData = null;
let coachMessagesData = null;
let userData = null;
let workoutData = null;
let nutritionData = null;
let wellnessData = null;
let socialData = null;
let coachData = null;
let progressData = null;
let plannerData = null;

// ===== LOGIN SYSTEM =====
function setupLoginTabs() {
    const tabs = document.querySelectorAll('.login-tab');
    const forms = document.querySelectorAll('.login-form');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetTab = tab.dataset.tab;
            
            // Update active tab
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            // Show corresponding form
            forms.forEach(form => {
                form.classList.remove('active');
                if (form.id === `${targetTab}-form`) {
                    form.classList.add('active');
                }
            });
        });
    });
}

function loginAsCoach() {
    const email = document.getElementById('coach-email').value;
    const password = document.getElementById('coach-password').value;
    
    // Demo login - in real app, this would validate against backend
    if (email === 'sarah.johnson@fitcoach.com' && password === 'password123') {
        currentUser = {
            id: 'coach_001',
            name: 'Sarah Johnson',
            email: email,
            role: 'coach'
        };
        currentRole = 'coach';
        initializeCoachDashboard();
    } else {
        showNotification('Invalid coach credentials', 'error');
    }
}

function loginAsClient() {
    const email = document.getElementById('client-email').value;
    const password = document.getElementById('client-password').value;
    
    // Demo login - in real app, this would validate against backend
    if (email === 'alex.johnson@email.com' && password === 'password123') {
        // Redirect to main client app
        window.location.href = '../index.html';
    } else {
        showNotification('Invalid client credentials', 'error');
    }
}

function switchToClientView() {
    if (confirm('Switch to client view? You will be redirected to the main app.')) {
        window.location.href = '../index.html';
    }
}

// ===== INITIALIZATION =====
async function initializeCoachDashboard() {
    try {
        showLoadingOverlay('Loading coach dashboard...');
        
        // Load all data
        await loadAllData();
        
        // Hide login screen and show dashboard
        document.getElementById('login-screen').style.display = 'none';
        document.getElementById('app-container').style.display = 'grid';
        
        // Initialize dashboard
        updateCoachDashboard();
        initializeNavigation();
        
        hideLoadingOverlay();
        showNotification('Welcome back, Coach!', 'success');
        
    } catch (error) {
        console.error('Error initializing coach dashboard:', error);
        hideLoadingOverlay();
        showNotification('Failed to load coach dashboard', 'error');
    }
}

async function loadAllData() {
    try {
        const [
            coachesResponse,
            requestsResponse,
            messagesResponse,
            userResponse,
            workoutResponse,
            nutritionResponse,
            wellnessResponse,
            socialResponse,
            coachResponse,
            progressResponse,
            plannerResponse
        ] = await Promise.all([
            fetch('../data/coaches.json'),
            fetch('../data/coach-requests.json'),
            fetch('../data/coach-messages.json'),
            fetch('../data/user-data.json'),
            fetch('../data/workout-data.json'),
            fetch('../data/nutrition-data.json'),
            fetch('../data/wellness-data.json'),
            fetch('../data/social-data.json'),
            fetch('../data/coach-data.json'),
            fetch('../data/progress-data.json'),
            fetch('../data/planner-data.json')
        ]);

        coachesData = await coachesResponse.json();
        coachRequestsData = await requestsResponse.json();
        coachMessagesData = await messagesResponse.json();
        userData = await userResponse.json();
        workoutData = await workoutResponse.json();
        nutritionData = await nutritionResponse.json();
        wellnessData = await wellnessResponse.json();
        socialData = await socialResponse.json();
        coachData = await coachResponse.json();
        progressData = await progressResponse.json();
        plannerData = await plannerResponse.json();
        
        console.log('✅ All data loaded successfully');
        
    } catch (error) {
        console.error('❌ Error loading data:', error);
        throw error;
    }
}

// ===== DASHBOARD UPDATES =====
function updateCoachDashboard() {
    updateCoachStats();
    updateRecentActivity();
    updateRecentMessages();
    updateUserInfo();
}

function updateCoachStats() {
    const currentCoach = coachesData.coaches.find(c => c.id === currentUser.id);
    if (currentCoach) {
        document.getElementById('total-clients').textContent = currentCoach.clientCount;
        document.getElementById('total-sessions').textContent = '45'; // Demo data
        document.getElementById('avg-rating').textContent = currentCoach.rating;
    }
}

function updateRecentActivity() {
    const activityContainer = document.getElementById('recent-activity');
    const recentMessages = coachMessagesData.messages
        .filter(msg => msg.coachId === currentUser.id)
        .slice(0, 5);
    
    activityContainer.innerHTML = recentMessages.map(message => `
        <div class="activity-item">
            <div class="activity-icon">
                <i class="fas ${message.type === 'activity_log' ? 'fa-play' : 'fa-comment'}"></i>
            </div>
            <div class="activity-content">
                <div class="activity-text">${message.content}</div>
                <div class="activity-time">${formatTime(message.timestamp)}</div>
            </div>
        </div>
    `).join('');
}

function updateRecentMessages() {
    const messagesContainer = document.getElementById('recent-messages');
    const recentMessages = coachMessagesData.messages
        .filter(msg => msg.coachId === currentUser.id && msg.type === 'message')
        .slice(0, 3);
    
    messagesContainer.innerHTML = recentMessages.map(message => `
        <div class="message-item">
            <div class="message-avatar">C</div>
            <div class="message-content">
                <div class="message-header">
                    <span class="message-sender">Client</span>
                    <span class="message-time">${formatTime(message.timestamp)}</span>
                </div>
                <div class="message-text">${message.content}</div>
            </div>
        </div>
    `).join('');
}

function updateUserInfo() {
    const currentCoach = coachesData.coaches.find(c => c.id === currentUser.id);
    if (currentCoach) {
        document.getElementById('current-user-name').textContent = currentCoach.name;
        document.getElementById('header-user-name').textContent = currentCoach.name;
    }
}

// ===== NAVIGATION =====
function initializeNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Remove active class from all items
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');
            
            // Show corresponding tab content
            const tabName = item.dataset.tab;
            loadTabContent(tabName);
        });
    });
}

function loadTabContent(tabName) {
    // Hide all tab contents
    const tabContents = document.querySelectorAll('.tab-content');
    tabContents.forEach(content => content.classList.remove('active'));
    
    // Show selected tab content
    const selectedTab = document.getElementById(tabName);
    if (selectedTab) {
        selectedTab.classList.add('active');
        
        // Load specific content based on tab
        switch(tabName) {
            case 'clients':
                loadClientsTab();
                break;
            case 'planner':
                loadPlannerTab();
                break;
            case 'train':
                loadTrainTab();
                break;
            case 'progress':
                loadProgressTab();
                break;
            case 'nutrition':
                loadNutritionTab();
                break;
            case 'coach':
                loadCoachTab();
                break;
            case 'wellness':
                loadWellnessTab();
                break;
            case 'profile':
                loadProfileTab();
                break;
            case 'gif':
                loadGifTab();
                break;
        }
    }
}

// ===== CLIENTS TAB =====
function loadClientsTab() {
    loadClientList();
}

function loadClientList() {
    const clientsContainer = document.getElementById('clients-list');
    const currentCoach = coachesData.coaches.find(c => c.id === currentUser.id);
    
    if (!currentCoach) return;
    
    // Get clients for this coach from requests
    const coachClients = coachRequestsData.requests
        .filter(req => req.coachId === currentUser.id && req.status === 'accepted')
        .map(req => {
            // Get client data from user-data.json
            const clientData = userData.clients.find(client => client.id === req.clientId);
            return {
                id: req.clientId,
                name: clientData ? clientData.name : `Client ${req.clientId.split('_')[1]}`,
                status: 'Active',
                lastActivity: '2 hours ago',
                email: clientData ? clientData.email : '',
                goals: clientData ? clientData.goals : []
            };
        });
    
    clientsContainer.innerHTML = coachClients.map(client => `
        <div class="client-card" onclick="selectClient('${client.id}')">
            <div class="client-avatar">${client.name.charAt(0)}</div>
            <div class="client-info">
                <div class="client-name">${client.name}</div>
                <div class="client-status">${client.status}</div>
                <div class="client-activity">Last active: ${client.lastActivity}</div>
            </div>
        </div>
    `).join('');
}

function selectClient(clientId) {
    // Update active client card
    document.querySelectorAll('.client-card').forEach(card => {
        card.classList.remove('active');
    });
    event.currentTarget.classList.add('active');
    
    // Show client dashboard
    document.getElementById('selected-client-dashboard').style.display = 'block';
    
    // Get client data
    const clientData = userData.clients.find(client => client.id === clientId);
    const clientName = clientData ? clientData.name : `Client ${clientId.split('_')[1]}`;
    document.getElementById('selected-client-name').textContent = clientName;
    
    // Load client dashboard content
    loadClientDashboard(clientId);
}

function loadClientDashboard(clientId) {
    const dashboardContent = document.getElementById('client-dashboard-content');
    
    // In a real app, you'd load the client's actual data
    dashboardContent.innerHTML = `
        <div class="dashboard-grid">
            <div class="card">
                <div class="card-header">
                    <h4 class="card-title">Client Overview</h4>
                </div>
                <div class="card-content">
                    <p>This would show the client's dashboard with all their data (same as the main app).</p>
                    <p>The coach can view and edit workout routines, nutrition plans, etc.</p>
                </div>
            </div>
        </div>
    `;
}

// ===== UTILITY FUNCTIONS =====
function formatTime(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleString();
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas ${getNotificationIcon(type)}"></i>
            <span>${message}</span>
            <button class="notification-close" onclick="this.parentElement.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

function getNotificationIcon(type) {
    switch(type) {
        case 'success': return 'fa-check-circle';
        case 'error': return 'fa-exclamation-circle';
        case 'warning': return 'fa-exclamation-triangle';
        default: return 'fa-info-circle';
    }
}

function showLoadingOverlay(message = 'Loading...') {
    // Create loading overlay
    const overlay = document.createElement('div');
    overlay.id = 'loading-overlay';
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
    `;
    
    overlay.innerHTML = `
        <div style="text-align: center; color: white;">
            <i class="fas fa-spinner fa-spin" style="font-size: 2rem; margin-bottom: 1rem;"></i>
            <p>${message}</p>
        </div>
    `;
    
    document.body.appendChild(overlay);
}

function hideLoadingOverlay() {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) {
        overlay.remove();
    }
}

// ===== PLACEHOLDER FUNCTIONS FOR OTHER TABS =====
function loadPlannerTab() {
    const plannerContainer = document.getElementById('coach-planner');
    plannerContainer.innerHTML = '<p>Coach planner functionality will be implemented here.</p>';
}

function loadTrainTab() {
    const trainContainer = document.getElementById('coach-exercise-library');
    trainContainer.innerHTML = '<p>Exercise library for coaches will be implemented here.</p>';
}

function loadProgressTab() {
    const progressContainer = document.getElementById('client-progress-overview');
    progressContainer.innerHTML = '<p>Client progress overview will be implemented here.</p>';
}

function loadNutritionTab() {
    const nutritionContainer = document.getElementById('coach-nutrition');
    nutritionContainer.innerHTML = '<p>Nutrition management for coaches will be implemented here.</p>';
}

function loadCoachTab() {
    const coachContainer = document.getElementById('coach-profile');
    coachContainer.innerHTML = '<p>Coach profile management will be implemented here.</p>';
}

function loadWellnessTab() {
    const wellnessContainer = document.getElementById('coach-wellness');
    wellnessContainer.innerHTML = '<p>Client wellness tracking will be implemented here.</p>';
}

function loadProfileTab() {
    const profileContainer = document.getElementById('coach-profile-settings');
    profileContainer.innerHTML = '<p>Coach profile settings will be implemented here.</p>';
}

function loadGifTab() {
    const gifContainer = document.getElementById('coach-gif-gallery');
    gifContainer.innerHTML = '<p>Exercise GIF gallery for coaches will be implemented here.</p>';
}

// ===== PLACEHOLDER FUNCTIONS FOR CLIENT ACTIONS =====
function showClientRequests() {
    alert('Client requests functionality will be implemented here.');
}

function addNewClient() {
    alert('Add new client functionality will be implemented here.');
}

function assignRoutine() {
    alert('Assign routine functionality will be implemented here.');
}

function sendMessage() {
    alert('Send message functionality will be implemented here.');
}

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
    setupLoginTabs();
    console.log('Coach Dashboard loaded successfully');
}); 