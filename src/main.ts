import { Plugin, Notice, View } from 'obsidian';
import { EmojiChecklistSettings, DEFAULT_SETTINGS } from './types';
import { EmojiChecklistSettingTab } from './settings';
import { processCheckboxes } from './processor';

interface MarkdownView extends View {
    previewMode?: {
        rerender: (force?: boolean) => void;
    };
}

export default class EmojiChecklistPlugin extends Plugin {
    settings: EmojiChecklistSettings;

    async onload() {
        await this.loadSettings();
        console.log('Plugin loaded with settings:', this.settings);
        this.registerMarkdownPostProcessor(processCheckboxes.bind(this));
        this.addSettingTab(new EmojiChecklistSettingTab(this.app, this));
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