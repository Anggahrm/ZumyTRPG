const Player = require('../models/Player');

// Middleware to load or create player
async function playerLoader(ctx, next) {
    if (ctx.from && ctx.from.id) {
        try {
            let player = await Player.findOne({ userId: ctx.from.id });
            
            if (!player) {
                // Create new player
                player = new Player({
                    userId: ctx.from.id,
                    username: ctx.from.username || ctx.from.first_name || 'Unknown'
                });
                await player.save();
                console.log(`New player created: ${player.username} (${player.userId})`);
                
                // Send welcome message for new players
                await ctx.reply(
                    `🎉 *Selamat datang di RPG Telegram!*\n\n` +
                    `Halo ${player.username}! Akun RPG kamu telah dibuat.\n` +
                    `Gunakan /help untuk melihat semua perintah yang tersedia.\n\n` +
                    `💡 *Tips untuk pemula:*\n` +
                    `• Mulai dengan /hunt untuk berburu monster\n` +
                    `• Gunakan /work untuk mengumpulkan material\n` +
                    `• Jangan lupa ambil /daily bonus setiap hari\n` +
                    `• Lihat /profile untuk melihat progress kamu`,
                    { parse_mode: 'Markdown' }
                );
            } else {
                // Update last active time
                player.lastActive = new Date();
                await player.save();
            }
            
            ctx.player = player;
        } catch (error) {
            console.error('Error loading player:', error);
            await ctx.reply('❌ Terjadi error saat memuat data player. Silakan coba lagi.');
            return;
        }
    }
    
    await next();
}

// Middleware to check if player exists (for commands that require player)
function requirePlayer(ctx, next) {
    if (!ctx.player) {
        return ctx.reply('❌ Kamu harus memulai game terlebih dahulu. Gunakan /start');
    }
    return next();
}

// Middleware to check minimum level
function requireLevel(minLevel) {
    return (ctx, next) => {
        if (!ctx.player) {
            return ctx.reply('❌ Kamu harus memulai game terlebih dahulu. Gunakan /start');
        }
        
        if (ctx.player.level < minLevel) {
            return ctx.reply(`❌ Kamu harus level ${minLevel} untuk menggunakan fitur ini. Level kamu sekarang: ${ctx.player.level}`);
        }
        
        return next();
    };
}

// Middleware to check if player is alive (HP > 0)
function requireAlive(ctx, next) {
    if (!ctx.player) {
        return ctx.reply('❌ Kamu harus memulai game terlebih dahulu. Gunakan /start');
    }
    
    if (ctx.player.hp <= 0) {
        return ctx.reply('💀 HP kamu 0! Gunakan /heal untuk memulihkan HP terlebih dahulu.');
    }
    
    return next();
}

// Middleware to check if player is in a guild
function requireGuild(ctx, next) {
    if (!ctx.player) {
        return ctx.reply('❌ Kamu harus memulai game terlebih dahulu. Gunakan /start');
    }
    
    if (!ctx.player.guildId) {
        return ctx.reply('❌ Kamu harus bergabung dengan guild terlebih dahulu. Gunakan /guild join <nama_guild>');
    }
    
    return next();
}

// Middleware to check guild permissions
function requireGuildRank(minRank) {
    const rankHierarchy = { 'member': 1, 'officer': 2, 'leader': 3 };
    
    return (ctx, next) => {
        if (!ctx.player) {
            return ctx.reply('❌ Kamu harus memulai game terlebih dahulu. Gunakan /start');
        }
        
        if (!ctx.player.guildId) {
            return ctx.reply('❌ Kamu harus bergabung dengan guild terlebih dahulu.');
        }
        
        const playerRankLevel = rankHierarchy[ctx.player.guildRank] || 0;
        const requiredRankLevel = rankHierarchy[minRank] || 0;
        
        if (playerRankLevel < requiredRankLevel) {
            return ctx.reply(`❌ Kamu harus memiliki rank ${minRank} atau lebih tinggi untuk menggunakan fitur ini.`);
        }
        
        return next();
    };
}

// Middleware for error handling
function errorHandler(error, ctx) {
    console.error('Bot error:', error);
    
    // Don't send error messages for certain types of errors
    if (error.code === 403) {
        console.log('Bot was blocked by user:', ctx.from?.id);
        return;
    }
    
    // Send generic error message to user
    ctx.reply('❌ Terjadi error yang tidak terduga. Tim developer telah diberitahu.')
        .catch(err => console.error('Failed to send error message:', err));
}

// Middleware to log commands
function commandLogger(ctx, next) {
    if (ctx.message?.text) {
        const userId = ctx.from?.id;
        const username = ctx.from?.username || ctx.from?.first_name || 'Unknown';
        const command = ctx.message.text;
        
        console.log(`[${new Date().toISOString()}] User ${username} (${userId}): ${command}`);
    }
    
    return next();
}

// Middleware to check for maintenance mode
function maintenanceCheck(ctx, next) {
    const maintenanceMode = process.env.MAINTENANCE_MODE === 'true';
    
    if (maintenanceMode) {
        const adminIds = (process.env.ADMIN_IDS || '').split(',').map(id => parseInt(id));
        
        if (!adminIds.includes(ctx.from?.id)) {
            return ctx.reply(
                '🔧 *Bot sedang dalam maintenance*\n\n' +
                'Maaf, bot sedang dalam perbaikan. Silakan coba lagi nanti.\n\n' +
                'Terima kasih atas pengertiannya! 🙏',
                { parse_mode: 'Markdown' }
            );
        }
    }
    
    return next();
}

module.exports = {
    playerLoader,
    requirePlayer,
    requireLevel,
    requireAlive,
    requireGuild,
    requireGuildRank,
    errorHandler,
    commandLogger,
    maintenanceCheck
};

