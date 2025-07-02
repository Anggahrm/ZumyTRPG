const Player = require('../models/Player');
const { items } = require('../data/items');
const { calculateXpNeeded } = require('../utils/common');
const config = require('../../config');

class PlayerService {
    // Get player by user ID
    static async getPlayer(userId) {
        return await Player.findOne({ userId });
    }
    
    // Create new player
    static async createPlayer(userId, username) {
        const player = new Player({
            userId,
            username: username || 'Unknown'
        });
        return await player.save();
    }
    
    // Update player stats
    static async updatePlayerStats(player, updates) {
        Object.assign(player, updates);
        return await player.save();
    }
    
    // Add XP and handle level up
    static async addXp(player, amount) {
        player.xp += amount;
        
        const levelUps = [];
        while (player.canLevelUp()) {
            const oldLevel = player.level;
            player.levelUp();
            levelUps.push({
                from: oldLevel,
                to: player.level,
                hpGain: config.GAME_CONFIG.LEVEL_UP.HP_BONUS,
                attackGain: config.GAME_CONFIG.LEVEL_UP.ATTACK_BONUS,
                defenseGain: config.GAME_CONFIG.LEVEL_UP.DEFENSE_BONUS
            });
        }
        
        await player.save();
        return { player, levelUps };
    }
    
    // Add gold
    static async addGold(player, amount) {
        // Use updateOne to avoid conflicts with other concurrent updates
        await Player.updateOne(
            { _id: player._id },
            { 
                $inc: { 
                    gold: amount,
                    'stats.goldEarned': amount
                }
            }
        );
        
        // Update local player object for consistency
        player.gold += amount;
        if (player.stats.goldEarned !== undefined) {
            player.stats.goldEarned += amount;
        }
        
        return player;
    }
    
    // Remove gold (returns false if insufficient)
    static async removeGold(player, amount) {
        if (player.gold < amount) {
            return false;
        }
        
        // Use updateOne to avoid conflicts with other concurrent updates
        await Player.updateOne(
            { _id: player._id },
            { $inc: { gold: -amount } }
        );
        
        // Update local player object for consistency
        player.gold -= amount;
        return true;
    }
    
    // Add item to inventory
    static async addItem(player, itemName, quantity = 1) {
        // Use updateOne to avoid conflicts with other concurrent updates
        const currentQuantity = player.inventory.get(itemName) || 0;
        const newQuantity = currentQuantity + quantity;
        
        await Player.updateOne(
            { _id: player._id },
            { $set: { [`inventory.${itemName}`]: newQuantity } }
        );
        
        // Update local player object for consistency
        player.addItem(itemName, quantity);
        
        return player;
    }
    
    // Remove item from inventory (returns false if insufficient)
    static async removeItem(player, itemName, quantity = 1) {
        if (!player.hasItem(itemName, quantity)) {
            return false;
        }
        
        // Calculate new quantity
        const currentQuantity = player.inventory.get(itemName) || 0;
        const newQuantity = currentQuantity - quantity;
        
        // Use updateOne to avoid conflicts with other concurrent updates
        if (newQuantity <= 0) {
            await Player.updateOne(
                { _id: player._id },
                { $unset: { [`inventory.${itemName}`]: "" } }
            );
        } else {
            await Player.updateOne(
                { _id: player._id },
                { $set: { [`inventory.${itemName}`]: newQuantity } }
            );
        }
        
        // Update local player object for consistency
        player.removeItem(itemName, quantity);
        return true;
    }
    
    // Equip item
    static async equipItem(player, itemName, slot) {
        const item = items[itemName];
        if (!item) return { success: false, message: 'Item tidak ditemukan' };
        
        // Check if player has the item
        if (!player.hasItem(itemName)) {
            return { success: false, message: 'Kamu tidak memiliki item ini' };
        }
        
        // Check item type matches slot
        if (item.type !== slot) {
            return { success: false, message: `Item ini bukan ${slot}` };
        }
        
        const oldItem = player.equipment[slot];
        
        // Remove old item stats
        if (oldItem && items[oldItem]) {
            const oldItemData = items[oldItem];
            if (oldItemData.attack) player.attack -= oldItemData.attack;
            if (oldItemData.defense) player.defense -= oldItemData.defense;
            if (oldItemData.hp) player.maxHp -= oldItemData.hp;
        }
        
        // Add new item stats
        if (item.attack) player.attack += item.attack;
        if (item.defense) player.defense += item.defense;
        if (item.hp) {
            player.maxHp += item.hp;
            player.hp = Math.min(player.hp + item.hp, player.maxHp);
        }
        
        // Equip new item
        player.equipment[slot] = itemName;
        
        // Remove item from inventory
        player.removeItem(itemName, 1);
        
        // Add old item back to inventory if it exists
        if (oldItem && oldItem !== 'Wooden Sword' && oldItem !== 'Cloth Armor') {
            player.addItem(oldItem, 1);
        }
        
        await player.save();
        
        return {
            success: true,
            message: `Berhasil melengkapi ${itemName}`,
            oldItem,
            newItem: itemName,
            statChanges: {
                attack: item.attack || 0,
                defense: item.defense || 0,
                hp: item.hp || 0
            }
        };
    }
    
    // Heal player
    static async healPlayer(player, amount) {
        const oldHp = player.hp;
        player.hp = Math.min(player.maxHp, player.hp + amount);
        const actualHeal = player.hp - oldHp;
        
        await player.save();
        return { actualHeal, newHp: player.hp, maxHp: player.maxHp };
    }
    
    // Damage player
    static async damagePlayer(player, amount) {
        const oldHp = player.hp;
        player.hp = Math.max(0, player.hp - amount);
        const actualDamage = oldHp - player.hp;
        
        await player.save();
        return { actualDamage, newHp: player.hp, isDead: player.hp === 0 };
    }
    
    // Get player inventory formatted
    static getFormattedInventory(player) {
        if (player.inventory.size === 0) {
            return 'Inventaris kosong';
        }
        
        const inventoryItems = [];
        for (const [itemName, quantity] of player.inventory.entries()) {
            const item = items[itemName];
            const rarity = item ? item.rarity : 'common';
            const value = item ? item.value : 1;
            
            inventoryItems.push({
                name: itemName,
                quantity,
                rarity,
                value,
                totalValue: value * quantity
            });
        }
        
        // Sort by rarity and value
        const rarityOrder = { legendary: 5, epic: 4, rare: 3, uncommon: 2, common: 1 };
        inventoryItems.sort((a, b) => {
            const rarityDiff = (rarityOrder[b.rarity] || 1) - (rarityOrder[a.rarity] || 1);
            if (rarityDiff !== 0) return rarityDiff;
            return b.value - a.value;
        });
        
        return inventoryItems;
    }
    
    // Get player equipment formatted
    static getFormattedEquipment(player) {
        const equipment = {};
        
        for (const [slot, itemName] of Object.entries(player.equipment)) {
            if (itemName) {
                const item = items[itemName];
                equipment[slot] = {
                    name: itemName,
                    rarity: item ? item.rarity : 'common',
                    stats: {
                        attack: item ? item.attack : 0,
                        defense: item ? item.defense : 0,
                        hp: item ? item.hp : 0
                    }
                };
            } else {
                equipment[slot] = null;
            }
        }
        
        return equipment;
    }
    
    // Get leaderboard
    static async getLeaderboard(limit = 10, sortBy = 'level') {
        const sortOptions = {
            level: { level: -1, xp: -1 },
            gold: { gold: -1 },
            monstersKilled: { 'stats.monstersKilled': -1 }
        };
        
        const sort = sortOptions[sortBy] || sortOptions.level;
        
        return await Player.find({})
            .sort(sort)
            .limit(limit)
            .select('username level xp gold stats.monstersKilled stats.bossesKilled');
    }
    
    // Update player statistics
    static async updateStats(player, statUpdates) {
        const incUpdates = {};
        for (const [stat, value] of Object.entries(statUpdates)) {
            incUpdates[`stats.${stat}`] = value;
        }
        
        // Use updateOne to avoid conflicts with other concurrent updates
        await Player.updateOne({ _id: player._id }, { $inc: incUpdates });
        
        // Update local player object for consistency
        for (const [stat, value] of Object.entries(statUpdates)) {
            if (player.stats[stat] !== undefined) {
                player.stats[stat] += value;
            }
        }
        
        return player;
    }
    
    // Check and award achievements
    static async checkAchievements(player) {
        const newAchievements = [];
        
        // Level achievements
        if (player.level >= 10 && !player.achievements.includes('level_10')) {
            player.achievements.push('level_10');
            newAchievements.push({
                id: 'level_10',
                name: 'Veteran',
                description: 'Mencapai level 10',
                reward: { gold: 500, xp: 200 }
            });
        }
        
        if (player.level >= 20 && !player.achievements.includes('level_20')) {
            player.achievements.push('level_20');
            newAchievements.push({
                id: 'level_20',
                name: 'Master',
                description: 'Mencapai level 20',
                reward: { gold: 1000, xp: 500 }
            });
        }
        
        // Monster kill achievements
        if (player.stats.monstersKilled >= 100 && !player.achievements.includes('monster_hunter')) {
            player.achievements.push('monster_hunter');
            newAchievements.push({
                id: 'monster_hunter',
                name: 'Monster Hunter',
                description: 'Membunuh 100 monster',
                reward: { gold: 300, items: { 'Ring of Strength': 1 } }
            });
        }
        
        // Gold achievements
        if (player.stats.goldEarned >= 10000 && !player.achievements.includes('gold_collector')) {
            player.achievements.push('gold_collector');
            newAchievements.push({
                id: 'gold_collector',
                name: 'Gold Collector',
                description: 'Mengumpulkan total 10,000 gold',
                reward: { gold: 1000, items: { 'Lucky Charm': 1 } }
            });
        }
        
        // Award achievement rewards
        for (const achievement of newAchievements) {
            if (achievement.reward.gold) {
                player.gold += achievement.reward.gold;
            }
            if (achievement.reward.xp) {
                player.xp += achievement.reward.xp;
            }
            if (achievement.reward.items) {
                for (const [itemName, quantity] of Object.entries(achievement.reward.items)) {
                    player.addItem(itemName, quantity);
                }
            }
        }
        
        if (newAchievements.length > 0) {
            await player.save();
        }
        
        return newAchievements;
    }
    
    // Get player's active quests progress
    static getQuestProgress(player) {
        return player.activeQuests.map(activeQuest => {
            const progress = {};
            for (const [objective, current] of activeQuest.progress.entries()) {
                progress[objective] = current;
            }
            
            return {
                questId: activeQuest.questId,
                progress,
                startedAt: activeQuest.startedAt
            };
        });
    }
}

module.exports = PlayerService;

