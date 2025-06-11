// Centralized Configuration File

export const Config = {
    // Application Info
    app: {
        name: 'AI Character Hub',
        version: '1.0.0',
        author: 'AI Character Hub Team',
        description: 'Ultimate AI character creation and chat platform'
    },

    // Feature Flags
    features: {
        nsfwEnabled: false,
        autoSave: true,
        autoSaveInterval: 30000, // 30 seconds
        enableAnimations: true,
        enableSounds: false,
        enableNotifications: true,
        debugMode: false,
        maxCharacters: 100,
        maxChatsPerCharacter: 50,
        maxMessagesPerChat: 1000,
        maxMessageLength: 5000,
        maxFileSize: 10 * 1024 * 1024, // 10MB
        allowedFileTypes: ['image/jpeg', 'image/png', 'image/gif', 'text/plain', 'application/pdf']
    },

    // UI Configuration
    ui: {
        theme: 'light', // light, dark, auto
        language: 'en',
        dateFormat: 'relative', // relative, short, medium, long
        timeFormat: '12h', // 12h, 24h
        animations: {
            duration: 200,
            easing: 'ease-out'
        },
        breakpoints: {
            mobile: 480,
            tablet: 768,
            desktop: 1024,
            wide: 1440
        },
        defaultAvatar: '🤖',
        messagesPerPage: 50,
        charactersPerPage: 20
    },

    // Category Configuration
    categories: {
        list: [
            'human', 'humanoid', 'mythical', 'mechanical', 'alien', 
            'animal', 'fantasy', 'historical', 'celebrity', 'anime', 
            'game', 'horror', 'romantic', 'comedy', 'superhero', 'villain'
        ],
        colors: {
            human: '#3B82F6',
            humanoid: '#10B981',
            mythical: '#8B5CF6',
            mechanical: '#F59E0B',
            alien: '#EF4444',
            animal: '#F97316',
            fantasy: '#EC4899',
            historical: '#6366F1',
            celebrity: '#84CC16',
            anime: '#06B6D4',
            game: '#A855F7',
            horror: '#DC2626',
            romantic: '#F472B6',
            comedy: '#FBBF24',
            superhero: '#3B82F6',
            villain: '#7C3AED',
            default: '#6B7280'
        },
        descriptions: {
            human: 'Realistic human characters from various backgrounds',
            humanoid: 'Human-like beings with special abilities or traits',
            mythical: 'Creatures from mythology and legends',
            mechanical: 'Robots, androids, and AI entities',
            alien: 'Extraterrestrial beings from other worlds',
            animal: 'Anthropomorphic animals and creatures',
            fantasy: 'Characters from fantasy worlds and stories',
            historical: 'Historical figures and period characters',
            celebrity: 'Famous personalities and public figures',
            anime: 'Characters inspired by anime and manga',
            game: 'Characters from video games',
            horror: 'Scary and supernatural characters',
            romantic: 'Characters focused on romance and relationships',
            comedy: 'Humorous and comedic characters',
            superhero: 'Heroes with superpowers',
            villain: 'Antagonists and evil characters'
        }
    },

    // Chat Configuration
    chat: {
        defaultSettings: {
            temperature: 0.8,
            maxTokens: 1000,
            topP: 0.9,
            frequencyPenalty: 0.0,
            presencePenalty: 0.0,
            streamResponse: true
        },
        modes: {
            normal: {
                name: 'Normal Chat',
                description: 'Standard conversation mode',
                icon: '💬'
            },
            roleplay: {
                name: 'Roleplay',
                description: 'Immersive character roleplay',
                icon: '🎭'
            },
            creative: {
                name: 'Creative',
                description: 'Creative writing and storytelling',
                icon: '✍️'
            },
            game: {
                name: 'Game Mode',
                description: 'Interactive game scenarios',
                icon: '🎮'
            }
        },
        typingSpeed: {
            slow: 3000,
            normal: 2000,
            fast: 1000
        }
    },

    // API Configuration (for future use)
    api: {
        endpoints: {
            openai: 'https://api.openai.com/v1',
            anthropic: 'https://api.anthropic.com/v1',
            local: 'http://localhost:8080/api'
        },
        models: {
            openai: ['gpt-4', 'gpt-3.5-turbo'],
            anthropic: ['claude-2', 'claude-instant'],
            local: ['custom-model']
        },
        timeout: 30000, // 30 seconds
        retryAttempts: 3,
        retryDelay: 1000
    },

    // Storage Configuration
    storage: {
        prefix: 'aiCharHub_',
        version: '1.0',
        compression: true,
        encryption: false,
        quotaWarningThreshold: 0.9, // Warn when 90% full
        keys: {
            characters: 'characters',
            chats: 'chats',
            messages: 'messages',
            settings: 'settings',
            user: 'user',
            theme: 'theme'
        }
    },

    // Export Configuration
    export: {
        formats: ['json', 'txt', 'csv'],
        includeMetadata: true,
        compression: false,
        filePrefix: 'ai-character-hub',
        dateFormat: 'YYYY-MM-DD'
    },

    // Personality Templates
    personalityTemplates: {
        friendly: {
            name: 'Friendly',
            template: 'I am warm, approachable, and always eager to help. I enjoy making others feel comfortable and valued in our conversations.'
        },
        professional: {
            name: 'Professional',
            template: 'I maintain a professional demeanor while being helpful and informative. I focus on providing accurate and useful information.'
        },
        creative: {
            name: 'Creative',
            template: 'I am imaginative and artistic, always looking for creative solutions and enjoying discussions about art, music, and innovation.'
        },
        intellectual: {
            name: 'Intellectual',
            template: 'I am analytical and thoughtful, enjoying deep discussions about philosophy, science, and complex topics.'
        },
        playful: {
            name: 'Playful',
            template: 'I am fun-loving and energetic, always ready with a joke or a game. I enjoy making conversations light and entertaining.'
        },
        mysterious: {
            name: 'Mysterious',
            template: 'I speak in riddles and hints, never revealing everything at once. There\'s always more to discover about me.'
        },
        mentor: {
            name: 'Mentor',
            template: 'I am wise and experienced, offering guidance and support. I help others grow and learn from their experiences.'
        },
        adventurous: {
            name: 'Adventurous',
            template: 'I love excitement and new experiences. I\'m always ready for the next adventure and encourage others to step out of their comfort zones.'
        }
    },

    // Validation Rules
    validation: {
        character: {
            name: {
                minLength: 2,
                maxLength: 50,
                pattern: /^[a-zA-Z0-9\s\-']+$/
            },
            personality: {
                minLength: 20,
                maxLength: 1000
            },
            scenario: {
                minLength: 10,
                maxLength: 500
            },
            greeting: {
                minLength: 10,
                maxLength: 500
            },
            tags: {
                max: 10,
                minLength: 2,
                maxLength: 20
            }
        },
        chat: {
            name: {
                minLength: 2,
                maxLength: 50
            },
            message: {
                minLength: 1,
                maxLength: 5000
            }
        }
    },

    // Error Messages
    errors: {
        network: 'Network error. Please check your connection.',
        storage: 'Storage error. Local storage might be full.',
        validation: 'Validation error. Please check your input.',
        notFound: 'The requested item was not found.',
        unauthorized: 'You are not authorized to perform this action.',
        serverError: 'Server error. Please try again later.',
        importError: 'Error importing data. Please check the file format.',
        exportError: 'Error exporting data. Please try again.',
        characterLimit: 'Character limit reached. Please delete some characters.',
        messageLimit: 'Message limit reached for this chat.'
    },

    // Success Messages
    messages: {
        characterCreated: 'Character created successfully!',
        characterUpdated: 'Character updated successfully!',
        characterDeleted: 'Character deleted successfully!',
        chatCreated: 'New chat started!',
        messageSent: 'Message sent!',
        dataImported: 'Data imported successfully!',
        dataExported: 'Data exported successfully!',
        settingsSaved: 'Settings saved!',
        copied: 'Copied to clipboard!'
    },

    // Keyboard Shortcuts
    shortcuts: {
        newCharacter: { key: 'n', ctrl: true },
        newChat: { key: 'm', ctrl: true },
        search: { key: 'k', ctrl: true },
        settings: { key: ',', ctrl: true },
        help: { key: '?', shift: true },
        export: { key: 'e', ctrl: true, shift: true },
        import: { key: 'i', ctrl: true, shift: true },
        toggleTheme: { key: 't', ctrl: true, alt: true },
        closeModal: { key: 'Escape' }
    },

    // Development Configuration
    dev: {
        logLevel: 'info', // error, warn, info, debug
        enableMockData: false,
        mockDelay: 1000,
        showPerformanceMetrics: false,
        enableHotReload: true
    }
};

// Freeze configuration to prevent accidental modifications
Object.freeze(Config);

// Export helper functions
export function getConfig(path) {
    return path.split('.').reduce((obj, key) => obj?.[key], Config);
}

export function getCategoryColor(category) {
    return Config.categories.colors[category] || Config.categories.colors.default;
}

export function validateCharacterName(name) {
    const rules = Config.validation.character.name;
    return name.length >= rules.minLength && 
           name.length <= rules.maxLength && 
           rules.pattern.test(name);
}