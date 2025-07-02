const { InlineKeyboard } = require("grammy");
const { requirePlayer } = require('../middlewares/playerLoader');
const PlayerService = require('../services/playerService');
const { getItemRarityEmoji, getProgressBar, formatNumber } = require('../utils/common');
const { safeEditMessage, safeReply } = require('../utils/messageHelpers');

async function profileCommand(ctx) {
    const player = ctx.player;
    
    if (!player) {
        return await ctx.reply('❌ Kamu harus memulai game terlebih dahulu. Gunakan /start');
    }
    
    const xpNeeded = player.level * 100;
    const xpProgress = getProgressBar(player.xp, xpNeeded, 10);
    const hpProgress = getProgressBar(player.hp, player.maxHp, 10);
    
    // Get equipment info
    const equipment = PlayerService.getFormattedEquipment(player);
    
    // Format equipment display
    let equipmentText = '';
    for (const [slot, item] of Object.entries(equipment)) {
        if (item) {
            const emoji = getItemRarityEmoji(item.rarity);
            const stats = [];
            if (item.stats.attack > 0) stats.push(`⚔️${item.stats.attack}`);
            if (item.stats.defense > 0) stats.push(`🛡️${item.stats.defense}`);
            if (item.stats.hp > 0) stats.push(`❤️${item.stats.hp}`);
            
            equipmentText += `• ${slot}: ${emoji} ${item.name}`;
            if (stats.length > 0) {
                equipmentText += ` (${stats.join(', ')})`;
            }
            equipmentText += '\n';
        } else {
            equipmentText += `• ${slot}: -\n`;
        }
    }
    
    // Calculate total stats from equipment
    let totalAttack = 10; // Base attack
    let totalDefense = 5; // Base defense
    let totalHp = 100; // Base HP
    
    // Add level bonuses
    totalAttack += (player.level - 1) * 2;
    totalDefense += (player.level - 1) * 1;
    totalHp += (player.level - 1) * 10;
    
    const profileMessage = 
        `👤 *Profil ${player.username}*\n\n` +
        `🎯 Level: ${player.level}\n` +
        `⭐ XP: ${player.xp}/${xpNeeded}\n` +
        `${xpProgress} (${Math.floor((player.xp / xpNeeded) * 100)}%)\n\n` +
        `❤️ HP: ${player.hp}/${player.maxHp}\n` +
        `${hpProgress}\n\n` +
        `⚔️ Attack: ${player.attack}\n` +
        `🛡️ Defense: ${player.defense}\n` +
        `💰 Gold: ${formatNumber(player.gold)}\n` +
        `💎 Gems: ${formatNumber(player.gems)}\n\n` +
        `🎒 *Equipment:*\n${equipmentText}\n` +
        `📊 *Statistics:*\n` +
        `• Total Hunts: ${player.stats.totalHunts}\n` +
        `• Monsters Killed: ${player.stats.monstersKilled}\n` +
        `• Dungeons Completed: ${player.stats.totalDungeons}\n` +
        `• Bosses Killed: ${player.stats.bossesKilled}\n` +
        `• Total Gold Earned: ${formatNumber(player.stats.goldEarned)}\n` +
        `• Items Crafted: ${player.stats.itemsCrafted}\n\n` +
        `🏆 Achievements: ${player.achievements.length}`;
    
    const keyboard = new InlineKeyboard()
        .text("🎒 Inventory", "inv_category_all")
        .text("📜 Quests", "quest_type_active").row()
        .text("🏆 Achievements", "achievements")
        .text("⚙️ Settings", "settings").row()
        .text("🔄 Refresh", "refresh_profile");
    
    if (ctx.callbackQuery) {
        await safeEditMessage(ctx, profileMessage, {
            parse_mode: 'Markdown',
            reply_markup: keyboard
        });
    } else {
        await safeReply(ctx, profileMessage, {
            parse_mode: 'Markdown',
            reply_markup: keyboard
        });
    }
}

module.exports = profileCommand;

