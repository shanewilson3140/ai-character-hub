// Database Module - Handles all data storage and retrieval

export class InMemoryDatabase {
    constructor() {
        this.characters = new Map();
        this.chats = new Map();
        this.messages = new Map();
        this.scenarios = new Map();
        this.users = new Map();
        this.tags = new Set();
        
        // Initialize with default user
        this.createDefaultUser();
    }

    // User Management
    createDefaultUser() {
        const defaultUser = {
            id: 'user-default',
            username: 'User',
            email: 'user@example.com',
            preferences: {
                theme: 'light',
                language: 'en',
                nsfwEnabled: false,
                autoSave: true
            },
            stats: {
                charactersCreated: 0,
                messagessSent: 0,
                scenariosCreated: 0,
                totalChatTime: 0
            },
            createdAt: new Date().toISOString()
        };
        this.users.set(defaultUser.id, defaultUser);
    }

    // Character Methods
    createCharacter(characterData) {
        const character = {
            id: `char-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            name: characterData.name,
            category: characterData.category,
            personality: characterData.personality,
            scenario: characterData.scenario,
            greeting: characterData.greeting,
            examples: characterData.examples || '',
            description: characterData.description || '',
            tags: characterData.tags || [],
            creator: characterData.creator || 'user-default',
            avatar: characterData.avatar || this.generateAvatar(characterData.name),
            stats: {
                chats: 0,
                messages: 0,
                likes: 0,
                rating: 0
            },
            isNSFW: characterData.isNSFW || false,
            visibility: characterData.visibility || 'private',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        this.characters.set(character.id, character);
        this.updateTags(character.tags);
        this.updateUserStats('charactersCreated', 1);
        
        return character;
    }

    updateCharacter(characterId, updates) {
        const character = this.characters.get(characterId);
        if (!character) throw new Error('Character not found');

        const updatedCharacter = {
            ...character,
            ...updates,
            updatedAt: new Date().toISOString()
        };

        this.characters.set(characterId, updatedCharacter);
        
        if (updates.tags) {
            this.updateTags(updates.tags);
        }
        
        return updatedCharacter;
    }

    deleteCharacter(characterId) {
        const character = this.characters.get(characterId);
        if (!character) throw new Error('Character not found');

        // Delete associated chats and messages
        this.chats.forEach((chat, chatId) => {
            if (chat.participants.includes(characterId)) {
                this.deleteChat(chatId);
            }
        });

        this.characters.delete(characterId);
        return true;
    }

    getCharacter(characterId) {
        return this.characters.get(characterId);
    }

    getAllCharacters(filters = {}) {
        let characters = Array.from(this.characters.values());

        // Apply filters
        if (filters.search) {
            const searchLower = filters.search.toLowerCase();
            characters = characters.filter(char => 
                char.name.toLowerCase().includes(searchLower) ||
                char.description.toLowerCase().includes(searchLower) ||
                char.tags.some(tag => tag.toLowerCase().includes(searchLower))
            );
        }

        if (filters.category && filters.category !== 'all') {
            characters = characters.filter(char => char.category === filters.category);
        }

        if (filters.tags && filters.tags.length > 0) {
            characters = characters.filter(char => 
                filters.tags.every(tag => char.tags.includes(tag))
            );
        }

        if (filters.nsfw !== undefined) {
            characters = characters.filter(char => char.isNSFW === filters.nsfw);
        }

        // Sort
        if (filters.sortBy) {
            characters.sort((a, b) => {
                switch(filters.sortBy) {
                    case 'name':
                        return a.name.localeCompare(b.name);
                    case 'created':
                        return new Date(b.createdAt) - new Date(a.createdAt);
                    case 'popular':
                        return b.stats.chats - a.stats.chats;
                    case 'rating':
                        return b.stats.rating - a.stats.rating;
                    default:
                        return 0;
                }
            });
        }

        return characters;
    }

    // Chat Methods
    createChat(chatData) {
        const chat = {
            id: `chat-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            name: chatData.name || 'New Chat',
            type: chatData.type || 'single', // single, group, scenario
            participants: chatData.participants || [],
            scenario: chatData.scenario || null,
            messages: [],
            settings: {
                temperature: 0.8,
                maxTokens: 1000,
                systemPrompt: chatData.systemPrompt || ''
            },
            stats: {
                messageCount: 0,
                duration: 0,
                lastActivity: new Date().toISOString()
            },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        this.chats.set(chat.id, chat);
        
        // Update character stats
        chat.participants.forEach(charId => {
            const character = this.characters.get(charId);
            if (character) {
                character.stats.chats++;
                this.characters.set(charId, character);
            }
        });

        return chat;
    }

    updateChat(chatId, updates) {
        const chat = this.chats.get(chatId);
        if (!chat) throw new Error('Chat not found');

        const updatedChat = {
            ...chat,
            ...updates,
            updatedAt: new Date().toISOString()
        };

        this.chats.set(chatId, updatedChat);
        return updatedChat;
    }

    deleteChat(chatId) {
        const chat = this.chats.get(chatId);
        if (!chat) throw new Error('Chat not found');

        // Delete associated messages
        chat.messages.forEach(messageId => {
            this.messages.delete(messageId);
        });

        this.chats.delete(chatId);
        return true;
    }

    getChat(chatId) {
        return this.chats.get(chatId);
    }

    getAllChats(filters = {}) {
        let chats = Array.from(this.chats.values());

        if (filters.type) {
            chats = chats.filter(chat => chat.type === filters.type);
        }

        if (filters.participant) {
            chats = chats.filter(chat => chat.participants.includes(filters.participant));
        }

        // Sort by last activity
        chats.sort((a, b) => 
            new Date(b.stats.lastActivity) - new Date(a.stats.lastActivity)
        );

        return chats;
    }

    // Message Methods
    createMessage(messageData) {
        const message = {
            id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            chatId: messageData.chatId,
            sender: messageData.sender, // 'user' or character ID
            content: messageData.content,
            role: messageData.role || (messageData.sender === 'user' ? 'user' : 'assistant'),
            attachments: messageData.attachments || [],
            metadata: {
                tokens: messageData.tokens || 0,
                model: messageData.model || 'default',
                edited: false,
                editedAt: null
            },
            createdAt: new Date().toISOString()
        };

        this.messages.set(message.id, message);

        // Update chat
        const chat = this.chats.get(messageData.chatId);
        if (chat) {
            chat.messages.push(message.id);
            chat.stats.messageCount++;
            chat.stats.lastActivity = message.createdAt;
            this.chats.set(chat.id, chat);
        }

        // Update character stats if sender is a character
        if (messageData.sender !== 'user') {
            const character = this.characters.get(messageData.sender);
            if (character) {
                character.stats.messages++;
                this.characters.set(character.id, character);
            }
        }

        // Update user stats
        if (messageData.sender === 'user') {
            this.updateUserStats('messagesSent', 1);
        }

        return message;
    }

    updateMessage(messageId, updates) {
        const message = this.messages.get(messageId);
        if (!message) throw new Error('Message not found');

        const updatedMessage = {
            ...message,
            ...updates,
            metadata: {
                ...message.metadata,
                edited: true,
                editedAt: new Date().toISOString()
            }
        };

        this.messages.set(messageId, updatedMessage);
        return updatedMessage;
    }

    deleteMessage(messageId) {
        const message = this.messages.get(messageId);
        if (!message) throw new Error('Message not found');

        // Remove from chat
        const chat = this.chats.get(message.chatId);
        if (chat) {
            chat.messages = chat.messages.filter(id => id !== messageId);
            chat.stats.messageCount--;
            this.chats.set(chat.id, chat);
        }

        this.messages.delete(messageId);
        return true;
    }

    getChatMessages(chatId) {
        const chat = this.chats.get(chatId);
        if (!chat) return [];

        return chat.messages.map(messageId => this.messages.get(messageId)).filter(Boolean);
    }

    // Scenario Methods
    createScenario(scenarioData) {
        const scenario = {
            id: `scenario-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            name: scenarioData.name,
            description: scenarioData.description,
            characters: scenarioData.characters || [],
            setting: scenarioData.setting,
            objectives: scenarioData.objectives || [],
            rules: scenarioData.rules || [],
            tags: scenarioData.tags || [],
            creator: scenarioData.creator || 'user-default',
            stats: {
                plays: 0,
                completions: 0,
                rating: 0
            },
            isNSFW: scenarioData.isNSFW || false,
            visibility: scenarioData.visibility || 'private',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        this.scenarios.set(scenario.id, scenario);
        this.updateTags(scenario.tags);
        this.updateUserStats('scenariosCreated', 1);

        return scenario;
    }

    // Tag Management
    updateTags(tags) {
        tags.forEach(tag => this.tags.add(tag.toLowerCase()));
    }

    getAllTags() {
        return Array.from(this.tags).sort();
    }

    // User Stats
    updateUserStats(stat, increment = 1) {
        const user = this.users.get('user-default');
        if (user && user.stats[stat] !== undefined) {
            user.stats[stat] += increment;
            this.users.set(user.id, user);
        }
    }

    getUserStats() {
        const user = this.users.get('user-default');
        return user ? user.stats : null;
    }

    // Helper Methods
    generateAvatar(name) {
        const colors = [
            '#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', 
            '#EF4444', '#F97316', '#EC4899', '#6366F1'
        ];
        const color = colors[Math.floor(Math.random() * colors.length)];
        return {
            type: 'initial',
            color: color,
            initial: name.charAt(0).toUpperCase()
        };
    }

    // Import/Export
    async exportData() {
        return {
            version: '1.0',
            exportDate: new Date().toISOString(),
            data: {
                characters: Array.from(this.characters.entries()),
                chats: Array.from(this.chats.entries()),
                messages: Array.from(this.messages.entries()),
                scenarios: Array.from(this.scenarios.entries()),
                users: Array.from(this.users.entries()),
                tags: Array.from(this.tags)
            }
        };
    }

    async importData(importedData) {
        if (!importedData || !importedData.data) {
            throw new Error('Invalid import data format');
        }

        const { data } = importedData;

        // Clear existing data
        this.characters.clear();
        this.chats.clear();
        this.messages.clear();
        this.scenarios.clear();
        this.tags.clear();

        // Import data
        if (data.characters) {
            data.characters.forEach(([id, character]) => {
                this.characters.set(id, character);
            });
        }

        if (data.chats) {
            data.chats.forEach(([id, chat]) => {
                this.chats.set(id, chat);
            });
        }

        if (data.messages) {
            data.messages.forEach(([id, message]) => {
                this.messages.set(id, message);
            });
        }

        if (data.scenarios) {
            data.scenarios.forEach(([id, scenario]) => {
                this.scenarios.set(id, scenario);
            });
        }

        if (data.users) {
            data.users.forEach(([id, user]) => {
                this.users.set(id, user);
            });
        }

        if (data.tags) {
            data.tags.forEach(tag => this.tags.add(tag));
        }

        return true;
    }

    // Search functionality
    search(query, options = {}) {
        const results = {
            characters: [],
            chats: [],
            scenarios: []
        };

        const searchLower = query.toLowerCase();

        // Search characters
        if (options.includeCharacters !== false) {
            results.characters = this.getAllCharacters({
                search: query
            }).slice(0, options.limit || 10);
        }

        // Search chats
        if (options.includeChats !== false) {
            results.chats = Array.from(this.chats.values())
                .filter(chat => 
                    chat.name.toLowerCase().includes(searchLower)
                )
                .slice(0, options.limit || 10);
        }

        // Search scenarios
        if (options.includeScenarios !== false) {
            results.scenarios = Array.from(this.scenarios.values())
                .filter(scenario => 
                    scenario.name.toLowerCase().includes(searchLower) ||
                    scenario.description.toLowerCase().includes(searchLower)
                )
                .slice(0, options.limit || 10);
        }

        return results;
    }
}