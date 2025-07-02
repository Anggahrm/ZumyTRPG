const { InlineKeyboard } = require('grammy');
const { safeEditMessage, safeReply } = require('../utils/messageHelpers');
const { requirePlayer } = require('../middlewares/playerLoader');
const PlayerService = require('../services/playerService');
const { items } = require('../data/items');
const { getItemRarityEmoji, formatNumber, chunkArray } = require('../utils/common');

async function inventoryCommand(ctx) {
    const player = ctx.player;
    
    if (!player) {
        return await ctx.reply('❌ Kamu harus memulai game terlebih dahulu. Gunakan /start');
    }
    
    const inventoryItems = PlayerService.getFormattedInventory(player);
    
    if (typeof inventoryItems === 'string') {
        // Empty inventory
        const message = 
            `🎒 *Inventory*\n\n` +
            `${inventoryItems}\n\n` +
            `💡 Mulai berburu atau bekerja untuk mendapatkan item!`;
        
        const keyboard = new InlineKeyboard()
            .text('🏹 Hunt', 'quick_hunt')
            .text('🔨 Work', 'quick_work').row()
            .text('🏪 Shop', 'shop_main');
        
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
        return;
    }
    
    // Show inventory categories
    const categories = {
        weapon: '⚔️ Weapons',
        armor: '🛡️ Armor',
        accessory: '💍 Accessories',
        consumable: '🧪 Consumables',
        material: '🔧 Materials',
        food: '🍎 Food',
        pet: '🐾 Pets',
        special: '📜 Special'
    };
    
    const categoryCounts = {};
    let totalValue = 0;
    
    for (const item of inventoryItems) {
        const itemData = items[item.name];
        const category = itemData ? itemData.type : 'material';
        categoryCounts[category] = (categoryCounts[category] || 0) + item.quantity;
        totalValue += item.totalValue;
    }
    
    let message = 
        `🎒 *Inventory*\n\n` +
        `📦 Total Items: ${inventoryItems.reduce((sum, item) => sum + item.quantity, 0)}\n` +
        `💰 Total Value: ${formatNumber(totalValue)} gold\n\n` +
        `📋 *Categories:*\n`;
    
    const keyboard = new InlineKeyboard();
    let buttonCount = 0;
    
    for (const [category, name] of Object.entries(categories)) {
        const count = categoryCounts[category] || 0;
        if (count > 0) {
            message += `${name}: ${count} items\n`;
            keyboard.text(`${name} (${count})`, `inv_category_${category}`);
            
            if (buttonCount % 2 === 1) {
                keyboard.row();
            }
            buttonCount++;
        }
    }
    
    keyboard.row()
        .text('🔄 Refresh', 'refresh_inventory')
        .text('👤 Profile', 'quick_profile');
    
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

async function handleInventoryCategory(ctx, category) {
    const player = ctx.player;
    const inventoryItems = PlayerService.getFormattedInventory(player);
    
    if (typeof inventoryItems === 'string') {
        return await ctx.answerCallbackQuery('❌ Inventory kosong.');
    }
    
    // Filter items by category
    const categoryItems = inventoryItems.filter(item => {
        const itemData = items[item.name];
        return itemData && itemData.type === category;
    });
    
    if (categoryItems.length === 0) {
        return await ctx.answerCallbackQuery('❌ Tidak ada item di kategori ini.');
    }
    
    const categoryNames = {
        weapon: '⚔️ Weapons',
        armor: '🛡️ Armor',
        accessory: '💍 Accessories',
        consumable: '🧪 Consumables',
        material: '🔧 Materials',
        food: '🍎 Food',
        pet: '🐾 Pets',
        special: '📜 Special'
    };
    
    let message = `${categoryNames[category]}\n\n`;
    
    const keyboard = new InlineKeyboard();
    let itemCount = 0;
    
    for (const item of categoryItems.slice(0, 15)) { // Limit to 15 items
        const itemData = items[item.name];
        const emoji = getItemRarityEmoji(item.rarity);
        
        message += `${emoji} **${item.name}** x${item.quantity}\n`;
        
        if (itemData) {
            const stats = [];
            if (itemData.attack) stats.push(`⚔️${itemData.attack}`);
            if (itemData.defense) stats.push(`🛡️${itemData.defense}`);
            if (itemData.hp) stats.push(`❤️${itemData.hp}`);
            if (itemData.heal) stats.push(`💚${itemData.heal}`);
            
            if (stats.length > 0) {
                message += `${stats.join(', ')} | `;
            }
            message += `💰${formatNumber(itemData.value)}\n`;
            message += `${itemData.description}\n\n`;
            
            // Add action buttons
            if (category === 'weapon' || category === 'armor' || category === 'accessory') {
                keyboard.text(`Equip ${item.name}`, `inv_equip_${item.name}`);
            } else if (category === 'consumable' || category === 'food') {
                keyboard.text(`Use ${item.name}`, `inv_use_${item.name}`);
            }
            
            if (itemCount % 2 === 1) {
                keyboard.row();
            }
            itemCount++;
        }
    }
    
    keyboard.row().text('🔙 Back to Inventory', 'quick_inventory');
    
    await safeEditMessage(ctx, message, {
        parse_mode: 'Markdown',
        reply_markup: keyboard
    });
}

async function handleEquipItem(ctx, itemName) {
    const player = ctx.player;
    const item = items[itemName];
    
    if (!item) {
        return await ctx.answerCallbackQuery('❌ Item tidak ditemukan.');
    }
    
    if (!player.hasItem(itemName)) {
        return await ctx.answerCallbackQuery('❌ Kamu tidak memiliki item ini.');
    }
    
    const result = await PlayerService.equipItem(player, itemName, item.type);
    
    if (result.success) {
        let message = `✅ **${itemName}** berhasil dilengkapi!\n\n`;
        
        if (result.oldItem) {
            message += `📤 ${result.oldItem} dikembalikan ke inventory\n`;
        }
        
        if (result.statChanges.attack > 0) {
            message += `⚔️ Attack +${result.statChanges.attack}\n`;
        }
        if (result.statChanges.defense > 0) {
            message += `🛡️ Defense +${result.statChanges.defense}\n`;
        }
        if (result.statChanges.hp > 0) {
            message += `❤️ Max HP +${result.statChanges.hp}\n`;
        }
        
        message += `\n📊 **Current Stats:**\n`;
        message += `⚔️ Attack: ${player.attack}\n`;
        message += `🛡️ Defense: ${player.defense}\n`;
        message += `❤️ HP: ${player.hp}/${player.maxHp}`;
        
        const keyboard = new InlineKeyboard()
            .text('🎒 Inventory', 'quick_inventory')
            .text('👤 Profile', 'quick_profile').row()
            .text('🏹 Hunt', 'quick_hunt');
        
        await safeEditMessage(ctx, message, {
            parse_mode: 'Markdown',
            reply_markup: keyboard
        });
        
        await ctx.answerCallbackQuery(`✅ ${itemName} equipped!`);
    } else {
        await ctx.answerCallbackQuery(`❌ ${result.message}`);
    }
}

async function handleUseItem(ctx, itemName) {
    const player = ctx.player;
    const item = items[itemName];
    
    if (!item) {
        return await ctx.answerCallbackQuery('❌ Item tidak ditemukan.');
    }
    
    if (!player.hasItem(itemName)) {
        return await ctx.answerCallbackQuery('❌ Kamu tidak memiliki item ini.');
    }
    
    if (item.heal) {
        if (player.hp >= player.maxHp) {
            return await ctx.answerCallbackQuery('❌ HP kamu sudah penuh!');
        }
        
        const healResult = await PlayerService.healPlayer(player, item.heal);
        await PlayerService.removeItem(player, itemName, 1);
        
        const message = 
            `💚 **${itemName}** digunakan!\n\n` +
            `❤️ HP restored: +${healResult.actualHeal}\n` +
            `❤️ Current HP: ${healResult.newHp}/${healResult.maxHp}`;
        
        const keyboard = new InlineKeyboard()
            .text('🎒 Inventory', 'quick_inventory')
            .text('🏹 Hunt', 'quick_hunt').row()
            .text('👤 Profile', 'quick_profile');
        
        await safeEditMessage(ctx, message, {
            parse_mode: 'Markdown',
            reply_markup: keyboard
        });
        
        await ctx.answerCallbackQuery(`✅ Healed ${healResult.actualHeal} HP!`);
    } else {
        await ctx.answerCallbackQuery('❌ Item ini tidak bisa digunakan.');
    }
}

module.exports = {
    inventoryCommand,
    handleInventoryCategory,
    handleEquipItem,
    handleUseItem
};

module.exports.default = inventoryCommand;

