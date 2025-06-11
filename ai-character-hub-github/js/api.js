// API Integration Module - Placeholder for future AI services

import { Config } from './config.js';

export class APIManager {
    constructor() {
        this.providers = {
            openai: new OpenAIProvider(),
            anthropic: new AnthropicProvider(),
            local: new LocalAIProvider(),
            mock: new MockAIProvider()
        };
        
        this.currentProvider = 'mock'; // Default to mock for now
        this.apiKeys = this.loadAPIKeys();
        this.requestQueue = [];
        this.rateLimits = new Map();
    }

    // Set API provider
    setProvider(provider) {
        if (this.providers[provider]) {
            this.currentProvider = provider;
            return true;
        }
        return false;
    }

    // Set API key for a provider
    setAPIKey(provider, apiKey) {
        this.apiKeys[provider] = apiKey;
        this.saveAPIKeys();
    }

    // Generate response from AI
    async generateResponse(messages, options = {}) {
        const provider = this.providers[this.currentProvider];
        
        // Check if provider is available
        if (!provider.isAvailable()) {
            throw new Error(`Provider ${this.currentProvider} is not available`);
        }

        // Apply rate limiting
        await this.checkRateLimit(this.currentProvider);

        try {
            const response = await provider.generateResponse(messages, {
                ...Config.chat.defaultSettings,
                ...options,
                apiKey: this.apiKeys[this.currentProvider]
            });

            return response;
        } catch (error) {
            console.error('API Error:', error);
            
            // Fallback to mock if real API fails
            if (this.currentProvider !== 'mock') {
                console.log('Falling back to mock provider');
                return this.providers.mock.generateResponse(messages, options);
            }
            
            throw error;
        }
    }

    // Stream response from AI
    async *streamResponse(messages, options = {}) {
        const provider = this.providers[this.currentProvider];
        
        if (!provider.supportsStreaming()) {
            // Simulate streaming for providers that don't support it
            const response = await this.generateResponse(messages, options);
            const words = response.split(' ');
            
            for (const word of words) {
                yield word + ' ';
                await this.sleep(50); // Simulate typing
            }
            return;
        }

        // Real streaming
        const stream = provider.streamResponse(messages, {
            ...Config.chat.defaultSettings,
            ...options,
            apiKey: this.apiKeys[this.currentProvider]
        });

        for await (const chunk of stream) {
            yield chunk;
        }
    }

    // Check rate limits
    async checkRateLimit(provider) {
        const limit = this.rateLimits.get(provider);
        if (limit && limit.remaining <= 0) {
            const waitTime = limit.resetTime - Date.now();
            if (waitTime > 0) {
                console.log(`Rate limit reached. Waiting ${waitTime}ms`);
                await this.sleep(waitTime);
            }
        }
    }

    // Load API keys from storage
    loadAPIKeys() {
        const stored = localStorage.getItem('aiHub_apiKeys');
        return stored ? JSON.parse(stored) : {};
    }

    // Save API keys to storage
    saveAPIKeys() {
        localStorage.setItem('aiHub_apiKeys', JSON.stringify(this.apiKeys));
    }

    // Utility sleep function
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Test API connection
    async testConnection(provider, apiKey) {
        try {
            const testProvider = this.providers[provider];
            if (!testProvider) {
                throw new Error('Invalid provider');
            }

            const result = await testProvider.testConnection(apiKey);
            return result;
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Get available models for a provider
    getAvailableModels(provider) {
        const p = this.providers[provider];
        return p ? p.getAvailableModels() : [];
    }

    // Estimate tokens
    estimateTokens(text) {
        // Simple estimation: ~4 characters per token
        return Math.ceil(text.length / 4);
    }
}

// Base AI Provider Class
class BaseAIProvider {
    constructor(name) {
        this.name = name;
        this.baseURL = Config.api.endpoints.openai;
        this.models = [];
    }

    isAvailable() {
        return true;
    }

    supportsStreaming() {
        return false;
    }

    async generateResponse(messages, options) {
        throw new Error('generateResponse must be implemented by subclass');
    }

    async *streamResponse(messages, options) {
        throw new Error('streamResponse must be implemented by subclass');
    }

    async testConnection(apiKey) {
        throw new Error('testConnection must be implemented by subclass');
    }

    getAvailableModels() {
        return this.models;
    }

    // Format messages for the specific API
    formatMessages(messages) {
        return messages;
    }

    // Parse API response
    parseResponse(response) {
        return response;
    }
}

// OpenAI Provider
class OpenAIProvider extends BaseAIProvider {
    constructor() {
        super('openai');
        this.baseURL = Config.api.endpoints.openai;
        this.models = ['gpt-4', 'gpt-3.5-turbo', 'gpt-3.5-turbo-16k'];
    }

    async generateResponse(messages, options) {
        // Placeholder for OpenAI API implementation
        // In production, this would make actual API calls
        
        if (!options.apiKey) {
            throw new Error('OpenAI API key required');
        }

        // Simulated API call
        const response = await fetch(`${this.baseURL}/chat/completions`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${options.apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: options.model || 'gpt-3.5-turbo',
                messages: this.formatMessages(messages),
                temperature: options.temperature,
                max_tokens: options.maxTokens,
                stream: false
            })
        });

        if (!response.ok) {
            throw new Error(`OpenAI API error: ${response.status}`);
        }

        const data = await response.json();
        return data.choices[0].message.content;
    }

    supportsStreaming() {
        return true;
    }

    formatMessages(messages) {
        return messages.map(msg => ({
            role: msg.role === 'user' ? 'user' : 'assistant',
            content: msg.content
        }));
    }
}

// Anthropic Provider
class AnthropicProvider extends BaseAIProvider {
    constructor() {
        super('anthropic');
        this.baseURL = Config.api.endpoints.anthropic;
        this.models = ['claude-2', 'claude-instant-1'];
    }

    async generateResponse(messages, options) {
        // Placeholder for Anthropic API implementation
        if (!options.apiKey) {
            throw new Error('Anthropic API key required');
        }

        // Format for Claude API
        const prompt = this.formatMessagesAsPrompt(messages);

        // Simulated API call
        const response = await fetch(`${this.baseURL}/complete`, {
            method: 'POST',
            headers: {
                'x-api-key': options.apiKey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: options.model || 'claude-instant-1',
                prompt: prompt,
                max_tokens_to_sample: options.maxTokens,
                temperature: options.temperature
            })
        });

        if (!response.ok) {
            throw new Error(`Anthropic API error: ${response.status}`);
        }

        const data = await response.json();
        return data.completion;
    }

    formatMessagesAsPrompt(messages) {
        return messages.map(msg => 
            `${msg.role === 'user' ? 'Human' : 'Assistant'}: ${msg.content}`
        ).join('\n\n') + '\n\nAssistant:';
    }
}

// Local AI Provider (for self-hosted models)
class LocalAIProvider extends BaseAIProvider {
    constructor() {
        super('local');
        this.baseURL = Config.api.endpoints.local;
        this.models = ['local-model'];
    }

    isAvailable() {
        // Check if local server is running
        return this.checkLocalServer();
    }

    async checkLocalServer() {
        try {
            const response = await fetch(`${this.baseURL}/health`, {
                method: 'GET',
                signal: AbortSignal.timeout(1000)
            });
            return response.ok;
        } catch {
            return false;
        }
    }

    async generateResponse(messages, options) {
        const response = await fetch(`${this.baseURL}/generate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                messages: messages,
                ...options
            })
        });

        if (!response.ok) {
            throw new Error(`Local AI error: ${response.status}`);
        }

        const data = await response.json();
        return data.response;
    }
}

// Mock AI Provider (for testing and development)
class MockAIProvider extends BaseAIProvider {
    constructor() {
        super('mock');
        this.models = ['mock-model'];
        this.personalities = {
            friendly: [
                "That's a great question! ",
                "I'm happy to help with that. ",
                "What an interesting topic! ",
                "I'd love to discuss this with you. "
            ],
            professional: [
                "Thank you for your inquiry. ",
                "I understand your question. ",
                "Let me provide you with information on that. ",
                "Based on the context provided, "
            ],
            creative: [
                "Oh, what a fascinating thought! ",
                "That sparks my imagination! ",
                "Let's explore this creatively... ",
                "What an artistic perspective! "
            ]
        };
    }

    async generateResponse(messages, options) {
        // Simulate API delay
        await this.sleep(Math.random() * 1000 + 500);

        const lastMessage = messages[messages.length - 1];
        const character = options.character || {};
        const personality = character.personality || 'friendly';

        // Get personality-based prefix
        const prefixes = this.personalities[personality] || this.personalities.friendly;
        const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];

        // Generate contextual response
        const responses = this.generateContextualResponse(lastMessage.content, character);
        const response = responses[Math.floor(Math.random() * responses.length)];

        return prefix + response;
    }

    generateContextualResponse(userMessage, character) {
        const lowerMessage = userMessage.toLowerCase();

        // Greeting responses
        if (lowerMessage.match(/^(hi|hello|hey|greetings)/)) {
            return [
                `Hello! ${character.greeting || "How can I assist you today?"}`,
                `Greetings! ${character.scenario || "I'm here to help."}`,
                "Hello there! What would you like to talk about?"
            ];
        }

        // Question responses
        if (lowerMessage.includes('?')) {
            return [
                "That's an interesting question. Based on what you've asked, I think...",
                "Let me think about that for a moment. In my opinion...",
                "Great question! Here's what I think about that...",
                `As ${character.name || 'your AI assistant'}, I believe...`
            ];
        }

        // Default responses
        return [
            "I understand what you're saying. Let me share my thoughts on that...",
            "That's a fascinating point. Here's my perspective...",
            "Thank you for sharing that. In response, I would say...",
            `${character.personality || "From my understanding"}, I think...`
        ];
    }

    supportsStreaming() {
        return true;
    }

    async *streamResponse(messages, options) {
        const fullResponse = await this.generateResponse(messages, options);
        const words = fullResponse.split(' ');

        for (const word of words) {
            yield word + ' ';
            await this.sleep(Math.random() * 100 + 20);
        }
    }

    async testConnection() {
        return {
            success: true,
            message: 'Mock provider is always available'
        };
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Export singleton instance
export const apiManager = new APIManager();

// Export for window access
window.apiManager = apiManager;