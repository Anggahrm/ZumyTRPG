const achievements = [
    // Level Achievements
    {
        id: 'level_5',
        name: '🎯 First Steps',
        description: 'Reach level 5',
        type: 'level',
        requirement: 5,
        reward: { gold: 500, gems: 10 },
        icon: '🎯'
    },
    {
        id: 'level_10',
        name: '⭐ Rising Star',
        description: 'Reach level 10',
        type: 'level',
        requirement: 10,
        reward: { gold: 1000, gems: 25 },
        icon: '⭐'
    },
    {
        id: 'level_25',
        name: '🌟 Champion',
        description: 'Reach level 25',
        type: 'level',
        requirement: 25,
        reward: { gold: 2500, gems: 50 },
        icon: '🌟'
    },

    // Combat Achievements
    {
        id: 'first_kill',
        name: '⚔️ First Blood',
        description: 'Kill your first monster',
        type: 'kills',
        requirement: 1,
        reward: { gold: 100, gems: 5 },
        icon: '⚔️'
    },
    {
        id: 'monster_hunter',
        name: '🗡️ Monster Hunter',
        description: 'Kill 100 monsters',
        type: 'kills',
        requirement: 100,
        reward: { gold: 1500, gems: 30 },
        icon: '🗡️'
    },
    {
        id: 'monster_slayer',
        name: '🏹 Monster Slayer',
        description: 'Kill 500 monsters',
        type: 'kills',
        requirement: 500,
        reward: { gold: 5000, gems: 100 },
        icon: '🏹'
    },

    // Boss Achievements
    {
        id: 'first_boss',
        name: '👑 Boss Killer',
        description: 'Defeat your first boss',
        type: 'bosses',
        requirement: 1,
        reward: { gold: 1000, gems: 20 },
        icon: '👑'
    },
    {
        id: 'boss_hunter',
        name: '🔥 Boss Hunter',
        description: 'Defeat 10 bosses',
        type: 'bosses',
        requirement: 10,
        reward: { gold: 3000, gems: 75 },
        icon: '🔥'
    },

    // Gold Achievements
    {
        id: 'rich_1k',
        name: '💰 Getting Rich',
        description: 'Earn 1,000 total gold',
        type: 'gold_earned',
        requirement: 1000,
        reward: { gold: 200, gems: 10 },
        icon: '💰'
    },
    {
        id: 'rich_10k',
        name: '💎 Wealthy',
        description: 'Earn 10,000 total gold',
        type: 'gold_earned',
        requirement: 10000,
        reward: { gold: 1000, gems: 50 },
        icon: '💎'
    },
    {
        id: 'rich_100k',
        name: '👑 Millionaire',
        description: 'Earn 100,000 total gold',
        type: 'gold_earned',
        requirement: 100000,
        reward: { gold: 5000, gems: 200 },
        icon: '👑'
    },

    // Crafting Achievements
    {
        id: 'first_craft',
        name: '🔨 First Craft',
        description: 'Craft your first item',
        type: 'crafted',
        requirement: 1,
        reward: { gold: 200, gems: 5 },
        icon: '🔨'
    },
    {
        id: 'crafter',
        name: '⚒️ Skilled Crafter',
        description: 'Craft 50 items',
        type: 'crafted',
        requirement: 50,
        reward: { gold: 2000, gems: 40 },
        icon: '⚒️'
    },

    // Hunt Achievements
    {
        id: 'hunter_10',
        name: '🎯 Hunter',
        description: 'Complete 10 hunts',
        type: 'hunts',
        requirement: 10,
        reward: { gold: 300, gems: 15 },
        icon: '🎯'
    },
    {
        id: 'hunter_100',
        name: '🏹 Master Hunter',
        description: 'Complete 100 hunts',
        type: 'hunts',
        requirement: 100,
        reward: { gold: 2000, gems: 60 },
        icon: '🏹'
    },

    // Quest Achievements
    {
        id: 'first_quest',
        name: '📜 Quest Starter',
        description: 'Complete your first quest',
        type: 'quests',
        requirement: 1,
        reward: { gold: 300, gems: 10 },
        icon: '📜'
    },
    {
        id: 'quest_master',
        name: '🏆 Quest Master',
        description: 'Complete 25 quests',
        type: 'quests',
        requirement: 25,
        reward: { gold: 3000, gems: 80 },
        icon: '🏆'
    },

    // Dungeon Achievements
    {
        id: 'first_dungeon',
        name: '🏰 Dungeon Explorer',
        description: 'Complete your first dungeon',
        type: 'dungeons',
        requirement: 1,
        reward: { gold: 500, gems: 15 },
        icon: '🏰'
    },
    {
        id: 'dungeon_master',
        name: '🗝️ Dungeon Master',
        description: 'Complete 20 dungeons',
        type: 'dungeons',
        requirement: 20,
        reward: { gold: 4000, gems: 100 },
        icon: '🗝️'
    },

    // Special Achievements
    {
        id: 'collector',
        name: '🎒 Collector',
        description: 'Have 50 different items in inventory',
        type: 'collection',
        requirement: 50,
        reward: { gold: 2000, gems: 50 },
        icon: '🎒'
    },
    {
        id: 'survivor',
        name: '💪 Survivor',
        description: 'Survive 10 battles with less than 10% HP',
        type: 'survival',
        requirement: 10,
        reward: { gold: 1500, gems: 35 },
        icon: '💪'
    }
];

module.exports = achievements;
