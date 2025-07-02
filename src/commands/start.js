const { InlineKeyboard } = require('grammy');
const { safeEditMessage, safeReply } = require('../utils/messageHelpers');
const { requirePlayer } = require("../middlewares/playerLoader");

async function startCommand(ctx) {
    const player = ctx.player;
    
    if (!player) {
        // This shouldn't happen due to playerLoader middleware, but just in case
        return await ctx.reply("❌ Terjadi error saat memuat data player.");
    }
    
    const welcomeMessage =
        `🎮 *Selamat datang di RPG Telegram!*\n\n` +
        `Halo, ${player.username}!\n` +
        `Level: ${player.level} | HP: ${player.hp}/${player.maxHp} | Gold: ${player.gold}\n\n` +
        `Gunakan tombol di bawah untuk berinteraksi dengan game.`;
    
    await safeReply(ctx, welcomeMessage, {
        parse_mode: "Markdown",
        reply_markup: new InlineKeyboard()
            .text("🏹 Hunt", "quick_hunt")
            .text("🗺️ Adventure", "quick_adventure").row()
            .text("🔨 Work", "quick_work")
            .text("🎁 Daily", "quick_daily").row()
            .text("👤 Profile", "quick_profile")
            .text("🎒 Inventory", "quick_inventory").row()
            .text("🏪 Shop", "shop_main")
            .text("⚒️ Craft", "quick_craft").row()
            .text("📜 Quests", "quest_type_available")
            .text("🏰 Guild", "refresh_guild").row()
            .text("🏆 Leaderboard", "quick_leaderboard")
            .text("❓ Help", "quick_help")
    });
}

module.exports = startCommand;;

