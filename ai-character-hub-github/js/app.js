// Main Application File
import { InMemoryDatabase } from './database.js';
import { CharacterManager } from './characters.js';
import { ChatManager } from './chat.js';
import { UIManager } from './ui.js';
import { Utils } from './utils.js';
import { Config } from './config.js';
import { apiManager } from './api.js';

// Application State
class AppState {
    constructor() {
        this.currentTab = 'dashboard';
        this.currentUser = null;
        this.selectedCharacters = [];
        this.currentChat = null;
        this.filters = {
            search: '',
            category: 'all',
            tags: []
        };
        this.theme = localStorage.getItem('theme') || 'light';
    }

    setState(updates) {
        Object.assign(this, updates);
        this.notify();
    }

    notify() {
        window.dispatchEvent(new CustomEvent('statechange', { detail: this }));
    }
}

// Main Application Class
class AICharacterHub {
    constructor() {
        this.config = Config;
        this.state = new AppState();
        this.db = new InMemoryDatabase();
        this.characterManager = new CharacterManager(this.db, this.state);
        this.chatManager = new ChatManager(this.db, this.state);
        this.uiManager = new UIManager(this.state, this.config);
        this.utils = new Utils();
        this.apiManager = apiManager;
        
        // Register global functions immediately
        this.registerGlobalFunctions();
        
        // Initialize when DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            this.init();
        }
    }

    registerGlobalFunctions() {
        // Navigation
        window.switchTab = (tab) => this.switchTab(tab);
        window.toggleTheme = () => this.toggleTheme();
        window.showSettings = () => this.uiManager.showSettings();
        
        // Character actions
        window.saveCharacter = (event) => this.characterManager.saveCharacter(event);
        window.editCharacter = (id) => this.characterManager.editCharacter(id);
        window.deleteCharacter = (id) => this.characterManager.deleteCharacter(id);
        window.filterCharacters = () => this.characterManager.filterCharacters();
        window.toggleGridView = () => this.uiManager.toggleGridView();
        window.viewCharacter = (id) => this.characterManager.viewCharacter(id);
        
        // Chat actions
        window.createNewEnhancedChat = () => this.chatManager.createNewChat();
        window.sendEnhancedMessage = () => this.chatManager.sendMessage();
        window.switchChatMode = (mode) => this.chatManager.switchMode(mode);
        window.startChatWithCharacter = (id) => this.chatManager.startChatWithCharacter(id);
        window.loadChatById = (id) => this.chatManager.loadChatById(id);
        window.setChatMode = (mode) => this.chatManager.setChatMode(mode);
        window.selectCharacterForChat = (id) => this.chatManager.selectCharacterForChat(id);
        
        // Message actions
        window.copyMessage = (id) => this.chatManager.copyMessage(id);
        window.editMessage = (id) => this.chatManager.editMessage(id);
        window.regenerateMessage = (id) => this.chatManager.regenerateMessage(id);
        window.deleteMessage = (id) => this.chatManager.deleteMessage(id);
        
        // Chat management
        window.showChatSettings = (id) => this.chatManager.showChatSettings(id);
        window.exportChat = (id) => this.chatManager.exportChat(id);
        window.deleteChat = (id) => this.chatManager.deleteChat(id);
        
        // Data management
        window.showImportModal = () => this.showImportModal();
        window.exportAllData = () => this.exportAllData();
        window.clearAllData = () => this.clearAllData();
        window.handleImport = (file) => this.handleImport(file);
        
        // UI actions
        window.closeModal = () => this.uiManager.closeModal();
        window.showNotification = (msg, type) => this.uiManager.showNotification(msg, type);
        window.toggleMobileMenu = () => this.toggleMobileMenu();
        
        // Tools
        window.createNewScenario = () => this.createNewScenario();
        window.showCharacterGenerator = () => this.showCharacterGenerator();
        window.showPromptLibrary = () => this.showPromptLibrary();
        window.showAPISettings = () => this.showAPISettings();
        
        // Profile
        window.savePreferences = (event) => this.savePreferences(event);
    }

    async init() {
        try {
            // Hide loading screen
            const loadingScreen = document.getElementById('app-loading');
            const appContainer = document.getElementById('app');
            
            // Initialize theme
            this.applyTheme(this.state.theme);
            
            // Load saved data
            await this.loadData();
            
            // Setup event listeners
            this.setupEventListeners();
            
            // Initialize UI
            this.uiManager.init();
            
            // Show app
            if (loadingScreen) loadingScreen.style.display = 'none';
            if (appContainer) appContainer.style.display = 'flex';
            
            // Show initial tab
            this.switchTab('dashboard');
            
            // Start auto-save
            this.startAutoSave();
            
            console.log(`${this.config.app.name} v${this.config.app.version} initialized`);
            
            // Show welcome message
            this.uiManager.showNotification('Welcome to AI Character Hub!', 'success');
            
        } catch (error) {
            console.error('Failed to initialize app:', error);
            this.showErrorScreen(error);
        }
    }

    setupEventListeners() {
        // State changes
        window.addEventListener('statechange', (e) => {
            this.uiManager.updateUI(e.detail);
        });
        
        // Window resize
        window.addEventListener('resize', () => {
            this.handleResize();
        });
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            this.handleKeyboardShortcuts(e);
        });
        
        // Mobile menu setup
        if (window.innerWidth <= 768) {
            this.setupMobileMenu();
        }
    }

    switchTab(tab) {
        this.state.setState({ currentTab: tab });
        
        // Update nav
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.toggle('active', item.dataset.tab === tab);
        });
        
        // Load tab content
        this.loadTabContent(tab);
        
        // Close mobile menu if open
        this.closeMobileMenu();
    }

    async loadTabContent(tab) {
        const contentContainer = document.getElementById('tab-content');
        if (!contentContainer) return;
        
        try {
            const content = await this.uiManager.getTabContent(tab);
            contentContainer.innerHTML = content;
            
            // Run tab-specific initialization
            this.initializeTab(tab);
        } catch (error) {
            console.error(`Error loading tab ${tab}:`, error);
            contentContainer.innerHTML = `
                <div class="alert alert-danger">
                    Error loading content. Please try again.
                </div>
            `;
        }
    }

    initializeTab(tab) {
        switch(tab) {
            case 'dashboard':
                this.uiManager.initDashboard();
                break;
            case 'characters':
                this.characterManager.loadCharacters();
                break;
            case 'create':
                this.characterManager.initCreateForm();
                break;
            case 'chat':
                this.chatManager.initChat();
                break;
            case 'scenarios':
                this.initScenarios();
                break;
            case 'tools':
                this.initTools();
                break;
            case 'profile':
                this.initProfile();
                break;
        }
    }

    toggleTheme() {
        const newTheme = this.state.theme === 'light' ? 'dark' : 'light';
        this.state.setState({ theme: newTheme });
        this.applyTheme(newTheme);
        localStorage.setItem('theme', newTheme);
    }

    applyTheme(theme) {
        document.body.classList.toggle('dark', theme === 'dark');
        const themeIcon = document.getElementById('theme-icon');
        if (themeIcon) {
            themeIcon.textContent = theme === 'dark' ? '☀️' : '🌙';
        }
    }

    setupMobileMenu() {
        if (!document.querySelector('.mobile-header')) {
            const mobileHeader = document.createElement('div');
            mobileHeader.className = 'mobile-header';
            mobileHeader.innerHTML = `
                <button class="mobile-menu-btn" onclick="toggleMobileMenu()">
                    <span>☰</span>
                </button>
                <div class="nav-brand">
                    <span class="nav-logo">🤖</span>
                    <span class="nav-title">AI Hub</span>
                </div>
                <div></div>
            `;
            document.body.appendChild(mobileHeader);
        }

        if (!document.querySelector('.nav-overlay')) {
            const overlay = document.createElement('div');
            overlay.className = 'nav-overlay';
            overlay.onclick = () => this.closeMobileMenu();
            document.body.appendChild(overlay);
        }
    }

    toggleMobileMenu() {
        const nav = document.querySelector('.nav');
        const overlay = document.querySelector('.nav-overlay');
        if (nav) nav.classList.toggle('mobile-open');
        if (overlay) overlay.classList.toggle('active');
    }

    closeMobileMenu() {
        const nav = document.querySelector('.nav');
        const overlay = document.querySelector('.nav-overlay');
        if (nav) nav.classList.remove('mobile-open');
        if (overlay) overlay.classList.remove('active');
    }

    handleResize() {
        const isMobile = window.innerWidth <= 768;
        if (isMobile && !document.querySelector('.mobile-header')) {
            this.setupMobileMenu();
        }
    }

    handleKeyboardShortcuts(e) {
        // Cmd/Ctrl + K - Quick search
        if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
            e.preventDefault();
            this.uiManager.showQuickSearch();
        }
        
        // Cmd/Ctrl + N - New character
        if ((e.metaKey || e.ctrlKey) && e.key === 'n') {
            e.preventDefault();
            this.switchTab('create');
        }
        
        // Escape - Close modals
        if (e.key === 'Escape') {
            this.uiManager.closeAllModals();
        }
    }

    async loadData() {
        try {
            const savedData = localStorage.getItem('aiCharacterHubData');
            if (savedData) {
                const data = JSON.parse(savedData);
                await this.db.importData(data);
            }
        } catch (error) {
            console.error('Error loading saved data:', error);
        }
    }

    async saveData() {
        try {
            const data = await this.db.exportData();
            localStorage.setItem('aiCharacterHubData', JSON.stringify(data));
        } catch (error) {
            console.error('Error saving data:', error);
        }
    }

    startAutoSave() {
        setInterval(() => {
            this.saveData();
        }, 30000); // Auto-save every 30 seconds
    }

    // Data management methods
    showImportModal() {
        this.uiManager.createModal('Import Data', `
            <div class="import-section">
                <p>Select a JSON file containing your character and chat data.</p>
                <input type="file" 
                       id="import-file" 
                       accept=".json" 
                       class="form-input"
                       onchange="handleImport(this.files[0])">
            </div>
        `);
    }

    async handleImport(file) {
        if (!file) return;
        
        try {
            const text = await file.text();
            const data = JSON.parse(text);
            await this.db.importData(data);
            this.uiManager.showNotification('Data imported successfully!', 'success');
            this.uiManager.closeModal();
            this.switchTab('dashboard');
        } catch (error) {
            console.error('Import error:', error);
            this.uiManager.showNotification('Error importing data. Please check the file format.', 'error');
        }
    }

    async exportAllData() {
        try {
            const data = await this.db.exportData();
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `ai-character-hub-${new Date().toISOString().split('T')[0]}.json`;
            a.click();
            URL.revokeObjectURL(url);
            this.uiManager.showNotification('Data exported successfully!', 'success');
        } catch (error) {
            console.error('Export error:', error);
            this.uiManager.showNotification('Error exporting data.', 'error');
        }
    }

    async clearAllData() {
        const confirmed = await this.uiManager.showConfirmDialog(
            'Clear All Data',
            'Are you sure you want to delete all data? This cannot be undone!'
        );
        
        if (confirmed) {
            localStorage.clear();
            this.uiManager.showNotification('All data cleared. Refreshing...', 'info');
            setTimeout(() => location.reload(), 1000);
        }
    }

    // Placeholder methods
    initScenarios() {
        console.log('Scenarios feature coming soon!');
    }

    initTools() {
        console.log('Tools initialized');
    }

    initProfile() {
        console.log('Profile initialized');
    }

    createNewScenario() {
        this.uiManager.showNotification('Scenario creation coming soon!', 'info');
    }

    showCharacterGenerator() {
        this.uiManager.showNotification('Character generator coming soon!', 'info');
    }

    showPromptLibrary() {
        this.uiManager.showNotification('Prompt library coming soon!', 'info');
    }

    showAPISettings() {
        this.uiManager.showNotification('API settings coming soon!', 'info');
    }

    savePreferences(event) {
        event.preventDefault();
        this.uiManager.showNotification('Preferences saved!', 'success');
    }

    showErrorScreen(error) {
        const app = document.getElementById('app');
        if (app) {
            app.innerHTML = `
                <div class="error-screen" style="padding: 2rem; text-align: center;">
                    <h1>😕 Oops! Something went wrong</h1>
                    <p>Error: ${error.message}</p>
                    <button class="btn btn-primary" onclick="location.reload()">Reload App</button>
                </div>
            `;
        }
    }
}

// Initialize the application
const app = new AICharacterHub();

// Make app instance globally available for debugging
window.app = app;