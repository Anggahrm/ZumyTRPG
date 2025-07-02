const recipes = {
    // Weapon recipes
    'iron_sword': {
        id: 'iron_sword',
        name: 'Iron Sword',
        result: 'Iron Sword',
        category: 'weapon',
        level: 3,
        materials: {
            'Iron Ore': 3,
            'Wood': 2
        },
        gold: 50,
        xp: 25,
        successRate: 0.9,
        description: 'Craft pedang besi yang tajam'
    },
    
    'steel_sword': {
        id: 'steel_sword',
        name: 'Steel Sword',
        result: 'Steel Sword',
        category: 'weapon',
        level: 8,
        materials: {
            'Iron Ore': 5,
            'Stone': 3,
            'Gold Ore': 1
        },
        gold: 150,
        xp: 50,
        successRate: 0.8,
        description: 'Craft pedang baja berkualitas tinggi'
    },
    
    'mithril_sword': {
        id: 'mithril_sword',
        name: 'Mithril Sword',
        result: 'Mithril Sword',
        category: 'weapon',
        level: 15,
        materials: {
            'Mithril Ore': 3,
            'Gold Ore': 2,
            'Dragon Scale': 1
        },
        gold: 500,
        xp: 100,
        successRate: 0.7,
        description: 'Craft pedang mithril yang sangat tajam'
    },
    
    'dragon_slayer': {
        id: 'dragon_slayer',
        name: 'Dragon Slayer',
        result: 'Dragon Slayer',
        category: 'weapon',
        level: 20,
        materials: {
            'Dragon Scale': 5,
            'Mithril Ore': 3,
            'Resurrection Stone': 1
        },
        gold: 1500,
        xp: 200,
        successRate: 0.5,
        description: 'Craft pedang legendaris pembunuh naga'
    },
    
    // Armor recipes
    'leather_armor': {
        id: 'leather_armor',
        name: 'Leather Armor',
        result: 'Leather Armor',
        category: 'armor',
        level: 2,
        materials: {
            'Wood': 4,
            'Stone': 2
        },
        gold: 30,
        xp: 20,
        successRate: 0.95,
        description: 'Craft armor kulit yang fleksibel'
    },
    
    'iron_armor': {
        id: 'iron_armor',
        name: 'Iron Armor',
        result: 'Iron Armor',
        category: 'armor',
        level: 6,
        materials: {
            'Iron Ore': 6,
            'Stone': 4
        },
        gold: 120,
        xp: 40,
        successRate: 0.85,
        description: 'Craft armor besi yang kokoh'
    },
    
    'mithril_armor': {
        id: 'mithril_armor',
        name: 'Mithril Armor',
        result: 'Mithril Armor',
        category: 'armor',
        level: 12,
        materials: {
            'Mithril Ore': 4,
            'Gold Ore': 3,
            'Iron Ore': 5
        },
        gold: 400,
        xp: 80,
        successRate: 0.75,
        description: 'Craft armor mithril yang ringan namun kuat'
    },
    
    'dragon_armor': {
        id: 'dragon_armor',
        name: 'Dragon Armor',
        result: 'Dragon Armor',
        category: 'armor',
        level: 18,
        materials: {
            'Dragon Scale': 8,
            'Mithril Ore': 2,
            'Gold Ore': 3
        },
        gold: 1000,
        xp: 150,
        successRate: 0.6,
        description: 'Craft armor dari sisik naga'
    },
    
    // Accessory recipes
    'ring_of_strength': {
        id: 'ring_of_strength',
        name: 'Ring of Strength',
        result: 'Ring of Strength',
        category: 'accessory',
        level: 10,
        materials: {
            'Gold Ore': 3,
            'Iron Ore': 2,
            'Stone': 5
        },
        gold: 200,
        xp: 60,
        successRate: 0.8,
        description: 'Craft cincin yang meningkatkan kekuatan'
    },
    
    'ring_of_defense': {
        id: 'ring_of_defense',
        name: 'Ring of Defense',
        result: 'Ring of Defense',
        category: 'accessory',
        level: 10,
        materials: {
            'Gold Ore': 3,
            'Stone': 8,
            'Iron Ore': 2
        },
        gold: 200,
        xp: 60,
        successRate: 0.8,
        description: 'Craft cincin yang meningkatkan pertahanan'
    },
    
    'amulet_of_health': {
        id: 'amulet_of_health',
        name: 'Amulet of Health',
        result: 'Amulet of Health',
        category: 'accessory',
        level: 15,
        materials: {
            'Mithril Ore': 2,
            'Gold Ore': 4,
            'Dragon Scale': 1
        },
        gold: 400,
        xp: 100,
        successRate: 0.7,
        description: 'Craft jimat yang meningkatkan HP maksimum'
    },
    
    // Consumable recipes
    'health_potion': {
        id: 'health_potion',
        name: 'Health Potion',
        result: 'Health Potion',
        category: 'consumable',
        level: 1,
        materials: {
            'Apple': 2,
            'Fish': 1
        },
        gold: 20,
        xp: 10,
        successRate: 0.95,
        description: 'Craft ramuan yang memulihkan HP'
    },
    
    'greater_health_potion': {
        id: 'greater_health_potion',
        name: 'Greater Health Potion',
        result: 'Greater Health Potion',
        category: 'consumable',
        level: 8,
        materials: {
            'Health Potion': 3,
            'Gold Ore': 1,
            'Apple': 5
        },
        gold: 100,
        xp: 40,
        successRate: 0.85,
        description: 'Craft ramuan kuat yang memulihkan banyak HP'
    },
    
    'mana_potion': {
        id: 'mana_potion',
        name: 'Mana Potion',
        result: 'Mana Potion',
        category: 'consumable',
        level: 5,
        materials: {
            'Fish': 3,
            'Stone': 2,
            'Apple': 1
        },
        gold: 50,
        xp: 25,
        successRate: 0.9,
        description: 'Craft ramuan yang memulihkan MP'
    },
    
    'strength_potion': {
        id: 'strength_potion',
        name: 'Strength Potion',
        result: 'Strength Potion',
        category: 'consumable',
        level: 12,
        materials: {
            'Mana Potion': 2,
            'Iron Ore': 3,
            'Gold Ore': 1
        },
        gold: 150,
        xp: 60,
        successRate: 0.8,
        description: 'Craft ramuan yang meningkatkan attack sementara'
    },
    
    // Special recipes
    'teleport_scroll': {
        id: 'teleport_scroll',
        name: 'Teleport Scroll',
        result: 'Teleport Scroll',
        category: 'special',
        level: 10,
        materials: {
            'Mana Potion': 1,
            'Gold Ore': 2,
            'Stone': 5
        },
        gold: 150,
        xp: 50,
        successRate: 0.8,
        description: 'Craft gulungan untuk teleportasi instan'
    },
    
    'lucky_charm': {
        id: 'lucky_charm',
        name: 'Lucky Charm',
        result: 'Lucky Charm',
        category: 'special',
        level: 15,
        materials: {
            'Gold Ore': 5,
            'Mithril Ore': 1,
            'Dragon Scale': 1
        },
        gold: 400,
        xp: 80,
        successRate: 0.7,
        description: 'Craft jimat yang meningkatkan keberuntungan'
    },
    
    'resurrection_stone': {
        id: 'resurrection_stone',
        name: 'Resurrection Stone',
        result: 'Resurrection Stone',
        category: 'special',
        level: 20,
        materials: {
            'Dragon Scale': 3,
            'Mithril Ore': 5,
            'Lucky Charm': 1
        },
        gold: 800,
        xp: 150,
        successRate: 0.5,
        description: 'Craft batu untuk menghidupkan kembali'
    }
};

// Helper functions
function getRecipesByCategory(category) {
    return Object.entries(recipes)
        .filter(([id, recipe]) => recipe.category === category)
        .reduce((acc, [id, recipe]) => {
            acc[id] = recipe;
            return acc;
        }, {});
}

function getRecipesByLevel(minLevel, maxLevel = Infinity) {
    return Object.entries(recipes)
        .filter(([id, recipe]) => recipe.level >= minLevel && recipe.level <= maxLevel)
        .reduce((acc, [id, recipe]) => {
            acc[id] = recipe;
            return acc;
        }, {});
}

function getAvailableRecipes(player) {
    return Object.entries(recipes)
        .filter(([id, recipe]) => player.level >= recipe.level)
        .reduce((acc, [id, recipe]) => {
            acc[id] = recipe;
            return acc;
        }, {});
}

function canCraftRecipe(player, recipeId) {
    const recipe = recipes[recipeId];
    if (!recipe) return { canCraft: false, reason: 'Recipe not found' };
    
    // Check level
    if (player.level < recipe.level) {
        return { canCraft: false, reason: `Level ${recipe.level} required` };
    }
    
    // Check gold
    if (player.gold < recipe.gold) {
        return { canCraft: false, reason: `Need ${recipe.gold} gold` };
    }
    
    // Check materials
    for (const [material, needed] of Object.entries(recipe.materials)) {
        const owned = player.inventory.get(material) || 0;
        if (owned < needed) {
            return { canCraft: false, reason: `Need ${needed} ${material}, have ${owned}` };
        }
    }
    
    return { canCraft: true };
}

async function craftItem(player, recipeId) {
    const PlayerService = require('../services/playerService');
    const QuestService = require('../services/questService');
    
    const recipe = recipes[recipeId];
    const canCraft = canCraftRecipe(player, recipeId);
    
    if (!canCraft.canCraft) {
        return { success: false, reason: canCraft.reason };
    }
    
    // Check success rate
    const success = Math.random() < recipe.successRate;
    
    // Consume materials and gold
    await PlayerService.removeGold(player, recipe.gold);
    for (const [material, needed] of Object.entries(recipe.materials)) {
        await PlayerService.removeItem(player, material, needed);
    }
    
    if (success) {
        // Give result item
        await PlayerService.addItem(player, recipe.result, 1);
        const xpResult = await PlayerService.addXp(player, recipe.xp);
        
        // Update stats
        await PlayerService.updateStats(player, { itemsCrafted: 1 });
        
        // Update quest progress
        await QuestService.updateQuestProgress(player, 'craft');
        await QuestService.updateQuestProgress(player, 'craft_items');
        if (recipe.category === 'weapon' || recipe.category === 'armor' || recipe.category === 'accessory') {
            await QuestService.updateQuestProgress(player, 'craft_equipment');
        }
        
        // Get updated player data
        const updatedPlayer = await PlayerService.getPlayer(player.userId);
        
        return { 
            success: true, 
            item: recipe.result, 
            xp: recipe.xp,
            levelUps: xpResult.levelUps,
            newGold: updatedPlayer.gold,
            message: `Successfully crafted ${recipe.result}!`
        };
    } else {
        // Get updated player data
        const updatedPlayer = await PlayerService.getPlayer(player.userId);
        
        return { 
            success: false, 
            reason: 'Crafting failed!',
            newGold: updatedPlayer.gold,
            message: 'Crafting failed! Materials were consumed.'
        };
    }
}

module.exports = {
    recipes,
    getRecipesByCategory,
    getRecipesByLevel,
    getAvailableRecipes,
    canCraftRecipe,
    craftItem
};

