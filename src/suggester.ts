import { App, ISuggestOwner, Scope, SuggestModal } from 'obsidian';
import type { JiraTask } from './jira';

export class JiraTaskSuggester extends SuggestModal<JiraTask> {
    private tasks: JiraTask[] = [];
    private onSelect: (task: JiraTask) => void;

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
        
        // Close on Escape
        this.scope = new Scope();
        this.scope.register([], "Escape", () => {
            this.close();
            return false;
        });

        // Explicitly open the modal
        console.log('About to open modal');
        this.open();
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
        const container = el.createDiv({ cls: "jira-task-suggestion" });
        
        const keyEl = container.createDiv({ cls: "jira-key" });
        keyEl.setText(task.key);
        
        const summaryEl = container.createDiv({ cls: "jira-summary" });
        summaryEl.setText(task.summary);
        
        const statusEl = container.createDiv({ cls: "jira-status" });
        statusEl.setText(task.status);

        // Add styles inline since we can't modify the CSS file
        el.style.display = "flex";
        el.style.flexDirection = "column";
        el.style.gap = "4px";
        keyEl.style.fontWeight = "bold";
        keyEl.style.color = "var(--text-accent)";
        statusEl.style.fontSize = "0.8em";
        statusEl.style.color = "var(--text-muted)";
        statusEl.style.fontStyle = "italic";
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
