const { InlineKeyboard } = require('grammy');
const { safeEditMessage, safeReply } = require('../utils/messageHelpers');
const { requirePlayer } = require('../middlewares/playerLoader');
const { canPerformAction, createCooldownMessage } = require('../utils/cooldown');
const PlayerService = require('../services/playerService');
const QuestService = require('../services/questService');
const { getRandomInt, getRandomElement, formatNumber } = require('../utils/common');
const config = require('../../config');

async function dailyCommand(ctx) {
    const player = ctx.player;
    
    if (!player) {
        return await ctx.reply('❌ Kamu harus memulai game terlebih dahulu. Gunakan /start');
    }
    
    // Check cooldown (24 hours)
    const cooldownCheck = canPerformAction(player.lastDaily, config.GAME_CONFIG.COOLDOWNS.DAILY);
    if (!cooldownCheck.canPerform) {
        const nextDaily = new Date(player.lastDaily.getTime() + (24 * 60 * 60 * 1000));
        const timeUntilNext = nextDaily - new Date();
        const hoursLeft = Math.floor(timeUntilNext / (1000 * 60 * 60));
        const minutesLeft = Math.floor((timeUntilNext % (1000 * 60 * 60)) / (1000 * 60));
        
        const message = 
            `🎁 *Daily Bonus*\n\n` +
            `⏰ Kamu sudah mengambil daily bonus hari ini!\n\n` +
            `⏳ Next daily bonus: ${hoursLeft}h ${minutesLeft}m\n\n` +
            `💡 Daily bonus reset setiap 24 jam.`;
        
        const keyboard = new InlineKeyboard()
            .text('🏹 Hunt', 'quick_hunt')
            .text('🗺️ Adventure', 'quick_adventure').row()
            .text('🔨 Work', 'quick_work')
            .text('👤 Profile', 'quick_profile');
            
        return await safeReply(ctx, message, {
            parse_mode: 'Markdown',
            reply_markup: keyboard
        });
    }
    
    // Show daily bonus message
    const dailyMessage = await ctx.reply('🎁 Mengambil daily bonus...');
    
    try {
        // Calculate daily bonus based on level and streak
        const baseGold = 50 + (player.level * 10);
        const baseXp = 25 + (player.level * 5);
        
        // Calculate streak bonus (placeholder - could be implemented later)
        const streakMultiplier = 1.0; // Could be based on consecutive days
        
        const goldReward = Math.floor(baseGold * streakMultiplier);
        const xpReward = Math.floor(baseXp * streakMultiplier);
        
        // Award rewards
        const xpResult = await PlayerService.addXp(player, xpReward);
        await PlayerService.addGold(player, goldReward);
        
        // Random bonus items
        const bonusItems = [
            { name: 'Health Potion', chance: 0.3, quantity: [1, 2] },
            { name: 'Apple', chance: 0.5, quantity: [2, 4] },
            { name: 'Fish', chance: 0.4, quantity: [1, 3] },
            { name: 'Wood', chance: 0.6, quantity: [3, 6] },
            { name: 'Stone', chance: 0.5, quantity: [2, 5] },
            { name: 'Iron Ore', chance: 0.2, quantity: [1, 2] },
            { name: 'Gold Ore', chance: 0.1, quantity: [1, 1] },
            { name: 'Mana Potion', chance: 0.15, quantity: [1, 1] }
        ];
        
        const earnedItems = {};
        for (const item of bonusItems) {
            if (Math.random() < item.chance) {
                const quantity = getRandomInt(item.quantity[0], item.quantity[1]);
                await PlayerService.addItem(player, item.name, quantity);
                earnedItems[item.name] = quantity;
            }
        }
        
        // Special level milestone rewards
        let milestoneReward = null;
        if (player.level >= 10 && player.level % 5 === 0) {
            const milestoneRewards = [
                { name: 'Lucky Charm', level: 10 },
                { name: 'Greater Health Potion', level: 15 },
                { name: 'Teleport Scroll', level: 20 },
                { name: 'Mithril Ore', level: 25 }
            ];
            
            const reward = milestoneRewards.find(r => r.level === player.level);
            if (reward) {
                await PlayerService.addItem(player, reward.name, 1);
                milestoneReward = reward.name;
            }
        }
        
        // Update quest progress
        await QuestService.updateQuestProgress(player, 'daily');
        
        // Update stats
        await PlayerService.updateStats(player, {
            goldEarned: goldReward
        });
        
        // Check achievements
        const achievements = await PlayerService.checkAchievements(player);
        
        let message = 
            `🎁 **Daily Bonus Claimed!**\n\n` +
            `💰 +${formatNumber(goldReward)} Gold\n` +
            `⭐ +${xpReward} XP`;
        
        // Add level up info
        if (xpResult.levelUps && xpResult.levelUps.length > 0) {
            for (const levelUp of xpResult.levelUps) {
                message += `\n🎉 **LEVEL UP!** ${levelUp.from} → ${levelUp.to}`;
            }
        }
        
        // Add bonus items
        if (Object.keys(earnedItems).length > 0) {
            message += '\n\n🎁 **Bonus Items:**';
            for (const [itemName, quantity] of Object.entries(earnedItems)) {
                message += `\n• ${itemName} x${quantity}`;
            }
        }
        
        // Add milestone reward
        if (milestoneReward) {
            message += `\n\n🌟 **Level ${player.level} Milestone Reward:**\n• ${milestoneReward} x1`;
        }
        
        // Add achievements
        if (achievements && achievements.length > 0) {
            message += '\n\n🏆 **Achievement Unlocked:**';
            for (const achievement of achievements) {
                message += `\n• ${achievement.name}`;
            }
        }
        
        message += `\n\n💰 Total Gold: ${formatNumber(player.gold)}`;
        message += `\n⏰ Next daily bonus: 24 hours`;
        
        const keyboard = new InlineKeyboard()
            .text('🏹 Hunt', 'quick_hunt')
            .text('🗺️ Adventure', 'quick_adventure').row()
            .text('🔨 Work', 'quick_work')
            .text('🎒 Inventory', 'quick_inventory').row()
            .text('📜 Quests', 'quest_type_daily')
            .text('👤 Profile', 'quick_profile');
        
        await safeEditMessage(ctx, 
            ctx.chat.id,
            dailyMessage.message_id,
            message,
            {
                parse_mode: 'Markdown',
                reply_markup: keyboard
            }
        );
        
        // Update last daily time
        player.lastDaily = new Date();
        await player.save();
        
    } catch (error) {
        console.error('Daily error:', error);
        await safeEditMessage(ctx, 
            ctx.chat.id,
            dailyMessage.message_id,
            '❌ Terjadi error saat mengambil daily bonus. Silakan coba lagi.'
        );
    }
}

module.exports = dailyCommand;

