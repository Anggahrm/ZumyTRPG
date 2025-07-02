const { InlineKeyboard } = require('grammy');
const { requirePlayer, requireAlive } = require('../middlewares/playerLoader');
const { canPerformAction, createCooldownMessage } = require('../utils/cooldown');
const CombatService = require('../services/combatService');
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
            if (result.achievements && result.achievements.length > 0) {
                message += '\n\n🏆 **Achievement Unlocked:**';
                for (const achievement of result.achievements) {
                    message += `\n• ${achievement.name}`;
                }
            }
            
            if (result.damage > 0) {
                message += `\n\n💔 Kamu kehilangan ${result.damage} HP`;
            }
            
            message += `\n\n❤️ HP: ${player.hp}/${player.maxHp}`;
            
            const keyboard = new InlineKeyboard()
                .text("🏹 Hunt Lagi", "quick_hunt")
                .text("🗺️ Adventure", "quick_adventure").row()
                .text("🏰 Dungeon", "dungeon_list")
                .text("👤 Profile", "quick_profile").row();
                
            if (player.hp < player.maxHp * 0.3) {
                keyboard.text("❤️ Heal", "quick_heal");
            }
            
            await ctx.api.editMessageText(
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
                `❤️ HP: ${player.hp}/${player.maxHp}\n\n` +
                `💡 *Tips:* Tingkatkan level atau equipment kamu!`;
            
            const keyboard = new InlineKeyboard()
                .text('❤️ Heal', 'quick_heal')
                .text('🏪 Shop', 'shop_category_weapon').row()
                .text('🗺️ Adventure', 'quick_adventure')
                .text('🔨 Work', 'quick_work');
            
            await ctx.api.editMessageText(
                ctx.chat.id,
                huntingMessage.message_id,
                message,
                {
                    parse_mode: 'Markdown',
                    reply_markup: keyboard
                }
            );
        }
        
        // Update last hunt time
        player.lastHunt = new Date();
        await player.save();
        
    } catch (error) {
        console.error('Hunt error:', error);
        await ctx.api.editMessageText(
            ctx.chat.id,
            huntingMessage.message_id,
            '❌ Terjadi error saat berburu. Silakan coba lagi.'
        );
    }
}

module.exports = huntCommand;

