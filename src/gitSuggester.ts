import { App, ISuggestOwner, Scope, SuggestModal } from 'obsidian';
import { GitIntegration } from './git';

export interface GitMergeRequest {
    title: string;
    description: string;
    web_url?: string;  // GitLab
    html_url?: string; // GitHub
    state: string;
    created_at: string;
    number?: number;
    author: {
        name?: string;
        login?: string; // GitHub
        username?: string; // GitLab
    };
}

export class GitMergeRequestSuggester extends SuggestModal<GitMergeRequest> {
    private suggestions: GitMergeRequest[] = [];
    private loading = false;
    private gitIntegration: GitIntegration;
    private onChoose?: (selectedPR: GitMergeRequest) => void;
    private selectedIndex = 0;
    inputEl: HTMLInputElement;

    constructor(
        app: App,
        inputEl: HTMLInputElement,
        gitIntegration: GitIntegration,
        suggestions?: GitMergeRequest[],
        onChoose?: (selectedPR: GitMergeRequest) => void
    ) {
        super(app);
        console.log('GitMergeRequestSuggester constructor called');
        
        this.gitIntegration = gitIntegration;
        this.inputEl = inputEl;
        
        if (suggestions) {
            this.suggestions = suggestions;
        }
        
        // Store the onChoose callback
        this.onChoose = onChoose;
        
        // Explicitly set placeholder and styling
        this.setPlaceholder("Search pull requests...");
        
        // Style the modal
        this.containerEl.addClass('git-mr-suggester');
        
        // Center the modal
        this.modalEl.style.maxWidth = '600px';
        this.modalEl.style.width = '80%';
        this.modalEl.style.top = '30%';
        this.modalEl.style.left = '50%';
        this.modalEl.style.transform = 'translate(-50%, -30%)';
        this.modalEl.style.position = 'fixed';
        
        // Style the suggestions container
        const suggestionsContainer = this.modalEl.querySelector('.suggestion-container');
        if (suggestionsContainer instanceof HTMLElement) {
            suggestionsContainer.style.maxHeight = '400px';
            suggestionsContainer.style.width = '100%';
            suggestionsContainer.style.border = '1px solid var(--background-modifier-border)';
            suggestionsContainer.style.borderRadius = '4px';
            suggestionsContainer.style.overflow = 'auto';
        }

        // Style the input container
        const inputContainer = this.modalEl.querySelector('.prompt');
        if (inputContainer instanceof HTMLElement) {
            inputContainer.style.border = '1px solid var(--background-modifier-border)';
            inputContainer.style.borderRadius = '4px';
            inputContainer.style.margin = '0 0 8px 0';
        }

        // Style the input
        const input = this.modalEl.querySelector('.prompt-input');
        if (input instanceof HTMLElement) {
            input.style.width = '100%';
            input.style.padding = '8px 12px';
            input.style.border = 'none';
            input.style.background = 'var(--background-primary)';
        }
        
        // Set up keyboard navigation
        this.scope = new Scope();
        
        // Close on Escape
        this.scope.register([], "Escape", () => {
            this.close();
            return false;
        });

        // Enter to select
        this.scope.register([], "Enter", async (evt: KeyboardEvent) => {
            const suggestions = await this.getSuggestions(this.inputEl.value);
            if (suggestions && suggestions.length > 0) {
                this.onChooseSuggestion(suggestions[this.selectedIndex], evt);
                return false;
            }
            return true;
        });

        // Arrow key navigation
        this.scope.register([], "ArrowUp", async (evt: KeyboardEvent) => {
            evt.preventDefault();
            this.selectedIndex = Math.max(0, this.selectedIndex - 1);
            this.updateSelectedSuggestion();
            return false;
        });

        this.scope.register([], "ArrowDown", async (evt: KeyboardEvent) => {
            evt.preventDefault();
            const suggestions = await this.getSuggestions(this.inputEl.value);
            this.selectedIndex = Math.min((suggestions?.length || 1) - 1, this.selectedIndex + 1);
            this.updateSelectedSuggestion();
            return false;
        });

        // Open the modal
        console.log('About to open modal');
        this.open();
    }

    private updateSelectedSuggestion() {
        const suggestionElements = this.modalEl.querySelectorAll('.suggestion-container .suggestion-item');
        suggestionElements.forEach((el, index) => {
            if (index === this.selectedIndex) {
                el.addClass('is-selected');
                // Ensure the selected item is visible
                (el as HTMLElement).scrollIntoView({ block: 'nearest' });
            } else {
                el.removeClass('is-selected');
            }
        });
    }

    async getSuggestions(query: string): Promise<GitMergeRequest[]> {
        if (this.loading) return this.suggestions;
        
        try {
            this.loading = true;
            
            // Filter the existing suggestions based on the query
            const searchStr = query.toLowerCase();
            const filteredSuggestions = this.suggestions.filter(mr => {
                return mr.title.toLowerCase().includes(searchStr) || 
                       mr.description?.toLowerCase().includes(searchStr) ||
                       (mr.web_url || mr.html_url || '').toLowerCase().includes(searchStr) ||
                       mr.author.name?.toLowerCase().includes(searchStr) ||
                       mr.author.login?.toLowerCase().includes(searchStr) ||
                       mr.author.username?.toLowerCase().includes(searchStr);
            });
            
            return filteredSuggestions;
        } catch (error) {
            console.error('Error filtering suggestions:', error);
            return [];
        } finally {
            this.loading = false;
        }
    }

    onChooseSuggestion(result: GitMergeRequest, evt: MouseEvent | KeyboardEvent): void {
        if (this.onChoose) {
            this.onChoose(result);
        }
        this.close();
    }

    renderSuggestion(result: GitMergeRequest, el: HTMLElement): void {
        el.addClass('suggestion-item');
        
        // Create container for better alignment
        const container = el.createDiv({ cls: 'suggestion-content' });
        container.style.display = 'flex';
        container.style.alignItems = 'center';
        container.style.gap = '8px';
        
        // Add GitLab/GitHub icon
        const iconContainer = container.createDiv({ cls: 'suggestion-icon' });
        if (result.web_url?.includes('gitlab')) {
            iconContainer.innerHTML = `<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M15.97 9.058l-.895-2.756L13.3.842c-.09-.282-.488-.282-.58 0L10.946 6.3H5.054L3.28.842c-.09-.282-.488-.282-.58 0L.924 6.302.03 9.058c-.082.25.008.526.22.682l7.75 5.63 7.75-5.63c.212-.156.302-.43.22-.682"/>
            </svg>`;
        } else {
            // GitHub icon as fallback
            iconContainer.innerHTML = `<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8"/>
            </svg>`;
        }
        iconContainer.style.display = 'flex';
        iconContainer.style.alignItems = 'center';
        iconContainer.style.color = 'var(--text-muted)';

        // Add title and description
        const textContainer = container.createDiv({ cls: 'suggestion-text' });
        const titleEl = textContainer.createDiv({ cls: 'suggestion-title' });
        titleEl.setText(result.title);
        titleEl.style.fontWeight = 'bold';
        
        const descEl = textContainer.createDiv({ cls: 'suggestion-description' });
        descEl.setText(`#${result.number || ''} by ${result.author?.name || result.author?.username || result.author?.login || 'Unknown'}`);
        descEl.style.fontSize = '0.8em';
        descEl.style.color = 'var(--text-muted)';
    }
}
