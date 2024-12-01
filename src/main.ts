import {Editor, MarkdownPreviewView, MarkdownView, Notice, Plugin} from 'obsidian';
import type {EmojiChecklistSettings} from './types';
import {DEFAULT_SETTINGS} from './types';
import {EmojiChecklistSettingTab} from './settings';
import {processCheckboxes} from './processor';
import {JiraClient} from './jira';
import {JiraTaskSuggester} from './suggester';

// Augment the MarkdownView type from Obsidian
declare module 'obsidian' {
    interface MarkdownView {
        previewMode: MarkdownPreviewView;
        editor: Editor;
    }
}

export default class EmojiChecklistPlugin extends Plugin {
    settings: EmojiChecklistSettings;

    async onload() {
        await this.loadSettings();
        console.log('Plugin loaded with settings:', this.settings);

        // Register editor change handler for @ triggers
        this.registerEvent(
            this.app.workspace.on('editor-change', (editor: Editor) => {
                const cursor = editor.getCursor();
                const line = editor.getLine(cursor.line);
                const beforeCursor = line.slice(0, cursor.ch);

                // Check if we just typed the trigger word
                const triggerWord = this.settings.jiraSettings.triggerWord;
                console.log('Checking for trigger:', {
                    triggerWord,
                    beforeCursor,
                    endsWith: beforeCursor.endsWith(triggerWord),
                    enabled: this.settings.jiraSettings.enabled
                });

                if (beforeCursor.endsWith(triggerWord)) {
                    console.log('Trigger word detected, handling Jira trigger');
                    this.handleJiraTrigger(editor);
                }
            })
        );

        // Add command to insert Jira issue
        this.addCommand({
            id: 'insert-jira-issue',
            name: 'Insert Jira Issue',
            checkCallback: (checking: boolean) => {
                const view = this.app.workspace.getActiveViewOfType(MarkdownView);
                if (!view) return false;
                if (!checking) {
                    this.insertJiraIssue(view);
                }
                return true;
            }
        });

        this.registerMarkdownPostProcessor(processCheckboxes.bind(this));
        this.addSettingTab(new EmojiChecklistSettingTab(this.app, this));
    }

    private async insertJiraIssue(view: MarkdownView) {
        if (!this.settings.jiraSettings.enabled) {
            new Notice('Please enable and configure Jira integration in settings first');
            return;
        }

        try {
            const jiraClient = new JiraClient(this.settings.jiraSettings);
            const tasks = await jiraClient.searchTasks('my tasks');

            if (tasks.length === 0) {
                new Notice('No Jira tasks found assigned to you');
                return;
            }

            new JiraTaskSuggester(this.app, tasks, (selectedTask) => {
                const cursor = view.editor.getCursor();
                const taskMarkdown = `- [ ] [${selectedTask.key}: ${selectedTask.summary}](${selectedTask.url}) (${selectedTask.status})`;

                // Insert at cursor position
                view.editor.replaceRange(
                    taskMarkdown + '\n',
                    cursor,
                    cursor
                );

                // Move cursor to next line
                view.editor.setCursor({
                    line: cursor.line + 1,
                    ch: 0
                });
            });
        } catch (error) {
            console.error('Error fetching Jira tasks:', error);
            new Notice(error.message || 'Error fetching Jira tasks');
        }
    }

    private async handleJiraTrigger(_editor: Editor) {
        console.log('handleJiraTrigger called');

        if (!this.settings.jiraSettings.enabled) {
            console.log('Jira integration not enabled');
            new Notice('Please enable and configure Jira integration in settings first');
            return;
        }

        try {
            console.log('Creating Jira client with settings:', this.settings.jiraSettings);
            const jiraClient = new JiraClient(this.settings.jiraSettings);

            console.log('Fetching tasks...');
            const tasks = await jiraClient.searchTasks('my tasks');
            console.log('Fetched tasks:', tasks);

            if (tasks.length === 0) {
                console.log('No tasks found');
                new Notice('No Jira tasks found assigned to you');
                return;
            }

            console.log('Opening task suggester with', tasks.length, 'tasks');

            // Ensure we're in the correct context
            const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
            if (!activeView) {
                console.error('No active markdown view');
                new Notice('Please open a markdown note first');
                return;
            }

            // Create suggester with more robust error handling
            try {
                const suggester = new JiraTaskSuggester(this.app, tasks, (selectedTask) => {
                    console.log('Task selected:', selectedTask);
                    const editor = activeView.editor;
                    const cursor = editor.getCursor();
                    const currentLine = editor.getLine(cursor.line);
                    const triggerWord = this.settings.jiraSettings.triggerWord;

                    // Remove the trigger word and replace with the task
                    const newLine = currentLine.slice(0, cursor.ch - triggerWord.length) +
                                  `[${selectedTask.key}: ${selectedTask.summary}](${selectedTask.url}) (${selectedTask.status})` +
                                  currentLine.slice(cursor.ch);

                    // Replace the current line
                    editor.setLine(cursor.line, newLine);

                    // Move cursor to end of inserted text
                    editor.setCursor({
                        line: cursor.line,
                        ch: cursor.ch - triggerWord.length + `[${selectedTask.key}: ${selectedTask.summary}](${selectedTask.url}) (${selectedTask.status})`.length
                    });
                });

                // Additional logging to verify suggester creation
                console.log('Suggester created:', suggester);
            } catch (suggesterError) {
                console.error('Error creating suggester:', suggesterError);
                new Notice('Failed to create task suggester');
            }
        } catch (error) {
            console.error('Error in handleJiraTrigger:', error);
            new Notice(error.message || 'Error fetching Jira tasks');
        }
    }

    async loadSettings() {
        const loadedData = await this.loadData();
        console.log('Loaded data:', loadedData);
        this.settings = Object.assign({}, DEFAULT_SETTINGS, loadedData);
        console.log('Merged settings:', this.settings);
    }

    async saveSettings() {
        console.log('Saving settings:', this.settings);
        await this.saveData(this.settings);
    }

    refreshAllNotes() {
        // Force refresh all markdown views
        this.app.workspace.trigger('markdown-preview-refresh');

        // Force re-render of all leaf views
        this.app.workspace.iterateAllLeaves(leaf => {
            if (leaf.view.getViewType() === 'markdown') {
                (leaf.view as MarkdownView).previewMode?.rerender(true);
            }
        });

        new Notice('Applied emoji changes to all notes');
    }
}
