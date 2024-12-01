import {App, Notice, PluginSettingTab, Setting} from 'obsidian';
import EmojiChecklistPlugin from './main';
import {DEFAULT_SETTINGS} from './types';

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

            // Add tag examples
            if (this.plugin.settings.tagMappings.length > 0) {
                const tagHeader = this.testEl.createEl('h3', { text: 'Tag Examples' });
                tagHeader.style.marginTop = '2em';
                tagHeader.style.marginBottom = '1em';

                for (const mapping of this.plugin.settings.tagMappings) {
                    const tagUncheckedExample = this.testEl.createEl('div', { cls: 'setting-item' });
                    tagUncheckedExample.createEl('span', { text: `#${mapping.tag} unchecked: ` });
                    const tagUncheckedContainer = tagUncheckedExample.createEl('span', { cls: 'task-preview' });
                    tagUncheckedContainer.createEl('span', {
                        text: mapping.uncheckedEmoji,
                        cls: 'emoji-preview'
                    });
                    tagUncheckedContainer.createEl('span', { text: ` Sample #${mapping.tag} task` });

                    const tagCheckedExample = this.testEl.createEl('div', { cls: 'setting-item' });
                    tagCheckedExample.createEl('span', { text: `#${mapping.tag} checked: ` });
                    const tagCheckedContainer = tagCheckedExample.createEl('span', { cls: 'task-preview' });
                    tagCheckedContainer.createEl('span', {
                        text: mapping.checkedEmoji,
                        cls: 'emoji-preview'
                    });
                    const tagCheckedText = tagCheckedContainer.createEl('span', { text: ` Sample #${mapping.tag} task` });
                    tagCheckedText.style.textDecoration = 'line-through';
                    tagCheckedText.style.color = 'var(--text-muted)';

                    tagUncheckedExample.style.marginBottom = '0.5em';
                    tagCheckedExample.style.marginBottom = '0.5em';
                }
            }

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
            .setName('Default Unchecked Emoji')
            .setDesc('Emoji to display for unchecked tasks')
            .addText(text => text
                .setValue(this.plugin.settings.uncheckedEmoji)
                .onChange(async (value) => {
                    this.plugin.settings.uncheckedEmoji = value;
                    await this.plugin.saveSettings();
                    this.updateTestSection();
                    console.log('Updated default unchecked emoji:', this.plugin.settings.uncheckedEmoji);
                }));

        new Setting(containerEl)
            .setName('Default Checked Emoji')
            .setDesc('Emoji to display for checked tasks')
            .addText(text => text
                .setValue(this.plugin.settings.checkedEmoji)
                .onChange(async (value) => {
                    this.plugin.settings.checkedEmoji = value;
                    await this.plugin.saveSettings();
                    this.updateTestSection();
                    console.log('Updated default checked emoji:', this.plugin.settings.checkedEmoji);
                }));

        containerEl.createEl('h3', { text: 'Tag Mappings' });

        const tagMappingsContainer = containerEl.createDiv('tag-mappings');

        // Add existing tag mappings
        this.plugin.settings.tagMappings.forEach((mapping, index) => {
            const mappingContainer = tagMappingsContainer.createDiv('tag-mapping');

            new Setting(mappingContainer)
                .setName(`Tag #${mapping.tag}`)
                .addText(text => text
                    .setPlaceholder('tag name')
                    .setValue(mapping.tag)
                    .onChange(async (value) => {
                        this.plugin.settings.tagMappings[index].tag = value;
                        await this.plugin.saveSettings();
                        this.updateTestSection();
                        console.log('Updated tag mapping:', this.plugin.settings.tagMappings);
                    }))
                .addText(text => text
                    .setPlaceholder('unchecked emoji')
                    .setValue(mapping.uncheckedEmoji)
                    .onChange(async (value) => {
                        this.plugin.settings.tagMappings[index].uncheckedEmoji = value;
                        await this.plugin.saveSettings();
                        this.updateTestSection();
                        console.log('Updated tag mapping:', this.plugin.settings.tagMappings);
                    }))
                .addText(text => text
                    .setPlaceholder('checked emoji')
                    .setValue(mapping.checkedEmoji)
                    .onChange(async (value) => {
                        this.plugin.settings.tagMappings[index].checkedEmoji = value;
                        await this.plugin.saveSettings();
                        this.updateTestSection();
                        console.log('Updated tag mapping:', this.plugin.settings.tagMappings);
                    }))
                .addButton(button => button
                    .setIcon('trash')
                    .onClick(async () => {
                        this.plugin.settings.tagMappings.splice(index, 1);
                        await this.plugin.saveSettings();
                        this.display();
                        console.log('Removed tag mapping, remaining:', this.plugin.settings.tagMappings);
                    }));
        });

        // Add button to add new tag mapping
        new Setting(containerEl)
            .setName('Add Tag Mapping')
            .setDesc('Add a new tag-emoji mapping')
            .addButton(button => button
                .setButtonText('Add New Tag')
                .onClick(async () => {
                    this.plugin.settings.tagMappings.push({
                        tag: 'newtag',
                        uncheckedEmoji: '⭕',
                        checkedEmoji: '✅'
                    });
                    await this.plugin.saveSettings();
                    console.log('Added new tag mapping:', this.plugin.settings.tagMappings);
                    this.display();
                }));

        new Setting(containerEl)
            .setName('Reset Settings')
            .setDesc('Restore all settings to their defaults')
            .addButton(button => button
                .setButtonText('Restore Defaults')
                .onClick(async () => {
                    this.plugin.settings = Object.assign({}, DEFAULT_SETTINGS);
                    await this.plugin.saveSettings();
                    console.log('Reset settings to defaults:', this.plugin.settings);
                    this.display();
                    new Notice('Settings restored to defaults');
                }));

        // Jira Settings
        containerEl.createEl('h3', { text: 'Jira Integration' });

        new Setting(containerEl)
            .setName('Enable Jira Integration')
            .setDesc('Enable or disable Jira integration')
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.jiraSettings.enabled)
                .onChange(async (value) => {
                    this.plugin.settings.jiraSettings.enabled = value;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName('Trigger Word')
            .setDesc('Word that triggers Jira task insertion (e.g., @jira)')
            .addText(text => text
                .setPlaceholder('@jira')
                .setValue(this.plugin.settings.jiraSettings.triggerWord)
                .onChange(async (value) => {
                    this.plugin.settings.jiraSettings.triggerWord = value;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName('Jira Base URL')
            .setDesc('Your Jira instance URL (e.g., https://your-domain.atlassian.net)')
            .addText(text => text
                .setPlaceholder('https://your-domain.atlassian.net')
                .setValue(this.plugin.settings.jiraSettings.baseUrl)
                .onChange(async (value) => {
                    this.plugin.settings.jiraSettings.baseUrl = value;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName('Username')
            .setDesc('Your Jira email address')
            .addText(text => text
                .setPlaceholder('email@example.com')
                .setValue(this.plugin.settings.jiraSettings.username)
                .onChange(async (value) => {
                    this.plugin.settings.jiraSettings.username = value;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName('API Token')
            .setDesc('Your Jira API token (from https://id.atlassian.com/manage-profile/security/api-tokens)')
            .addText(text => text
                .setPlaceholder('Enter your API token')
                .setValue(this.plugin.settings.jiraSettings.apiToken)
                .onChange(async (value) => {
                    this.plugin.settings.jiraSettings.apiToken = value;
                    await this.plugin.saveSettings();
                }));

        // Add Apply Changes button
        new Setting(containerEl)
            .setName('Apply Changes')
            .setDesc('Apply emoji changes to all open notes')
            .addButton(button => button
                .setButtonText('Apply Changes')
                .onClick(() => {
                    this.plugin.refreshAllNotes();
                }));

        this.testEl = containerEl.createDiv();
        this.updateTestSection();
    }
}
