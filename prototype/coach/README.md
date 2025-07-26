# FitAI Pro - Coach Module

## Overview
This is the independent coach module for FitAI Pro, designed for personal trainers and fitness coaches to manage their clients, assign routines, and track progress.

## Features

### 🔐 Authentication
- **Coach Login**: Dedicated login system for coaches
- **Client Login**: Option to switch to client view
- **Role Detection**: Automatic detection of user role
- **Demo Credentials**: Pre-configured test accounts

### 👥 Client Management
- **Client List**: View all assigned clients
- **Client Dashboard**: Access client's full dashboard (same as main app)
- **Client Requests**: Manage incoming client requests
- **Client Actions**: Assign routines, send messages, track progress

### 📊 Dashboard
- **Coach Overview**: Stats, client count, ratings
- **Recent Activity**: Real-time client workout logs
- **Messages**: Client communication
- **All Original Tabs**: Full access to all main app features

### 🔄 Data Integration
- **Shared Data**: Connects to existing JSON files
- **Independent Structure**: No conflicts with main app
- **Real-time Updates**: Live activity tracking

## File Structure

```
coach/
├── index.html              # Redirect to dashboard
├── coach-dashboard.html    # Main coach interface
├── coach-dashboard.css     # Coach-specific styles
├── coach-dashboard.js      # Coach functionality
└── README.md              # This file
```

## Demo Credentials

### Coach Account
- **Email**: sarah.johnson@fitcoach.com
- **Password**: password123
- **Role**: Senior Strength Training Coach

### Client Account
- **Email**: alex.johnson@email.com
- **Password**: password123
- **Role**: Regular Client

## Usage

1. **Access**: Navigate to `/coach/` or `/coach/coach-dashboard.html`
2. **Login**: Use demo credentials to access coach dashboard
3. **Client Management**: Use the "Clients" tab to manage clients
4. **Role Switching**: Use "Switch to Client" to access main app
5. **All Features**: Navigate through all tabs like the main app

## Data Files

The module connects to these data files in the parent `data/` directory:
- `coaches.json` - Coach profiles and levels
- `coach-requests.json` - Client-coach relationships
- `coach-messages.json` - Activity logs and messages
- All existing app data files (user-data.json, workout-data.json, etc.)

## Development

- **Independent**: No modifications to existing files
- **Modular**: Self-contained coach functionality
- **Extensible**: Easy to add new coach features
- **Connected**: Shares data with main application

## Browser Compatibility

- Modern browsers with ES6+ support
- Responsive design for mobile and desktop
- Requires internet connection for external resources (fonts, icons) 