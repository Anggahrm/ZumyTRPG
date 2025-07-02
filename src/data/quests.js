const quests = {
    // Beginner quests
    'first_hunt': {
        id: 'first_hunt',
        name: 'First Hunt',
        description: 'Berburu monster untuk pertama kalinya',
        type: 'main',
        requirements: {
            level: 1
        },
        objectives: {
            hunt_monsters: 1
        },
        rewards: {
            xp: 50,
            gold: 100,
            items: { 'Health Potion': 2 }
        },
        nextQuest: 'goblin_slayer'
    },
    
    'goblin_slayer': {
        id: 'goblin_slayer',
        name: 'Goblin Slayer',
        description: 'Bunuh 5 goblin untuk melindungi desa',
        type: 'main',
        requirements: {
            level: 2,
            completedQuests: ['first_hunt']
        },
        objectives: {
            kill_goblin: 5
        },
        rewards: {
            xp: 100,
            gold: 200,
            items: { 'Iron Sword': 1 }
        },
        nextQuest: 'dungeon_explorer'
    },
    
    'dungeon_explorer': {
        id: 'dungeon_explorer',
        name: 'Dungeon Explorer',
        description: 'Selesaikan dungeon pertama kamu',
        type: 'main',
        requirements: {
            level: 5,
            completedQuests: ['goblin_slayer']
        },
        objectives: {
            complete_dungeon: 1
        },
        rewards: {
            xp: 300,
            gold: 500,
            items: { 'Steel Sword': 1, 'Leather Armor': 1 }
        },
        nextQuest: 'guild_member'
    },
    
    'guild_member': {
        id: 'guild_member',
        name: 'Guild Member',
        description: 'Bergabung dengan guild atau buat guild sendiri',
        type: 'main',
        requirements: {
            level: 8,
            completedQuests: ['dungeon_explorer']
        },
        objectives: {
            join_guild: 1
        },
        rewards: {
            xp: 200,
            gold: 300,
            items: { 'Ring of Strength': 1 }
        },
        nextQuest: 'dragon_hunter'
    },
    
    'dragon_hunter': {
        id: 'dragon_hunter',
        name: 'Dragon Hunter',
        description: 'Kalahkan naga pertama kamu',
        type: 'main',
        requirements: {
            level: 15,
            completedQuests: ['guild_member']
        },
        objectives: {
            kill_dragon: 1
        },
        rewards: {
            xp: 1000,
            gold: 2000,
            items: { 'Dragon Slayer': 1, 'Dragon Scale': 5 }
        }
    },
    
    // Daily quests
    'daily_hunter': {
        id: 'daily_hunter',
        name: 'Daily Hunter',
        description: 'Berburu 3 monster hari ini',
        type: 'daily',
        requirements: {
            level: 1
        },
        objectives: {
            hunt_monsters: 3
        },
        rewards: {
            xp: 75,
            gold: 150,
            items: { 'Health Potion': 1 }
        },
        resetDaily: true
    },
    
    'daily_worker': {
        id: 'daily_worker',
        name: 'Daily Worker',
        description: 'Bekerja 2 kali hari ini',
        type: 'daily',
        requirements: {
            level: 1
        },
        objectives: {
            work_count: 2
        },
        rewards: {
            xp: 50,
            gold: 100,
            items: { 'Apple': 2 }
        },
        resetDaily: true
    },
    
    'daily_crafter': {
        id: 'daily_crafter',
        name: 'Daily Crafter',
        description: 'Craft 1 item hari ini',
        type: 'daily',
        requirements: {
            level: 3
        },
        objectives: {
            craft_items: 1
        },
        rewards: {
            xp: 100,
            gold: 200,
            items: { 'Iron Ore': 2 }
        },
        resetDaily: true
    },
    
    // Weekly quests
    'weekly_dungeon': {
        id: 'weekly_dungeon',
        name: 'Weekly Dungeon',
        description: 'Selesaikan 3 dungeon minggu ini',
        type: 'weekly',
        requirements: {
            level: 5
        },
        objectives: {
            complete_dungeon: 3
        },
        rewards: {
            xp: 500,
            gold: 1000,
            items: { 'Greater Health Potion': 3, 'Gold Ore': 2 }
        },
        resetWeekly: true
    },
    
    'weekly_boss': {
        id: 'weekly_boss',
        name: 'Weekly Boss',
        description: 'Kalahkan 2 boss minggu ini',
        type: 'weekly',
        requirements: {
            level: 10
        },
        objectives: {
            kill_boss: 2
        },
        rewards: {
            xp: 800,
            gold: 1500,
            items: { 'Mithril Ore': 1, 'Lucky Charm': 1 }
        },
        resetWeekly: true
    },
    
    // Side quests
    'material_collector': {
        id: 'material_collector',
        name: 'Material Collector',
        description: 'Kumpulkan 50 Wood dan 30 Stone',
        type: 'side',
        requirements: {
            level: 3
        },
        objectives: {
            collect_wood: 50,
            collect_stone: 30
        },
        rewards: {
            xp: 200,
            gold: 400,
            items: { 'Iron Ore': 5 }
        }
    },
    
    'equipment_master': {
        id: 'equipment_master',
        name: 'Equipment Master',
        description: 'Craft 10 equipment items',
        type: 'side',
        requirements: {
            level: 8
        },
        objectives: {
            craft_equipment: 10
        },
        rewards: {
            xp: 500,
            gold: 1000,
            items: { 'Mithril Ore': 3, 'Ring of Defense': 1 }
        }
    },
    
    'monster_encyclopedia': {
        id: 'monster_encyclopedia',
        name: 'Monster Encyclopedia',
        description: 'Bunuh setidaknya 1 dari setiap jenis monster',
        type: 'side',
        requirements: {
            level: 10
        },
        objectives: {
            kill_goblin: 1,
            kill_wolf: 1,
            kill_orc: 1,
            kill_skeleton: 1,
            kill_troll: 1,
            kill_dark_elf: 1,
            kill_minotaur: 1,
            kill_wyvern: 1,
            kill_lich: 1,
            kill_demon: 1
        },
        rewards: {
            xp: 1000,
            gold: 2000,
            items: { 'Amulet of Health': 1, 'Wolf Pup': 1 }
        }
    },
    
    // Achievement quests
    'level_master': {
        id: 'level_master',
        name: 'Level Master',
        description: 'Capai level 20',
        type: 'achievement',
        requirements: {
            level: 20
        },
        objectives: {
            reach_level: 20
        },
        rewards: {
            xp: 2000,
            gold: 5000,
            items: { 'Dragon Hatchling': 1, 'Resurrection Stone': 1 }
        }
    },
    
    'gold_collector': {
        id: 'gold_collector',
        name: 'Gold Collector',
        description: 'Kumpulkan total 10,000 gold',
        type: 'achievement',
        requirements: {
            level: 5
        },
        objectives: {
            total_gold_earned: 10000
        },
        rewards: {
            xp: 500,
            gold: 2000,
            items: { 'Lucky Charm': 1 }
        }
    }
};

// Helper functions
function getQuestsByType(type) {
    return Object.entries(quests)
        .filter(([id, quest]) => quest.type === type)
        .reduce((acc, [id, quest]) => {
            acc[id] = quest;
            return acc;
        }, {});
}

function getAvailableQuests(player) {
    const available = [];
    
    for (const [questId, quest] of Object.entries(quests)) {
        // Check if already completed (except daily/weekly)
        if (!quest.resetDaily && !quest.resetWeekly && player.completedQuests.includes(questId)) {
            continue;
        }
        
        // Check if already active
        if (player.activeQuests.some(aq => aq.questId === questId)) {
            continue;
        }
        
        // Check level requirement
        if (quest.requirements.level && player.level < quest.requirements.level) {
            continue;
        }
        
        // Check completed quests requirement
        if (quest.requirements.completedQuests) {
            const hasRequired = quest.requirements.completedQuests.every(reqQuest => 
                player.completedQuests.includes(reqQuest)
            );
            if (!hasRequired) {
                continue;
            }
        }
        
        available.push(quest);
    }
    
    return available;
}

function checkQuestProgress(player, action, data = {}) {
    const updates = [];
    
    for (const activeQuest of player.activeQuests) {
        const quest = quests[activeQuest.questId];
        if (!quest) continue;
        
        let progressMade = false;
        
        // Check each objective
        for (const [objective, target] of Object.entries(quest.objectives)) {
            const current = activeQuest.progress.get(objective) || 0;
            
            if (current >= target) continue; // Already completed
            
            let increment = 0;
            
            switch (objective) {
                case 'hunt_monsters':
                    if (action === 'hunt') increment = 1;
                    break;
                case 'work_count':
                    if (action === 'work') increment = 1;
                    break;
                case 'craft_items':
                case 'craft_equipment':
                    if (action === 'craft') increment = 1;
                    break;
                case 'complete_dungeon':
                    if (action === 'dungeon_complete') increment = 1;
                    break;
                case 'join_guild':
                    if (action === 'guild_join') increment = 1;
                    break;
                case 'reach_level':
                    if (action === 'level_up' && data.level >= target) {
                        activeQuest.progress.set(objective, target);
                        progressMade = true;
                    }
                    break;
                case 'total_gold_earned':
                    if (action === 'gold_earned' && data.amount) {
                        activeQuest.progress.set(objective, current + data.amount);
                        progressMade = true;
                    }
                    break;
                default:
                    // Handle monster kills
                    if (objective.startsWith('kill_') && action === 'monster_killed') {
                        const monsterType = objective.replace('kill_', '');
                        if (data.monsterName && data.monsterName.toLowerCase().includes(monsterType)) {
                            increment = 1;
                        }
                    }
                    // Handle collection objectives
                    if (objective.startsWith('collect_') && action === 'item_collected') {
                        const itemType = objective.replace('collect_', '');
                        if (data.itemName && data.itemName.toLowerCase().includes(itemType)) {
                            increment = data.amount || 1;
                        }
                    }
                    break;
            }
            
            if (increment > 0) {
                activeQuest.progress.set(objective, Math.min(current + increment, target));
                progressMade = true;
            }
        }
        
        if (progressMade) {
            updates.push(activeQuest);
        }
    }
    
    return updates;
}

function isQuestCompleted(activeQuest) {
    const quest = quests[activeQuest.questId];
    if (!quest) return false;
    
    for (const [objective, target] of Object.entries(quest.objectives)) {
        const current = activeQuest.progress.get(objective) || 0;
        if (current < target) {
            return false;
        }
    }
    
    return true;
}

module.exports = {
    quests,
    getQuestsByType,
    getAvailableQuests,
    checkQuestProgress,
    isQuestCompleted
};

