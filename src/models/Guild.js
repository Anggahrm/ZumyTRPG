const mongoose = require('mongoose');

const guildSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    description: { type: String, default: '' },
    tag: { type: String, required: true, unique: true, maxlength: 5 },
    
    // Guild settings
    level: { type: Number, default: 1 },
    xp: { type: Number, default: 0 },
    maxMembers: { type: Number, default: 20 },
    
    // Guild resources
    treasury: { type: Number, default: 0 },
    
    // Members
    leaderId: { type: Number, required: true },
    members: [{
        userId: { type: Number, required: true },
        username: String,
        rank: { type: String, enum: ['member', 'officer', 'leader'], default: 'member' },
        joinedAt: { type: Date, default: Date.now },
        contribution: { type: Number, default: 0 }
    }],
    
    // Guild perks/bonuses
    perks: {
        xpBonus: { type: Number, default: 0 },
        goldBonus: { type: Number, default: 0 },
        shopDiscount: { type: Number, default: 0 }
    },
    
    // Guild activities
    lastRaid: { type: Date, default: null },
    raidCooldown: { type: Number, default: 24 * 60 * 60 * 1000 }, // 24 hours in ms
    
    // Settings
    isPublic: { type: Boolean, default: true },
    autoAccept: { type: Boolean, default: false },
    minLevel: { type: Number, default: 1 },
    
    // Timestamps
    createdAt: { type: Date, default: Date.now },
    lastActive: { type: Date, default: Date.now }
});

// Indexes
guildSchema.index({ level: -1, xp: -1 });

// Virtual for XP needed for next level
guildSchema.virtual('xpNeeded').get(function() {
    return this.level * 1000;
});

// Method to add member
guildSchema.methods.addMember = function(userId, username, rank = 'member') {
    if (this.members.length >= this.maxMembers) {
        return false;
    }
    
    this.members.push({
        userId,
        username,
        rank,
        joinedAt: new Date(),
        contribution: 0
    });
    return true;
};

// Method to remove member
guildSchema.methods.removeMember = function(userId) {
    this.members = this.members.filter(member => member.userId !== userId);
};

// Method to get member
guildSchema.methods.getMember = function(userId) {
    return this.members.find(member => member.userId === userId);
};

// Method to update member rank
guildSchema.methods.updateMemberRank = function(userId, newRank) {
    const member = this.getMember(userId);
    if (member) {
        member.rank = newRank;
        return true;
    }
    return false;
};

// Method to add contribution
guildSchema.methods.addContribution = function(userId, amount) {
    const member = this.getMember(userId);
    if (member) {
        member.contribution += amount;
        this.xp += amount;
        return true;
    }
    return false;
};

// Method to check if guild can level up
guildSchema.methods.canLevelUp = function() {
    return this.xp >= this.xpNeeded;
};

// Method to level up guild
guildSchema.methods.levelUp = function() {
    if (this.canLevelUp()) {
        this.level += 1;
        this.maxMembers += 5;
        
        // Increase perks
        this.perks.xpBonus += 0.05; // 5% more XP bonus per level
        this.perks.goldBonus += 0.05; // 5% more gold bonus per level
        this.perks.shopDiscount += 0.02; // 2% more shop discount per level
        
        return true;
    }
    return false;
};

module.exports = mongoose.model('Guild', guildSchema);

