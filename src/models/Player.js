const mongoose = require('mongoose');

const playerSchema = new mongoose.Schema({
    userId: { type: Number, required: true, unique: true },
    username: { type: String },
    
    // Basic stats
    level: { type: Number, default: 1 },
    xp: { type: Number, default: 0 },
    hp: { type: Number, default: 100 },
    maxHp: { type: Number, default: 100 },
    attack: { type: Number, default: 10 },
    defense: { type: Number, default: 5 },
    
    // Resources
    gold: { type: Number, default: 100 },
    gems: { type: Number, default: 0 }, // Premium currency
    
    // Inventory and equipment
    inventory: { type: Map, of: Number, default: {} },
    equipment: {
        weapon: { type: String, default: 'Wooden Sword' },
        armor: { type: String, default: 'Cloth Armor' },
        accessory: { type: String, default: null },
        pet: { type: String, default: null }
    },
    
    // Cooldowns
    lastHunt: { type: Date, default: null },
    lastAdventure: { type: Date, default: null },
    lastWork: { type: Date, default: null },
    lastDaily: { type: Date, default: null },
    lastDungeon: { type: Date, default: null },
    
    // Guild system
    guildId: { type: mongoose.Schema.Types.ObjectId, ref: 'Guild', default: null },
    guildRank: { type: String, default: 'member' }, // member, officer, leader
    
    // Quest system
    activeQuests: [{
        questId: String,
        progress: { type: Map, of: Number, default: {} },
        startedAt: { type: Date, default: Date.now }
    }],
    completedQuests: [String],
    
    // Achievements
    achievements: [String],
    
    // Statistics
    stats: {
        totalHunts: { type: Number, default: 0 },
        totalAdventures: { type: Number, default: 0 },
        totalDungeons: { type: Number, default: 0 },
        totalDuels: { type: Number, default: 0 },
        monstersKilled: { type: Number, default: 0 },
        bossesKilled: { type: Number, default: 0 },
        goldEarned: { type: Number, default: 0 },
        itemsCrafted: { type: Number, default: 0 }
    },
    
    // Settings
    settings: {
        notifications: { type: Boolean, default: true },
        autoHeal: { type: Boolean, default: false },
        language: { type: String, default: 'id' }
    },
    
    // Timestamps
    createdAt: { type: Date, default: Date.now },
    lastActive: { type: Date, default: Date.now }
});

// Indexes for better performance
playerSchema.index({ level: -1, xp: -1 });
playerSchema.index({ guildId: 1 });

// Virtual for XP needed for next level
playerSchema.virtual('xpNeeded').get(function() {
    return this.level * 100;
});

// Method to check if player can level up
playerSchema.methods.canLevelUp = function() {
    return this.xp >= this.xpNeeded;
};

// Method to level up
playerSchema.methods.levelUp = function() {
    if (this.canLevelUp()) {
        this.level += 1;
        this.maxHp += 10;
        this.attack += 2;
        this.defense += 1;
        this.hp = this.maxHp; // Full heal on level up
        return true;
    }
    return false;
};

// Method to add item to inventory
playerSchema.methods.addItem = function(itemName, quantity = 1) {
    const current = this.inventory.get(itemName) || 0;
    this.inventory.set(itemName, current + quantity);
};

// Method to remove item from inventory
playerSchema.methods.removeItem = function(itemName, quantity = 1) {
    const current = this.inventory.get(itemName) || 0;
    if (current >= quantity) {
        const remaining = current - quantity;
        if (remaining > 0) {
            this.inventory.set(itemName, remaining);
        } else {
            this.inventory.delete(itemName);
        }
        return true;
    }
    return false;
};

// Method to check if player has item
playerSchema.methods.hasItem = function(itemName, quantity = 1) {
    const current = this.inventory.get(itemName) || 0;
    return current >= quantity;
};

module.exports = mongoose.model('Player', playerSchema);

