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
const dailyCommand = require("../commands/daily");
const { inventoryCommand, handleInventoryCategory, handleEquipItem, handleUseItem } = require("../commands/inventory");
const { shopCommand, handleShopCategory, handleBuyItem } = require("../commands/shop");
const { questCommand, handleQuestType, handleStartQuest, handleCompleteQuest } = require("../commands/quest");
const { guildCommand, handleGuildAction, handleJoinGuild, handleLeaveGuild, handleGuildListPage } = require("../commands/guild");
const { craftCommand, handleCraftCategory, handleCraftView, handleCraftDo } = require("../commands/craft");
const { leaderboardCommand, handleLeaderboardCategory, handlePlayerLeaderboard, handleMyRankingMenu } = require("../commands/leaderboard");
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

// Register command handlers
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
bot.command("help", helpCommand);

// Handle inline keyboard callbacks
bot.callbackQuery("quick_hunt", huntCommand);
bot.callbackQuery("quick_adventure", adventureCommand);
bot.callbackQuery("quick_work", workCommand);
bot.callbackQuery("quick_daily", dailyCommand);
bot.callbackQuery("quick_profile", profileCommand);
bot.callbackQuery("quick_inventory", inventoryCommand);
bot.callbackQuery("quick_craft", craftCommand);
bot.callbackQuery("quick_leaderboard", leaderboardCommand);
bot.callbackQuery("quick_help", helpCommand);
bot.callbackQuery("quick_start", startCommand);

// Handle shop callbacks
bot.callbackQuery(/^shop_buy_(.+)$/, async (ctx) => {
    const itemId = ctx.match[1];
    await handleBuyItem(ctx, itemId);
});

bot.callbackQuery(/^shop_category_(.+)$/, async (ctx) => {
    const category = ctx.match[1];
    await handleShopCategory(ctx, category);
});

// Handle quest callbacks
bot.callbackQuery(/^quest_start_(.+)$/, async (ctx) => {
    const questId = ctx.match[1];
    await handleStartQuest(ctx, questId);
});

bot.callbackQuery(/^quest_complete_(.+)$/, async (ctx) => {
    const questId = ctx.match[1];
    await handleCompleteQuest(ctx, questId);
});

bot.callbackQuery(/^quest_type_(.+)$/, async (ctx) => {
    const questType = ctx.match[1];
    await handleQuestType(ctx, questType);
});

// Handle guild callbacks
bot.callbackQuery(/^guild_join_(.+)$/, async (ctx) => {
    const guildName = ctx.match[1];
    await handleJoinGuild(ctx, guildName);
});

bot.callbackQuery(/^guild_action_(.+)$/, async (ctx) => {
    const action = ctx.match[1];
    await handleGuildAction(ctx, action);
});
bot.callbackQuery(/^page_guild_list_(\d+)$/, async (ctx) => {
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

bot.callbackQuery(/^craft_do_(.+)$/, async (ctx) => {
    const recipeId = ctx.match[1];
    await handleCraftDo(ctx, recipeId);
});

// Handle leaderboard callbacks
bot.callbackQuery("leaderboard_main", leaderboardCommand);

bot.callbackQuery(/^leaderboard_(.+)$/, async (ctx) => {
    const category = ctx.match[1];
    if (category === 'main') {
        await leaderboardCommand(ctx);
    } else {
        await handleLeaderboardCategory(ctx, category);
    }
});

bot.callbackQuery(/^player_rank_(.+)$/, async (ctx) => {
    const category = ctx.match[1];
    await handlePlayerLeaderboard(ctx, category);
});

bot.callbackQuery("my_ranking_menu", handleMyRankingMenu);

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
    }
});

// Handle cancel callbacks
bot.callbackQuery("cancel", async (ctx) => {
    await ctx.editMessageText("❌ Aksi dibatalkan.");
});

// Export bot instance
module.exports = {
    bot
};

