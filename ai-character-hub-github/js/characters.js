// Character Management Module

export class CharacterManager {
    constructor(database, appState) {
        this.db = database;
        this.state = appState;
        this.currentEditingId = null;
    }

    // Create or update character
    async saveCharacter(event) {
        event.preventDefault();
        
        const form = event.target;
        const formData = new FormData(form);
        
        const characterData = {
            name: formData.get('name'),
            category: formData.get('category'),
            personality: formData.get('personality'),
            scenario: formData.get('scenario'),
            greeting: formData.get('greeting'),
            examples: formData.get('examples'),
            description: formData.get('description'),
            tags: this.parseTags(formData.get('tags')),
            isNSFW: formData.get('nsfw') === 'on',
            visibility: formData.get('visibility') || 'private'
        };

        try {
            let character;
            if (this.currentEditingId) {
                // Update existing character
                character = this.db.updateCharacter(this.currentEditingId, characterData);
                this.showNotification('Character updated successfully!', 'success');
            } else {
                // Create new character
                character = this.db.createCharacter(characterData);
                this.showNotification('Character created successfully!', 'success');
            }

            // Reset form and state
            form.reset();
            this.currentEditingId = null;
            
            // Switch to characters tab
            window.switchTab('characters');
            
            return character;
        } catch (error) {
            console.error('Error saving character:', error);
            this.showNotification('Error saving character. Please try again.', 'error');
        }
    }

    // Edit character
    editCharacter(characterId) {
        const character = this.db.getCharacter(characterId);
        if (!character) {
            this.showNotification('Character not found', 'error');
            return;
        }

        this.currentEditingId = characterId;
        
        // Switch to create tab
        window.switchTab('create');
        
        // Wait for form to load
        setTimeout(() => {
            this.populateForm(character);
        }, 100);
    }

    // Populate form with character data
    populateForm(character) {
        const form = document.getElementById('create-character-form');
        if (!form) return;

        // Set form values
        form.elements['name'].value = character.name;
        form.elements['category'].value = character.category;
        form.elements['personality'].value = character.personality;
        form.elements['scenario'].value = character.scenario;
        form.elements['greeting'].value = character.greeting;
        form.elements['examples'].value = character.examples || '';
        form.elements['description'].value = character.description || '';
        form.elements['tags'].value = character.tags.join(', ');
        form.elements['nsfw'].checked = character.isNSFW;
        form.elements['visibility'].value = character.visibility;

        // Update form title
        const formTitle = document.querySelector('.create-form-title');
        if (formTitle) {
            formTitle.textContent = 'Edit Character';
        }

        // Update button text
        const submitBtn = form.querySelector('button[type="submit"]');
        if (submitBtn) {
            submitBtn.textContent = 'Update Character';
        }
    }

    // Delete character
    async deleteCharacter(characterId) {
        const character = this.db.getCharacter(characterId);
        if (!character) return;

        const confirmed = await this.showConfirmDialog(
            'Delete Character',
            `Are you sure you want to delete "${character.name}"? This will also delete all associated chats and cannot be undone.`
        );

        if (confirmed) {
            try {
                this.db.deleteCharacter(characterId);
                this.showNotification('Character deleted successfully', 'success');
                this.loadCharacters();
            } catch (error) {
                console.error('Error deleting character:', error);
                this.showNotification('Error deleting character', 'error');
            }
        }
    }

    // Load and display characters
    loadCharacters() {
        const filters = {
            search: this.state.filters.search,
            category: this.state.filters.category,
            tags: this.state.filters.tags,
            nsfw: this.state.filters.includeNSFW,
            sortBy: this.state.filters.sortBy || 'created'
        };

        const characters = this.db.getAllCharacters(filters);
        this.displayCharacters(characters);
        this.updateCharacterStats(characters);
    }

    // Display characters in grid
    displayCharacters(characters) {
        const container = document.getElementById('character-grid');
        if (!container) return;

        if (characters.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">👥</div>
                    <h3>No characters found</h3>
                    <p>Create your first character to get started!</p>
                    <button class="btn btn-primary" onclick="switchTab('create')">
                        Create Character
                    </button>
                </div>
            `;
            return;
        }

        const characterCards = characters.map(character => 
            this.createCharacterCard(character)
        ).join('');

        container.innerHTML = characterCards;
    }

    // Create character card HTML
    createCharacterCard(character) {
        const categoryColor = this.getCategoryColor(character.category);
        const avatar = character.avatar;
        
        return `
            <div class="character-card" data-character-id="${character.id}">
                <div class="character-avatar" style="background: ${avatar.color || categoryColor}">
                    ${avatar.type === 'emoji' ? avatar.emoji : avatar.initial}
                </div>
                <div class="character-info">
                    <h3 class="character-name">${this.escapeHtml(character.name)}</h3>
                    <p class="character-category">${character.category}</p>
                    <p class="character-description">${this.escapeHtml(character.description || character.personality.substring(0, 100) + '...')}</p>
                    <div class="character-tags">
                        ${character.tags.slice(0, 3).map(tag => 
                            `<span class="tag">${this.escapeHtml(tag)}</span>`
                        ).join('')}
                        ${character.tags.length > 3 ? `<span class="tag">+${character.tags.length - 3}</span>` : ''}
                    </div>
                    <div class="character-stats">
                        <span title="Chats">💬 ${character.stats.chats}</span>
                        <span title="Messages">✉️ ${character.stats.messages}</span>
                        <span title="Rating">⭐ ${character.stats.rating || 'N/A'}</span>
                    </div>
                </div>
                <div class="character-actions">
                    <button class="btn btn-sm" onclick="startChatWithCharacter('${character.id}')" title="Start Chat">
                        💬
                    </button>
                    <button class="btn btn-sm" onclick="editCharacter('${character.id}')" title="Edit">
                        ✏️
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="deleteCharacter('${character.id}')" title="Delete">
                        🗑️
                    </button>
                </div>
                ${character.isNSFW ? '<div class="nsfw-badge">NSFW</div>' : ''}
            </div>
        `;
    }

    // Filter characters
    filterCharacters() {
        const searchInput = document.getElementById('character-search');
        const categorySelect = document.getElementById('category-filter');
        const tagInput = document.getElementById('tag-filter');
        
        this.state.filters = {
            search: searchInput ? searchInput.value : '',
            category: categorySelect ? categorySelect.value : 'all',
            tags: tagInput ? this.parseTags(tagInput.value) : []
        };

        this.loadCharacters();
    }

    // Update character statistics display
    updateCharacterStats(characters) {
        const statsContainer = document.getElementById('character-stats');
        if (!statsContainer) return;

        const stats = {
            total: characters.length,
            byCategory: {},
            nsfw: characters.filter(c => c.isNSFW).length
        };

        // Count by category
        characters.forEach(char => {
            stats.byCategory[char.category] = (stats.byCategory[char.category] || 0) + 1;
        });

        statsContainer.innerHTML = `
            <div class="stat-card">
                <div class="stat-value">${stats.total}</div>
                <div class="stat-label">Total Characters</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${Object.keys(stats.byCategory).length}</div>
                <div class="stat-label">Categories</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${stats.nsfw}</div>
                <div class="stat-label">NSFW</div>
            </div>
        `;
    }

    // Initialize create form
    initCreateForm() {
        const form = document.getElementById('create-character-form');
        if (!form) return;

        // Reset form if not editing
        if (!this.currentEditingId) {
            form.reset();
            const formTitle = document.querySelector('.create-form-title');
            if (formTitle) formTitle.textContent = 'Create New Character';
            
            const submitBtn = form.querySelector('button[type="submit"]');
            if (submitBtn) submitBtn.textContent = 'Create Character';
        }

        // Setup tag autocomplete
        this.setupTagAutocomplete();
        
        // Setup personality templates
        this.setupPersonalityTemplates();
    }

    // Setup tag autocomplete
    setupTagAutocomplete() {
        const tagInput = document.getElementById('character-tags');
        if (!tagInput) return;

        const allTags = this.db.getAllTags();
        
        // Simple autocomplete implementation
        tagInput.addEventListener('input', (e) => {
            const value = e.target.value;
            const lastTag = value.split(',').pop().trim();
            
            if (lastTag.length > 1) {
                const suggestions = allTags.filter(tag => 
                    tag.toLowerCase().startsWith(lastTag.toLowerCase())
                );
                
                // Show suggestions (implement your preferred UI)
                console.log('Tag suggestions:', suggestions);
            }
        });
    }

    // Setup personality templates
    setupPersonalityTemplates() {
        const templateSelect = document.getElementById('personality-template');
        if (!templateSelect) return;

        const templates = {
            friendly: "I am warm, approachable, and always eager to help. I enjoy making others feel comfortable and valued in our conversations.",
            professional: "I maintain a professional demeanor while being helpful and informative. I focus on providing accurate and useful information.",
            creative: "I am imaginative and artistic, always looking for creative solutions and enjoying discussions about art, music, and innovation.",
            intellectual: "I am analytical and thoughtful, enjoying deep discussions about philosophy, science, and complex topics.",
            playful: "I am fun-loving and energetic, always ready with a joke or a game. I enjoy making conversations light and entertaining."
        };

        templateSelect.addEventListener('change', (e) => {
            const template = templates[e.target.value];
            if (template) {
                const personalityField = document.getElementById('character-personality');
                if (personalityField) {
                    personalityField.value = template;
                }
            }
        });
    }

    // NEW METHOD - View character details
    viewCharacter(characterId) {
        const character = this.db.getCharacter(characterId);
        if (!character) {
            this.showNotification('Character not found', 'error');
            return;
        }

        // Create a modal with character details
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3 class="modal-title">Character Details</h3>
                    <button class="modal-close" onclick="closeModal()">×</button>
                </div>
                <div class="modal-body">
                    <div class="character-details">
                        <div class="character-header">
                            <div class="character-header-avatar" style="background: ${character.avatar.color}">
                                ${character.avatar.type === 'emoji' ? character.avatar.emoji : character.avatar.initial}
                            </div>
                            <div class="character-header-info">
                                <h2 class="character-header-name">${this.escapeHtml(character.name)}</h2>
                                <span class="character-header-category">${character.category}</span>
                                <div class="character-header-stats">
                                    <div class="character-stat">
                                        <div class="character-stat-value">${character.stats.chats}</div>
                                        <div class="character-stat-label">Chats</div>
                                    </div>
                                    <div class="character-stat">
                                        <div class="character-stat-value">${character.stats.messages}</div>
                                        <div class="character-stat-label">Messages</div>
                                    </div>
                                    <div class="character-stat">
                                        <div class="character-stat-value">${character.stats.rating || 'N/A'}</div>
                                        <div class="character-stat-label">Rating</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="character-section">
                            <h4>Personality</h4>
                            <p>${this.escapeHtml(character.personality)}</p>
                        </div>
                        
                        <div class="character-section">
                            <h4>Scenario</h4>
                            <p>${this.escapeHtml(character.scenario)}</p>
                        </div>
                        
                        <div class="character-section">
                            <h4>Greeting</h4>
                            <p>${this.escapeHtml(character.greeting)}</p>
                        </div>
                        
                        ${character.examples ? `
                            <div class="character-section">
                                <h4>Example Messages</h4>
                                <pre>${this.escapeHtml(character.examples)}</pre>
                            </div>
                        ` : ''}
                        
                        <div class="character-section">
                            <h4>Tags</h4>
                            <div class="character-tags">
                                ${character.tags.map(tag => 
                                    `<span class="tag">${this.escapeHtml(tag)}</span>`
                                ).join('')}
                            </div>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn" onclick="editCharacter('${character.id}')">Edit</button>
                    <button class="btn btn-primary" onclick="startChatWithCharacter('${character.id}')">Start Chat</button>
                </div>
            </div>
        `;
        
        document.getElementById('modals-container').appendChild(modal);
    }

    // Helper methods
    parseTags(tagString) {
        if (!tagString) return [];
        return tagString.split(',')
            .map(tag => tag.trim())
            .filter(tag => tag.length > 0);
    }

    getCategoryColor(category) {
        const colors = {
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
            villain: '#7C3AED'
        };
        return colors[category] || '#6B7280';
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Updated notification method
    showNotification(message, type = 'info') {
        if (window.app && window.app.uiManager) {
            window.app.uiManager.showNotification(message, type);
        } else {
            // Fallback notification
            const notification = document.createElement('div');
            notification.className = `notification notification-${type}`;
            notification.textContent = message;
            document.body.appendChild(notification);
            setTimeout(() => notification.remove(), 3000);
        }
    }

    // Updated confirm dialog method
    async showConfirmDialog(title, message) {
        if (window.app && window.app.uiManager) {
            return window.app.uiManager.showConfirmDialog(title, message);
        } else {
            // Fallback to native confirm
            return confirm(`${title}\n\n${message}`);
        }
    }
}