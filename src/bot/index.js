const { Bot, InlineKeyboard } = require("grammy");
const mongoose = require("mongoose");
const config = require("../../config");

// Import middlewares
const {
    playerLoader,
    errorHandler,
    commandLogger,
    maintenanceCheck
} = require("../middlewares/playerLoader");

// Import command handlers
const startCommand = require("../commands/start");
const profileCommand = require("../commands/profile");
const huntCommand = require("../commands/hunt");
const adventureCommand = require("../commands/adventure");
const workCommand = require("../commands/work");
const { dailyCommand, dailyChallengesCommand } = require("../commands/daily");
const { inventoryCommand, handleInventoryCategory, handleEquipItem, handleUseItem } = require("../commands/inventory");
const { shopCommand, handleShopCategory, handleBuyItem } = require("../commands/shop");
const { questCommand, handleQuestType, handleStartQuest, handleCompleteQuest } = require("../commands/quest");
const { guildCommand, handleGuildAction, handleJoinGuild, handleLeaveGuild, handleGuildListPage } = require("../commands/guild");
const { craftCommand, handleCraftCategory, handleCraftView, handleCraftDo } = require("../commands/craft");
const { leaderboardCommand, handleLeaderboardCategory, handlePlayerLeaderboard, handleMyRankingMenu } = require("../commands/leaderboard");
const achievementsCommand = require("../commands/achievements");
const { healCommand, handleHealUse } = require("../commands/heal");
const helpCommand = require("../commands/help");

// Create bot instance
const bot = new Bot(config.BOT_TOKEN);

// Connect to MongoDB
mongoose.connect(config.MONGODB_URI)
    .then(() => console.log("✅ Connected to MongoDB"))
    .catch(err => console.error("❌ Could not connect to MongoDB:", err));

// Global middlewares
bot.use(commandLogger);
bot.use(maintenanceCheck);
bot.use(playerLoader);

// Error handling
bot.catch(errorHandler);

// Middleware to handle callback queries and restrict interaction
bot.callbackQuery(async (ctx, next) => {
    const message = ctx.callbackQuery.message;
    // Check if the message exists and if the user clicking the button is the one who sent the message
    if (message && message.from.id !== ctx.from.id) {
        await ctx.answerCallbackQuery({ text: "❌ Ini bukan giliranmu!", show_alert: true });
        return;
    }
    await next();
});

// Command handlers
bot.command("start", startCommand);
bot.command("profile", profileCommand);
bot.command("hunt", huntCommand);
bot.command("adventure", adventureCommand);
bot.command("work", workCommand);
bot.command("daily", dailyCommand);
bot.command("inventory", inventoryCommand);
bot.command("shop", shopCommand);
bot.command("quest", questCommand);
bot.command("guild", guildCommand);
bot.command("craft", craftCommand);
bot.command("leaderboard", leaderboardCommand);
bot.command("achievements", achievementsCommand);
bot.command("heal", healCommand);
bot.command("help", helpCommand);

// Handle quick action callbacks
bot.callbackQuery(/^quick_(.+)$/, async (ctx) => {
    const action = ctx.match[1];
    
    switch (action) {
        case "start":
            await startCommand(ctx);
            break;
        case "profile":
            await profileCommand(ctx);
            break;
        case "hunt":
            await huntCommand(ctx);
            break;
        case "adventure":
            await adventureCommand(ctx);
            break;
        case "work":
            await workCommand(ctx);
            break;
        case "daily":
            await dailyCommand(ctx);
            break;
        case "inventory":
            await inventoryCommand(ctx);
            break;
        case "shop":
            await shopCommand(ctx);
            break;
        case "quest":
            await questCommand(ctx);
            break;
        case "guild":
            await guildCommand(ctx);
            break;
        case "craft":
            await craftCommand(ctx);
            break;
        case "leaderboard":
            await leaderboardCommand(ctx);
            break;
        case "achievements":
            await achievementsCommand(ctx);
            break;
        case "heal":
            await healCommand(ctx);
            break;
        case "help":
            await helpCommand(ctx);
            break;
    }
});

// Handle shop callbacks
bot.callbackQuery(/^shop_category_(.+)$/, async (ctx) => {
    const category = ctx.match[1];
    await handleShopCategory(ctx, category);
});

bot.callbackQuery(/^buy_(.+)_(\d+)$/, async (ctx) => {
    const itemName = ctx.match[1];
    const quantity = parseInt(ctx.match[2]);
    await handleBuyItem(ctx, itemName, quantity);
});

// Handle quest callbacks
bot.callbackQuery(/^quest_type_(.+)$/, async (ctx) => {
    const type = ctx.match[1];
    await handleQuestType(ctx, type);
});

bot.callbackQuery(/^start_quest_(.+)$/, async (ctx) => {
    const questId = ctx.match[1];
    await handleStartQuest(ctx, questId);
});

bot.callbackQuery(/^complete_quest_(.+)$/, async (ctx) => {
    const questId = ctx.match[1];
    await handleCompleteQuest(ctx, questId);
});

// Handle guild callbacks
bot.callbackQuery(/^guild_(.+)$/, async (ctx) => {
    const action = ctx.match[1];
    await handleGuildAction(ctx, action);
});

bot.callbackQuery(/^join_guild_(.+)$/, async (ctx) => {
    const guildId = ctx.match[1];
    await handleJoinGuild(ctx, guildId);
});

bot.callbackQuery(/^leave_guild_(.+)$/, async (ctx) => {
    const guildId = ctx.match[1];
    await handleLeaveGuild(ctx, guildId);
});

bot.callbackQuery(/^guild_list_(\d+)$/, async (ctx) => {
    const page = parseInt(ctx.match[1]);
    await handleGuildListPage(ctx, page);
});

// Handle craft callbacks
bot.callbackQuery(/^craft_category_(.+)$/, async (ctx) => {
    const category = ctx.match[1];
    await handleCraftCategory(ctx, category);
});

bot.callbackQuery(/^craft_view_(.+)$/, async (ctx) => {
    const recipeId = ctx.match[1];
    await handleCraftView(ctx, recipeId);
});

bot.callbackQuery(/^craft_do_(.+)_(\d+)$/, async (ctx) => {
    const recipeId = ctx.match[1];
    const quantity = parseInt(ctx.match[2]);
    await handleCraftDo(ctx, recipeId, quantity);
});

// Handle leaderboard callbacks
bot.callbackQuery(/^leaderboard_(.+)$/, async (ctx) => {
    const category = ctx.match[1];
    await handleLeaderboardCategory(ctx, category);
});

bot.callbackQuery(/^player_rank_(.+)$/, async (ctx) => {
    const category = ctx.match[1];
    await handlePlayerLeaderboard(ctx, category);
});

bot.callbackQuery("my_ranking_menu", handleMyRankingMenu);

// Achievement callbacks
bot.callbackQuery(/^achievements_category_(.+)_(.+)$/, async (ctx) => {
    await achievementsCommand(ctx);
});

bot.callbackQuery("achievements", achievementsCommand);

// Daily challenges callback
bot.callbackQuery("daily_challenges", dailyChallengesCommand);

// Heal callbacks
bot.callbackQuery(/^heal_use_(.+)$/, async (ctx) => {
    const itemName = decodeURIComponent(ctx.match[1]);
    await handleHealUse(ctx, itemName);
});

// Back to profile callback
bot.callbackQuery("back_to_profile", profileCommand);

// Handle inventory callbacks
bot.callbackQuery(/^inv_equip_(.+)$/, async (ctx) => {
    const itemName = ctx.match[1];
    await handleEquipItem(ctx, itemName);
});

bot.callbackQuery(/^inv_use_(.+)$/, async (ctx) => {
    const itemName = ctx.match[1];
    await handleUseItem(ctx, itemName);
});

bot.callbackQuery(/^inv_category_(.+)$/, async (ctx) => {
    const category = ctx.match[1];
    await handleInventoryCategory(ctx, category);
});

// Handle refresh callbacks
bot.callbackQuery(/^refresh_(.+)$/, async (ctx) => {
    const type = ctx.match[1];

    switch (type) {
        case "profile":
            await profileCommand(ctx);
            break;
        case "inventory":
            await inventoryCommand(ctx);
            break;
        case "quests":
            await questCommand(ctx);
            break;
        case "guild":
            await guildCommand(ctx);
            break;
        case "shop":
            await shopCommand(ctx);
            break;
        case "craft":
            await craftCommand(ctx);
            break;
        case "leaderboard":
            await leaderboardCommand(ctx);
            break;
        case "achievements":
            await achievementsCommand(ctx);
            break;
        case "daily":
            await dailyCommand(ctx);
            break;
        case "heal":
            await healCommand(ctx);
            break;
    }
});

// Handle settings callback
bot.callbackQuery("settings", async (ctx) => {
    const message = 
        `⚙️ *Settings*\n\n` +
        `🚧 **Coming Soon!**\n\n` +
        `Settings feature sedang dalam pengembangan.\n` +
        `Fitur yang akan tersedia:\n` +
        `• 🔔 Notifications toggle\n` +
        `• 💊 Auto-heal settings\n` +
        `• 🌍 Language preferences\n` +
        `• 🎨 UI customization\n\n` +
        `Stay tuned for updates!`;
    
    const keyboard = new InlineKeyboard()
        .text('🔙 Back to Profile', 'quick_profile');
    
    await ctx.editMessageText(message, {
        parse_mode: 'Markdown',
        reply_markup: keyboard
    });
});

// Handle cancel callbacks
bot.callbackQuery("cancel", async (ctx) => {
    await ctx.editMessageText("❌ Aksi dibatalkan.");
});

// Export bot instance
module.exports = {
    bot
};
