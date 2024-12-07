import { App, ISuggestOwner, Scope, SuggestModal } from 'obsidian';
import type { JiraTask } from './jira';

export class JiraTaskSuggester extends SuggestModal<JiraTask> {
    private tasks: JiraTask[] = [];
    private onSelect: (task: JiraTask) => void;
    private selectedIndex = 0;

    constructor(app: App, tasks: JiraTask[], onSelect: (task: JiraTask) => void) {
        super(app);
        console.log('JiraTaskSuggester constructor called');
        console.log('Tasks received:', tasks);
        
        this.tasks = tasks;
        this.onSelect = onSelect;
        
        // Explicitly set placeholder and styling
        this.setPlaceholder("Select a Jira task...");
        
        // Ensure the modal is styled and visible
        this.containerEl.addClass('jira-task-suggester');
        
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
        }
        
        // Set up keyboard navigation
        this.scope = new Scope();
        
        // Close on Escape
        this.scope.register([], "Escape", () => {
            this.close();
            return false;
        });

        // Enter to select
        this.scope.register([], "Enter", (evt: KeyboardEvent) => {
            const suggestions = this.getSuggestions(this.inputEl.value);
            if (suggestions && suggestions.length > 0) {
                this.onChooseSuggestion(suggestions[this.selectedIndex], evt);
                return false;
            }
            return true;
        });

        // Arrow key navigation
        this.scope.register([], "ArrowUp", (evt: KeyboardEvent) => {
            evt.preventDefault();
            this.selectedIndex = Math.max(0, this.selectedIndex - 1);
            this.updateSelectedSuggestion();
            return false;
        });

        this.scope.register([], "ArrowDown", (evt: KeyboardEvent) => {
            evt.preventDefault();
            const suggestions = this.getSuggestions(this.inputEl.value);
            this.selectedIndex = Math.min((suggestions?.length || 1) - 1, this.selectedIndex + 1);
            this.updateSelectedSuggestion();
            return false;
        });

        // Explicitly open the modal
        console.log('About to open modal');
        this.open();
    }

    private updateSelectedSuggestion() {
        const suggestionElements = this.modalEl.querySelectorAll('.suggestion-container .suggestion-item');
        suggestionElements.forEach((el, index) => {
            if (index === this.selectedIndex) {
                el.addClass('is-selected');
                (el as HTMLElement).style.backgroundColor = 'var(--background-modifier-hover)';
            } else {
                el.removeClass('is-selected');
                (el as HTMLElement).style.backgroundColor = 'transparent';
            }
        });
    }

    // Override open method to ensure it's fully visible
    open() {
        console.log('Explicitly opening modal');
        super.open();
        
        // Additional visibility checks
        this.containerEl.style.display = 'block';
        this.containerEl.style.visibility = 'visible';
        this.containerEl.style.opacity = '1';
    }

    getSuggestions(query: string): JiraTask[] {
        console.log('Getting suggestions for query:', query);
        const lowerQuery = query.toLowerCase();
        const filteredTasks = this.tasks.filter(task => 
            task.key.toLowerCase().includes(lowerQuery) ||
            task.summary.toLowerCase().includes(lowerQuery)
        );
        console.log('Filtered tasks:', filteredTasks);
        return filteredTasks;
    }

    renderSuggestion(task: JiraTask, el: HTMLElement) {
        console.log('Rendering suggestion for task:', task);
        el.addClass('suggestion-item');
        
        // Create container for better alignment
        const container = el.createDiv({ cls: 'suggestion-content' });
        container.style.display = 'flex';
        container.style.alignItems = 'center';
        container.style.gap = '8px';
        
        // Add Jira icon
        const iconContainer = container.createDiv({ cls: 'suggestion-icon' });
        iconContainer.innerHTML = `<svg width="16" height="16" viewBox="0 0 128 128" fill="currentColor">
            <path d="M108.023 16H61.805c0 11.52 9.324 20.848 20.847 20.848h8.5v8.226c0 11.52 9.328 20.847 20.848 20.847V19.977A3.98 3.98 0 00108.023 16z"/>
            <path d="M85.121 39.04H38.902c0 11.52 9.324 20.847 20.847 20.847h8.5v8.226c0 11.524 9.328 20.847 20.848 20.847V43.016a3.978 3.978 0 00-3.976-3.977z"/>
            <path d="M62.219 62.078H16c0 11.524 9.324 20.847 20.847 20.847h8.5v8.23c0 11.52 9.328 20.847 20.848 20.847V66.055a3.979 3.979 0 00-3.976-3.977z"/>
        </svg>`;
        iconContainer.style.display = 'flex';
        iconContainer.style.alignItems = 'center';
        iconContainer.style.color = 'var(--text-muted)';

        // Add text content
        const textContainer = container.createDiv({ cls: 'suggestion-text' });
        
        // Key and Summary in title
        const titleEl = textContainer.createDiv({ cls: 'suggestion-title' });
        titleEl.setText(`${task.key} - ${task.summary}`);
        titleEl.style.fontWeight = 'bold';
        
        // Status in description
        const statusEl = textContainer.createDiv({ cls: 'suggestion-description' });
        statusEl.setText(task.status);
        statusEl.style.fontSize = '0.8em';
        statusEl.style.color = 'var(--text-muted)';

        // Add hover and selection handling
        el.addEventListener('mouseenter', () => {
            el.addClass('is-selected');
            this.selectedIndex = Array.from(el.parentElement?.children || []).indexOf(el);
            this.updateSelectedSuggestion();
        });

        // Style for hover and selection
        el.style.padding = '8px';
        el.style.cursor = 'pointer';
        el.style.borderRadius = '4px';
        el.style.transition = 'background-color 100ms ease-in-out';
    }

    onChooseSuggestion(task: JiraTask, evt: MouseEvent | KeyboardEvent) {
        console.log('Task chosen:', task);
        // Ensure the onSelect callback is called
        if (this.onSelect) {
            this.onSelect(task);
        }
        this.close();
    }
}
