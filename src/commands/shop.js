const { InlineKeyboard } = require('grammy');
const { safeEditMessage, safeReply } = require('../utils/messageHelpers');
const { requirePlayer } = require('../middlewares/playerLoader');
const { items, getItemsByType } = require('../data/items');
const { getItemRarityEmoji, formatNumber, chunkArray } = require('../utils/common');
const PlayerService = require('../services/playerService');

async function shopCommand(ctx) {
    const player = ctx.player;
    
    if (!player) {
        return await ctx.reply('❌ Kamu harus memulai game terlebih dahulu. Gunakan /start');
    }
    
    const shopMessage = 
        `🏪 *Selamat datang di Shop!*\n\n` +
        `💰 Gold kamu: ${formatNumber(player.gold)}\n` +
        `💎 Gems kamu: ${formatNumber(player.gems)}\n\n` +
        `Pilih kategori item yang ingin kamu beli:`;
    
    const keyboard = new InlineKeyboard()
        .text('⚔️ Weapons', 'shop_category_weapon')
        .text('🛡️ Armor', 'shop_category_armor').row()
        .text('💍 Accessories', 'shop_category_accessory')
        .text('🧪 Consumables', 'shop_category_consumable').row()
        .text('🐾 Pets', 'shop_category_pet')
        .text('📜 Special', 'shop_category_special').row()
        .text('🔄 Refresh', 'refresh_shop');
    
    if (ctx.callbackQuery) {
        await safeEditMessage(ctx, shopMessage, {
            parse_mode: 'Markdown',
            reply_markup: keyboard
        });
    } else {
        await safeReply(ctx, shopMessage, {
            parse_mode: 'Markdown',
            reply_markup: keyboard
        });
    }
}

async function handleShopCategory(ctx, category) {
    const player = ctx.player;
    const categoryItems = getItemsByType(category);
    
    if (Object.keys(categoryItems).length === 0) {
        return await ctx.answerCallbackQuery('❌ Kategori ini belum tersedia.');
    }
    
    const categoryNames = {
        weapon: '⚔️ Weapons',
        armor: '🛡️ Armor',
        accessory: '💍 Accessories',
        consumable: '🧪 Consumables',
        pet: '🐾 Pets',
        special: '📜 Special Items'
    };
    
    let message = `${categoryNames[category] || category}\n\n`;
    message += `💰 Gold kamu: ${formatNumber(player.gold)}\n\n`;
    
    const keyboard = new InlineKeyboard();
    let itemCount = 0;
    
    for (const [itemName, item] of Object.entries(categoryItems)) {
        if (itemCount >= 20) break; // Limit items per page
        
        const emoji = getItemRarityEmoji(item.rarity);
        const stats = [];
        if (item.attack) stats.push(`⚔️${item.attack}`);
        if (item.defense) stats.push(`🛡️${item.defense}`);
        if (item.hp) stats.push(`❤️${item.hp}`);
        
        message += `${emoji} **${itemName}**\n`;
        message += `💰 ${formatNumber(item.value)} gold`;
        if (stats.length > 0) {
            message += ` | ${stats.join(', ')}`;
        }
        message += `\n${item.description}\n\n`;
        
        const canAfford = player.gold >= item.value;
        const buttonText = canAfford ? `Buy ${itemName}` : `❌ ${itemName}`;
        
        keyboard.text(buttonText, `shop_buy_${itemName}`);
        
        if (itemCount % 2 === 1) {
            keyboard.row();
        }
        
        itemCount++;
    }
    
    keyboard.row().text('🔙 Back to Shop', 'shop_main');
    
    await safeEditMessage(ctx, message, {
        parse_mode: 'Markdown',
        reply_markup: keyboard
    });
}

async function handleBuyItem(ctx, itemName) {
    const player = ctx.player;
    const item = items[itemName];
    
    if (!item) {
        return await ctx.answerCallbackQuery('❌ Item tidak ditemukan.');
    }
    
    if (player.gold < item.value) {
        return await ctx.answerCallbackQuery('❌ Gold tidak cukup!');
    }
    
    // Process purchase
    const success = await PlayerService.removeGold(player, item.value);
    if (!success) {
        return await ctx.answerCallbackQuery('❌ Transaksi gagal.');
    }
    
    await PlayerService.addItem(player, itemName, 1);
    
    const emoji = getItemRarityEmoji(item.rarity);
    const message = 
        `✅ *Pembelian Berhasil!*\n\n` +
        `${emoji} **${itemName}** telah ditambahkan ke inventory!\n\n` +
        `💰 Gold tersisa: ${formatNumber(player.gold)}`;
    
    const keyboard = new InlineKeyboard()
        .text('🛒 Beli Lagi', `shop_category_${item.type}`)
        .text('🎒 Inventory', 'quick_inventory').row()
        .text('🏪 Shop', 'shop_main');
    
    await safeEditMessage(ctx, message, {
        parse_mode: 'Markdown',
        reply_markup: keyboard
    });
    
    await ctx.answerCallbackQuery(`✅ Berhasil membeli ${itemName}!`);
}

async function handleShopPage(ctx, page) {
    // Implement pagination if needed
    await shopCommand(ctx);
}

module.exports = {
    shopCommand,
    handleShopCategory,
    handleBuyItem,
    handleShopPage
};

// Export default for command registration
module.exports.default = shopCommand;

