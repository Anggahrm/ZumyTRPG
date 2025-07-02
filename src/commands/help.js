const { InlineKeyboard } = require("grammy");
const { safeEditMessage, safeReply } = require('../utils/messageHelpers');

async function helpCommand(ctx) {
    const helpMessage = 
        `❓ *RPG Telegram Bot - Help*\n\n` +
        `🎮 **Basic Commands:**\n` +
        `• /start - Mulai game dan lihat menu utama\n` +
        `• /profile - Lihat profil dan stats kamu\n` +
        `• /help - Tampilkan bantuan ini\n\n` +
        `⚔️ **Combat & Adventure:**\n` +
        `• /hunt - Berburu monster untuk XP dan gold\n` +
        `• /adventure - Petualangan untuk XP bonus\n` +
        `• /dungeon - Masuk dungeon untuk tantangan besar\n` +
        `• /duel - Duel dengan bot player\n\n` +
        `🔨 **Work & Economy:**\n` +
        `• /work - Bekerja untuk gold dan material\n` +
        `• /daily - Ambil bonus harian\n` +
        `• /shop - Beli equipment dan item\n` +
        `• /craft - Craft equipment dari material\n\n` +
        `🎒 **Inventory & Items:**\n` +
        `• /inventory - Lihat inventory kamu\n` +
        `• /heal - Gunakan item untuk heal HP\n\n` +
        `📜 **Quests & Progression:**\n` +
        `• /quest - Lihat dan kelola quest\n` +
        `• /achievements - Lihat dan unlock achievements\n` +
        `• /leaderboard - Lihat ranking player\n\n` +
        `🏰 **Guild System:**\n` +
        `• /guild - Menu guild (join, create, manage)\n` +
        `• /guild create <name> <tag> - Buat guild baru\n` +
        `• /guild join <name> - Bergabung dengan guild\n` +
        `• /guild contribute <amount> - Kontribusi ke guild\n\n` +
        `💡 **Tips:**\n` +
        `• Gunakan keyboard buttons untuk navigasi cepat\n` +
        `• Selesaikan quest untuk rewards besar\n` +
        `• Bergabung dengan guild untuk bonus\n` +
        `• Upgrade equipment untuk combat yang lebih baik`;
    
    const keyboard = new InlineKeyboard()
        .text('🎮 Main Menu', 'quick_start')
        .text('👤 Profile', 'quick_profile').row()
        .text('📜 Quests', 'quest_type_available')
        .text('🏆 Achievements', 'achievements').row()
        .text('🏰 Guild', 'refresh_guild')
        .text('🏆 Leaderboard', 'leaderboard_level');
    
    if (ctx.callbackQuery) {
        await safeEditMessage(ctx, helpMessage, {
            parse_mode: 'Markdown',
            reply_markup: keyboard
        });
    } else {
        await safeReply(ctx, helpMessage, {
            parse_mode: 'Markdown',
            reply_markup: keyboard
        });
    }
}

module.exports = helpCommand;

