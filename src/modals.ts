import { App, Modal, Setting, SuggestModal, Scope } from 'obsidian';

export class TextInputModal extends Modal {
    private result: string;
    private onSubmit: (result: string) => void;
    private title: string;
    private placeholder: string;
    private initialValue: string;

    constructor(
        app: App,
        title: string,
        placeholder: string,
        initialValue: string,
        onSubmit: (result: string) => void
    ) {
        super(app);
        this.title = title;
        this.placeholder = placeholder;
        this.initialValue = initialValue;
        this.onSubmit = onSubmit;
    }

    onOpen() {
        const { contentEl } = this;

        contentEl.createEl("h2", { text: this.title });

        new Setting(contentEl)
            .setName(this.placeholder)
            .addText((text) =>
                text
                    .setValue(this.initialValue)
                    .onChange((value) => {
                        this.result = value;
                    })
            );

        new Setting(contentEl)
            .addButton((btn) =>
                btn
                    .setButtonText("Submit")
                    .setCta()
                    .onClick(() => {
                        this.close();
                        this.onSubmit(this.result);
                    }));
    }

    onClose() {
        const { contentEl } = this;
        contentEl.empty();
    }
}

export class GitResultSuggester extends SuggestModal<any> {
    private results: any[] = [];
    private onSelect: (item: any) => void;

    constructor(app: App, results: any[], title: string, onSelect: (item: any) => void) {
        super(app);
        this.results = results;
        this.onSelect = onSelect;
        
        this.setPlaceholder(`Select a ${title}...`);
        
        this.containerEl.addClass('git-result-suggester');
        
        // Center the modal
        this.modalEl.style.maxWidth = '600px';
        this.modalEl.style.width = '80%';
        this.modalEl.style.top = '30%';
        this.modalEl.style.left = '50%';
        this.modalEl.style.transform = 'translate(-50%, -30%)';
        this.modalEl.style.position = 'fixed';
        
        const suggestionsContainer = this.modalEl.querySelector('.suggestion-container');
        if (suggestionsContainer instanceof HTMLElement) {
            suggestionsContainer.style.maxHeight = '400px';
            suggestionsContainer.style.width = '100%';
        }
        
        this.scope = new Scope();
        this.scope.register([], "Escape", () => {
            this.close();
            return false;
        });

        this.open();
    }

    getSuggestions(query: string): any[] {
        const lowerQuery = query.toLowerCase();
        return this.results.filter(item => 
            item.repository.toLowerCase().includes(lowerQuery) ||
            item.title.toLowerCase().includes(lowerQuery)
        );
    }

    renderSuggestion(item: any, el: HTMLElement) {
        const container = el.createDiv({ cls: "git-result-suggestion" });
        
        const repoEl = container.createDiv({ cls: "git-repo" });
        repoEl.setText(item.repository);
        
        const titleEl = container.createDiv({ cls: "git-title" });
        titleEl.setText(item.title);
        
        const statusEl = container.createDiv({ cls: "git-status" });
        statusEl.setText(item.state || 'open');

        el.style.display = "flex";
        el.style.flexDirection = "column";
        el.style.gap = "4px";
        repoEl.style.fontWeight = "bold";
        repoEl.style.color = "var(--text-accent)";
        statusEl.style.fontSize = "0.8em";
        statusEl.style.color = "var(--text-muted)";
        statusEl.style.fontStyle = "italic";
    }

    onChooseSuggestion(item: any, evt: MouseEvent | KeyboardEvent) {
        if (this.onSelect) {
            this.onSelect(item);
        }
        this.close();
    }
}
