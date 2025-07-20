# FitAI Pro - JSON Data Structure

## Overview

FitAI Pro now uses a modular JSON-based data structure where each module has its own dedicated data file. This architecture provides better maintainability, easier data updates, and cleaner separation of concerns.

## Data Files Structure

```
data/
├── user-data.json      # User profile, stats, achievements, goals
├── workout-data.json   # Training modes, exercises, templates, history
├── nutrition-data.json # Foods, meal plans, fasting, daily logs
├── wellness-data.json  # Mood, sleep, HRV, mindfulness, steps
├── social-data.json    # Community, challenges, friends, feed
├── coach-data.json     # Trainer info, collaboration, assessments
├── progress-data.json  # Charts, measurements, body visualization
└── planner-data.json   # Calendar, schedules, weekly plans
```

## File Descriptions

### 1. user-data.json
Contains user profile information, gamification stats, achievements, and personal goals.

**Key Sections:**
- `profile`: Personal information and preferences
- `stats`: Level, XP, streak, workout totals
- `achievements`: Unlocked achievements with metadata
- `badges`: Progress-based badges with targets
- `goals`: Personal fitness goals with tracking

### 2. workout-data.json
Comprehensive workout system data including training modes, exercise library, and workout history.

**Key Sections:**
- `trainingModes`: Available workout types (gym, calisthenics, HIIT, etc.)
- `exercises`: Complete exercise database with instructions
- `workoutTemplates`: Pre-built workout routines
- `workoutHistory`: Completed workout records

### 3. nutrition-data.json
Complete nutrition tracking system with foods, meal planning, and macro tracking.

**Key Sections:**
- `foods`: Food database with nutrition information
- `mealPlans`: Structured meal planning templates
- `fastingModes`: Intermittent fasting configurations
- `dailyLog`: Daily nutrition tracking data

### 4. wellness-data.json
Holistic wellness tracking including mood, sleep, recovery, and mindfulness.

**Key Sections:**
- `moodTracking`: Current mood and historical data
- `sleepData`: Sleep quality and duration tracking
- `hrvData`: Heart rate variability monitoring
- `mindfulnessActivities`: Meditation and breathing exercises
- `stepTracking`: Daily activity and step counting
- `wellnessScore`: Overall wellness calculation

### 5. social-data.json
Social features including community interactions, challenges, and friend connections.

**Key Sections:**
- `userFeed`: Social activity feed posts
- `challenges`: Active and upcoming fitness challenges
- `leaderboards`: Ranking and competitive data
- `groups`: Fitness communities and memberships
- `notifications`: Social interaction alerts
- `friends`: Friend connections and relationships

### 6. coach-data.json
Trainer-client ecosystem with collaboration tools and communication.

**Key Sections:**
- `trainer`: Coach profile and credentials
- `connection`: Relationship status and package info
- `sharedWorkspace`: Collaborative planning environment
- `workoutPlans`: Trainer-created workout schedules
- `dietSchedule`: Nutrition planning and supplements
- `goals`: Coach-set goals and milestones
- `messages`: Communication history
- `assessments`: Progress evaluations
- `payments`: Billing and package information

### 7. progress-data.json
Comprehensive progress tracking with charts, measurements, and analytics.

**Key Sections:**
- `workoutProgress`: Weekly and monthly workout statistics
- `strengthProgress`: Exercise-specific strength gains
- `bodyMeasurements`: Weight, body fat, muscle mass tracking
- `bodyVisualization`: 3D body mapping and muscle group data
- `cardioProgress`: Running, cycling, and endurance metrics
- `progressPhotos`: Visual progress documentation
- `goals`: Progress-based goal tracking
- `analytics`: Trend analysis and predictions

### 8. planner-data.json
Smart planning system with scheduling, recommendations, and habit tracking.

**Key Sections:**
- `currentWeek`: Current week information and title
- `scheduledWorkouts`: Daily workout schedule
- `workoutTemplates`: Available workout templates
- `weeklyGoals`: Week-specific targets and progress
- `recommendations`: AI-generated planning suggestions
- `habits`: Habit tracking and streaks
- `upcomingWeeks`: Future planning preview

## Data Loading Architecture

### Asynchronous Loading
All data files are loaded asynchronously using the Fetch API:

```javascript
async loadAllData() {
    const results = await Promise.all([
        this.loadUserData(),
        this.loadWorkoutData(),
        // ... other data files
    ]);
}
```

### Error Handling
Robust error handling ensures graceful degradation if data files are unavailable:

```javascript
async loadJSON(filename) {
    try {
        const response = await fetch(`data/${filename}`);
        if (!response.ok) {
            throw new Error(`Failed to load ${filename}`);
        }
        return await response.json();
    } catch (error) {
        console.error(`Error loading ${filename}:`, error);
        throw error;
    }
}
```

### Data Validation
The application checks for data availability before rendering components:

```javascript
updateDashboard() {
    if (!this.dataLoaded) return;
    // Safe to use data...
}
```

## Benefits of JSON Structure

### 1. **Modularity**
- Each feature module has dedicated data
- Independent data management
- Easier testing and debugging

### 2. **Maintainability**
- Clear data organization
- Easy to update specific modules
- Version control friendly

### 3. **Scalability**
- Add new modules without affecting existing ones
- Easy data structure evolution
- Performance optimization through selective loading

### 4. **Flexibility**
- Easy data customization
- Multiple environment support
- API integration ready

## Usage Examples

### Testing Data Loading
```javascript
// In browser console
fitAI.testDataLoading()
```

### Accessing Module Data
```javascript
// User stats
const userLevel = fitAI.userData.stats.level;
const userXP = fitAI.userData.stats.xp;

// Workout data
const trainingModes = fitAI.workoutData.trainingModes;
const exercises = fitAI.workoutData.exercises;

// Nutrition info
const dailyMacros = fitAI.nutritionData.dailyLog.macros;
```

### Updating Data
```javascript
// Data changes are automatically saved to localStorage
fitAI.userData.stats.xp += 100;
fitAI.saveUserData();
```

## Migration Notes

- **No Breaking Changes**: Existing functionality preserved
- **Enhanced Performance**: Faster loading with parallel requests
- **Better Organization**: Clear data boundaries between modules
- **Future Ready**: Prepared for API integration

## Development Workflow

1. **Edit JSON Files**: Modify data in `data/` directory
2. **Test Changes**: Use `fitAI.testDataLoading()` to verify
3. **Verify UI**: Check that components update correctly
4. **Save Progress**: Changes persist in localStorage

This JSON structure provides a solid foundation for the FitAI Pro application while maintaining flexibility for future enhancements. 