const items = {
    // Materials
    'Wood': { 
        type: 'material', 
        value: 2, 
        rarity: 'common',
        description: 'Kayu biasa untuk crafting'
    },
    'Stone': { 
        type: 'material', 
        value: 3, 
        rarity: 'common',
        description: 'Batu keras untuk crafting'
    },
    'Iron Ore': { 
        type: 'material', 
        value: 5, 
        rarity: 'uncommon',
        description: 'Bijih besi untuk membuat equipment'
    },
    'Gold Ore': { 
        type: 'material', 
        value: 15, 
        rarity: 'rare',
        description: 'Bijih emas yang berharga'
    },
    'Mithril Ore': { 
        type: 'material', 
        value: 50, 
        rarity: 'epic',
        description: 'Bijih mithril yang sangat langka'
    },
    'Dragon Scale': { 
        type: 'material', 
        value: 100, 
        rarity: 'legendary',
        description: 'Sisik naga yang sangat kuat'
    },
    
    // Food & Consumables
    'Apple': { 
        type: 'food', 
        value: 5, 
        heal: 10, 
        rarity: 'common',
        description: 'Apel segar yang memulihkan HP'
    },
    'Fish': { 
        type: 'food', 
        value: 8, 
        heal: 20, 
        rarity: 'common',
        description: 'Ikan yang bergizi'
    },
    'Health Potion': { 
        type: 'consumable', 
        value: 50, 
        heal: 50, 
        rarity: 'uncommon',
        description: 'Ramuan yang memulihkan HP'
    },
    'Greater Health Potion': { 
        type: 'consumable', 
        value: 150, 
        heal: 150, 
        rarity: 'rare',
        description: 'Ramuan kuat yang memulihkan banyak HP'
    },
    'Mana Potion': { 
        type: 'consumable', 
        value: 75, 
        mana: 50, 
        rarity: 'uncommon',
        description: 'Ramuan yang memulihkan MP'
    },
    'Strength Potion': { 
        type: 'consumable', 
        value: 100, 
        effect: 'attack_boost', 
        duration: 3600, // 1 hour
        rarity: 'rare',
        description: 'Ramuan yang meningkatkan attack sementara'
    },
    
    // Weapons
    'Wooden Sword': { 
        type: 'weapon', 
        value: 10, 
        attack: 10, 
        rarity: 'common',
        description: 'Pedang kayu sederhana'
    },
    'Iron Sword': { 
        type: 'weapon', 
        value: 100, 
        attack: 25, 
        rarity: 'uncommon',
        description: 'Pedang besi yang tajam'
    },
    'Steel Sword': { 
        type: 'weapon', 
        value: 250, 
        attack: 40, 
        rarity: 'rare',
        description: 'Pedang baja berkualitas tinggi'
    },
    'Mithril Sword': { 
        type: 'weapon', 
        value: 750, 
        attack: 65, 
        rarity: 'epic',
        description: 'Pedang mithril yang sangat tajam'
    },
    'Dragon Slayer': { 
        type: 'weapon', 
        value: 2000, 
        attack: 100, 
        rarity: 'legendary',
        description: 'Pedang legendaris pembunuh naga'
    },
    
    // Armor
    'Cloth Armor': { 
        type: 'armor', 
        value: 8, 
        defense: 5, 
        rarity: 'common',
        description: 'Baju kain sederhana'
    },
    'Leather Armor': { 
        type: 'armor', 
        value: 80, 
        defense: 15, 
        rarity: 'uncommon',
        description: 'Armor kulit yang fleksibel'
    },
    'Iron Armor': { 
        type: 'armor', 
        value: 200, 
        defense: 25, 
        rarity: 'rare',
        description: 'Armor besi yang kokoh'
    },
    'Mithril Armor': { 
        type: 'armor', 
        value: 600, 
        defense: 40, 
        rarity: 'epic',
        description: 'Armor mithril yang ringan namun kuat'
    },
    'Dragon Armor': { 
        type: 'armor', 
        value: 1500, 
        defense: 60, 
        rarity: 'legendary',
        description: 'Armor dari sisik naga'
    },
    
    // Accessories
    'Ring of Strength': { 
        type: 'accessory', 
        value: 300, 
        attack: 10, 
        rarity: 'rare',
        description: 'Cincin yang meningkatkan kekuatan'
    },
    'Ring of Defense': { 
        type: 'accessory', 
        value: 300, 
        defense: 10, 
        rarity: 'rare',
        description: 'Cincin yang meningkatkan pertahanan'
    },
    'Amulet of Health': { 
        type: 'accessory', 
        value: 500, 
        hp: 50, 
        rarity: 'epic',
        description: 'Jimat yang meningkatkan HP maksimum'
    },
    
    // Pets
    'Wolf Pup': { 
        type: 'pet', 
        value: 1000, 
        attack: 5, 
        rarity: 'rare',
        description: 'Anak serigala yang setia'
    },
    'Dragon Hatchling': { 
        type: 'pet', 
        value: 5000, 
        attack: 15, 
        defense: 10, 
        rarity: 'legendary',
        description: 'Bayi naga yang akan tumbuh kuat'
    },
    
    // Special Items
    'Teleport Scroll': { 
        type: 'special', 
        value: 200, 
        rarity: 'uncommon',
        description: 'Gulungan untuk teleportasi instan'
    },
    'Resurrection Stone': { 
        type: 'special', 
        value: 1000, 
        rarity: 'epic',
        description: 'Batu untuk menghidupkan kembali'
    },
    'Lucky Charm': { 
        type: 'special', 
        value: 500, 
        effect: 'luck_boost', 
        rarity: 'rare',
        description: 'Jimat yang meningkatkan keberuntungan'
    }
};

// Helper function to get items by type
function getItemsByType(type) {
    return Object.entries(items)
        .filter(([name, item]) => item.type === type)
        .reduce((acc, [name, item]) => {
            acc[name] = item;
            return acc;
        }, {});
}

// Helper function to get items by rarity
function getItemsByRarity(rarity) {
    return Object.entries(items)
        .filter(([name, item]) => item.rarity === rarity)
        .reduce((acc, [name, item]) => {
            acc[name] = item;
            return acc;
        }, {});
}

// Rarity colors for display
const rarityColors = {
    'common': '⚪',
    'uncommon': '🟢',
    'rare': '🔵',
    'epic': '🟣',
    'legendary': '🟡'
};

module.exports = {
    items,
    getItemsByType,
    getItemsByRarity,
    rarityColors
};

