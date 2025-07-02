const monsters = {
    // Common monsters (Level 1-5)
    'Goblin': { 
        hp: 30, 
        attack: 8, 
        defense: 2, 
        xp: 15, 
        gold: [5, 15], 
        level: 1,
        rarity: 'common',
        items: ['Wood', 'Apple'],
        dropRates: { 'Wood': 0.6, 'Apple': 0.4 },
        description: 'Goblin kecil yang lemah'
    },
    'Wolf': { 
        hp: 40, 
        attack: 12, 
        defense: 3, 
        xp: 20, 
        gold: [8, 18], 
        level: 2,
        rarity: 'common',
        items: ['Wood', 'Fish'],
        dropRates: { 'Wood': 0.5, 'Fish': 0.3 },
        description: 'Serigala liar yang agresif'
    },
    'Orc': { 
        hp: 50, 
        attack: 15, 
        defense: 4, 
        xp: 25, 
        gold: [10, 25], 
        level: 3,
        rarity: 'common',
        items: ['Stone', 'Fish', 'Iron Ore'],
        dropRates: { 'Stone': 0.7, 'Fish': 0.4, 'Iron Ore': 0.1 },
        description: 'Orc yang kuat dan brutal'
    },
    'Skeleton': { 
        hp: 45, 
        attack: 10, 
        defense: 6, 
        xp: 22, 
        gold: [8, 20], 
        level: 3,
        rarity: 'common',
        items: ['Stone', 'Iron Ore'],
        dropRates: { 'Stone': 0.6, 'Iron Ore': 0.2 },
        description: 'Kerangka hidup yang mengerikan'
    },
    
    // Uncommon monsters (Level 5-10)
    'Troll': { 
        hp: 80, 
        attack: 20, 
        defense: 8, 
        xp: 40, 
        gold: [20, 40], 
        level: 6,
        rarity: 'uncommon',
        items: ['Stone', 'Iron Ore', 'Health Potion'],
        dropRates: { 'Stone': 0.8, 'Iron Ore': 0.3, 'Health Potion': 0.1 },
        description: 'Troll besar dengan regenerasi'
    },
    'Dark Elf': { 
        hp: 70, 
        attack: 25, 
        defense: 5, 
        xp: 45, 
        gold: [25, 45], 
        level: 7,
        rarity: 'uncommon',
        items: ['Iron Ore', 'Mana Potion', 'Gold Ore'],
        dropRates: { 'Iron Ore': 0.4, 'Mana Potion': 0.2, 'Gold Ore': 0.05 },
        description: 'Elf gelap dengan sihir'
    },
    'Minotaur': { 
        hp: 100, 
        attack: 30, 
        defense: 12, 
        xp: 60, 
        gold: [30, 60], 
        level: 8,
        rarity: 'uncommon',
        items: ['Iron Ore', 'Gold Ore', 'Strength Potion'],
        dropRates: { 'Iron Ore': 0.5, 'Gold Ore': 0.1, 'Strength Potion': 0.05 },
        description: 'Makhluk setengah banteng yang kuat'
    },
    
    // Rare monsters (Level 10-15)
    'Wyvern': { 
        hp: 150, 
        attack: 35, 
        defense: 15, 
        xp: 80, 
        gold: [50, 100], 
        level: 12,
        rarity: 'rare',
        items: ['Gold Ore', 'Dragon Scale', 'Greater Health Potion'],
        dropRates: { 'Gold Ore': 0.3, 'Dragon Scale': 0.05, 'Greater Health Potion': 0.1 },
        description: 'Naga kecil yang dapat terbang'
    },
    'Lich': { 
        hp: 120, 
        attack: 40, 
        defense: 10, 
        xp: 90, 
        gold: [60, 120], 
        level: 13,
        rarity: 'rare',
        items: ['Mithril Ore', 'Mana Potion', 'Teleport Scroll'],
        dropRates: { 'Mithril Ore': 0.1, 'Mana Potion': 0.3, 'Teleport Scroll': 0.05 },
        description: 'Penyihir undead yang kuat'
    },
    'Demon': { 
        hp: 180, 
        attack: 45, 
        defense: 20, 
        xp: 100, 
        gold: [80, 150], 
        level: 14,
        rarity: 'rare',
        items: ['Mithril Ore', 'Dragon Scale', 'Lucky Charm'],
        dropRates: { 'Mithril Ore': 0.15, 'Dragon Scale': 0.08, 'Lucky Charm': 0.03 },
        description: 'Iblis dari dimensi lain'
    },
    
    // Epic monsters (Level 15+)
    'Dragon': { 
        hp: 300, 
        attack: 60, 
        defense: 30, 
        xp: 200, 
        gold: [150, 300], 
        level: 18,
        rarity: 'epic',
        items: ['Dragon Scale', 'Mithril Ore', 'Dragon Hatchling'],
        dropRates: { 'Dragon Scale': 0.5, 'Mithril Ore': 0.2, 'Dragon Hatchling': 0.01 },
        description: 'Naga dewasa yang menguasai api'
    },
    'Ancient Golem': { 
        hp: 400, 
        attack: 50, 
        defense: 50, 
        xp: 250, 
        gold: [200, 400], 
        level: 20,
        rarity: 'epic',
        items: ['Mithril Ore', 'Resurrection Stone', 'Amulet of Health'],
        dropRates: { 'Mithril Ore': 0.3, 'Resurrection Stone': 0.02, 'Amulet of Health': 0.01 },
        description: 'Golem kuno dengan kekuatan magis'
    },
    
    // Legendary monsters (Raid bosses)
    'Shadow Dragon': { 
        hp: 1000, 
        attack: 80, 
        defense: 40, 
        xp: 500, 
        gold: [500, 1000], 
        level: 25,
        rarity: 'legendary',
        items: ['Dragon Scale', 'Dragon Slayer', 'Dragon Armor'],
        dropRates: { 'Dragon Scale': 0.8, 'Dragon Slayer': 0.05, 'Dragon Armor': 0.03 },
        description: 'Naga bayangan yang legendaris'
    },
    'Demon Lord': { 
        hp: 1200, 
        attack: 90, 
        defense: 35, 
        xp: 600, 
        gold: [600, 1200], 
        level: 28,
        rarity: 'legendary',
        items: ['Mithril Ore', 'Resurrection Stone', 'Ring of Strength'],
        dropRates: { 'Mithril Ore': 0.5, 'Resurrection Stone': 0.1, 'Ring of Strength': 0.02 },
        description: 'Raja iblis yang menguasai kegelapan'
    },
    'Titan': { 
        hp: 1500, 
        attack: 100, 
        defense: 60, 
        xp: 800, 
        gold: [800, 1500], 
        level: 30,
        rarity: 'legendary',
        items: ['Dragon Scale', 'Mithril Armor', 'Amulet of Health'],
        dropRates: { 'Dragon Scale': 0.6, 'Mithril Armor': 0.03, 'Amulet of Health': 0.02 },
        description: 'Titan raksasa dari zaman kuno'
    }
};

// Dungeon configurations
const dungeons = {
    'Goblin Cave': {
        name: 'Goblin Cave',
        minLevel: 3,
        maxLevel: 8,
        floors: 3,
        monsters: ['Goblin', 'Wolf', 'Orc'],
        boss: 'Troll',
        rewards: {
            gold: [100, 200],
            xp: 150,
            items: ['Iron Sword', 'Leather Armor', 'Health Potion'],
            dropRates: { 'Iron Sword': 0.1, 'Leather Armor': 0.1, 'Health Potion': 0.3 }
        },
        description: 'Gua yang dipenuhi goblin dan makhluk lemah lainnya'
    },
    
    'Skeleton Crypt': {
        name: 'Skeleton Crypt',
        minLevel: 8,
        maxLevel: 15,
        floors: 5,
        monsters: ['Skeleton', 'Dark Elf', 'Lich'],
        boss: 'Ancient Lich',
        rewards: {
            gold: [200, 400],
            xp: 300,
            items: ['Steel Sword', 'Iron Armor', 'Mana Potion'],
            dropRates: { 'Steel Sword': 0.08, 'Iron Armor': 0.08, 'Mana Potion': 0.2 }
        },
        description: 'Kuburan kuno yang dipenuhi undead'
    },
    
    'Dragon Lair': {
        name: 'Dragon Lair',
        minLevel: 15,
        maxLevel: 25,
        floors: 7,
        monsters: ['Wyvern', 'Demon', 'Dragon'],
        boss: 'Ancient Dragon',
        rewards: {
            gold: [500, 1000],
            xp: 600,
            items: ['Mithril Sword', 'Mithril Armor', 'Dragon Scale'],
            dropRates: { 'Mithril Sword': 0.05, 'Mithril Armor': 0.05, 'Dragon Scale': 0.3 }
        },
        description: 'Sarang naga yang berbahaya'
    },
    
    'Demon Realm': {
        name: 'Demon Realm',
        minLevel: 20,
        maxLevel: 30,
        floors: 10,
        monsters: ['Demon', 'Demon Lord'],
        boss: 'Demon King',
        rewards: {
            gold: [800, 1500],
            xp: 1000,
            items: ['Dragon Slayer', 'Dragon Armor', 'Resurrection Stone'],
            dropRates: { 'Dragon Slayer': 0.03, 'Dragon Armor': 0.03, 'Resurrection Stone': 0.05 }
        },
        description: 'Dimensi iblis yang penuh bahaya'
    }
};

// Helper functions
function getMonstersByLevel(minLevel, maxLevel) {
    return Object.entries(monsters)
        .filter(([name, monster]) => monster.level >= minLevel && monster.level <= maxLevel)
        .reduce((acc, [name, monster]) => {
            acc[name] = monster;
            return acc;
        }, {});
}

function getMonstersByRarity(rarity) {
    return Object.entries(monsters)
        .filter(([name, monster]) => monster.rarity === rarity)
        .reduce((acc, [name, monster]) => {
            acc[name] = monster;
            return acc;
        }, {});
}

function getRandomMonster(playerLevel) {
    const suitableMonsters = Object.entries(monsters)
        .filter(([name, monster]) => monster.level <= playerLevel + 2 && monster.level >= Math.max(1, playerLevel - 3));
    
    if (suitableMonsters.length === 0) {
        return ['Goblin', monsters['Goblin']];
    }
    
    const randomIndex = Math.floor(Math.random() * suitableMonsters.length);
    return suitableMonsters[randomIndex];
}

module.exports = {
    monsters,
    dungeons,
    getMonstersByLevel,
    getMonstersByRarity,
    getRandomMonster
};

