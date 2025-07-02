module.exports = {
    BOT_TOKEN: '7054705950:AAECvRbWSdATmfiXPhkGkdqToyQq8SZ32UQ',
    MONGODB_URI: 'mongodb+srv://hermawan360com:k7vz4sIDu42hwCre@zumytele.oy9dgsl.mongodb.net/?retryWrites=true&w=majority&appName=ZumyTele',
    
    GAME_CONFIG: {
        COOLDOWNS: {
            HUNT: 5,        // 5 minutes
            ADVENTURE: 10,  // 10 minutes
            WORK: 15,       // 15 minutes
            DAILY: 1440,    // 24 hours (1440 minutes)
            DUNGEON: 30     // 30 minutes
        },
        
        LEVEL_UP: {
            HP_BONUS: 10,
            ATTACK_BONUS: 2,
            DEFENSE_BONUS: 1
        },
        
        COMBAT: {
            variance: 3,
            critChance: 0.15,
            critMultiplier: 1.5
        },
        
        GUILD: {
            CREATION_COST: 1000,
            MIN_LEVEL: 5,
            MAX_MEMBERS_BASE: 20
        },
        
        SHOP: {
            SELL_RATE: 0.7  // Players get 70% of item value when selling
        }
    },
    
    // Admin user IDs (comma-separated string in production)
    ADMIN_IDS: process.env.ADMIN_IDS || '6026583608',
    
    // Maintenance mode
    MAINTENANCE_MODE: process.env.MAINTENANCE_MODE === 'true'
};

