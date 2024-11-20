import { App, PluginSettingTab, Setting } from 'obsidian';
import type EmojiChecklistPlugin from './main';

export class EmojiChecklistSettingTab extends PluginSettingTab {
    plugin: EmojiChecklistPlugin;

    constructor(app: App, plugin: EmojiChecklistPlugin) {
        super(app, plugin);
        this.plugin = plugin;
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
                }));
    }
}