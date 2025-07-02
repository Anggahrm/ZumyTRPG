const { InlineKeyboard } = require('grammy');
const { requirePlayer, requireAlive } = require('../middlewares/playerLoader');
const { recipes, canCraftRecipe, craftItem } = require('../data/recipes');
const { items } = require('../data/items');
const { safeEditMessage, safeReply } = require('../utils/messageHelpers');
const Player = require('../models/Player');

// Main craft command
async function craftCommand(ctx) {
    const player = ctx.player;
    
    if (!player) {
        return await ctx.reply('❌ Kamu harus memulai game terlebih dahulu. Gunakan /start');
    }
    
    // Show craft menu with categories
    const keyboard = new InlineKeyboard()
        .text('⚔️ Weapons', 'craft_category_weapon')
        .text('🛡️ Armor', 'craft_category_armor').row()
        .text('💍 Accessories', 'craft_category_accessory')
        .text('🧪 Potions', 'craft_category_potion').row()
        .text('📜 Misc', 'craft_category_misc')
        .text('🔍 All', 'craft_category_all').row()
        .text('🔙 Back', 'quick_start');
    
    const message = 
        `⚒️ *Craft Menu*\n\n` +
        `🔨 Pilih kategori item yang ingin kamu craft:\n\n` +
        `💡 *Tips:*\n` +
        `• Pastikan kamu memiliki material yang dibutuhkan\n` +
        `• Level dan gold yang cukup diperlukan\n` +
        `• Success rate berbeda untuk setiap recipe`;
    
    if (ctx.callbackQuery) {
        await safeEditMessage(ctx, message, {
            parse_mode: 'Markdown',
            reply_markup: keyboard
        });
    } else {
        await safeReply(ctx, message, {
            parse_mode: 'Markdown',
            reply_markup: keyboard
        });
    }
}

// Handle craft category selection
async function handleCraftCategory(ctx, category) {
    const player = ctx.player;
    
    // Filter recipes by category
    let filteredRecipes = Object.values(recipes);
    if (category !== 'all') {
        filteredRecipes = filteredRecipes.filter(recipe => recipe.category === category);
    }
    
    // Sort by level requirement
    filteredRecipes.sort((a, b) => a.level - b.level);
    
    if (filteredRecipes.length === 0) {
        return await safeEditMessage(ctx, 
            `❌ Tidak ada recipe untuk kategori ${category}`,
            { reply_markup: new InlineKeyboard().text('🔙 Back', 'craft_category_all') }
        );
    }
    
    const keyboard = new InlineKeyboard();
    let row = 0;
    
    for (const recipe of filteredRecipes.slice(0, 15)) { // Limit to 15 recipes
        const canCraft = canCraftRecipe(player, recipe.id);
        const status = canCraft.canCraft ? '✅' : '❌';
        
        keyboard.text(
            `${status} ${recipe.name}`,
            `craft_view_${recipe.id}`
        );
        
        row++;
        if (row % 2 === 0) keyboard.row();
    }
    
    keyboard.row()
        .text('🔙 Back', 'craft_category_all')
        .text('🏠 Menu', 'quick_start');
    
    const categoryNames = {
        weapon: 'Weapons ⚔️',
        armor: 'Armor 🛡️',
        accessory: 'Accessories 💍',
        potion: 'Potions 🧪',
        misc: 'Miscellaneous 📜',
        all: 'All Items 🔍'
    };
    
    const message = 
        `⚒️ *Craft - ${categoryNames[category]}*\n\n` +
        `📋 Pilih recipe yang ingin kamu craft:\n\n` +
        `✅ = Bisa craft\n` +
        `❌ = Tidak bisa craft (cek requirement)`;
    
    try {
        await safeEditMessage(ctx, message, {
            parse_mode: 'Markdown',
            reply_markup: keyboard
        });
    } catch (error) {
        // Ignore "message not modified" errors
        if (!error.description || !error.description.includes('message is not modified')) {
            throw error;
        }
    }
}

// Handle recipe view
async function handleCraftView(ctx, recipeId) {
    const player = ctx.player;
    const recipe = recipes[recipeId];
    
    if (!recipe) {
        return await safeEditMessage(ctx, '❌ Recipe tidak ditemukan');
    }
    
    const canCraft = canCraftRecipe(player, recipeId);
    
    let message = 
        `⚒️ *${recipe.name}*\n\n` +
        `📝 ${recipe.description}\n\n` +
        `**Requirements:**\n` +
        `• Level: ${recipe.level} ${player.level >= recipe.level ? '✅' : '❌'}\n` +
        `• Gold: ${recipe.gold} ${player.gold >= recipe.gold ? '✅' : '❌'}\n\n` +
        `**Materials:**\n`;
    
    for (const [material, quantity] of Object.entries(recipe.materials)) {
        const hasQuantity = player.inventory.get(material) || 0;
        const status = hasQuantity >= quantity ? '✅' : '❌';
        message += `• ${material}: ${hasQuantity}/${quantity} ${status}\n`;
    }
    
    message += 
        `\n**Rewards:**\n` +
        `• Item: ${recipe.result}\n` +
        `• XP: +${recipe.xp}\n` +
        `• Success Rate: ${(recipe.successRate * 100).toFixed(0)}%`;
    
    if (!canCraft.canCraft) {
        message += `\n\n❌ **Cannot craft:** ${canCraft.reason}`;
    }
    
    const keyboard = new InlineKeyboard();
    
    if (canCraft.canCraft) {
        keyboard.text('🔨 Craft', `craft_do_${recipeId}`);
    }
    
    keyboard.text('🔙 Back', `craft_category_${recipe.category}`)
        .text('🏠 Menu', 'quick_start');
    
    await safeEditMessage(ctx, message, {
        parse_mode: 'Markdown',
        reply_markup: keyboard
    });
}

// Handle actual crafting
async function handleCraftDo(ctx, recipeId) {
    const player = ctx.player;
    const recipe = recipes[recipeId];
    
    if (!recipe) {
        return await safeEditMessage(ctx, '❌ Recipe tidak ditemukan');
    }
    
    const canCraft = canCraftRecipe(player, recipeId);
    if (!canCraft.canCraft) {
        return await safeEditMessage(ctx, `❌ Tidak bisa craft: ${canCraft.reason}`);
    }
    
    // Show crafting in progress
    await safeEditMessage(ctx, '⚒️ Sedang crafting...');
    
    try {
        const result = await craftItem(player, recipeId);
        
        if (result.success) {
            const item = items[recipe.result];
            const rarity = item ? item.rarity : 'common';
            
            let message = 
                `✨ *Craft Berhasil!*\n\n` +
                `🎁 Kamu berhasil membuat **${recipe.result}** (${rarity})\n` +
                `⭐ +${recipe.xp} XP\n\n`;
            
            // Add level up info if any
            if (result.levelUps && result.levelUps.length > 0) {
                for (const levelUp of result.levelUps) {
                    message += `🎉 **LEVEL UP!** ${levelUp.from} → ${levelUp.to}\n`;
                }
                message += '\n';
            }
            
            message += `💰 Gold: ${result.newGold}\n`;
            
            const keyboard = new InlineKeyboard()
                .text('🔨 Craft Lagi', `craft_view_${recipeId}`)
                .text('⚒️ Craft Menu', 'craft_category_all').row()
                .text('🎒 Inventory', 'quick_inventory')
                .text('🏠 Menu', 'quick_start');
            
            await safeEditMessage(ctx, message, {
                parse_mode: 'Markdown',
                reply_markup: keyboard
            });
        } else {
            let message = 
                `💥 *Craft Gagal!*\n\n` +
                `😞 Crafting ${recipe.result} gagal...\n` +
                `💸 Material dan gold tetap hilang\n\n` +
                `💡 *Tips:* Coba lagi atau tingkatkan level untuk success rate yang lebih baik`;
            
            const keyboard = new InlineKeyboard()
                .text('🔨 Coba Lagi', `craft_view_${recipeId}`)
                .text('⚒️ Craft Menu', 'craft_category_all').row()
                .text('🏠 Menu', 'quick_start');
            
            await safeEditMessage(ctx, message, {
                parse_mode: 'Markdown',
                reply_markup: keyboard
            });
        }
        
    } catch (error) {
        console.error('Craft error:', error);
        await safeEditMessage(ctx, '❌ Terjadi error saat crafting. Silakan coba lagi.');
    }
}

module.exports = {
    craftCommand,
    handleCraftCategory,
    handleCraftView,
    handleCraftDo
};
