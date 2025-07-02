const { quests, getAvailableQuests, checkQuestProgress, isQuestCompleted } = require('../data/quests');
const PlayerService = require('./playerService');

class QuestService {
    // Get available quests for player
    static getAvailableQuests(player) {
        return getAvailableQuests(player);
    }
    
    // Start a quest
    static async startQuest(player, questId) {
        const quest = quests[questId];
        if (!quest) {
            return { success: false, message: 'Quest tidak ditemukan' };
        }
        
        // Check if already active
        if (player.activeQuests.some(aq => aq.questId === questId)) {
            return { success: false, message: 'Quest sudah aktif' };
        }
        
        // Check if already completed (except daily/weekly)
        if (!quest.resetDaily && !quest.resetWeekly && player.completedQuests.includes(questId)) {
            return { success: false, message: 'Quest sudah diselesaikan' };
        }
        
        // Check requirements
        if (quest.requirements.level && player.level < quest.requirements.level) {
            return { success: false, message: `Level ${quest.requirements.level} diperlukan` };
        }
        
        if (quest.requirements.completedQuests) {
            const hasRequired = quest.requirements.completedQuests.every(reqQuest => 
                player.completedQuests.includes(reqQuest)
            );
            if (!hasRequired) {
                return { success: false, message: 'Quest prasyarat belum diselesaikan' };
            }
        }
        
        // Check daily/weekly reset
        if (quest.resetDaily) {
            const today = new Date().toDateString();
            const lastCompleted = player.lastQuestReset?.daily;
            if (lastCompleted && lastCompleted.toDateString() === today) {
                return { success: false, message: 'Daily quest sudah diselesaikan hari ini' };
            }
        }
        
        if (quest.resetWeekly) {
            const thisWeek = this.getWeekNumber(new Date());
            const lastCompleted = player.lastQuestReset?.weekly;
            if (lastCompleted && this.getWeekNumber(lastCompleted) === thisWeek) {
                return { success: false, message: 'Weekly quest sudah diselesaikan minggu ini' };
            }
        }
        
        // Initialize progress
        const progress = new Map();
        for (const objective of Object.keys(quest.objectives)) {
            progress.set(objective, 0);
        }
        
        // Add to active quests
        player.activeQuests.push({
            questId,
            progress,
            startedAt: new Date()
        });
        
        await player.save();
        
        return { success: true, quest };
    }
    
    // Complete a quest
    static async completeQuest(player, questId) {
        const quest = quests[questId];
        if (!quest) {
            return { success: false, message: 'Quest tidak ditemukan' };
        }
        
        const activeQuestIndex = player.activeQuests.findIndex(aq => aq.questId === questId);
        if (activeQuestIndex === -1) {
            return { success: false, message: 'Quest tidak aktif' };
        }
        
        const activeQuest = player.activeQuests[activeQuestIndex];
        
        // Check if completed
        if (!isQuestCompleted(activeQuest)) {
            return { success: false, message: 'Quest belum selesai' };
        }
        
        // Remove from active quests
        player.activeQuests.splice(activeQuestIndex, 1);
        
        // Add to completed quests
        if (!quest.resetDaily && !quest.resetWeekly) {
            player.completedQuests.push(questId);
        } else {
            // Update reset tracking
            if (!player.lastQuestReset) {
                player.lastQuestReset = {};
            }
            
            if (quest.resetDaily) {
                player.lastQuestReset.daily = new Date();
            }
            
            if (quest.resetWeekly) {
                player.lastQuestReset.weekly = new Date();
            }
        }
        
        // Award rewards
        const rewards = {
            xp: 0,
            gold: 0,
            items: {}
        };
        
        if (quest.rewards.xp) {
            const result = await PlayerService.addXp(player, quest.rewards.xp);
            rewards.xp = quest.rewards.xp;
            rewards.levelUps = result.levelUps;
        }
        
        if (quest.rewards.gold) {
            await PlayerService.addGold(player, quest.rewards.gold);
            rewards.gold = quest.rewards.gold;
        }
        
        if (quest.rewards.items) {
            for (const [itemName, quantity] of Object.entries(quest.rewards.items)) {
                await PlayerService.addItem(player, itemName, quantity);
                rewards.items[itemName] = quantity;
            }
        }
        
        await player.save();
        
        // Check for next quest
        let nextQuest = null;
        if (quest.nextQuest && quests[quest.nextQuest]) {
            nextQuest = quests[quest.nextQuest];
        }
        
        return { 
            success: true, 
            quest, 
            rewards,
            nextQuest
        };
    }
    
    // Update quest progress
    static async updateQuestProgress(player, action, data = {}) {
        const updatedQuests = checkQuestProgress(player, action, data);
        
        if (updatedQuests.length > 0) {
            await player.save();
        }
        
        // Check for completed quests
        const completedQuests = [];
        for (const activeQuest of player.activeQuests) {
            if (isQuestCompleted(activeQuest)) {
                completedQuests.push(activeQuest.questId);
            }
        }
        
        return {
            updatedQuests: updatedQuests.map(aq => aq.questId),
            completedQuests
        };
    }
    
    // Get quest progress display
    static getQuestProgressDisplay(player, questId) {
        const quest = quests[questId];
        if (!quest) return null;
        
        const activeQuest = player.activeQuests.find(aq => aq.questId === questId);
        if (!activeQuest) return null;
        
        const progressDisplay = [];
        
        for (const [objective, target] of Object.entries(quest.objectives)) {
            const current = activeQuest.progress.get(objective) || 0;
            const percentage = Math.min((current / target) * 100, 100);
            
            progressDisplay.push({
                objective: this.formatObjectiveName(objective),
                current,
                target,
                percentage,
                completed: current >= target
            });
        }
        
        return {
            quest,
            progress: progressDisplay,
            isCompleted: isQuestCompleted(activeQuest),
            startedAt: activeQuest.startedAt
        };
    }
    
    // Format objective name for display
    static formatObjectiveName(objective) {
        const objectiveNames = {
            hunt_monsters: 'Berburu monster',
            work_count: 'Bekerja',
            craft_items: 'Craft item',
            craft_equipment: 'Craft equipment',
            complete_dungeon: 'Selesaikan dungeon',
            join_guild: 'Bergabung dengan guild',
            reach_level: 'Mencapai level',
            total_gold_earned: 'Total gold yang diperoleh',
            kill_goblin: 'Bunuh Goblin',
            kill_wolf: 'Bunuh Wolf',
            kill_orc: 'Bunuh Orc',
            kill_skeleton: 'Bunuh Skeleton',
            kill_troll: 'Bunuh Troll',
            kill_dark_elf: 'Bunuh Dark Elf',
            kill_minotaur: 'Bunuh Minotaur',
            kill_wyvern: 'Bunuh Wyvern',
            kill_lich: 'Bunuh Lich',
            kill_demon: 'Bunuh Demon',
            kill_dragon: 'Bunuh Dragon',
            kill_boss: 'Bunuh boss',
            collect_wood: 'Kumpulkan Wood',
            collect_stone: 'Kumpulkan Stone'
        };
        
        return objectiveNames[objective] || objective;
    }
    
    // Get week number for weekly quest tracking
    static getWeekNumber(date) {
        const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
        const dayNum = d.getUTCDay() || 7;
        d.setUTCDate(d.getUTCDate() + 4 - dayNum);
        const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
        return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    }
    
    // Reset daily quests (call this daily)
    static async resetDailyQuests() {
        const dailyQuests = Object.keys(quests).filter(questId => quests[questId].resetDaily);
        
        // Remove completed daily quests from all players
        await Player.updateMany(
            { completedQuests: { $in: dailyQuests } },
            { $pullAll: { completedQuests: dailyQuests } }
        );
        
        console.log('Daily quests reset for all players');
    }
    
    // Reset weekly quests (call this weekly)
    static async resetWeeklyQuests() {
        const weeklyQuests = Object.keys(quests).filter(questId => quests[questId].resetWeekly);
        
        // Remove completed weekly quests from all players
        await Player.updateMany(
            { completedQuests: { $in: weeklyQuests } },
            { $pullAll: { completedQuests: weeklyQuests } }
        );
        
        console.log('Weekly quests reset for all players');
    }
    
    // Get quest statistics
    static async getQuestStatistics() {
        const totalQuests = Object.keys(quests).length;
        const mainQuests = Object.values(quests).filter(q => q.type === 'main').length;
        const dailyQuests = Object.values(quests).filter(q => q.type === 'daily').length;
        const weeklyQuests = Object.values(quests).filter(q => q.type === 'weekly').length;
        const sideQuests = Object.values(quests).filter(q => q.type === 'side').length;
        const achievementQuests = Object.values(quests).filter(q => q.type === 'achievement').length;
        
        return {
            total: totalQuests,
            main: mainQuests,
            daily: dailyQuests,
            weekly: weeklyQuests,
            side: sideQuests,
            achievement: achievementQuests
        };
    }
    
    // Get quest leaderboard (most quests completed)
    static async getQuestLeaderboard(limit = 10) {
        return await Player.aggregate([
            {
                $project: {
                    username: 1,
                    level: 1,
                    questsCompleted: { $size: '$completedQuests' }
                }
            },
            { $sort: { questsCompleted: -1, level: -1 } },
            { $limit: limit }
        ]);
    }
}

module.exports = QuestService;

