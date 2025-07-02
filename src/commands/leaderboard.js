const { InlineKeyboard } = require('grammy');
const PlayerService = require('../services/playerService');
const GuildService = require('../services/guildService');
const QuestService = require('../services/questService');
const { safeEditMessage, safeReply } = require('../utils/messageHelpers');

// Main leaderboard command
async function leaderboardCommand(ctx) {
    // Show leaderboard menu with different categorie
    const keyboard = new InlineKeyboard()
        .text('🏆 Level', 'leaderboard_level')
        .text('💰 Gold', 'leaderboard_gold').row()
        .text('⚔️ Monster Kills', 'leaderboard_monsters')
        .text('📜 Quests', 'leaderboard_quests').row()
        .text('🏰 Guilds', 'leaderboard_guilds').row()
        .text('📊 My Rank', 'my_ranking_menu')
        .text('🔙 Back', 'quick_start');
    
    const message = 
        `🏆 *Leaderboard Menu*\n\n` +
        `📊 Pilih kategori leaderboard yang ingin kamu lihat:\n\n` +
        `🏆 **Level** - Ranking berdasarkan level tertinggi\n` +
        `💰 **Gold** - Ranking berdasarkan gold terbanyak\n` +
        `⚔️ **Monster Kills** - Ranking berdasarkan monster yang dibunuh\n` +
        `📜 **Quests** - Ranking berdasarkan quest yang diselesaikan\n` +
        `🏰 **Guilds** - Ranking guild terbaik`;
    
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

// Handle leaderboard category selection
async function handleLeaderboardCategory(ctx, category) {
    try {
        let message = '';
        let leaderboard = [];
        
        switch (category) {
            case 'level':
                leaderboard = await PlayerService.getLeaderboard(10, 'level');
                message = `🏆 *Level Leaderboard*\n\n`;
                leaderboard.forEach((player, index) => {
                    const medal = getMedal(index);
                    message += `${medal} **${player.username}** - Lvl ${player.level} (${player.xp.toLocaleString()} XP)\n`;
                });
                break;
                
            case 'gold':
                leaderboard = await PlayerService.getLeaderboard(10, 'gold');
                message = `💰 *Gold Leaderboard*\n\n`;
                leaderboard.forEach((player, index) => {
                    const medal = getMedal(index);
                    message += `${medal} **${player.username}** - ${player.gold.toLocaleString()} Gold\n`;
                });
                break;
                
            case 'monsters':
                leaderboard = await PlayerService.getLeaderboard(10, 'monstersKilled');
                message = `⚔️ *Monster Kills Leaderboard*\n\n`;
                leaderboard.forEach((player, index) => {
                    const medal = getMedal(index);
                    const kills = player.stats?.monstersKilled || 0;
                    message += `${medal} **${player.username}** - ${kills.toLocaleString()} Kills\n`;
                });
                break;
                
            case 'quests':
                leaderboard = await QuestService.getQuestLeaderboard(10);
                message = `📜 *Quest Leaderboard*\n\n`;
                leaderboard.forEach((player, index) => {
                    const medal = getMedal(index);
                    message += `${medal} **${player.username}** - ${player.questsCompleted} Quests\n`;
                });
                break;
                
            case 'guilds':
                leaderboard = await GuildService.getGuildLeaderboard(10);
                message = `🏰 *Guild Leaderboard*\n\n`;
                leaderboard.forEach((guild, index) => {
                    const medal = getMedal(index);
                    const memberCount = guild.members ? guild.members.length : 0;
                    message += `${medal} **${guild.name}** [${guild.tag}] - Lvl ${guild.level} (${memberCount} members)\n`;
                });
                break;
                
            default:
                message = '❌ Kategori leaderboard tidak ditemukan';
        }
        
        if (leaderboard.length === 0) {
            message += '\n❌ Belum ada data untuk kategori ini';
        }
        
        message += `\n\n📊 Showing top ${leaderboard.length} ${category === 'guilds' ? 'guilds' : 'players'}`;
        
        const keyboard = new InlineKeyboard()
            .text('🔄 Refresh', `leaderboard_${category}`)
            .text('🏆 Menu', 'leaderboard_main').row()
            .text('🏠 Main Menu', 'quick_start');
        
        await safeEditMessage(ctx, message, {
            parse_mode: 'Markdown',
            reply_markup: keyboard
        });
        
    } catch (error) {
        console.error('Leaderboard error:', error);
        await safeEditMessage(ctx, '❌ Terjadi error saat memuat leaderboard. Silakan coba lagi.');
    }
}

// Handle player leaderboard (shows current player position)
async function handlePlayerLeaderboard(ctx, category) {
    try {
        const player = ctx.player;
        if (!player) {
            return await safeEditMessage(ctx, '❌ Player data tidak ditemukan');
        }
        
        let allPlayers = [];
        let playerValue = 0;
        let unit = '';
        let title = '';
        
        switch (category) {
            case 'level':
                allPlayers = await PlayerService.getLeaderboard(1000, 'level');
                playerValue = player.level;
                unit = 'Level';
                title = '🏆 Your Level Ranking';
                break;
                
            case 'gold':
                allPlayers = await PlayerService.getLeaderboard(1000, 'gold');
                playerValue = player.gold;
                unit = 'Gold';
                title = '💰 Your Gold Ranking';
                break;
                
            case 'monsters':
                allPlayers = await PlayerService.getLeaderboard(1000, 'monstersKilled');
                playerValue = player.stats?.monstersKilled || 0;
                unit = 'Kills';
                title = '⚔️ Your Monster Kills Ranking';
                break;
                
            case 'quests':
                allPlayers = await QuestService.getQuestLeaderboard(1000);
                playerValue = player.completedQuests ? player.completedQuests.length : 0;
                unit = 'Quests';
                title = '📜 Your Quest Ranking';
                break;
        }
        
        const playerPosition = allPlayers.findIndex(p => p._id.toString() === player._id.toString()) + 1;
        const totalPlayers = allPlayers.length;
        
        let message = `${title}\n\n`;
        message += `👤 **${player.username}**\n`;
        message += `📊 Rank: **#${playerPosition}** of ${totalPlayers}\n`;
        message += `📈 ${unit}: **${playerValue.toLocaleString()}**\n\n`;
        
        // Show players around current player
        const startIndex = Math.max(0, playerPosition - 3);
        const endIndex = Math.min(allPlayers.length, playerPosition + 2);
        
        message += `🎯 **Players Around You:**\n`;
        for (let i = startIndex; i < endIndex; i++) {
            const p = allPlayers[i];
            const rank = i + 1;
            const isCurrentPlayer = p._id.toString() === player._id.toString();
            const marker = isCurrentPlayer ? '👉' : '   ';
            
            let value = 0;
            switch (category) {
                case 'level': value = p.level; break;
                case 'gold': value = p.gold; break;
                case 'monsters': value = p.stats?.monstersKilled || 0; break;
                case 'quests': value = p.questsCompleted || 0; break;
            }
            
            message += `${marker}${rank}. **${p.username}** - ${value.toLocaleString()}\n`;
        }
        
        const keyboard = new InlineKeyboard()
            .text('🏆 Top 10', `leaderboard_${category}`)
            .text('🔄 Refresh', `player_rank_${category}`).row()
            .text('🏆 Menu', 'leaderboard_main')
            .text('🏠 Main Menu', 'quick_start');
        
        await safeEditMessage(ctx, message, {
            parse_mode: 'Markdown',
            reply_markup: keyboard
        });
        
    } catch (error) {
        console.error('Player leaderboard error:', error);
        await safeEditMessage(ctx, '❌ Terjadi error saat memuat ranking. Silakan coba lagi.');
    }
}

// Helper function to get medal emoji
function getMedal(index) {
    switch (index) {
        case 0: return '🥇';
        case 1: return '🥈';
        case 2: return '🥉';
        default: return `${index + 1}.`;
    }
}

// Handle player ranking menu
async function handleMyRankingMenu(ctx) {
    const keyboard = new InlineKeyboard()
        .text('🏆 My Level Rank', 'player_rank_level')
        .text('💰 My Gold Rank', 'player_rank_gold').row()
        .text('⚔️ My Kills Rank', 'player_rank_monsters')
        .text('📜 My Quest Rank', 'player_rank_quests').row()
        .text('🔙 Back', 'leaderboard_main');
    
    const message = 
        `📊 *My Rankings*\n\n` +
        `🎯 Pilih kategori untuk melihat ranking kamu:\n\n` +
        `🏆 **Level Rank** - Posisi level kamu\n` +
        `💰 **Gold Rank** - Posisi gold kamu\n` +
        `⚔️ **Kills Rank** - Posisi monster kills kamu\n` +
        `📜 **Quest Rank** - Posisi quest completion kamu`;
    
    await safeEditMessage(ctx, message, {
        parse_mode: 'Markdown',
        reply_markup: keyboard
    });
}

module.exports = {
    leaderboardCommand,
    handleLeaderboardCategory,
    handlePlayerLeaderboard,
    handleMyRankingMenu
};
