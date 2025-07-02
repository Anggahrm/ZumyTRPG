const { InlineKeyboard } = require('grammy');
const { safeEditMessage, safeReply } = require('../utils/messageHelpers');
const { requirePlayer } = require('../middlewares/playerLoader');
const GuildService = require('../services/guildService');
const { formatNumber, chunkArray } = require('../utils/common');

async function guildCommand(ctx) {
    const player = ctx.player;
    
    if (!player) {
        return await ctx.reply('❌ Kamu harus memulai game terlebih dahulu. Gunakan /start');
    }
    
    // Check if there are command arguments
    const args = ctx.message?.text?.split(' ').slice(1) || [];
    const subcommand = args[0];
    
    // Handle subcommands
    if (subcommand) {
        switch (subcommand.toLowerCase()) {
            case 'create':
                return await handleCreateGuild(ctx, args);
            case 'contribute':
                return await handleContributeGuild(ctx, args);
            case 'desc':
            case 'description':
                return await handleChangeDescription(ctx, args);
            case 'promote':
                return await handlePromoteMember(ctx, args);
            case 'demote':
                return await handleDemoteMember(ctx, args);
            case 'kick':
                return await handleKickMember(ctx, args);
            default:
                return await ctx.reply(`❌ Unknown subcommand: ${subcommand}`);
        }
    }
    
    // Default behavior - show guild info or menu
    if (player.guildId) {
        // Player is in a guild - show guild info
        await showGuildInfo(ctx, player);
    } else {
        // Player not in guild - show guild menu
        await showGuildMenu(ctx, player);
    }
}

async function showGuildMenu(ctx, player) {
    const message = 
        `🏰 *Guild System*\n\n` +
        `Kamu belum bergabung dengan guild.\n\n` +
        `🌟 **Benefits of joining a guild:**\n` +
        `• XP dan Gold bonus\n` +
        `• Guild raids dan events\n` +
        `• Chat dengan guild members\n` +
        `• Shop discount\n` +
        `• Shared guild treasury\n\n` +
        `Pilih aksi:`;
    
    const keyboard = new InlineKeyboard()
        .text('🔍 Browse Guilds', 'guild_action_browse')
        .text('➕ Create Guild', 'guild_action_create').row()
        .text('🔄 Refresh', 'refresh_guild');
    
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

async function showGuildInfo(ctx, player) {
    const guildInfo = await GuildService.getGuildInfo(player.guildId);
    
    if (!guildInfo) {
        // Guild not found - reset player guild
        player.guildId = null;
        player.guildRank = 'member';
        await player.save();
        return await showGuildMenu(ctx, player);
    }
    
    const playerMember = guildInfo.members.find(m => m.userId === player.userId);
    const memberCount = guildInfo.members.length;
    
    // Calculate guild level progress
    const xpNeeded = guildInfo.level * 1000;
    const xpProgress = Math.floor((guildInfo.xp / xpNeeded) * 100);
    
    let message = 
        `🏰 **${guildInfo.name}** [${guildInfo.tag}]\n\n` +
        `📝 ${guildInfo.description || 'No description'}\n\n` +
        `🎯 Level: ${guildInfo.level}\n` +
        `⭐ XP: ${formatNumber(guildInfo.xp)}/${formatNumber(xpNeeded)} (${xpProgress}%)\n` +
        `👥 Members: ${memberCount}/${guildInfo.maxMembers}\n` +
        `💰 Treasury: ${formatNumber(guildInfo.treasury)} gold\n\n` +
        `🎁 **Guild Perks:**\n` +
        `• XP Bonus: +${Math.floor(guildInfo.perks.xpBonus * 100)}%\n` +
        `• Gold Bonus: +${Math.floor(guildInfo.perks.goldBonus * 100)}%\n` +
        `• Shop Discount: ${Math.floor(guildInfo.perks.shopDiscount * 100)}%\n\n` +
        `👤 **Your Info:**\n` +
        `• Rank: ${player.guildRank}\n` +
        `• Contribution: ${formatNumber(playerMember?.contribution || 0)}\n`;
    
    const keyboard = new InlineKeyboard()
        .text('👥 Members', 'guild_action_members')
        .text('💰 Contribute', 'guild_action_contribute').row();
    
    if (player.guildRank === 'leader') {
        keyboard.text('⚙️ Manage', 'guild_action_manage')
            .text('🚪 Disband', 'guild_action_disband_confirm').row();
    } else {
        keyboard.text('🚪 Leave Guild', 'guild_action_leave_confirm').row();
    }
    
    keyboard.text('🔄 Refresh', 'refresh_guild');
    
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

async function handleGuildAction(ctx, action) {
    const player = ctx.player;
    
    switch (action) {
        case 'browse':
            await showGuildList(ctx, player);
            break;
        case 'create':
            await showCreateGuildInfo(ctx);
            break;
        case 'members':
            await showGuildMembers(ctx, player);
            break;
        case 'contribute':
            await showContributeMenu(ctx, player);
            break;
        case 'manage':
            await showGuildManagement(ctx, player);
            break;
        case 'leave_confirm':
            await showLeaveConfirmation(ctx);
            break;
        case 'disband_confirm':
            await showDisbandConfirmation(ctx);
            break;
    }
}

async function showGuildList(ctx, player, page = 1) {
    const guildList = await GuildService.getGuildList(page, 5);
    
    if (guildList.guilds.length === 0) {
        const message = 
            `🔍 *Browse Guilds*\n\n` +
            `Tidak ada guild yang tersedia saat ini.\n\n` +
            `💡 Buat guild pertama!`;
        
        const keyboard = new InlineKeyboard()
            .text('➕ Create Guild', 'guild_action_create')
            .text('🔙 Back', 'refresh_guild');
        
        await safeEditMessage(ctx, message, {
            parse_mode: 'Markdown',
            reply_markup: keyboard
        });
        return;
    }
    
    let message = `🔍 *Browse Guilds* (Page ${page}/${guildList.pagination.pages})\n\n`;
    
    const keyboard = new InlineKeyboard();
    
    for (const guild of guildList.guilds) {
        message += `🏰 **${guild.name}** [${guild.tag}]\n`;
        message += `🎯 Level ${guild.level} | 👥 ${guild.memberCount}/${guild.maxMembers}\n`;
        if (guild.description) {
            message += `📝 ${guild.description.substring(0, 50)}${guild.description.length > 50 ? '...' : ''}\n`;
        }
        message += `🎯 Min Level: ${guild.minLevel}\n\n`;
        
        const canJoin = player.level >= guild.minLevel && guild.memberCount < guild.maxMembers;
        const buttonText = canJoin ? `Join ${guild.name}` : `❌ ${guild.name}`;
        
        keyboard.text(buttonText, `guild_join_${guild.name}`);
        keyboard.row();
    }
    
    // Pagination buttons
    if (guildList.pagination.pages > 1) {
        const paginationRow = [];
        if (page > 1) {
            paginationRow.push({ text: '⬅️ Previous', callback_data: `page_guild_list_${page - 1}` });
        }
        if (page < guildList.pagination.pages) {
            paginationRow.push({ text: 'Next ➡️', callback_data: `page_guild_list_${page + 1}` });
        }
        if (paginationRow.length > 0) {
            keyboard.row(...paginationRow);
        }
    }
    
    keyboard.row()
        .text('➕ Create Guild', 'guild_action_create')
        .text('🔙 Back', 'refresh_guild');
    
    await safeEditMessage(ctx, message, {
        parse_mode: 'Markdown',
        reply_markup: keyboard
    });
}

async function showCreateGuildInfo(ctx) {
    const message = 
        `➕ *Create Guild*\n\n` +
        `📋 **Requirements:**\n` +
        `• Level 5 minimum\n` +
        `• 1000 gold (creation fee)\n` +
        `• Not in any guild\n\n` +
        `📝 **To create a guild, use:**\n` +
        `\`/guild create <name> <tag> [description]\`\n\n` +
        `**Example:**\n` +
        `\`/guild create Dragon Warriors DW Best guild ever!\`\n\n` +
        `📏 **Limits:**\n` +
        `• Name: 3-30 characters\n` +
        `• Tag: 2-5 characters\n` +
        `• Description: Optional, max 100 characters`;
    
    const keyboard = new InlineKeyboard()
        .text('🔙 Back to Guild Menu', 'refresh_guild');
    
    await safeEditMessage(ctx, message, {
        parse_mode: 'Markdown',
        reply_markup: keyboard
    });
}

async function showGuildMembers(ctx, player) {
    const guildInfo = await GuildService.getGuildInfo(player.guildId);
    
    if (!guildInfo) {
        return await ctx.answerCallbackQuery('❌ Guild tidak ditemukan.');
    }
    
    // Sort members by rank and contribution
    const rankOrder = { leader: 3, officer: 2, member: 1 };
    const sortedMembers = guildInfo.members.sort((a, b) => {
        const rankDiff = (rankOrder[b.rank] || 0) - (rankOrder[a.rank] || 0);
        if (rankDiff !== 0) return rankDiff;
        return b.contribution - a.contribution;
    });
    
    let message = `👥 **${guildInfo.name} Members**\n\n`;
    
    for (const member of sortedMembers) {
        const rankEmojis = { leader: '👑', officer: '⭐', member: '👤' };
        const emoji = rankEmojis[member.rank] || '👤';
        
        message += `${emoji} **${member.username}** (Lv.${member.level})\n`;
        message += `   ${member.rank} | Contribution: ${formatNumber(member.contribution)}\n\n`;
    }
    
    const keyboard = new InlineKeyboard()
        .text('🔙 Back to Guild', 'refresh_guild');
    
    await safeEditMessage(ctx, message, {
        parse_mode: 'Markdown',
        reply_markup: keyboard
    });
}

async function showContributeMenu(ctx, player) {
    const message = 
        `💰 *Contribute to Guild*\n\n` +
        `💰 Your Gold: ${formatNumber(player.gold)}\n\n` +
        `Contribution akan meningkatkan guild XP dan treasury.\n` +
        `Kamu juga akan mendapat contribution points!\n\n` +
        `📝 **To contribute, use:**\n` +
        `\`/guild contribute <amount>\`\n\n` +
        `**Example:**\n` +
        `\`/guild contribute 100\``;
    
    const keyboard = new InlineKeyboard()
        .text('🔙 Back to Guild', 'refresh_guild');
    
    await safeEditMessage(ctx, message, {
        parse_mode: 'Markdown',
        reply_markup: keyboard
    });
}

async function showGuildManagement(ctx, player) {
    if (player.guildRank !== 'leader') {
        return await ctx.answerCallbackQuery('❌ Hanya leader yang bisa mengakses management.');
    }
    
    const message = 
        `⚙️ *Guild Management*\n\n` +
        `👑 Leader Commands:\n\n` +
        `📝 **Change Description:**\n` +
        `\`/guild desc <new description>\`\n\n` +
        `👥 **Promote Member:**\n` +
        `\`/guild promote <username>\`\n\n` +
        `👥 **Demote Member:**\n` +
        `\`/guild demote <username>\`\n\n` +
        `🚪 **Kick Member:**\n` +
        `\`/guild kick <username>\`\n\n` +
        `⚙️ **Change Settings:**\n` +
        `\`/guild settings\``;
    
    const keyboard = new InlineKeyboard()
        .text('🔙 Back to Guild', 'refresh_guild');
    
    await safeEditMessage(ctx, message, {
        parse_mode: 'Markdown',
        reply_markup: keyboard
    });
}

async function showLeaveConfirmation(ctx) {
    const message = 
        `🚪 *Leave Guild*\n\n` +
        `⚠️ Apakah kamu yakin ingin keluar dari guild?\n\n` +
        `📝 **Consequences:**\n` +
        `• Kehilangan semua guild benefits\n` +
        `• Contribution points akan hilang\n` +
        `• Tidak bisa rejoin selama 24 jam`;
    
    const keyboard = new InlineKeyboard()
        .text('✅ Yes, Leave Guild', 'confirm_guild_leave')
        .text('❌ Cancel', 'refresh_guild');
    
    await safeEditMessage(ctx, message, {
        parse_mode: 'Markdown',
        reply_markup: keyboard
    });
}

async function showDisbandConfirmation(ctx) {
    const message = 
        `🚪 *Disband Guild*\n\n` +
        `⚠️ **WARNING!** Apakah kamu yakin ingin membubarkan guild?\n\n` +
        `📝 **This action will:**\n` +
        `• Permanently delete the guild\n` +
        `• Remove all members\n` +
        `• Delete guild treasury\n` +
        `• **CANNOT BE UNDONE!**`;
    
    const keyboard = new InlineKeyboard()
        .text('✅ Yes, Disband Guild', 'confirm_guild_disband')
        .text('❌ Cancel', 'refresh_guild');
    
    await safeEditMessage(ctx, message, {
        parse_mode: 'Markdown',
        reply_markup: keyboard
    });
}

async function handleJoinGuild(ctx, guildName) {
    const player = ctx.player;
    const result = await GuildService.joinGuild(player.userId, player.username, guildName);
    
    if (result.success) {
        const message = 
            `🎉 **Successfully joined guild!**\n\n` +
            `🏰 Welcome to **${result.guild.name}**!\n\n` +
            `🎁 You now have access to:\n` +
            `• Guild bonuses\n` +
            `• Guild chat\n` +
            `• Guild events\n` +
            `• Shop discounts`;
        
        const keyboard = new InlineKeyboard()
            .text('🏰 View Guild', 'refresh_guild')
            .text('👤 Profile', 'quick_profile');
        
        await safeEditMessage(ctx, message, {
            parse_mode: 'Markdown',
            reply_markup: keyboard
        });
        
        await ctx.answerCallbackQuery(`✅ Joined ${guildName}!`);
    } else {
        await ctx.answerCallbackQuery(`❌ ${result.message}`);
    }
}

async function handleLeaveGuild(ctx) {
    const player = ctx.player;
    const result = await GuildService.leaveGuild(player.userId);
    
    if (result.success) {
        const message = 
            `✅ **Left Guild Successfully**\n\n` +
            `You have left the guild.\n` +
            `You can join another guild anytime!`;
        
        const keyboard = new InlineKeyboard()
            .text('🔍 Browse Guilds', 'guild_action_browse')
            .text('👤 Profile', 'quick_profile');
        
        await safeEditMessage(ctx, message, {
            parse_mode: 'Markdown',
            reply_markup: keyboard
        });
        
        await ctx.answerCallbackQuery('✅ Left guild successfully');
    } else {
        await ctx.answerCallbackQuery(`❌ ${result.message}`);
    }
}

async function handleGuildListPage(ctx, page) {
    const player = ctx.player;
    await showGuildList(ctx, player, page);
}

// Guild subcommand handlers
async function handleCreateGuild(ctx, args) {
    const player = ctx.player;
    
    if (player.guildId) {
        return await ctx.reply('❌ Kamu sudah bergabung dengan guild. Keluar guild terlebih dahulu.');
    }
    
    if (player.level < 5) {
        return await ctx.reply('❌ Level minimum untuk membuat guild adalah 5.');
    }
    
    if (player.gold < 1000) {
        return await ctx.reply('❌ Kamu membutuhkan 1000 gold untuk membuat guild.');
    }
    
    if (args.length < 3) {
        return await ctx.reply('❌ Format: `/guild create <name> <tag> [description]`\n\nContoh: `/guild create Dragon Warriors DW Best guild ever!`');
    }
    
    const name = args[1];
    const tag = args[2];
    const description = args.slice(3).join(' ') || '';
    
    // Validate name and tag
    if (name.length < 3 || name.length > 30) {
        return await ctx.reply('❌ Nama guild harus 3-30 karakter.');
    }
    
    if (tag.length < 2 || tag.length > 5) {
        return await ctx.reply('❌ Tag guild harus 2-5 karakter.');
    }
    
    if (description.length > 100) {
        return await ctx.reply('❌ Deskripsi guild maksimal 100 karakter.');
    }
    
    const result = await GuildService.createGuild(player.userId, player.username, name, tag, description);
    
    if (result.success) {
        const message = 
            `🎉 **Guild Created Successfully!**\n\n` +
            `🏰 **${result.guild.name}** [${result.guild.tag}]\n` +
            `👑 You are now the guild leader!\n\n` +
            `💰 Creation fee: 1000 gold deducted\n\n` +
            `🎯 Start recruiting members and build your guild!`;
        
        await ctx.reply(message, { parse_mode: 'Markdown' });
    } else {
        await ctx.reply(`❌ ${result.message}`);
    }
}

async function handleContributeGuild(ctx, args) {
    const player = ctx.player;
    
    if (!player.guildId) {
        return await ctx.reply('❌ Kamu harus bergabung dengan guild terlebih dahulu.');
    }
    
    if (args.length < 2) {
        return await ctx.reply('❌ Format: `/guild contribute <amount>`\n\nContoh: `/guild contribute 100`');
    }
    
    const amount = parseInt(args[1]);
    
    if (isNaN(amount) || amount <= 0) {
        return await ctx.reply('❌ Jumlah harus berupa angka positif.');
    }
    
    if (player.gold < amount) {
        return await ctx.reply('❌ Gold tidak mencukupi.');
    }
    
    const result = await GuildService.contributeToGuild(player.guildId, player.userId, amount);
    
    if (result.success) {
        const message = 
            `💰 **Contribution Successful!**\n\n` +
            `Contributed: ${formatNumber(amount)} gold\n` +
            `Guild XP gained: ${result.xpGained}\n` +
            `Your contribution points: +${amount}`;
        
        await ctx.reply(message, { parse_mode: 'Markdown' });
    } else {
        await ctx.reply(`❌ ${result.message}`);
    }
}

async function handleChangeDescription(ctx, args) {
    const player = ctx.player;
    
    if (!player.guildId) {
        return await ctx.reply('❌ Kamu harus bergabung dengan guild terlebih dahulu.');
    }
    
    if (player.guildRank !== 'leader') {
        return await ctx.reply('❌ Hanya leader yang bisa mengubah deskripsi guild.');
    }
    
    if (args.length < 2) {
        return await ctx.reply('❌ Format: `/guild desc <new description>`\n\nContoh: `/guild desc We are the best guild!`');
    }
    
    const newDescription = args.slice(1).join(' ');
    
    if (newDescription.length > 100) {
        return await ctx.reply('❌ Deskripsi guild maksimal 100 karakter.');
    }
    
    const result = await GuildService.updateGuildSettings(player.guildId, { description: newDescription }, player.userId);
    
    if (result.success) {
        await ctx.reply('✅ Deskripsi guild berhasil diubah!');
    } else {
        await ctx.reply(`❌ ${result.message}`);
    }
}

async function handlePromoteMember(ctx, args) {
    const player = ctx.player;
    
    if (!player.guildId) {
        return await ctx.reply('❌ Kamu harus bergabung dengan guild terlebih dahulu.');
    }
    
    if (player.guildRank !== 'leader') {
        return await ctx.reply('❌ Hanya leader yang bisa promote member.');
    }
    
    if (args.length < 2) {
        return await ctx.reply('❌ Format: `/guild promote <username>`\n\nContoh: `/guild promote john_doe`');
    }
    
    const targetUsername = args[1];
    const result = await GuildService.promoteMember(player.guildId, targetUsername, player.userId);
    
    if (result.success) {
        await ctx.reply(`✅ ${targetUsername} berhasil dipromote menjadi officer!`);
    } else {
        await ctx.reply(`❌ ${result.message}`);
    }
}

async function handleDemoteMember(ctx, args) {
    const player = ctx.player;
    
    if (!player.guildId) {
        return await ctx.reply('❌ Kamu harus bergabung dengan guild terlebih dahulu.');
    }
    
    if (player.guildRank !== 'leader') {
        return await ctx.reply('❌ Hanya leader yang bisa demote member.');
    }
    
    if (args.length < 2) {
        return await ctx.reply('❌ Format: `/guild demote <username>`\n\nContoh: `/guild demote john_doe`');
    }
    
    const targetUsername = args[1];
    const result = await GuildService.demoteMember(player.guildId, targetUsername, player.userId);
    
    if (result.success) {
        await ctx.reply(`✅ ${targetUsername} berhasil didemote menjadi member!`);
    } else {
        await ctx.reply(`❌ ${result.message}`);
    }
}

async function handleKickMember(ctx, args) {
    const player = ctx.player;
    
    if (!player.guildId) {
        return await ctx.reply('❌ Kamu harus bergabung dengan guild terlebih dahulu.');
    }
    
    if (player.guildRank !== 'leader') {
        return await ctx.reply('❌ Hanya leader yang bisa kick member.');
    }
    
    if (args.length < 2) {
        return await ctx.reply('❌ Format: `/guild kick <username>`\n\nContoh: `/guild kick john_doe`');
    }
    
    const targetUsername = args[1];
    const result = await GuildService.kickMember(player.guildId, targetUsername, player.userId);
    
    if (result.success) {
        await ctx.reply(`✅ ${targetUsername} berhasil di-kick dari guild!`);
    } else {
        await ctx.reply(`❌ ${result.message}`);
    }
}

module.exports = {
    guildCommand,
    handleGuildAction,
    handleJoinGuild,
    handleLeaveGuild,
    handleGuildListPage
};

module.exports.default = guildCommand;

