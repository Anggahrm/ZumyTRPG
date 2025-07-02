const { bot } = require('./src/bot');

// Start the bot
console.log('🤖 Starting Telegram RPG Bot...');

bot.start()
    .then(() => {
        console.log('✅ Bot is running successfully!');
        console.log('🎮 RPG Telegram Bot is ready to serve players!');
    })
    .catch(err => {
        console.error('❌ Failed to start bot:', err);
        process.exit(1);
    });

// Graceful shutdown
process.once('SIGINT', () => {
    console.log('\n🛑 Received SIGINT, shutting down gracefully...');
    bot.stop();
    process.exit(0);
});

process.once('SIGTERM', () => {
    console.log('\n🛑 Received SIGTERM, shutting down gracefully...');
    bot.stop();
    process.exit(0);
});

