// ExerciseDB API Service
// Handles integration with the ExerciseDB API to fetch exercise data

class ExerciseDBService {
    constructor() {
        // Disabled API integration
        this.baseUrl = null;
        this.exerciseCache = new Map();
        this.bodyPartsCache = null;
        this.equipmentCache = null;
        this.targetMusclesCache = null;
        
        console.log('🚫 ExerciseDB API integration disabled');
    }

    // API methods disabled
    getHeaders() {
        return {};
    }

    async checkRateLimit() {
        // No rate limiting needed
    }

    async makeRequest(endpoint, params = {}) {
        console.log('🚫 API requests disabled');
        return [];
    }

    async makeSearchRequest(searchData) {
        console.log('🚫 API search requests disabled');
        return [];
    }

    // Get all body parts from local API
    async getBodyParts() {
        if (this.bodyPartsCache) {
            return this.bodyPartsCache;
        }

        try {
            console.log('🔄 Fetching body parts from local API...');
            const response = await fetch('http://localhost/api/v1/bodyparts');
            
            if (!response.ok) {
                throw new Error(`API request failed: ${response.status} ${response.statusText}`);
            }

            const result = await response.json();
            // Extract data array from response
            const bodyParts = result.data ? result.data.map(item => item.name) : result;
            this.bodyPartsCache = bodyParts;
            console.log('✅ Body parts fetched:', bodyParts);
            return bodyParts;
        } catch (error) {
            console.error('Failed to fetch body parts:', error);
            // Return fallback body parts
            return ['back', 'cardio', 'chest', 'lower arms', 'lower legs', 'neck', 'shoulders', 'upper arms', 'upper legs', 'waist'];
        }
    }

    // Get all equipment from local API
    async getEquipment() {
        if (this.equipmentCache) {
            return this.equipmentCache;
        }

        try {
            console.log('🔄 Fetching equipment from local API...');
            const response = await fetch('http://localhost/api/v1/equipments');
            
            if (!response.ok) {
                throw new Error(`API request failed: ${response.status} ${response.statusText}`);
            }

            const result = await response.json();
            // Extract data array from response
            const equipment = result.data ? result.data.map(item => item.name) : result;
            this.equipmentCache = equipment;
            console.log('✅ Equipment fetched:', equipment);
            return equipment;
        } catch (error) {
            console.error('Failed to fetch equipment:', error);
            return [];
        }
    }

    // Get all target muscles from local API
    async getTargetMuscles() {
        if (this.targetMusclesCache) {
            return this.targetMusclesCache;
        }

        try {
            console.log('🔄 Fetching target muscles from local API...');
            const response = await fetch('http://localhost/api/v1/muscles');
            
            if (!response.ok) {
                throw new Error(`API request failed: ${response.status} ${response.statusText}`);
            }

            const result = await response.json();
            // Extract data array from response
            const targetMuscles = result.data ? result.data.map(item => item.name) : result;
            this.targetMusclesCache = targetMuscles;
            console.log('✅ Target muscles fetched:', targetMuscles);
            return targetMuscles;
        } catch (error) {
            console.error('Failed to fetch target muscles:', error);
            return [];
        }
    }

    // Get filtered exercises using the advanced filter API
    async getFilteredExercises(filters = {}) {
        try {
            const {
                search = '',
                muscles = [],
                equipment = [],
                bodyParts = [],
                offset = 0,
                limit = 50,
                sortBy = 'name',
                sortOrder = 'asc',
                fetchAll = false // New parameter to fetch all pages
            } = filters;

            // If fetchAll is true, get all exercises with pagination
            if (fetchAll) {
                return await this.getAllFilteredExercises(filters);
            }

            // Build query parameters
            const params = new URLSearchParams({
                offset: offset.toString(),
                limit: limit.toString(),
                sortBy: sortBy,
                sortOrder: sortOrder
            });

            // Add optional filters
            if (search) params.append('search', search);
            if (muscles.length > 0) params.append('muscles', muscles.join(','));
            if (equipment.length > 0) params.append('equipment', equipment.join(','));
            if (bodyParts.length > 0) params.append('bodyParts', bodyParts.join(','));

            const url = `http://localhost/api/v1/exercises/filter?${params.toString()}`;
            console.log(`🔄 Fetching filtered exercises: ${url}`);

            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`API request failed: ${response.status} ${response.statusText}`);
            }

            const result = await response.json();
            console.log('🔍 Raw API response:', result);
            
            const exercises = result.data ? result.data : result;
            const totalExercises = result.metadata?.totalExercises || result.totalExercises || exercises.length;
            
            console.log(`✅ Found ${exercises.length} exercises (Total: ${totalExercises}) with filters:`, filters);
            console.log('📋 Sample exercises:', exercises.slice(0, 2));
            
            return {
                exercises: exercises,
                totalExercises: totalExercises,
                metadata: result.metadata || {}
            };
        } catch (error) {
            console.error('Failed to fetch filtered exercises:', error);
            return {
                exercises: [],
                totalExercises: 0,
                metadata: {}
            };
        }
    }

    // Get all filtered exercises with pagination
    async getAllFilteredExercises(filters = {}) {
        try {
            const {
                search = '',
                muscles = [],
                equipment = [],
                bodyParts = [],
                sortBy = 'name',
                sortOrder = 'asc'
            } = filters;

            console.log('🔄 Fetching ALL exercises with pagination...');
            
            let allExercises = [];
            let currentOffset = 0;
            let hasMorePages = true;
            let totalExercises = 0;
            let pageCount = 0;
            
            while (hasMorePages) {
                pageCount++;
                console.log(`📄 Fetching page ${pageCount} (offset: ${currentOffset})...`);
                
                // Build query parameters for current page
                const params = new URLSearchParams({
                    offset: currentOffset.toString(),
                    limit: '100', // Use maximum limit for efficiency
                    sortBy: sortBy,
                    sortOrder: sortOrder
                });

                // Add optional filters
                if (search) params.append('search', search);
                if (muscles.length > 0) params.append('muscles', muscles.join(','));
                if (equipment.length > 0) params.append('equipment', equipment.join(','));
                if (bodyParts.length > 0) params.append('bodyParts', bodyParts.join(','));

                const url = `http://localhost/api/v1/exercises/filter?${params.toString()}`;
                
                const response = await fetch(url);
                
                if (!response.ok) {
                    throw new Error(`API request failed: ${response.status} ${response.statusText}`);
                }

                const result = await response.json();
                const exercises = result.data ? result.data : result;
                
                // Update total exercises from first page metadata
                if (pageCount === 1) {
                    totalExercises = result.metadata?.totalExercises || result.totalExercises || 0;
                    console.log(`📊 Total exercises available: ${totalExercises}`);
                }
                
                // Add exercises from current page
                allExercises = allExercises.concat(exercises);
                console.log(`✅ Page ${pageCount}: ${exercises.length} exercises (Total so far: ${allExercises.length})`);
                
                // Check if there are more pages
                if (exercises.length < 100) {
                    hasMorePages = false;
                    console.log('🏁 No more pages available');
                } else {
                    currentOffset += 100;
                }
            }
            
            console.log(`🎉 Successfully fetched ALL ${allExercises.length} exercises from ${pageCount} pages`);
            
            return {
                exercises: allExercises,
                totalExercises: totalExercises,
                metadata: {
                    totalExercises: totalExercises,
                    pagesFetched: pageCount,
                    totalFetched: allExercises.length
                }
            };
            
        } catch (error) {
            console.error('Failed to fetch all filtered exercises:', error);
            return {
                exercises: [],
                totalExercises: 0,
                metadata: {}
            };
        }
    }

    // Get exercises by body part
    async getExercisesByBodyPart(bodyPart, limit = 20, fetchAll = false) {
        try {
            if (fetchAll) {
                console.log(`🔄 Fetching ALL exercises for body part: ${bodyPart}`);
                return await this.getAllFilteredExercises({
                    bodyParts: [bodyPart]
                });
            }
            
            console.log(`🔄 Fetching exercises for body part: ${bodyPart} (limit: ${limit})`);
            
            // Use the filter API to get exercises by body part
            const params = new URLSearchParams({
                bodyParts: bodyPart,
                limit: limit.toString(),
                offset: '0',
                sortBy: 'name',
                sortOrder: 'asc'
            });

            const url = `http://localhost/api/v1/exercises/filter?${params.toString()}`;
            console.log(`🌐 Fetching from: ${url}`);

            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`API request failed: ${response.status} ${response.statusText}`);
            }

            const result = await response.json();
            const exercises = result.data ? result.data : result;
            const totalExercises = result.metadata?.totalExercises || result.totalExercises || exercises.length;
            
            console.log(`✅ Found ${exercises.length} exercises for ${bodyPart} (Total available: ${totalExercises})`);
            
            return {
                exercises: exercises,
                totalExercises: totalExercises,
                metadata: result.metadata || {}
            };
        } catch (error) {
            console.error(`Failed to fetch exercises for ${bodyPart}:`, error);
            return {
                exercises: [],
                totalExercises: 0,
                metadata: {}
            };
        }
    }

    // Get exercises by equipment (disabled)
    async getExercisesByEquipment(equipment, limit = 20) {
        console.log('🚫 API equipment exercise fetching disabled');
        return [];
    }

    // Get exercises by target muscle (disabled)
    async getExercisesByTarget(target, limit = 20) {
        console.log('🚫 API target exercise fetching disabled');
        return [];
    }

    // Search exercises by name (disabled)
    async searchExercises(query, limit = 20) {
        console.log('🚫 API search disabled');
        return [];
    }

    // Get exercise by ID (disabled)
    async getExerciseById(id) {
        console.log('🚫 API exercise by ID disabled');
        return null;
    }

    // Get all exercises from the database (disabled)
    async getAllExercises() {
        console.log('🚫 API getAllExercises disabled');
        return [];
    }

    // Get random exercises (disabled)
    async getRandomExercises(limit = 10) {
        console.log('🚫 API random exercises disabled');
        return [];
    }

    // Get exercises for a specific muscle group
    async getExercisesForMuscleGroup(muscleGroup, limit = 20) {
        try {
            console.log(`🔄 Fetching exercises for muscle group: ${muscleGroup} (limit: ${limit})`);
            
            // Use the filter API to get exercises by target muscle
            const params = new URLSearchParams({
                muscles: muscleGroup,
                limit: limit.toString(),
                offset: '0',
                sortBy: 'name',
                sortOrder: 'asc'
            });

            const url = `http://localhost/api/v1/exercises/filter?${params.toString()}`;
            console.log(`🌐 Fetching from: ${url}`);

            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`API request failed: ${response.status} ${response.statusText}`);
            }

            const result = await response.json();
            const exercises = result.data ? result.data : result;
            const totalExercises = result.metadata?.totalExercises || result.totalExercises || exercises.length;
            
            console.log(`✅ Found ${exercises.length} exercises for ${muscleGroup} (Total available: ${totalExercises})`);
            
            return exercises;
        } catch (error) {
            console.error(`Failed to fetch exercises for ${muscleGroup}:`, error);
            return [];
        }
    }

    // Get exercises for a training mode (disabled)
    async getExercisesForTrainingMode(mode, limit = 20) {
        console.log('🚫 API training mode exercises disabled');
        return [];
    }

    // Clear cache
    clearCache() {
        this.exerciseCache.clear();
        this.bodyPartsCache = null;
        this.equipmentCache = null;
        this.targetMusclesCache = null;
    }

    // Get cache statistics
    getCacheStats() {
        return {
            exerciseCacheSize: this.exerciseCache.size,
            bodyPartsCached: !!this.bodyPartsCache,
            equipmentCached: !!this.equipmentCache,
            targetMusclesCached: !!this.targetMusclesCache
        };
    }

    // Get exercise image by ID and resolution (disabled)
    async getExerciseImage(exerciseId, resolution = 'medium') {
        console.log('🚫 API image fetching disabled');
        return null;
    }

    // Transform exercise to your app's format (preserving API field names)
    transformExercise(exercise) {
        // Handle both API and local exercise data formats
        return {
            id: exercise.id || exercise.exerciseId || exercise.name?.replace(/\s+/g, '_').toLowerCase(),
            name: exercise.name,
            bodyPart: exercise.bodyPart || exercise.bodyParts?.[0] || exercise.muscleGroup || 'other',
            bodyParts: exercise.bodyParts || [exercise.bodyPart || exercise.muscleGroup || 'other'],
            equipment: exercise.equipment || exercise.equipments?.[0] || 'body weight',
            equipments: exercise.equipments || [exercise.equipment || 'body weight'],
            target: exercise.target || exercise.targetMuscles?.[0] || exercise.activated?.[0] || 'general',
            targetMuscles: exercise.targetMuscles || [exercise.target || exercise.activated?.[0] || 'general'],
            secondaryMuscles: exercise.secondaryMuscles || [],
            gifUrl: exercise.gifUrl || exercise.imageUrl || exercise.images?.[0],
            imageUrl: exercise.gifUrl || exercise.imageUrl || exercise.images?.[0],
            instructions: exercise.instructions || [],
            hasWeights: exercise.hasWeights || (exercise.equipment !== 'body weight' && exercise.equipments?.[0] !== 'body weight'),
            reps: exercise.reps || 12,
            sets: exercise.sets || 3,
            duration: exercise.duration || 30,
            description: exercise.description || `Exercise targeting ${exercise.targetMuscles?.join(', ') || exercise.target || exercise.muscleGroup || 'multiple muscle groups'}`,
            common_mistakes: exercise.common_mistakes || exercise.commonMistakes || [],
            activated: exercise.activated || exercise.targetMuscles || [exercise.target || exercise.muscleGroup || 'general']
        };
    }

    // Transform multiple exercises
    transformExercises(exercises) {
        return exercises.map(exercise => this.transformExercise(exercise));
    }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ExerciseDBService;
} 