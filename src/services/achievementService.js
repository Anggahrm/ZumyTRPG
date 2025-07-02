const achievements = require('../data/achievements');
const PlayerService = require('./playerService');

class AchievementService {
    /**
     * Check and unlock achievements for a player
     */
    static async checkAchievements(player) {
        const unlockedAchievements = [];
        
        for (const achievement of achievements) {
            // Skip if already unlocked
            if (player.achievements.includes(achievement.id)) {
                continue;
            }
            
            let isUnlocked = false;
            
            switch (achievement.type) {
                case 'level':
                    isUnlocked = player.level >= achievement.requirement;
                    break;
                case 'kills':
                    isUnlocked = player.stats.monstersKilled >= achievement.requirement;
                    break;
                case 'bosses':
                    isUnlocked = player.stats.bossesKilled >= achievement.requirement;
                    break;
                case 'gold_earned':
                    isUnlocked = player.stats.goldEarned >= achievement.requirement;
                    break;
                case 'crafted':
                    isUnlocked = player.stats.itemsCrafted >= achievement.requirement;
                    break;
                case 'hunts':
                    isUnlocked = player.stats.totalHunts >= achievement.requirement;
                    break;
                case 'quests':
                    isUnlocked = player.stats.questsCompleted >= achievement.requirement;
                    break;
                case 'dungeons':
                    isUnlocked = player.stats.totalDungeons >= achievement.requirement;
                    break;
                case 'collection':
                    const uniqueItems = new Set(player.inventory.map(item => item.id)).size;
                    isUnlocked = uniqueItems >= achievement.requirement;
                    break;
                case 'survival':
                    isUnlocked = (player.stats.lowHpSurvival || 0) >= achievement.requirement;
                    break;
            }
            
            if (isUnlocked) {
                // Add achievement to player
                await PlayerService.unlockAchievement(player.userId, achievement.id);
                
                // Give rewards
                if (achievement.reward.gold) {
                    await PlayerService.addGold(player, achievement.reward.gold);
                }
                if (achievement.reward.gems) {
                    await PlayerService.addGems(player.userId, achievement.reward.gems);
                }
                
                unlockedAchievements.push(achievement);
            }
        }
        
        return unlockedAchievements;
    }
    
    /**
     * Get achievement by ID
     */
    static getAchievement(id) {
        return achievements.find(achievement => achievement.id === id);
    }
    
    /**
     * Get all achievements with unlock status for a player
     */
    static getPlayerAchievements(player) {
        return achievements.map(achievement => ({
            ...achievement,
            unlocked: player.achievements.includes(achievement.id),
            progress: this.getAchievementProgress(player, achievement)
        }));
    }
    
    /**
     * Get progress for a specific achievement
     */
    static getAchievementProgress(player, achievement) {
        let current = 0;
        
        switch (achievement.type) {
            case 'level':
                current = player.level;
                break;
            case 'kills':
                current = player.stats.monstersKilled;
                break;
            case 'bosses':
                current = player.stats.bossesKilled;
                break;
            case 'gold_earned':
                current = player.stats.goldEarned;
                break;
            case 'crafted':
                current = player.stats.itemsCrafted;
                break;
            case 'hunts':
                current = player.stats.totalHunts;
                break;
            case 'quests':
                current = player.stats.questsCompleted || 0;
                break;
            case 'dungeons':
                current = player.stats.totalDungeons;
                break;
            case 'collection':
                current = new Set(player.inventory.map(item => item.id)).size;
                break;
            case 'survival':
                current = player.stats.lowHpSurvival || 0;
                break;
        }
        
        return {
            current: Math.min(current, achievement.requirement),
            required: achievement.requirement,
            percentage: Math.min(100, Math.floor((current / achievement.requirement) * 100))
        };
    }
    
    /**
     * Format achievement message for notifications
     */
    static formatAchievementUnlock(achievement) {
        const rewardText = [];
        if (achievement.reward.gold) {
            rewardText.push(`💰 ${achievement.reward.gold} Gold`);
        }
        if (achievement.reward.gems) {
            rewardText.push(`💎 ${achievement.reward.gems} Gems`);
        }
        
        return `🏆 *Achievement Unlocked!*\n\n` +
               `${achievement.icon} *${achievement.name}*\n` +
               `${achievement.description}\n\n` +
               `*Rewards:*\n${rewardText.join('\n')}`;
    }
}

module.exports = AchievementService;
