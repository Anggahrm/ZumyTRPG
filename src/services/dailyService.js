const { dailyRewards, loginBonuses, dailyChallenges } = require('../data/dailyRewards');
const PlayerService = require('./playerService');

class DailyService {
    /**
     * Check if player can claim daily reward
     */
    static canClaimDaily(player) {
        const now = new Date();
        const lastDaily = player.lastDaily;
        
        if (!lastDaily) return true;
        
        // Check if it's a new day (using UTC)
        const today = new Date(now.toDateString());
        const lastDailyDate = new Date(lastDaily.toDateString());
        
        return today > lastDailyDate;
    }
    
    /**
     * Get current streak day for player
     */
    static getStreakDay(player) {
        const now = new Date();
        const lastDaily = player.lastDaily;
        
        if (!lastDaily) return 1; // First time
        
        const today = new Date(now.toDateString());
        const lastDailyDate = new Date(lastDaily.toDateString());
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        
        // Check if streak is broken (more than 1 day gap)
        if (lastDailyDate < yesterday) {
            return 1; // Streak broken, reset to day 1
        }
        
        // Continue streak
        const currentStreak = player.dailyStreak || 1;
        return Math.min(currentStreak + 1, 30); // Max 30 days
    }
    
    /**
     * Get daily reward for specific day
     */
    static getDailyReward(day) {
        return dailyRewards.find(reward => reward.day === day) || dailyRewards[0];
    }
    
    /**
     * Get login bonus based on player level
     */
    static getLoginBonus(playerLevel) {
        if (playerLevel <= 10) return loginBonuses.newbie;
        if (playerLevel <= 25) return loginBonuses.regular;
        if (playerLevel <= 50) return loginBonuses.veteran;
        return loginBonuses.elite;
    }
    
    /**
     * Claim daily reward
     */
    static async claimDailyReward(player) {
        if (!this.canClaimDaily(player)) {
            return { success: false, error: 'Already claimed today' };
        }
        
        const streakDay = this.getStreakDay(player);
        const dailyReward = this.getDailyReward(streakDay);
        const loginBonus = this.getLoginBonus(player.level);
        
        // Update player
        const updateData = {
            lastDaily: new Date(),
            dailyStreak: streakDay,
            $inc: {
                gold: dailyReward.gold + loginBonus.gold,
                gems: dailyReward.gems + loginBonus.gems,
                xp: loginBonus.xp
            }
        };
        
        await PlayerService.updatePlayer(player.userId, updateData);
        
        // Add items to inventory
        for (const [itemName, quantity] of Object.entries(dailyReward.items)) {
            await PlayerService.addItem(player.userId, itemName, quantity);
        }
        
        return {
            success: true,
            streakDay,
            dailyReward,
            loginBonus,
            totalGold: dailyReward.gold + loginBonus.gold,
            totalGems: dailyReward.gems + loginBonus.gems,
            totalXp: loginBonus.xp
        };
    }
    
    /**
     * Get random daily challenges for player
     */
    static getDailyChallenges(player, count = 3) {
        // Get challenges that player hasn't completed today
        const completedToday = player.dailyChallengesCompleted || [];
        const availableChallenges = dailyChallenges.filter(
            challenge => !completedToday.includes(challenge.id)
        );
        
        // Randomly select challenges
        const selected = [];
        const shuffled = [...availableChallenges].sort(() => 0.5 - Math.random());
        
        for (let i = 0; i < Math.min(count, shuffled.length); i++) {
            selected.push(shuffled[i]);
        }
        
        return selected;
    }
    
    /**
     * Check and update daily challenge progress
     */
    static async updateChallengeProgress(player, challengeType, amount = 1) {
        const todaysChallenges = this.getDailyChallenges(player, 5);
        const relevantChallenges = todaysChallenges.filter(c => c.type === challengeType);
        
        const completedChallenges = [];
        
        for (const challenge of relevantChallenges) {
            const currentProgress = player.dailyChallengeProgress?.[challenge.id] || 0;
            const newProgress = Math.min(currentProgress + amount, challenge.requirement);
            
            // Update progress
            await PlayerService.updatePlayer(player.userId, {
                [`dailyChallengeProgress.${challenge.id}`]: newProgress
            });
            
            // Check if completed
            if (newProgress >= challenge.requirement && !player.dailyChallengesCompleted?.includes(challenge.id)) {
                await PlayerService.updatePlayer(player.userId, {
                    $addToSet: { dailyChallengesCompleted: challenge.id },
                    $inc: {
                        gold: challenge.reward.gold,
                        gems: challenge.reward.gems,
                        xp: challenge.reward.xp
                    }
                });
                
                completedChallenges.push(challenge);
            }
        }
        
        return completedChallenges;
    }
    
    /**
     * Reset daily challenges at midnight
     */
    static async resetDailyChallenges(player) {
        const now = new Date();
        const lastReset = player.lastChallengeReset;
        
        if (!lastReset || now.toDateString() !== lastReset.toDateString()) {
            await PlayerService.updatePlayer(player.userId, {
                dailyChallengesCompleted: [],
                dailyChallengeProgress: {},
                lastChallengeReset: now
            });
            return true;
        }
        
        return false;
    }
    
    /**
     * Format daily reward message
     */
    static formatDailyRewardMessage(result) {
        if (!result.success) {
            return '❌ Kamu sudah mengambil daily reward hari ini!';
        }
        
        const { streakDay, dailyReward, loginBonus, totalGold, totalGems, totalXp } = result;
        
        let message = `🎁 *Daily Reward - Day ${streakDay}*\n\n`;
        
        // Streak bonus message
        if (dailyReward.bonus) {
            message += `${dailyReward.bonus}\n\n`;
        }
        
        message += `📅 *Daily Streak Reward:*\n`;
        message += `💰 ${dailyReward.gold} Gold\n`;
        message += `💎 ${dailyReward.gems} Gems\n`;
        
        if (Object.keys(dailyReward.items).length > 0) {
            message += `🎁 Items:\n`;
            for (const [itemName, quantity] of Object.entries(dailyReward.items)) {
                message += `• ${itemName} x${quantity}\n`;
            }
        }
        
        message += `\n⭐ *Login Bonus:*\n`;
        message += `💰 ${loginBonus.gold} Gold\n`;
        message += `💎 ${loginBonus.gems} Gems\n`;
        message += `⭐ ${loginBonus.xp} XP\n\n`;
        
        message += `🎊 *Total Received:*\n`;
        message += `💰 ${totalGold} Gold\n`;
        message += `💎 ${totalGems} Gems\n`;
        message += `⭐ ${totalXp} XP\n\n`;
        
        message += `🔥 Current Streak: ${streakDay} days\n`;
        message += `⏰ Next reward in: ${this.getTimeUntilNextDaily()}`;
        
        return message;
    }
    
    /**
     * Get time until next daily reward
     */
    static getTimeUntilNextDaily() {
        const now = new Date();
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);
        
        const timeDiff = tomorrow - now;
        const hours = Math.floor(timeDiff / (1000 * 60 * 60));
        const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
        
        return `${hours}h ${minutes}m`;
    }
}

module.exports = DailyService;
