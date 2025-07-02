const consumables = {
    // Health Potions
    'Health Potion': {
        id: 'health_potion',
        name: 'Health Potion',
        description: 'Restores 50 HP instantly',
        type: 'healing',
        effect: {
            hp: 50
        },
        rarity: 'common',
        price: 100,
        craftable: true,
        requirements: {
            'Red Herb': 2,
            'Water': 1
        },
        icon: '❤️',
        stackable: true,
        maxStack: 99,
        cooldown: 0 // No cooldown for health potions
    },

    'Greater Health Potion': {
        id: 'greater_health_potion',
        name: 'Greater Health Potion',
        description: 'Restores 150 HP instantly',
        type: 'healing',
        effect: {
            hp: 150
        },
        rarity: 'rare',
        price: 300,
        craftable: true,
        requirements: {
            'Health Potion': 2,
            'Magic Crystal': 1,
            'Blue Herb': 1
        },
        icon: '💚',
        stackable: true,
        maxStack: 50,
        cooldown: 0
    },

    'Full Health Potion': {
        id: 'full_health_potion',
        name: 'Full Health Potion',
        description: 'Restores all HP instantly',
        type: 'healing',
        effect: {
            hp: 'full'
        },
        rarity: 'epic',
        price: 800,
        craftable: true,
        requirements: {
            'Greater Health Potion': 3,
            'Phoenix Feather': 1,
            'Pure Water': 1
        },
        icon: '💖',
        stackable: true,
        maxStack: 20,
        cooldown: 300 // 5 minutes cooldown
    },

    // Mana/Energy Potions
    'Mana Potion': {
        id: 'mana_potion',
        name: 'Mana Potion',
        description: 'Reduces all cooldowns by 30 minutes',
        type: 'utility',
        effect: {
            cooldown_reduction: 30 * 60 * 1000 // 30 minutes in ms
        },
        rarity: 'uncommon',
        price: 200,
        craftable: true,
        requirements: {
            'Blue Herb': 2,
            'Magic Crystal': 1
        },
        icon: '💙',
        stackable: true,
        maxStack: 50,
        cooldown: 600 // 10 minutes cooldown
    },

    'Energy Drink': {
        id: 'energy_drink',
        name: 'Energy Drink',
        description: 'Instantly resets all cooldowns',
        type: 'utility',
        effect: {
            reset_cooldowns: true
        },
        rarity: 'rare',
        price: 500,
        craftable: false,
        icon: '⚡',
        stackable: true,
        maxStack: 10,
        cooldown: 1800 // 30 minutes cooldown
    },

    // Buff Potions
    'Strength Potion': {
        id: 'strength_potion',
        name: 'Strength Potion',
        description: 'Increases attack by 50% for 1 hour',
        type: 'buff',
        effect: {
            attack_multiplier: 1.5,
            duration: 60 * 60 * 1000 // 1 hour in ms
        },
        rarity: 'rare',
        price: 400,
        craftable: true,
        requirements: {
            'Red Herb': 3,
            'Beast Claw': 1,
            'Magic Crystal': 1
        },
        icon: '💪',
        stackable: true,
        maxStack: 20,
        cooldown: 0
    },

    'Defense Potion': {
        id: 'defense_potion',
        name: 'Defense Potion',
        description: 'Increases defense by 50% for 1 hour',
        type: 'buff',
        effect: {
            defense_multiplier: 1.5,
            duration: 60 * 60 * 1000 // 1 hour in ms
        },
        rarity: 'rare',
        price: 400,
        craftable: true,
        requirements: {
            'Blue Herb': 3,
            'Iron Ore': 2,
            'Magic Crystal': 1
        },
        icon: '🛡️',
        stackable: true,
        maxStack: 20,
        cooldown: 0
    },

    'Luck Potion': {
        id: 'luck_potion',
        name: 'Luck Potion',
        description: 'Increases drop rates and critical chance by 25% for 2 hours',
        type: 'buff',
        effect: {
            luck_multiplier: 1.25,
            duration: 2 * 60 * 60 * 1000 // 2 hours in ms
        },
        rarity: 'epic',
        price: 600,
        craftable: true,
        requirements: {
            'Golden Herb': 2,
            'Rabbit Foot': 1,
            'Magic Crystal': 2
        },
        icon: '🍀',
        stackable: true,
        maxStack: 15,
        cooldown: 0
    },

    'XP Potion': {
        id: 'xp_potion',
        name: 'XP Boost Potion',
        description: 'Increases XP gain by 100% for 30 minutes',
        type: 'buff',
        effect: {
            xp_multiplier: 2.0,
            duration: 30 * 60 * 1000 // 30 minutes in ms
        },
        rarity: 'epic',
        price: 800,
        craftable: true,
        requirements: {
            'Purple Herb': 3,
            'Wisdom Scroll': 1,
            'Pure Water': 1
        },
        icon: '⭐',
        stackable: true,
        maxStack: 10,
        cooldown: 0
    },

    // Food Items
    'Bread': {
        id: 'bread',
        name: 'Bread',
        description: 'Restores 25 HP',
        type: 'food',
        effect: {
            hp: 25
        },
        rarity: 'common',
        price: 20,
        craftable: true,
        requirements: {
            'Wheat': 2
        },
        icon: '🍞',
        stackable: true,
        maxStack: 99,
        cooldown: 0
    },

    'Steak': {
        id: 'steak',
        name: 'Grilled Steak',
        description: 'Restores 80 HP and gives +10 attack for 30 minutes',
        type: 'food',
        effect: {
            hp: 80,
            attack_bonus: 10,
            duration: 30 * 60 * 1000 // 30 minutes
        },
        rarity: 'uncommon',
        price: 150,
        craftable: true,
        requirements: {
            'Raw Meat': 1,
            'Salt': 1
        },
        icon: '🥩',
        stackable: true,
        maxStack: 50,
        cooldown: 0
    },

    // Special Items
    'Phoenix Feather': {
        id: 'phoenix_feather',
        name: 'Phoenix Feather',
        description: 'Revives player with full HP when used at 0 HP (Auto-use)',
        type: 'special',
        effect: {
            revive: true,
            hp: 'full'
        },
        rarity: 'legendary',
        price: 2000,
        craftable: false,
        icon: '🪶',
        stackable: true,
        maxStack: 5,
        cooldown: 0,
        autoUse: true // Automatically used when player dies
    },

    'Teleport Scroll': {
        id: 'teleport_scroll',
        name: 'Teleport Scroll',
        description: 'Instantly escape from any dangerous situation',
        type: 'utility',
        effect: {
            escape: true
        },
        rarity: 'rare',
        price: 300,
        craftable: true,
        requirements: {
            'Magic Paper': 1,
            'Magic Crystal': 2
        },
        icon: '📜',
        stackable: true,
        maxStack: 20,
        cooldown: 0
    },

    // Antidotes and Cures
    'Antidote': {
        id: 'antidote',
        name: 'Antidote',
        description: 'Cures poison and negative effects',
        type: 'cure',
        effect: {
            cure_poison: true,
            cure_debuffs: true
        },
        rarity: 'uncommon',
        price: 80,
        craftable: true,
        requirements: {
            'Green Herb': 2,
            'Pure Water': 1
        },
        icon: '🧪',
        stackable: true,
        maxStack: 50,
        cooldown: 0
    }
};

// Herbs and materials for crafting
const consumableMaterials = {
    'Red Herb': { rarity: 'common', price: 10, description: 'Basic healing herb' },
    'Blue Herb': { rarity: 'common', price: 15, description: 'Magical energy herb' },
    'Green Herb': { rarity: 'common', price: 12, description: 'Purifying herb' },
    'Purple Herb': { rarity: 'rare', price: 50, description: 'Wisdom enhancing herb' },
    'Golden Herb': { rarity: 'epic', price: 100, description: 'Luck enhancing herb' },
    'Water': { rarity: 'common', price: 5, description: 'Clean water' },
    'Pure Water': { rarity: 'uncommon', price: 25, description: 'Blessed pure water' },
    'Magic Paper': { rarity: 'uncommon', price: 30, description: 'Paper infused with magic' },
    'Wisdom Scroll': { rarity: 'rare', price: 200, description: 'Ancient wisdom scroll' },
    'Rabbit Foot': { rarity: 'uncommon', price: 80, description: 'Lucky rabbit foot' },
    'Beast Claw': { rarity: 'uncommon', price: 60, description: 'Sharp beast claw' },
    'Wheat': { rarity: 'common', price: 8, description: 'Basic grain' },
    'Raw Meat': { rarity: 'common', price: 20, description: 'Fresh raw meat' },
    'Salt': { rarity: 'common', price: 5, description: 'Cooking salt' }
};

module.exports = {
    consumables,
    consumableMaterials
};
