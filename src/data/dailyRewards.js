const dailyRewards = [
    // Day 1-7 (First week)
    { day: 1, gold: 100, gems: 5, items: {} },
    { day: 2, gold: 150, gems: 5, items: { "Health Potion": 1 } },
    { day: 3, gold: 200, gems: 10, items: {} },
    { day: 4, gold: 250, gems: 10, items: { "Iron Ore": 2 } },
    { day: 5, gold: 300, gems: 15, items: { "Magic Crystal": 1 } },
    { day: 6, gold: 400, gems: 20, items: { "Health Potion": 2, "Mana Potion": 1 } },
    { day: 7, gold: 500, gems: 25, items: { "Legendary Chest": 1 }, bonus: "🎉 Weekly Bonus!" },
    
    // Day 8-14 (Second week)
    { day: 8, gold: 200, gems: 10, items: {} },
    { day: 9, gold: 250, gems: 15, items: { "Steel Ore": 2 } },
    { day: 10, gold: 300, gems: 15, items: { "Health Potion": 2 } },
    { day: 11, gold: 350, gems: 20, items: { "Magic Crystal": 2 } },
    { day: 12, gold: 400, gems: 25, items: { "Mana Potion": 2 } },
    { day: 13, gold: 500, gems: 30, items: { "Rare Chest": 1 } },
    { day: 14, gold: 750, gems: 50, items: { "Epic Chest": 1 }, bonus: "🎊 Two Week Streak!" },
    
    // Day 15-21 (Third week)
    { day: 15, gold: 300, gems: 15, items: {} },
    { day: 16, gold: 400, gems: 20, items: { "Mithril Ore": 1 } },
    { day: 17, gold: 500, gems: 25, items: { "Health Potion": 3 } },
    { day: 18, gold: 600, gems: 30, items: { "Magic Crystal": 3 } },
    { day: 19, gold: 700, gems: 35, items: { "Rare Scroll": 1 } },
    { day: 20, gold: 800, gems: 40, items: { "Epic Chest": 1 } },
    { day: 21, gold: 1000, gems: 75, items: { "Legendary Chest": 1, "Epic Scroll": 1 }, bonus: "🏆 Three Week Master!" },
    
    // Day 22-28 (Fourth week)
    { day: 22, gold: 400, gems: 20, items: {} },
    { day: 23, gold: 500, gems: 25, items: { "Adamant Ore": 1 } },
    { day: 24, gold: 600, gems: 30, items: { "Mana Potion": 3 } },
    { day: 25, gold: 700, gems: 35, items: { "Magic Crystal": 4 } },
    { day: 26, gold: 800, gems: 40, items: { "Epic Chest": 2 } },
    { day: 27, gold: 900, gems: 45, items: { "Legendary Scroll": 1 } },
    { day: 28, gold: 1500, gems: 100, items: { "Mythic Chest": 1 }, bonus: "👑 Monthly Champion!" },
    
    // Day 29-30 (Bonus days)
    { day: 29, gold: 1000, gems: 50, items: { "Legendary Chest": 2 } },
    { day: 30, gold: 2000, gems: 150, items: { "Mythic Chest": 1, "Divine Scroll": 1 }, bonus: "🌟 Legendary Dedication!" }
];

// Daily login rewards for different tiers
const loginBonuses = {
    newbie: { // Level 1-10
        gold: 50,
        gems: 2,
        xp: 25
    },
    regular: { // Level 11-25
        gold: 100,
        gems: 5,
        xp: 50
    },
    veteran: { // Level 26-50
        gold: 200,
        gems: 10,
        xp: 100
    },
    elite: { // Level 51+
        gold: 300,
        gems: 15,
        xp: 150
    }
};

// Daily challenges
const dailyChallenges = [
    {
        id: 'hunt_monsters',
        name: '🏹 Monster Hunter',
        description: 'Hunt 5 monsters',
        requirement: 5,
        reward: { gold: 200, gems: 10, xp: 100 },
        type: 'hunt'
    },
    {
        id: 'complete_quests',
        name: '📜 Quest Master',
        description: 'Complete 2 quests',
        requirement: 2,
        reward: { gold: 300, gems: 15, xp: 150 },
        type: 'quest'
    },
    {
        id: 'craft_items',
        name: '🔨 Master Crafter',
        description: 'Craft 3 items',
        requirement: 3,
        reward: { gold: 250, gems: 12, xp: 125 },
        type: 'craft'
    },
    {
        id: 'earn_gold',
        name: '💰 Gold Digger',
        description: 'Earn 1000 gold',
        requirement: 1000,
        reward: { gold: 500, gems: 20, xp: 200 },
        type: 'gold'
    },
    {
        id: 'adventure_time',
        name: '🗺️ Explorer',
        description: 'Complete 3 adventures',
        requirement: 3,
        reward: { gold: 300, gems: 15, xp: 150 },
        type: 'adventure'
    }
];

module.exports = {
    dailyRewards,
    loginBonuses,
    dailyChallenges
};
