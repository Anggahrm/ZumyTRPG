const { InlineKeyboard } = require('grammy');
const { safeEditMessage, safeReply } = require('../utils/messageHelpers');
const { requirePlayer } = require('../middlewares/playerLoader');
const DailyService = require('../services/dailyService');
const AchievementService = require('../services/achievementService');
const PlayerService = require('../services/playerService');
const Player = require('../models/Player');
const { formatNumber } = require('../utils/common');

async function dailyCommand(ctx) {
    const player = ctx.player;
    
    if (!player) {
        return await safeReply(ctx, '❌ Kamu harus memulai game terlebih dahulu. Gunakan /start');
    }
    
    // Check if player can claim daily reward
    if (!DailyService.canClaimDaily(player)) {
        const timeUntil = DailyService.getTimeUntilNextDaily();
        const streakDay = player.dailyStreak || 0;
        
        const message = 
            `🎁 *Daily Reward*\n\n` +
            `⏰ Kamu sudah mengambil daily reward hari ini!\n\n` +
            `🔥 Current Streak: ${streakDay} days\n` +
            `⏳ Next reward: ${timeUntil}\n\n` +
            `💡 Daily reward reset setiap hari pada 00:00 UTC.`;
        
        const keyboard = new InlineKeyboard()
            .text('🏹 Hunt', 'quick_hunt')
            .text('🗺️ Adventure', 'quick_adventure').row()
            .text('📋 Daily Challenges', 'daily_challenges')
            .text('👤 Profile', 'quick_profile');
            
        return await safeReply(ctx, message, {
            parse_mode: 'Markdown',
            reply_markup: keyboard
        });
    }
    
    // Show claiming message
    const claimingMessage = await safeReply(ctx, '🎁 Mengambil daily reward...');
    
    try {
        // Claim daily reward
        const result = await DailyService.claimDailyReward(player);
        
        if (!result.success) {
            await safeEditMessage(ctx, claimingMessage.chat.id, claimingMessage.message_id, 
                `❌ ${result.error}`);
            return;
        }
        
        // Reload player for achievement checking
        const updatedPlayer = await Player.findById(player._id);
        
        // Check for new achievements
        const newAchievements = await AchievementService.checkAchievements(updatedPlayer);
        
        // Format message
        let message = DailyService.formatDailyRewardMessage(result);
        
        // Add achievements if any
        if (newAchievements && newAchievements.length > 0) {
            message += `\n\n🏆 *Achievement Unlocked:*\n`;
            for (const achievement of newAchievements) {
                message += `• ${achievement.icon} ${achievement.name}\n`;
            }
        }
        
        const keyboard = new InlineKeyboard()
            .text('🏹 Hunt', 'quick_hunt')
            .text('🗺️ Adventure', 'quick_adventure').row()
            .text('📋 Daily Challenges', 'daily_challenges')
            .text('🛒 Shop', 'quick_shop').row()
            .text('👤 Profile', 'quick_profile')
            .text('🔄 Refresh', 'refresh_daily');
        
        await safeEditMessage(ctx, claimingMessage.chat.id, claimingMessage.message_id, 
            message, {
                parse_mode: 'Markdown',
                reply_markup: keyboard
            });
            
    } catch (error) {
        console.error('Daily command error:', error);
        await safeEditMessage(ctx, claimingMessage.chat.id, claimingMessage.message_id, 
            '❌ Terjadi error saat mengambil daily reward. Coba lagi nanti.');
    }
}

async function dailyChallengesCommand(ctx) {
    const player = ctx.player;
    
    if (!player) {
        return await safeReply(ctx, '❌ Kamu harus memulai game terlebih dahulu. Gunakan /start');
    }
    
    // Reset daily challenges if needed
    await DailyService.resetDailyChallenges(player);
    
    // Get today's challenges
    const challenges = DailyService.getDailyChallenges(player, 5);
    const completedToday = player.dailyChallengesCompleted || [];
    
    let message = `📋 *Daily Challenges*\n\n`;
    message += `Complete challenges for extra rewards!\n\n`;
    
    if (challenges.length === 0) {
        message += `🎉 All challenges completed for today!\n`;
        message += `Come back tomorrow for new challenges.`;
    } else {
        for (const challenge of challenges) {
            const isCompleted = completedToday.includes(challenge.id);
            const progress = player.dailyChallengeProgress?.get(challenge.id) || 0;
            
            if (isCompleted) {
                message += `✅ ${challenge.name}\n`;
                message += `   ${challenge.description} - COMPLETED!\n`;
            } else {
                message += `📝 ${challenge.name}\n`;
                message += `   ${challenge.description}\n`;
                message += `   Progress: ${progress}/${challenge.requirement}\n`;
                message += `   Reward: 💰${challenge.reward.gold} 💎${challenge.reward.gems} ⭐${challenge.reward.xp}\n`;
            }
            message += `\n`;
        }
    }
    
    const completedCount = completedToday.length;
    const totalChallenges = DailyService.getDailyChallenges(player, 5).length;
    message += `\n📊 Progress: ${completedCount}/${totalChallenges} challenges completed`;
    
    const keyboard = new InlineKeyboard()
        .text('🎁 Daily Reward', 'quick_daily')
        .text('🏹 Hunt', 'quick_hunt').row()
        .text('📜 Quests', 'quick_quest')
        .text('🔨 Craft', 'quick_craft').row()
        .text('🔄 Refresh', 'daily_challenges')
        .text('🔙 Back', 'quick_daily');
    
    if (ctx.callbackQuery) {
        await safeEditMessage(ctx, message, {
            parse_mode: 'Markdown',
            reply_markup: keyboard
        });
    } else {
        await safeReply(ctx, message, {
            parse_mode: 'Markdown',
            reply_markup: keyboard
        });
    }
}

module.exports = { dailyCommand, dailyChallengesCommand };
