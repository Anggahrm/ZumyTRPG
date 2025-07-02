const { InlineKeyboard } = require("grammy");
const { requirePlayer } = require('../middlewares/playerLoader');
const AchievementService = require('../services/achievementService');
const { getProgressBar, formatNumber } = require('../utils/common');
const { safeEditMessage, safeReply } = require('../utils/messageHelpers');

async function achievementsCommand(ctx) {
    const player = ctx.player;
    
    if (!player) {
        return await safeReply(ctx, '❌ Kamu harus memulai game terlebih dahulu. Gunakan /start');
    }
    
    const playerAchievements = AchievementService.getPlayerAchievements(player);
    const categories = ['all', 'unlocked', 'locked'];
    
    // Handle different types of ctx.match
    let currentCategory = 'all';
    if (ctx.match) {
        if (Array.isArray(ctx.match) && ctx.match.length > 2) {
            // From regex callback like achievements_category_(.+)_(.+)
            currentCategory = ctx.match[2] || 'all';
        } else if (typeof ctx.match === 'string') {
            // From string match, extract category
            const parts = ctx.match.split('_');
            currentCategory = parts[2] || 'all';
        }
    }
    
    let filteredAchievements = playerAchievements;
    
    switch (currentCategory) {
        case 'unlocked':
            filteredAchievements = playerAchievements.filter(a => a.unlocked);
            break;
        case 'locked':
            filteredAchievements = playerAchievements.filter(a => !a.unlocked);
            break;
        default:
            // Show all
            break;
    }
    
    // Sort: unlocked first, then by progress
    filteredAchievements.sort((a, b) => {
        if (a.unlocked && !b.unlocked) return -1;
        if (!a.unlocked && b.unlocked) return 1;
        if (!a.unlocked && !b.unlocked) {
            return b.progress.percentage - a.progress.percentage;
        }
        return 0;
    });
    
    const totalAchievements = playerAchievements.length;
    const unlockedCount = playerAchievements.filter(a => a.unlocked).length;
    const completionPercentage = Math.floor((unlockedCount / totalAchievements) * 100);
    
    let message = `🏆 *Achievements* (${unlockedCount}/${totalAchievements})\n`;
    message += `${getProgressBar(unlockedCount, totalAchievements, 10)} ${completionPercentage}%\n\n`;
    
    if (filteredAchievements.length === 0) {
        message += `📭 Tidak ada achievement di kategori "${currentCategory}".`;
    } else {
        // Show first 8 achievements
        let page = 0;
        if (ctx.match) {
            if (Array.isArray(ctx.match) && ctx.match.length > 3) {
                page = parseInt(ctx.match[3]) || 0;
            } else if (typeof ctx.match === 'string') {
                const parts = ctx.match.split('_');
                page = parseInt(parts[3]) || 0;
            }
        }
        const itemsPerPage = 8;
        const startIndex = page * itemsPerPage;
        const endIndex = Math.min(startIndex + itemsPerPage, filteredAchievements.length);
        const pageAchievements = filteredAchievements.slice(startIndex, endIndex);
        
        for (const achievement of pageAchievements) {
            if (achievement.unlocked) {
                message += `✅ ${achievement.icon} *${achievement.name}*\n`;
                message += `   ${achievement.description}\n`;
                
                const rewardText = [];
                if (achievement.reward.gold) {
                    rewardText.push(`💰 ${formatNumber(achievement.reward.gold)}`);
                }
                if (achievement.reward.gems) {
                    rewardText.push(`💎 ${achievement.reward.gems}`);
                }
                message += `   Reward: ${rewardText.join(', ')}\n\n`;
            } else {
                message += `🔒 ${achievement.icon} *${achievement.name}*\n`;
                message += `   ${achievement.description}\n`;
                message += `   Progress: ${achievement.progress.current}/${achievement.progress.required} `;
                message += `${getProgressBar(achievement.progress.current, achievement.progress.required, 8)}\n\n`;
            }
        }
        
        // Add pagination info
        const totalPages = Math.ceil(filteredAchievements.length / itemsPerPage);
        if (totalPages > 1) {
            message += `📄 Page ${page + 1}/${totalPages}`;
        }
    }
    
    // Create keyboard
    const keyboard = new InlineKeyboard();
    
    // Category buttons
    keyboard.text(currentCategory === 'all' ? '📋 Semua ✓' : '📋 Semua', 'achievements_category_all_0')
           .text(currentCategory === 'unlocked' ? '✅ Unlocked ✓' : '✅ Unlocked', 'achievements_category_unlocked_0')
           .text(currentCategory === 'locked' ? '🔒 Locked ✓' : '🔒 Locked', 'achievements_category_locked_0').row();
    
    // Pagination for current category
    if (filteredAchievements.length > 8) {
        let page = 0;
        if (ctx.match) {
            if (Array.isArray(ctx.match) && ctx.match.length > 3) {
                page = parseInt(ctx.match[3]) || 0;
            } else if (typeof ctx.match === 'string') {
                const parts = ctx.match.split('_');
                page = parseInt(parts[3]) || 0;
            }
        }
        const totalPages = Math.ceil(filteredAchievements.length / 8);
        
        if (page > 0) {
            keyboard.text('⬅️ Previous', `achievements_category_${currentCategory}_${page - 1}`);
        }
        if (page < totalPages - 1) {
            keyboard.text('➡️ Next', `achievements_category_${currentCategory}_${page + 1}`);
        }
        keyboard.row();
    }
    
    keyboard.text('🔄 Refresh', `achievements_category_${currentCategory}_0`)
           .text('🔙 Back', 'back_to_profile');
    
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

module.exports = achievementsCommand;
