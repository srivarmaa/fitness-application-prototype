const fs = require('fs');
const path = require('path');

// Read the current exercise data
const exerciseDataPath = path.join(__dirname, 'data', 'exercise-list.json');
const exerciseData = JSON.parse(fs.readFileSync(exerciseDataPath, 'utf8'));

// Update each exercise with hasWeights, reps, and sets
Object.keys(exerciseData).forEach(muscleGroup => {
    if (exerciseData[muscleGroup]?.exercises) {
        exerciseData[muscleGroup].exercises.forEach(exercise => {
            // Determine if exercise has weights based on exercise type
            const hasWeights = determineHasWeights(exercise.name);
            
            exercise.hasWeights = hasWeights;
            
            if (hasWeights) {
                exercise.reps = 12; // Default reps
                exercise.sets = 3;  // Default sets
                exercise.weight = 0; // Default weight (user will set)
            } else {
                exercise.reps = 15; // Default reps for bodyweight
                exercise.sets = 3;  // Default sets
                exercise.duration = 30; // Default duration in seconds for bodyweight
            }
        });
    }
});

// Helper function to determine if exercise has weights
function determineHasWeights(exerciseName) {
    const weightExercises = [
        'bench press', 'dumbbell', 'barbell', 'deadlift', 'squat', 'press',
        'curl', 'extension', 'row', 'pull', 'push', 'fly', 'raise', 'shrug'
    ];
    
    const bodyweightExercises = [
        'push-up', 'pull-up', 'chin-up', 'dip', 'plank', 'crunch', 'sit-up',
        'burpee', 'mountain climber', 'jumping jack', 'lunge', 'squat'
    ];
    
    const name = exerciseName.toLowerCase();
    
    // Check for bodyweight exercises first
    if (bodyweightExercises.some(bw => name.includes(bw))) {
        return false;
    }
    
    // Check for weight exercises
    if (weightExercises.some(w => name.includes(w))) {
        return true;
    }
    
    // Default to bodyweight for unknown exercises
    return false;
}

// Write the updated data back to file
fs.writeFileSync(exerciseDataPath, JSON.stringify(exerciseData, null, 2));

console.log('✅ Exercise data updated with hasWeights, reps, and sets fields'); 