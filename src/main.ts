import { Plugin } from 'obsidian';
import { EmojiChecklistSettings, DEFAULT_SETTINGS } from './types';
import { EmojiChecklistSettingTab } from './settings';
import { processCheckboxes } from './processor';

export default class EmojiChecklistPlugin extends Plugin {
    settings: EmojiChecklistSettings;

    async onload() {
        await this.loadSettings();
        this.registerMarkdownPostProcessor(processCheckboxes.bind(this));
        this.addSettingTab(new EmojiChecklistSettingTab(this.app, this));
    }

    async loadSettings() {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    }

    async saveSettings() {
        await this.saveData(this.settings);
    }
}