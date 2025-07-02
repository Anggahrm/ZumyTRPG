const config = require('../../config');

class CooldownManager {
    constructor() {
        this.cooldowns = new Map();
    }
    
    // Check if action is on cooldown
    isOnCooldown(userId, action) {
        const key = `${userId}:${action}`;
        const cooldownEnd = this.cooldowns.get(key);
        
        if (!cooldownEnd) return false;
        
        const now = Date.now();
        if (now >= cooldownEnd) {
            this.cooldowns.delete(key);
            return false;
        }
        
        return true;
    }
    
    // Get remaining cooldown time in milliseconds
    getRemainingCooldown(userId, action) {
        const key = `${userId}:${action}`;
        const cooldownEnd = this.cooldowns.get(key);
        
        if (!cooldownEnd) return 0;
        
        const now = Date.now();
        const remaining = cooldownEnd - now;
        
        return Math.max(0, remaining);
    }
    
    // Set cooldown for an action
    setCooldown(userId, action, minutes) {
        const key = `${userId}:${action}`;
        const cooldownEnd = Date.now() + (minutes * 60 * 1000);
        this.cooldowns.set(key, cooldownEnd);
    }
    
    // Remove cooldown (for admin purposes or special items)
    removeCooldown(userId, action) {
        const key = `${userId}:${action}`;
        this.cooldowns.delete(key);
    }
    
    // Format remaining time as human readable string
    formatRemainingTime(userId, action) {
        const remaining = this.getRemainingCooldown(userId, action);
        if (remaining === 0) return '0s';
        
        const minutes = Math.floor(remaining / (60 * 1000));
        const seconds = Math.floor((remaining % (60 * 1000)) / 1000);
        
        if (minutes > 0) {
            return `${minutes}m ${seconds}s`;
        } else {
            return `${seconds}s`;
        }
    }
    
    // Clean up expired cooldowns (call periodically)
    cleanup() {
        const now = Date.now();
        for (const [key, cooldownEnd] of this.cooldowns.entries()) {
            if (now >= cooldownEnd) {
                this.cooldowns.delete(key);
            }
        }
    }
}

// Database-based cooldown checker (for persistent cooldowns)
function canPerformAction(lastAction, cooldownMinutes = 5) {
    if (!lastAction) return { canPerform: true, remaining: 0 };
    
    const now = new Date();
    const timeDiff = (now - lastAction) / (1000 * 60); // in minutes
    const remaining = cooldownMinutes - timeDiff;
    
    if (remaining <= 0) {
        return { canPerform: true, remaining: 0 };
    }
    
    return { 
        canPerform: false, 
        remaining: Math.ceil(remaining),
        remainingMs: remaining * 60 * 1000
    };
}

function formatCooldownTime(minutes) {
    if (minutes < 1) {
        const seconds = Math.ceil(minutes * 60);
        return `${seconds}s`;
    } else if (minutes < 60) {
        return `${Math.ceil(minutes)}m`;
    } else {
        const hours = Math.floor(minutes / 60);
        const remainingMinutes = Math.ceil(minutes % 60);
        if (remainingMinutes === 0) {
            return `${hours}h`;
        }
        return `${hours}h ${remainingMinutes}m`;
    }
}

// Check multiple cooldowns at once
function checkMultipleCooldowns(player, actions) {
    const results = {};
    
    for (const action of actions) {
        let lastAction, cooldownMinutes;
        
        switch (action) {
            case 'hunt':
                lastAction = player.lastHunt;
                cooldownMinutes = config.GAME_CONFIG.COOLDOWNS.HUNT;
                break;
            case 'adventure':
                lastAction = player.lastAdventure;
                cooldownMinutes = config.GAME_CONFIG.COOLDOWNS.ADVENTURE;
                break;
            case 'work':
                lastAction = player.lastWork;
                cooldownMinutes = config.GAME_CONFIG.COOLDOWNS.WORK;
                break;
            case 'daily':
                lastAction = player.lastDaily;
                cooldownMinutes = config.GAME_CONFIG.COOLDOWNS.DAILY;
                break;
            case 'dungeon':
                lastAction = player.lastDungeon;
                cooldownMinutes = config.GAME_CONFIG.COOLDOWNS.DUNGEON;
                break;
            default:
                results[action] = { canPerform: true, remaining: 0 };
                continue;
        }
        
        results[action] = canPerformAction(lastAction, cooldownMinutes);
    }
    
    return results;
}

// Get next available action time
function getNextAvailableTime(player, action) {
    let lastAction, cooldownMinutes;
    
    switch (action) {
        case 'hunt':
            lastAction = player.lastHunt;
            cooldownMinutes = config.GAME_CONFIG.COOLDOWNS.HUNT;
            break;
        case 'adventure':
            lastAction = player.lastAdventure;
            cooldownMinutes = config.GAME_CONFIG.COOLDOWNS.ADVENTURE;
            break;
        case 'work':
            lastAction = player.lastWork;
            cooldownMinutes = config.GAME_CONFIG.COOLDOWNS.WORK;
            break;
        case 'daily':
            lastAction = player.lastDaily;
            cooldownMinutes = config.GAME_CONFIG.COOLDOWNS.DAILY;
            break;
        case 'dungeon':
            lastAction = player.lastDungeon;
            cooldownMinutes = config.GAME_CONFIG.COOLDOWNS.DUNGEON;
            break;
        default:
            return new Date();
    }
    
    if (!lastAction) return new Date();
    
    return new Date(lastAction.getTime() + (cooldownMinutes * 60 * 1000));
}

// Create cooldown message
function createCooldownMessage(action, remaining) {
    const timeStr = formatCooldownTime(remaining);
    const actionEmojis = {
        hunt: '🏹',
        adventure: '🗺️',
        work: '🔨',
        daily: '🎁',
        dungeon: '🏰'
    };
    
    const emoji = actionEmojis[action] || '⏰';
    return `${emoji} Kamu masih lelah! Tunggu ${timeStr} lagi untuk ${action}.`;
}

// Global cooldown manager instance
const globalCooldownManager = new CooldownManager();

// Clean up expired cooldowns every 5 minutes
setInterval(() => {
    globalCooldownManager.cleanup();
}, 5 * 60 * 1000);

module.exports = {
    CooldownManager,
    globalCooldownManager,
    canPerformAction,
    formatCooldownTime,
    checkMultipleCooldowns,
    getNextAvailableTime,
    createCooldownMessage
};

