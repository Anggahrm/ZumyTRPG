const Guild = require('../models/Guild');
const Player = require('../models/Player');

class GuildService {
    // Create new guild
    static async createGuild(leaderId, leaderUsername, guildName, guildTag, description = '') {
        // Check if guild name or tag already exists
        const existingGuild = await Guild.findOne({
            $or: [
                { name: guildName },
                { tag: guildTag }
            ]
        });
        
        if (existingGuild) {
            return { success: false, message: 'Nama guild atau tag sudah digunakan' };
        }
        
        // Check if player is already in a guild
        const player = await Player.findOne({ userId: leaderId });
        if (player.guildId) {
            return { success: false, message: 'Kamu sudah bergabung dengan guild lain' };
        }
        
        // Create guild
        const guild = new Guild({
            name: guildName,
            tag: guildTag,
            description,
            leaderId,
            members: [{
                userId: leaderId,
                username: leaderUsername,
                rank: 'leader',
                joinedAt: new Date(),
                contribution: 0
            }]
        });
        
        await guild.save();
        
        // Update player
        player.guildId = guild._id;
        player.guildRank = 'leader';
        await player.save();
        
        return { success: true, guild };
    }
    
    // Join guild
    static async joinGuild(userId, username, guildName) {
        const guild = await Guild.findOne({ name: guildName });
        if (!guild) {
            return { success: false, message: 'Guild tidak ditemukan' };
        }
        
        const player = await Player.findOne({ userId });
        if (player.guildId) {
            return { success: false, message: 'Kamu sudah bergabung dengan guild lain' };
        }
        
        // Check if guild is full
        if (guild.members.length >= guild.maxMembers) {
            return { success: false, message: 'Guild sudah penuh' };
        }
        
        // Check level requirement
        if (player.level < guild.minLevel) {
            return { success: false, message: `Level minimum untuk bergabung: ${guild.minLevel}` };
        }
        
        // Add member to guild
        const success = guild.addMember(userId, username);
        if (!success) {
            return { success: false, message: 'Gagal bergabung dengan guild' };
        }
        
        await guild.save();
        
        // Update player
        player.guildId = guild._id;
        player.guildRank = 'member';
        await player.save();
        
        return { success: true, guild };
    }
    
    // Leave guild
    static async leaveGuild(userId) {
        const player = await Player.findOne({ userId });
        if (!player.guildId) {
            return { success: false, message: 'Kamu tidak bergabung dengan guild manapun' };
        }
        
        const guild = await Guild.findById(player.guildId);
        if (!guild) {
            return { success: false, message: 'Guild tidak ditemukan' };
        }
        
        // Check if player is the leader
        if (guild.leaderId === userId) {
            // Transfer leadership or disband guild
            const officers = guild.members.filter(m => m.rank === 'officer');
            if (officers.length > 0) {
                // Transfer to first officer
                const newLeader = officers[0];
                guild.leaderId = newLeader.userId;
                guild.updateMemberRank(newLeader.userId, 'leader');
            } else {
                const members = guild.members.filter(m => m.userId !== userId);
                if (members.length > 0) {
                    // Transfer to first member
                    const newLeader = members[0];
                    guild.leaderId = newLeader.userId;
                    guild.updateMemberRank(newLeader.userId, 'leader');
                } else {
                    // Disband guild if no other members
                    await Guild.findByIdAndDelete(guild._id);
                    player.guildId = null;
                    player.guildRank = 'member';
                    await player.save();
                    return { success: true, message: 'Guild dibubarkan karena tidak ada anggota lain' };
                }
            }
        }
        
        // Remove member from guild
        guild.removeMember(userId);
        await guild.save();
        
        // Update player
        player.guildId = null;
        player.guildRank = 'member';
        await player.save();
        
        return { success: true, guild };
    }
    
    // Get guild info
    static async getGuildInfo(guildId) {
        const guild = await Guild.findById(guildId);
        if (!guild) {
            return null;
        }
        
        // Get member details
        const memberIds = guild.members.map(m => m.userId);
        const players = await Player.find({ userId: { $in: memberIds } })
            .select('userId username level');
        
        const playersMap = new Map(players.map(p => [p.userId, p]));
        
        const membersWithDetails = guild.members.map(member => {
            const player = playersMap.get(member.userId);
            return {
                ...member.toObject(),
                level: player ? player.level : 1
            };
        });
        
        return {
            ...guild.toObject(),
            members: membersWithDetails
        };
    }
    
    // Get guild list
    static async getGuildList(page = 1, limit = 10, sortBy = 'level') {
        const skip = (page - 1) * limit;
        
        const sortOptions = {
            level: { level: -1, xp: -1 },
            members: { 'members.length': -1 },
            name: { name: 1 }
        };
        
        const sort = sortOptions[sortBy] || sortOptions.level;
        
        const guilds = await Guild.find({ isPublic: true })
            .sort(sort)
            .skip(skip)
            .limit(limit)
            .select('name tag description level members maxMembers minLevel');
        
        const total = await Guild.countDocuments({ isPublic: true });
        
        return {
            guilds: guilds.map(guild => ({
                ...guild.toObject(),
                memberCount: guild.members.length
            })),
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        };
    }
    
    // Promote/demote member
    static async updateMemberRank(guildId, targetUserId, newRank, actionUserId) {
        const guild = await Guild.findById(guildId);
        if (!guild) {
            return { success: false, message: 'Guild tidak ditemukan' };
        }
        
        const actionMember = guild.getMember(actionUserId);
        const targetMember = guild.getMember(targetUserId);
        
        if (!actionMember || !targetMember) {
            return { success: false, message: 'Member tidak ditemukan' };
        }
        
        // Check permissions
        const rankHierarchy = { member: 1, officer: 2, leader: 3 };
        const actionRankLevel = rankHierarchy[actionMember.rank];
        const targetRankLevel = rankHierarchy[targetMember.rank];
        const newRankLevel = rankHierarchy[newRank];
        
        if (actionRankLevel <= targetRankLevel) {
            return { success: false, message: 'Kamu tidak memiliki permission untuk mengubah rank member ini' };
        }
        
        if (newRankLevel >= actionRankLevel) {
            return { success: false, message: 'Kamu tidak bisa memberikan rank yang sama atau lebih tinggi dari rank kamu' };
        }
        
        // Update rank
        guild.updateMemberRank(targetUserId, newRank);
        await guild.save();
        
        // Update player
        await Player.updateOne({ userId: targetUserId }, { guildRank: newRank });
        
        return { success: true, guild };
    }
    
    // Kick member
    static async kickMember(guildId, targetUserId, actionUserId) {
        const guild = await Guild.findById(guildId);
        if (!guild) {
            return { success: false, message: 'Guild tidak ditemukan' };
        }
        
        const actionMember = guild.getMember(actionUserId);
        const targetMember = guild.getMember(targetUserId);
        
        if (!actionMember || !targetMember) {
            return { success: false, message: 'Member tidak ditemukan' };
        }
        
        // Check permissions
        const rankHierarchy = { member: 1, officer: 2, leader: 3 };
        const actionRankLevel = rankHierarchy[actionMember.rank];
        const targetRankLevel = rankHierarchy[targetMember.rank];
        
        if (actionRankLevel <= targetRankLevel) {
            return { success: false, message: 'Kamu tidak memiliki permission untuk kick member ini' };
        }
        
        // Remove member
        guild.removeMember(targetUserId);
        await guild.save();
        
        // Update player
        await Player.updateOne(
            { userId: targetUserId },
            { guildId: null, guildRank: 'member' }
        );
        
        return { success: true, guild };
    }
    
    // Add contribution
    static async addContribution(guildId, userId, amount) {
        const guild = await Guild.findById(guildId);
        if (!guild) {
            return { success: false, message: 'Guild tidak ditemukan' };
        }
        
        const success = guild.addContribution(userId, amount);
        if (!success) {
            return { success: false, message: 'Member tidak ditemukan' };
        }
        
        // Check for guild level up
        const leveledUp = guild.levelUp();
        
        await guild.save();
        
        return { success: true, guild, leveledUp };
    }
    
    // Get guild leaderboard
    static async getGuildLeaderboard(limit = 10) {
        return await Guild.find({})
            .sort({ level: -1, xp: -1 })
            .limit(limit)
            .select('name tag level xp members');
    }
    
    // Guild raid (placeholder for future implementation)
    static async startGuildRaid(guildId, raidType) {
        const guild = await Guild.findById(guildId);
        if (!guild) {
            return { success: false, message: 'Guild tidak ditemukan' };
        }
        
        // Check cooldown
        const now = new Date();
        if (guild.lastRaid && (now - guild.lastRaid) < guild.raidCooldown) {
            const remainingTime = guild.raidCooldown - (now - guild.lastRaid);
            return { 
                success: false, 
                message: `Guild raid masih cooldown. Sisa waktu: ${Math.ceil(remainingTime / (60 * 60 * 1000))} jam` 
            };
        }
        
        // Placeholder for raid logic
        guild.lastRaid = now;
        await guild.save();
        
        return { 
            success: true, 
            message: 'Guild raid dimulai! (Fitur ini akan dikembangkan lebih lanjut)' 
        };
    }
    
    // Update guild settings
    static async updateGuildSettings(guildId, settings, actionUserId) {
        const guild = await Guild.findById(guildId);
        if (!guild) {
            return { success: false, message: 'Guild tidak ditemukan' };
        }
        
        const actionMember = guild.getMember(actionUserId);
        if (!actionMember || actionMember.rank !== 'leader') {
            return { success: false, message: 'Hanya leader yang bisa mengubah pengaturan guild' };
        }
        
        // Update allowed settings
        const allowedSettings = ['description', 'isPublic', 'autoAccept', 'minLevel'];
        for (const [key, value] of Object.entries(settings)) {
            if (allowedSettings.includes(key)) {
                guild[key] = value;
            }
        }
        
        await guild.save();
        return { success: true, guild };
    }
}

module.exports = GuildService;

