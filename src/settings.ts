import { App, PluginSettingTab, Setting, Notice } from 'obsidian';
import type EmojiChecklistPlugin from './main';
import { DEFAULT_SETTINGS } from './types';

export class EmojiChecklistSettingTab extends PluginSettingTab {
    plugin: EmojiChecklistPlugin;
    testEl: HTMLElement;

    constructor(app: App, plugin: EmojiChecklistPlugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    updateTestSection(): void {
        if (this.testEl) {
            this.testEl.empty();

            const header = this.testEl.createEl('h3', { text: 'Live Preview' });

            const uncheckedExample = this.testEl.createEl('div', { cls: 'setting-item' });
            uncheckedExample.createEl('span', { text: 'Unchecked example: ' });
            const uncheckedContainer = uncheckedExample.createEl('span', { cls: 'task-preview' });
            uncheckedContainer.createEl('span', {
                text: this.plugin.settings.uncheckedEmoji,
                cls: 'emoji-preview'
            });
            uncheckedContainer.createEl('span', { text: ' Sample task' });

            const checkedExample = this.testEl.createEl('div', { cls: 'setting-item' });
            checkedExample.createEl('span', { text: 'Checked example: ' });
            const checkedContainer = checkedExample.createEl('span', { cls: 'task-preview' });
            checkedContainer.createEl('span', {
                text: this.plugin.settings.checkedEmoji,
                cls: 'emoji-preview'
            });
            const checkedText = checkedContainer.createEl('span', { text: ' Sample task' });
            checkedText.style.textDecoration = 'line-through';
            checkedText.style.color = 'var(--text-muted)';

            header.style.marginTop = '2em';
            header.style.marginBottom = '1em';
            uncheckedExample.style.marginBottom = '0.5em';
            checkedExample.style.marginBottom = '0.5em';
        }
    }

    display(): void {
        const { containerEl } = this;
        containerEl.empty();

        containerEl.createEl('h2', { text: 'Emoji Checklist Settings' });

        new Setting(containerEl)
            .setName('Unchecked emoji')
            .setDesc('Emoji to display for unchecked items')
            .addText(text => text
                .setPlaceholder('Enter emoji')
                .setValue(this.plugin.settings.uncheckedEmoji)
                .onChange(async (value) => {
                    this.plugin.settings.uncheckedEmoji = value;
                    await this.plugin.saveSettings();
                    this.updateTestSection();
                }));

        new Setting(containerEl)
            .setName('Checked emoji')
            .setDesc('Emoji to display for checked items')
            .addText(text => text
                .setPlaceholder('Enter emoji')
                .setValue(this.plugin.settings.checkedEmoji)
                .onChange(async (value) => {
                    this.plugin.settings.checkedEmoji = value;
                    await this.plugin.saveSettings();
                    this.updateTestSection();
                }));

        new Setting(containerEl)
            .setName('Restore defaults')
            .setDesc('Reset all settings to their default values')
            .addButton(button => button
                .setButtonText('Restore Defaults')
                .onClick(async () => {
                    this.plugin.settings = Object.assign({}, DEFAULT_SETTINGS);
                    await this.plugin.saveSettings();
                    this.display();
                    new Notice('Settings restored to defaults');
                }));

        this.testEl = containerEl.createDiv();
        this.updateTestSection();
    }
}
