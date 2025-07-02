// Common utility functions

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomFloat(min, max) {
    return Math.random() * (max - min) + min;
}

function getRandomElement(array) {
    return array[Math.floor(Math.random() * array.length)];
}

function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

function formatNumber(num) {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
}

function formatTime(milliseconds) {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) {
        return `${days}d ${hours % 24}h ${minutes % 60}m`;
    } else if (hours > 0) {
        return `${hours}h ${minutes % 60}m`;
    } else if (minutes > 0) {
        return `${minutes}m ${seconds % 60}s`;
    } else {
        return `${seconds}s`;
    }
}

function calculateDamage(attacker, defender, config = {}) {
    const baseAttack = attacker.attack || 10;
    const baseDefense = defender.defense || 0;
    const variance = config.variance || 2;
    const critChance = config.critChance || 0.1;
    const critMultiplier = config.critMultiplier || 1.5;
    
    // Base damage calculation
    let damage = Math.max(1, baseAttack - baseDefense);
    
    // Add variance
    const varianceAmount = getRandomInt(-variance, variance);
    damage += varianceAmount;
    
    // Check for critical hit
    const isCrit = Math.random() < critChance;
    if (isCrit) {
        damage = Math.floor(damage * critMultiplier);
    }
    
    return {
        damage: Math.max(1, damage),
        isCrit,
        variance: varianceAmount
    };
}

function calculateXpNeeded(level) {
    return level * 100;
}

function calculateLevelFromXp(xp) {
    let level = 1;
    let totalXpNeeded = 0;
    
    while (totalXpNeeded <= xp) {
        totalXpNeeded += calculateXpNeeded(level);
        if (totalXpNeeded <= xp) {
            level++;
        }
    }
    
    return level;
}

function getItemRarityEmoji(rarity) {
    const rarityEmojis = {
        'common': '⚪',
        'uncommon': '🟢',
        'rare': '🔵',
        'epic': '🟣',
        'legendary': '🟡'
    };
    return rarityEmojis[rarity] || '⚪';
}

function getProgressBar(current, max, length = 10) {
    const percentage = Math.min(current / max, 1);
    const filled = Math.floor(percentage * length);
    const empty = length - filled;
    
    return '█'.repeat(filled) + '░'.repeat(empty);
}

function formatItemName(itemName, rarity = 'common') {
    const emoji = getItemRarityEmoji(rarity);
    return `${emoji} ${itemName}`;
}

function parseCommand(text) {
    const parts = text.trim().split(/\s+/);
    const command = parts[0].toLowerCase();
    const args = parts.slice(1);
    
    return { command, args };
}

function validateInput(input, type, options = {}) {
    switch (type) {
        case 'number':
            const num = parseInt(input);
            if (isNaN(num)) return { valid: false, error: 'Must be a number' };
            if (options.min !== undefined && num < options.min) {
                return { valid: false, error: `Must be at least ${options.min}` };
            }
            if (options.max !== undefined && num > options.max) {
                return { valid: false, error: `Must be at most ${options.max}` };
            }
            return { valid: true, value: num };
            
        case 'string':
            if (typeof input !== 'string') return { valid: false, error: 'Must be text' };
            if (options.minLength && input.length < options.minLength) {
                return { valid: false, error: `Must be at least ${options.minLength} characters` };
            }
            if (options.maxLength && input.length > options.maxLength) {
                return { valid: false, error: `Must be at most ${options.maxLength} characters` };
            }
            return { valid: true, value: input };
            
        case 'choice':
            if (!options.choices || !options.choices.includes(input)) {
                return { valid: false, error: `Must be one of: ${options.choices.join(', ')}` };
            }
            return { valid: true, value: input };
            
        default:
            return { valid: true, value: input };
    }
}

function escapeMarkdown(text) {
    return text.replace(/[_*[\]()~`>#+=|{}.!-]/g, '\\$&');
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
}

function mergeObjects(target, source) {
    const result = { ...target };
    
    for (const key in source) {
        if (source.hasOwnProperty(key)) {
            if (typeof source[key] === 'object' && source[key] !== null && !Array.isArray(source[key])) {
                result[key] = mergeObjects(result[key] || {}, source[key]);
            } else {
                result[key] = source[key];
            }
        }
    }
    
    return result;
}

function chunkArray(array, size) {
    const chunks = [];
    for (let i = 0; i < array.length; i += size) {
        chunks.push(array.slice(i, i + size));
    }
    return chunks;
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

module.exports = {
    getRandomInt,
    getRandomFloat,
    getRandomElement,
    shuffleArray,
    formatNumber,
    formatTime,
    calculateDamage,
    calculateXpNeeded,
    calculateLevelFromXp,
    getItemRarityEmoji,
    getProgressBar,
    formatItemName,
    parseCommand,
    validateInput,
    escapeMarkdown,
    sleep,
    deepClone,
    mergeObjects,
    chunkArray,
    debounce,
    throttle
};

