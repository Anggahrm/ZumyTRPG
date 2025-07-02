const { InlineKeyboard } = require('grammy');
const { safeEditMessage, safeReply } = require('../utils/messageHelpers');
const { requirePlayer, requireAlive } = require('../middlewares/playerLoader');
const { canPerformAction, createCooldownMessage } = require('../utils/cooldown');
const PlayerService = require('../services/playerService');
const QuestService = require('../services/questService');
const { getRandomInt } = require('../utils/common');
const config = require('../../config');

async function adventureCommand(ctx) {
    const player = ctx.player;
    
    if (!player) {
        return await ctx.reply('❌ Kamu harus memulai game terlebih dahulu. Gunakan /start');
    }
    
    if (player.hp <= 0) {
        return await ctx.reply('💀 HP kamu 0! Gunakan /heal untuk memulihkan HP terlebih dahulu.');
    }
    
    // Check cooldown
    const cooldownCheck = canPerformAction(player.lastAdventure, config.GAME_CONFIG.COOLDOWNS.ADVENTURE);
    if (!cooldownCheck.canPerform) {
        const keyboard = new InlineKeyboard()
            .text("🏹 Hunt", "quick_hunt")
            .text("🔨 Work", "quick_work").row()
            .text("❤️ Heal", "quick_heal")
            .text("👤 Profile", "quick_profile");
            
        return await ctx.reply(
            createCooldownMessage('adventure', cooldownCheck.remaining),
            { reply_markup: keyboard }
        );
    }
    
    // Show adventure message
    const adventureMessage = await ctx.reply('🗺️ Memulai petualangan...');
    
    try {
        // Generate adventure result
        const adventures = [
            {
                name: 'Mysterious Cave',
                description: 'Kamu menemukan gua misterius dan mengeksplorasi dalamnya',
                xp: getRandomInt(20, 40),
                gold: getRandomInt(10, 30),
                risk: 0.1
            },
            {
                name: 'Ancient Ruins',
                description: 'Kamu menjelajahi reruntuhan kuno yang penuh dengan harta',
                xp: getRandomInt(30, 50),
                gold: getRandomInt(20, 40),
                risk: 0.15
            },
            {
                name: 'Enchanted Forest',
                description: 'Kamu berjalan melalui hutan yang dipenuhi sihir',
                xp: getRandomInt(25, 45),
                gold: getRandomInt(15, 35),
                risk: 0.12
            },
            {
                name: 'Mountain Peak',
                description: 'Kamu mendaki puncak gunung dan menikmati pemandangan',
                xp: getRandomInt(35, 55),
                gold: getRandomInt(25, 45),
                risk: 0.2
            },
            {
                name: 'Desert Oasis',
                description: 'Kamu menemukan oasis tersembunyi di tengah gurun',
                xp: getRandomInt(40, 60),
                gold: getRandomInt(30, 50),
                risk: 0.18
            }
        ];
        
        const adventure = adventures[Math.floor(Math.random() * adventures.length)];
        
        // Check if adventure is successful
        const isSuccessful = Math.random() > adventure.risk;
        
        if (isSuccessful) {
            // Successful adventure
            const xpResult = await PlayerService.addXp(player, adventure.xp);
            await PlayerService.addGold(player, adventure.gold);
            
            // Update quest progress
            await QuestService.updateQuestProgress(player, 'adventure');
            
            // Check achievements
            const achievements = await PlayerService.checkAchievements(player);
            
            let message = 
                `🗺️ **Adventure Berhasil!**\n\n` +
                `🌟 **${adventure.name}**\n` +
                `${adventure.description}\n\n` +
                `💰 +${adventure.gold} Gold\n` +
                `⭐ +${adventure.xp} XP`;
            
            // Add level up info
            if (xpResult.levelUps && xpResult.levelUps.length > 0) {
                for (const levelUp of xpResult.levelUps) {
                    message += `\n🎉 **LEVEL UP!** ${levelUp.from} → ${levelUp.to}`;
                }
            }
            
            // Add achievements
            if (achievements && achievements.length > 0) {
                message += '\n\n🏆 **Achievement Unlocked:**';
                for (const achievement of achievements) {
                    message += `\n• ${achievement.name}`;
                }
            }
            
            message += `\n\n❤️ HP: ${player.hp}/${player.maxHp}`;
            
            const keyboard = new InlineKeyboard()
                .text("🗺️ Adventure Lagi", "quick_adventure")
                .text("🏹 Hunt", "quick_hunt").row()
                .text("🔨 Work", "quick_work")
                .text("👤 Profile", "quick_profile");
            
            await safeEditMessage(ctx, 
                ctx.chat.id,
                adventureMessage.message_id,
                message,
                {
                    parse_mode: 'Markdown',
                    reply_markup: keyboard
                }
            );
        } else {
            // Failed adventure
            const damage = getRandomInt(5, 15);
            await PlayerService.damagePlayer(player, damage);
            
            const message = 
                `💀 **Adventure Gagal!**\n\n` +
                `🌟 **${adventure.name}**\n` +
                `${adventure.description}\n\n` +
                `⚠️ Tapi kamu menghadapi bahaya!\n` +
                `💔 Kamu kehilangan ${damage} HP\n` +
                `❤️ HP: ${player.hp}/${player.maxHp}\n\n` +
                `💡 *Tips:* Tingkatkan level untuk adventure yang lebih aman!`;
            
            const keyboard = new InlineKeyboard()
                .text('❤️ Heal', 'quick_heal')
                .text('🏹 Hunt', 'quick_hunt').row()
                .text('🔨 Work', 'quick_work')
                .text('👤 Profile', 'quick_profile');
            
            await safeEditMessage(ctx, 
                ctx.chat.id,
                adventureMessage.message_id,
                message,
                {
                    parse_mode: 'Markdown',
                    reply_markup: keyboard
                }
            );
        }
        
        // Update last adventure time
        player.lastAdventure = new Date();
        await player.save();
        
    } catch (error) {
        console.error('Adventure error:', error);
        await safeEditMessage(ctx, 
            ctx.chat.id,
            adventureMessage.message_id,
            '❌ Terjadi error saat adventure. Silakan coba lagi.'
        );
    }
}

module.exports = adventureCommand;

