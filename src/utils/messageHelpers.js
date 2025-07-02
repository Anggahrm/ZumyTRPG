// Helper function to safely edit message text without throwing "message not modified" errors
async function safeEditMessage(ctx, ...args) {
    try {
        // Handle different call signatures:
        // safeEditMessage(ctx, text, options)
        // safeEditMessage(ctx, chatId, messageId, text, options)
        if (args.length === 2 || (args.length === 3 && typeof args[2] === 'object')) {
            // Standard signature: (ctx, text, options)
            const [text, options = {}] = args;
            await ctx.editMessageText(text, options);
        } else if (args.length >= 4) {
            // Extended signature: (ctx, chatId, messageId, text, options)
            const [chatId, messageId, text, options = {}] = args;
            await ctx.api.editMessageText(chatId, messageId, text, options);
        } else {
            throw new Error('Invalid arguments for safeEditMessage');
        }
    } catch (error) {
        // Ignore "message not modified" errors
        if (!error.description || !error.description.includes('message is not modified')) {
            throw error;
        }
    }
}

// Helper function to safely send reply
async function safeReply(ctx, text, options = {}) {
    try {
        return await ctx.reply(text, options);
    } catch (error) {
        console.error('Failed to send reply:', error);
        throw error;
    }
}

// Helper function to safely answer callback query
async function safeAnswerCallback(ctx, text = '', showAlert = false) {
    try {
        await ctx.answerCallbackQuery({ text, show_alert: showAlert });
    } catch (error) {
        // Callback queries might already be answered, ignore those errors
        if (!error.description || !error.description.includes('query is too old')) {
            console.error('Failed to answer callback query:', error);
        }
    }
}

module.exports = {
    safeEditMessage,
    safeReply,
    safeAnswerCallback
};
