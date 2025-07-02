const { InlineKeyboard } = require("grammy");
const { requirePlayer } = require('../middlewares/playerLoader');
const { canPerformAction, createCooldownMessage } = require('../utils/cooldown');
const PlayerService = require('../services/playerService');
const QuestService = require('../services/questService');
const { getRandomInt, getRandomElement } = require('../utils/common');
const config = require('../../config');

async function workCommand(ctx) {
    const player = ctx.player;
    
    if (!player) {
        return await ctx.reply('❌ Kamu harus memulai game terlebih dahulu. Gunakan /start');
    }
    
    // Check cooldown
    const cooldownCheck = canPerformAction(player.lastWork, config.GAME_CONFIG.COOLDOWNS.WORK);
    if (!cooldownCheck.canPerform) {
        const keyboard = new InlineKeyboard()
            .text('🏹 Hunt', 'quick_hunt')
            .text('🗺️ Adventure', 'quick_adventure').row()
            .text('❤️ Heal', 'quick_heal')
            .text('👤 Profile', 'quick_profile');
            
        return await ctx.reply(
            createCooldownMessage('work', cooldownCheck.remaining),
            { reply_markup: keyboard }
        );
    }
    
    // Show work message
    const workMessage = await ctx.reply('🔨 Sedang bekerja...');
    
    try {
        // Generate work result
        const jobs = [
            {
                name: 'Mining',
                description: 'Kamu menambang di gua dan menemukan mineral',
                gold: getRandomInt(15, 25),
                materials: ['Stone', 'Iron Ore'],
                emoji: '⛏️'
            },
            {
                name: 'Woodcutting',
                description: 'Kamu menebang pohon di hutan',
                gold: getRandomInt(10, 20),
                materials: ['Wood'],
                emoji: '🪓'
            },
            {
                name: 'Fishing',
                description: 'Kamu memancing di danau yang tenang',
                gold: getRandomInt(12, 22),
                materials: ['Fish'],
                emoji: '🎣'
            },
            {
                name: 'Farming',
                description: 'Kamu bekerja di ladang dan memanen hasil',
                gold: getRandomInt(8, 18),
                materials: ['Apple', 'Wood'],
                emoji: '🌾'
            },
            {
                name: 'Blacksmithing',
                description: 'Kamu membantu pandai besi membuat peralatan',
                gold: getRandomInt(20, 30),
                materials: ['Iron Ore', 'Stone'],
                emoji: '🔨'
            }
        ];
        
        const job = getRandomElement(jobs);
        
        // Award gold
        await PlayerService.addGold(player, job.gold);
        
        // Award materials
        const earnedMaterials = {};
        for (const material of job.materials) {
            const chance = Math.random();
            if (chance < 0.7) { // 70% chance to get material
                const quantity = getRandomInt(1, 3);
                await PlayerService.addItem(player, material, quantity);
                earnedMaterials[material] = quantity;
                
                // Update quest progress for collection
                await QuestService.updateQuestProgress(player, 'item_collected', {
                    itemName: material,
                    amount: quantity
                });
            }
        }
        
        // Update quest progress
        await QuestService.updateQuestProgress(player, 'work');
        
        // Update stats
        await PlayerService.updateStats(player, {
            goldEarned: job.gold
        });
        
        // Check achievements
        const achievements = await PlayerService.checkAchievements(player);
        
        let message = 
            `🔨 **Work Berhasil!**\n\n` +
            `${job.emoji} **${job.name}**\n` +
            `${job.description}\n\n` +
            `💰 +${job.gold} Gold`;
        
        // Add materials earned
        if (Object.keys(earnedMaterials).length > 0) {
            message += '\n\n🎁 **Materials Earned:**';
            for (const [material, quantity] of Object.entries(earnedMaterials)) {
                message += `\n• ${material} x${quantity}`;
            }
        } else {
            message += '\n\n😔 Tidak mendapat material kali ini.';
        }
        
        // Add achievements
        if (achievements && achievements.length > 0) {
            message += '\n\n🏆 **Achievement Unlocked:**';
            for (const achievement of achievements) {
                message += `\n• ${achievement.name}`;
            }
        }
        
        message += `\n\n💰 Total Gold: ${player.gold}`;
        
        const keyboard = new InlineKeyboard()
            .text('🔨 Work Lagi', 'quick_work')
            .text('🏹 Hunt', 'quick_hunt').row()
            .text('🎒 Inventory', 'quick_inventory')
            .text('🏪 Shop', 'shop_main').row()
            .text('⚒️ Craft', 'craft_category_all')
            .text('👤 Profile', 'quick_profile');
        
        await ctx.api.editMessageText(
            ctx.chat.id,
            workMessage.message_id,
            message,
            {
                parse_mode: 'Markdown',
                reply_markup: keyboard
            }
        );
        
        // Update last work time
        player.lastWork = new Date();
        await player.save();
        
    } catch (error) {
        console.error('Work error:', error);
        await ctx.api.editMessageText(
            ctx.chat.id,
            workMessage.message_id,
            '❌ Terjadi error saat bekerja. Silakan coba lagi.'
        );
    }
}

module.exports = workCommand;

