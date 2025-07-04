const { InlineKeyboard } = require('grammy');
const { safeEditMessage, safeReply } = require('../utils/messageHelpers');
const { requirePlayer, requireAlive } = require('../middlewares/playerLoader');
const { canPerformAction, createCooldownMessage } = require('../utils/cooldown');
const CombatService = require('../services/combatService');
const AchievementService = require('../services/achievementService');
const Player = require('../models/Player');
const config = require('../../config');

async function huntCommand(ctx) {
    const player = ctx.player;
    
    if (!player) {
        return await ctx.reply('❌ Kamu harus memulai game terlebih dahulu. Gunakan /start');
    }
    
    if (player.hp <= 0) {
        return await ctx.reply('💀 HP kamu 0! Gunakan /heal untuk memulihkan HP terlebih dahulu.');
    }
    
    // Check cooldown
    const cooldownCheck = canPerformAction(player.lastHunt, config.GAME_CONFIG.COOLDOWNS.HUNT);
    if (!cooldownCheck.canPerform) {
        const keyboard = new InlineKeyboard()
            .text("❤️ Heal", "quick_heal")
            .text("🗺️ Adventure", "quick_adventure").row()
            .text("🔨 Work", "quick_work")
            .text("👤 Profile", "quick_profile");
            
        return await ctx.reply(
            createCooldownMessage('hunt', cooldownCheck.remaining),
            { reply_markup: keyboard }
        );
    }
    
    // Show hunting message
    const huntingMessage = await ctx.reply('🏹 Sedang berburu monster...');
    
    try {
        // Perform hunt
        const result = await CombatService.hunt(player);
        
        // Reload player to get updated HP
        const updatedPlayer = await Player.findById(player._id);
        
        // Check for safety
        if (!updatedPlayer) {
            throw new Error('Player not found after hunt');
        }
        
        // Check for new achievements
        const newAchievements = await AchievementService.checkAchievements(updatedPlayer);
        
        if (result.victory) {
            let message = 
                `🏹 *Hunt Berhasil!*\n\n` +
                `⚔️ Kamu mengalahkan **${result.monster.name}**!\n\n` +
                `💰 +${result.gold} Gold\n` +
                `⭐ +${result.xp} XP`;
            
            // Add level up info
            if (result.levelUps && result.levelUps.length > 0) {
                for (const levelUp of result.levelUps) {
                    message += `\n🎉 **LEVEL UP!** ${levelUp.from} → ${levelUp.to}`;
                }
            }
            
            // Add item drops
            if (Object.keys(result.items).length > 0) {
                message += '\n\n🎁 **Item Drops:**';
                for (const [itemName, quantity] of Object.entries(result.items)) {
                    message += `\n• ${itemName} x${quantity}`;
                }
            }
            
            // Add achievements
            if (newAchievements && newAchievements.length > 0) {
                message += '\n\n🏆 **Achievement Unlocked:**';
                for (const achievement of newAchievements) {
                    message += `\n• ${achievement.icon} ${achievement.name}`;
                }
            }
            
            if (result.damage > 0) {
                message += `\n\n💔 Kamu kehilangan ${result.damage} HP`;
            }
            
            message += `\n\n❤️ HP: ${updatedPlayer.hp}/${updatedPlayer.maxHp}`;
            
            const keyboard = new InlineKeyboard()
                .text("🏹 Hunt Lagi", "quick_hunt")
                .text("🗺️ Adventure", "quick_adventure").row()
                .text("🏰 Dungeon", "dungeon_list")
                .text("👤 Profile", "quick_profile").row();
                
            if (updatedPlayer.hp < updatedPlayer.maxHp * 0.3) {
                keyboard.text("❤️ Heal", "quick_heal");
            }
            
            await safeEditMessage(ctx, 
                ctx.chat.id,
                huntingMessage.message_id,
                message,
                {
                    parse_mode: 'Markdown',
                    reply_markup: keyboard
                }
            );
        } else {
            const message = 
                `💀 *Hunt Gagal!*\n\n` +
                `⚔️ **${result.monster.name}** terlalu kuat!\n\n` +
                `💔 Kamu kehilangan ${result.damage} HP\n` +
                `❤️ HP: ${updatedPlayer.hp}/${updatedPlayer.maxHp}\n\n` +
                `💡 *Tips:* Tingkatkan level atau equipment kamu!`;
            
            const keyboard = new InlineKeyboard()
                .text('❤️ Heal', 'quick_heal')
                .text('🏪 Shop', 'shop_category_weapon').row()
                .text('🗺️ Adventure', 'quick_adventure')
                .text('🔨 Work', 'quick_work');
            
            await safeEditMessage(ctx, 
                ctx.chat.id,
                huntingMessage.message_id,
                message,
                {
                    parse_mode: 'Markdown',
                    reply_markup: keyboard
                }
            );
        }
        
        // Update last hunt time - reload player to get updated HP
        await Player.updateOne(
            { _id: player._id },
            { lastHunt: new Date() }
        );
        
    } catch (error) {
        console.error('Hunt error:', error);
        await safeEditMessage(ctx, 
            ctx.chat.id,
            huntingMessage.message_id,
            '❌ Terjadi error saat berburu. Silakan coba lagi.'
        );
    }
}

module.exports = huntCommand;

