// Add these methods to your ChatManager class in chat.js

// Additional methods for ChatManager to handle all the global functions

startChatWithCharacter(characterId) {
    const character = this.db.getCharacter(characterId);
    if (!character) {
        this.showNotification('Character not found', 'error');
        return;
    }

    // Create new chat with this character
    const chat = this.db.createChat({
        name: `Chat with ${character.name}`,
        type: 'single',
        participants: [characterId]
    });

    // Send greeting message
    this.db.createMessage({
        chatId: chat.id,
        sender: characterId,
        content: character.greeting || `Hello! I'm ${character.name}. ${character.scenario || 'How can I help you today?'}`
    });

    // Set as current chat and switch to chat tab
    this.state.setState({ currentChat: chat.id });
    window.switchTab('chat');
}

loadChatById(chatId) {
    this.state.setState({ currentChat: chatId });
    this.loadChat(chatId);
}

setChatMode(mode) {
    this.currentMode = mode;
}

selectCharacterForChat(characterId) {
    this.createChatWithCharacter(characterId);
}

copyMessage(messageId) {
    const message = this.db.messages.get(messageId);
    if (message) {
        navigator.clipboard.writeText(message.content)
            .then(() => this.showNotification('Message copied!', 'success'))
            .catch(() => this.showNotification('Failed to copy message', 'error'));
    }
}

editMessage(messageId) {
    // Implementation for editing messages
    this.showNotification('Message editing coming soon!', 'info');
}

regenerateMessage(messageId) {
    const message = this.db.messages.get(messageId);
    if (message && message.sender !== 'user') {
        // Re-generate the AI response
        const chat = this.db.getChat(message.chatId);
        if (chat) {
            // Delete the old message
            this.db.deleteMessage(messageId);
            // Generate new response
            const messages = this.db.getChatMessages(chat.id);
            const lastUserMessage = messages.filter(m => m.sender === 'user').pop();
            if (lastUserMessage) {
                this.generateResponse(chat, lastUserMessage.content);
            }
        }
    }
}

deleteMessage(messageId) {
    const confirmed = confirm('Delete this message?');
    if (confirmed) {
        this.db.deleteMessage(messageId);
        // Reload the chat
        if (this.state.currentChat) {
            this.loadChat(this.state.currentChat);
        }
    }
}

showChatSettings(chatId) {
    const chat = this.db.getChat(chatId);
    if (!chat) return;

    this.createModal('Chat Settings', `
        <div class="chat-settings">
            <div class="form-group">
                <label class="form-label">Chat Name</label>
                <input type="text" class="form-input" value="${chat.name}" id="chat-name-input">
            </div>
            <div class="form-group">
                <label class="form-label">Temperature</label>
                <input type="range" class="form-range" min="0" max="2" step="0.1" value="${chat.settings.temperature}">
            </div>
            <div class="form-group">
                <label class="form-label">Max Tokens</label>
                <input type="number" class="form-input" value="${chat.settings.maxTokens}">
            </div>
            <button class="btn btn-primary" onclick="saveChatSettings('${chatId}')">Save Settings</button>
        </div>
    `);
}

exportChat(chatId) {
    const chat = this.db.getChat(chatId);
    if (!chat) return;

    const messages = this.db.getChatMessages(chatId);
    const exportData = {
        chat: chat,
        messages: messages,
        exportDate: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chat-${chat.name.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    this.showNotification('Chat exported successfully!', 'success');
}

deleteChat(chatId) {
    const chat = this.db.getChat(chatId);
    if (!chat) return;

    const confirmed = confirm(`Delete chat "${chat.name}"? This cannot be undone.`);
    if (confirmed) {
        this.db.deleteChat(chatId);
        
        // If this was the current chat, clear it
        if (this.state.currentChat === chatId) {
            this.state.setState({ currentChat: null });
            this.showChatWelcome();
        }
        
        // Reload chat list
        this.loadChatList();
        
        this.showNotification('Chat deleted', 'success');
    }
}

showNotification(message, type = 'info') {
    // Use the UI manager's notification system
    if (window.app && window.app.uiManager) {
        window.app.uiManager.showNotification(message, type);
    } else {
        console.log(`[${type}] ${message}`);
    }
}