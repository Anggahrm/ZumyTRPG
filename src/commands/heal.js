const { InlineKeyboard } = require('grammy');
const { safeEditMessage, safeReply } = require('../utils/messageHelpers');
const { requirePlayer } = require('../middlewares/playerLoader');
const ConsumableService = require('../services/consumableService');
const { consumables } = require('../data/items');
const { getItemRarityEmoji } = require('../utils/common');

async function healCommand(ctx) {
    const player = ctx.player;
    
    if (!player) {
        return await safeReply(ctx, '❌ Kamu harus memulai game terlebih dahulu. Gunakan /start');
    }
    
    if (player.hp >= player.maxHp) {
        return await safeReply(ctx, '❤️ HP kamu sudah penuh!');
    }
    
    // Get available healing items
    const healingItems = Object.entries(consumables)
        .filter(([name, item]) => 
            (item.type === 'healing' || item.type === 'food') && 
            item.effect.hp &&
            player.inventory.get(name) > 0
        )
        .sort((a, b) => {
            // Sort by healing amount
            const healA = a[1].effect.hp === 'full' ? 999 : a[1].effect.hp;
            const healB = b[1].effect.hp === 'full' ? 999 : b[1].effect.hp;
            return healB - healA;
        });
    
    if (healingItems.length === 0) {
        const message = 
            `❤️ *Healing*\n\n` +
            `Current HP: ${player.hp}/${player.maxHp}\n\n` +
            `❌ Kamu tidak memiliki item healing!\n\n` +
            `💡 **Cara mendapatkan healing items:**\n` +
            `• Beli Health Potion di shop\n` +
            `• Craft healing items\n` +
            `• Hunt untuk mendapatkan herbs\n` +
            `• Complete quests untuk rewards`;
        
        const keyboard = new InlineKeyboard()
            .text('🛒 Shop', 'quick_shop')
            .text('🔨 Craft', 'quick_craft').row()
            .text('🏹 Hunt', 'quick_hunt')
            .text('👤 Profile', 'quick_profile');
        
        return await safeReply(ctx, message, {
            parse_mode: 'Markdown',
            reply_markup: keyboard
        });
    }
    
    // Show healing options
    let message = 
        `❤️ *Healing Items*\n\n` +
        `Current HP: ${player.hp}/${player.maxHp}\n` +
        `Missing HP: ${player.maxHp - player.hp}\n\n` +
        `💊 **Available Healing Items:**\n\n`;
    
    const keyboard = new InlineKeyboard();
    
    for (const [itemName, item] of healingItems.slice(0, 8)) { // Max 8 items
        const quantity = player.inventory.get(itemName);
        const emoji = getItemRarityEmoji(item.rarity);
        const healAmount = item.effect.hp === 'full' ? 'Full HP' : `${item.effect.hp} HP`;
        
        message += `${emoji} **${itemName}** x${quantity}\n`;
        message += `   ${item.icon} Heals: ${healAmount}\n`;
        if (item.effect.attack_bonus) {
            message += `   ⚔️ Bonus: +${item.effect.attack_bonus} attack\n`;
        }
        if (item.effect.defense_bonus) {
            message += `   🛡️ Bonus: +${item.effect.defense_bonus} defense\n`;
        }
        message += `\n`;
        
        keyboard.text(`${item.icon} Use ${itemName}`, `heal_use_${encodeURIComponent(itemName)}`);
        
        if (healingItems.indexOf([itemName, item]) % 2 === 1) {
            keyboard.row();
        }
    }
    
    keyboard.row()
        .text('🎒 Inventory', 'quick_inventory')
        .text('🔙 Back', 'quick_profile');
    
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

async function handleHealUse(ctx, itemName) {
    const player = ctx.player;
    
    const currentQuantity = player.inventory.get(itemName) || 0;
    if (currentQuantity <= 0) {
        return await ctx.answerCallbackQuery('❌ Kamu tidak memiliki item ini.');
    }
    
    if (player.hp >= player.maxHp) {
        return await ctx.answerCallbackQuery('❤️ HP kamu sudah penuh!');
    }
    
    const result = await ConsumableService.useConsumable(player, itemName, 1);
    
    if (result.success) {
        const item = consumables[itemName];
        const message = 
            `${item.icon} **${itemName}** digunakan!\n\n` +
            `${result.message}\n\n` +
            `❤️ Current HP: ${player.hp}/${player.maxHp}`;
        
        const keyboard = new InlineKeyboard()
            .text('💊 Heal Again', 'quick_heal')
            .text('🏹 Hunt', 'quick_hunt').row()
            .text('👤 Profile', 'quick_profile');
        
        await safeEditMessage(ctx, message, {
            parse_mode: 'Markdown',
            reply_markup: keyboard
        });
        
        await ctx.answerCallbackQuery(`✅ ${itemName} used!`);
    } else {
        await ctx.answerCallbackQuery(`❌ ${result.error}`);
    }
}

module.exports = {
    healCommand,
    handleHealUse
};
