const { InlineKeyboard } = require("grammy");
const { requirePlayer } = require('../middlewares/playerLoader');
const QuestService = require('../services/questService');
const { quests } = require('../data/quests');
const { getProgressBar, formatNumber } = require('../utils/common');

async function questCommand(ctx) {
    const player = ctx.player;
    
    if (!player) {
        return await ctx.reply('❌ Kamu harus memulai game terlebih dahulu. Gunakan /start');
    }
    
    const activeQuests = player.activeQuests.length;
    const completedQuests = player.completedQuests.length;
    
    const message = 
        `📜 *Quest Menu*\n\n` +
        `🎯 Active Quests: ${activeQuests}\n` +
        `✅ Completed Quests: ${completedQuests}\n\n` +
        `Pilih kategori quest:`;
    
    const keyboard = new InlineKeyboard()
        .text('🎯 Active Quests', 'quest_type_active')
        .text('📋 Available Quests', 'quest_type_available').row()
        .text('📅 Daily Quests', 'quest_type_daily')
        .text('📆 Weekly Quests', 'quest_type_weekly').row()
        .text('🏆 Achievement Quests', 'quest_type_achievement')
        .text('📖 Main Story', 'quest_type_main').row()
        .text('🔄 Refresh', 'refresh_quests');
    
    if (ctx.callbackQuery) {
        await ctx.editMessageText(message, {
            parse_mode: 'Markdown',
            reply_markup: keyboard
        });
    } else {
        await ctx.reply(message, {
            parse_mode: 'Markdown',
            reply_markup: keyboard
        });
    }
}

async function handleQuestType(ctx, questType) {
    const player = ctx.player;
    
    switch (questType) {
        case 'active':
            await showActiveQuests(ctx, player);
            break;
        case 'available':
            await showAvailableQuests(ctx, player);
            break;
        case 'daily':
            await showQuestsByType(ctx, player, 'daily');
            break;
        case 'weekly':
            await showQuestsByType(ctx, player, 'weekly');
            break;
        case 'achievement':
            await showQuestsByType(ctx, player, 'achievement');
            break;
        case 'main':
            await showQuestsByType(ctx, player, 'main');
            break;
    }
}

async function showActiveQuests(ctx, player) {
    if (player.activeQuests.length === 0) {
        const message = 
            `📜 *Active Quests*\n\n` +
            `Tidak ada quest aktif.\n\n` +
            `💡 Mulai quest baru dari menu Available Quests!`;
        
        const keyboard = new InlineKeyboard()
            .text('📋 Available Quests', 'quest_type_available')
            .text('🔙 Back', 'refresh_quests');
        
        await ctx.editMessageText(message, {
            parse_mode: 'Markdown',
            reply_markup: keyboard
        });
        return;
    }
    
    let message = `📜 *Active Quests*\n\n`;
    const keyboard = new InlineKeyboard();
    
    for (const activeQuest of player.activeQuests) {
        const quest = quests[activeQuest.questId];
        if (!quest) continue;
        
        const progressDisplay = QuestService.getQuestProgressDisplay(player, activeQuest.questId);
        
        message += `🎯 **${quest.name}**\n`;
        message += `${quest.description}\n\n`;
        
        for (const progress of progressDisplay.progress) {
            const progressBar = getProgressBar(progress.current, progress.target, 8);
            const percentage = Math.floor(progress.percentage);
            message += `• ${progress.objective}: ${progress.current}/${progress.target}\n`;
            message += `  ${progressBar} ${percentage}%\n`;
        }
        
        if (progressDisplay.isCompleted) {
            message += `✅ **READY TO COMPLETE!**\n`;
            keyboard.text(`Complete ${quest.name}`, `quest_complete_${activeQuest.questId}`);
        }
        
        message += `\n`;
        
        if (keyboard.inline_keyboard.length > 0 && keyboard.inline_keyboard[keyboard.inline_keyboard.length - 1].length >= 2) {
            keyboard.row();
        }
    }
    
    keyboard.row().text('🔙 Back to Quests', 'refresh_quests');
    
    await ctx.editMessageText(message, {
        parse_mode: 'Markdown',
        reply_markup: keyboard
    });
}

async function showAvailableQuests(ctx, player) {
    const availableQuests = QuestService.getAvailableQuests(player);
    
    if (availableQuests.length === 0) {
        const message = 
            `📋 *Available Quests*\n\n` +
            `Tidak ada quest yang tersedia saat ini.\n\n` +
            `💡 Tingkatkan level atau selesaikan quest lain untuk membuka quest baru!`;
        
        const keyboard = new InlineKeyboard()
            .text('🎯 Active Quests', 'quest_type_active')
            .text('🔙 Back', 'refresh_quests');
        
        await ctx.editMessageText(message, {
            parse_mode: 'Markdown',
            reply_markup: keyboard
        });
        return;
    }
    
    let message = `📋 *Available Quests*\n\n`;
    const keyboard = new InlineKeyboard();
    
    for (const quest of availableQuests.slice(0, 10)) { // Limit to 10 quests
        const typeEmojis = {
            main: '📖',
            daily: '📅',
            weekly: '📆',
            side: '📝',
            achievement: '🏆'
        };
        
        const emoji = typeEmojis[quest.type] || '📜';
        
        message += `${emoji} **${quest.name}**\n`;
        message += `${quest.description}\n`;
        
        if (quest.requirements.level > 1) {
            message += `🎯 Level requirement: ${quest.requirements.level}\n`;
        }
        
        // Show rewards
        if (quest.rewards.xp) message += `⭐ +${quest.rewards.xp} XP `;
        if (quest.rewards.gold) message += `💰 +${quest.rewards.gold} Gold `;
        if (quest.rewards.items) {
            const itemNames = Object.keys(quest.rewards.items);
            if (itemNames.length > 0) {
                message += `🎁 ${itemNames.join(', ')}`;
            }
        }
        message += `\n\n`;
        
        keyboard.text(`Start ${quest.name}`, `quest_start_${quest.id}`);
        
        if (keyboard.inline_keyboard.length > 0 && keyboard.inline_keyboard[keyboard.inline_keyboard.length - 1].length >= 2) {
            keyboard.row();
        }
    }
    
    keyboard.row().text('🔙 Back to Quests', 'refresh_quests');
    
    await ctx.editMessageText(message, {
        parse_mode: 'Markdown',
        reply_markup: keyboard
    });
}

async function showQuestsByType(ctx, player, questType) {
    const typeQuests = Object.values(quests).filter(q => q.type === questType);
    
    const typeNames = {
        daily: '📅 Daily Quests',
        weekly: '📆 Weekly Quests',
        achievement: '🏆 Achievement Quests',
        main: '📖 Main Story Quests'
    };
    
    let message = `${typeNames[questType]}\n\n`;
    const keyboard = new InlineKeyboard();
    
    if (typeQuests.length === 0) {
        message += `Tidak ada quest di kategori ini.`;
    } else {
        for (const quest of typeQuests.slice(0, 8)) {
            const isActive = player.activeQuests.some(aq => aq.questId === quest.id);
            const isCompleted = player.completedQuests.includes(quest.id);
            
            let status = '';
            if (isActive) status = '🎯 ';
            else if (isCompleted) status = '✅ ';
            
            message += `${status}**${quest.name}**\n`;
            message += `${quest.description}\n`;
            
            if (quest.rewards.xp) message += `⭐ +${quest.rewards.xp} XP `;
            if (quest.rewards.gold) message += `💰 +${quest.rewards.gold} Gold\n`;
            
            message += `\n`;
            
            if (!isActive && !isCompleted) {
                keyboard.text(`Start ${quest.name}`, `quest_start_${quest.id}`);
                
                if (keyboard.inline_keyboard.length > 0 && keyboard.inline_keyboard[keyboard.inline_keyboard.length - 1].length >= 2) {
                    keyboard.row();
                }
            }
        }
    }
    
    keyboard.row().text('🔙 Back to Quests', 'refresh_quests');
    
    await ctx.editMessageText(message, {
        parse_mode: 'Markdown',
        reply_markup: keyboard
    });
}

async function handleStartQuest(ctx, questId) {
    const player = ctx.player;
    const result = await QuestService.startQuest(player, questId);
    
    if (result.success) {
        const quest = result.quest;
        
        let message = 
            `✅ **Quest Started!**\n\n` +
            `📜 **${quest.name}**\n` +
            `${quest.description}\n\n` +
            `🎯 **Objectives:**\n`;
        
        for (const [objective, target] of Object.entries(quest.objectives)) {
            const objectiveName = QuestService.formatObjectiveName(objective);
            message += `• ${objectiveName}: 0/${target}\n`;
        }
        
        message += `\n🏆 **Rewards:**\n`;
        if (quest.rewards.xp) message += `⭐ +${quest.rewards.xp} XP\n`;
        if (quest.rewards.gold) message += `💰 +${quest.rewards.gold} Gold\n`;
        if (quest.rewards.items) {
            for (const [itemName, quantity] of Object.entries(quest.rewards.items)) {
                message += `🎁 ${itemName} x${quantity}\n`;
            }
        }
        
        const keyboard = new InlineKeyboard()
            .text('🎯 Active Quests', 'quest_type_active')
            .text('🏹 Hunt', 'quick_hunt').row()
            .text('🔙 Back to Quests', 'refresh_quests');
        
        await ctx.editMessageText(message, {
            parse_mode: 'Markdown',
            reply_markup: keyboard
        });
        
        await ctx.answerCallbackQuery(`✅ Quest "${quest.name}" started!`);
    } else {
        await ctx.answerCallbackQuery(`❌ ${result.message}`);
    }
}

async function handleCompleteQuest(ctx, questId) {
    const player = ctx.player;
    const result = await QuestService.completeQuest(player, questId);
    
    if (result.success) {
        const quest = result.quest;
        
        let message = 
            `🎉 **Quest Completed!**\n\n` +
            `📜 **${quest.name}**\n` +
            `${quest.description}\n\n` +
            `🏆 **Rewards Received:**\n`;
        
        if (result.rewards.xp > 0) {
            message += `⭐ +${result.rewards.xp} XP\n`;
        }
        if (result.rewards.gold > 0) {
            message += `💰 +${result.rewards.gold} Gold\n`;
        }
        if (Object.keys(result.rewards.items).length > 0) {
            for (const [itemName, quantity] of Object.entries(result.rewards.items)) {
                message += `🎁 ${itemName} x${quantity}\n`;
            }
        }
        
        if (result.rewards.levelUps && result.rewards.levelUps.length > 0) {
            for (const levelUp of result.rewards.levelUps) {
                message += `\n🎉 **LEVEL UP!** ${levelUp.from} → ${levelUp.to}`;
            }
        }
        
        const keyboard = new InlineKeyboard()
            .text('📋 Available Quests', 'quest_type_available')
            .text('👤 Profile', 'quick_profile').row();
        
        if (result.nextQuest) {
            message += `\n\n📜 **Next Quest Available:**\n${result.nextQuest.name}`;
            keyboard.text(`Start ${result.nextQuest.name}`, `quest_start_${result.nextQuest.id}`);
        }
        
        keyboard.row().text('🔙 Back to Quests', 'refresh_quests');
        
        await ctx.editMessageText(message, {
            parse_mode: 'Markdown',
            reply_markup: keyboard
        });
        
        await ctx.answerCallbackQuery(`🎉 Quest completed! +${result.rewards.xp} XP, +${result.rewards.gold} Gold`);
    } else {
        await ctx.answerCallbackQuery(`❌ ${result.message}`);
    }
}

module.exports = {
    questCommand,
    handleQuestType,
    handleStartQuest,
    handleCompleteQuest
};

module.exports.default = questCommand;

