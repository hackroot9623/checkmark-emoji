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
        const {containerEl} = this;
        containerEl.empty();

        containerEl.createEl('h2', {text: 'Emoji Checklist Settings'});

        // Add test section
        this.testEl = containerEl.createDiv();
        this.updateTestSection();

        // Basic Settings
        containerEl.createEl('h3', {text: 'Basic Settings'});

        new Setting(containerEl)
            .setName('Default Unchecked Emoji')
            .setDesc('Emoji to use for unchecked tasks')
            .addText(text => text
                .setPlaceholder('⬜️')
                .setValue(this.plugin.settings.uncheckedEmoji)
                .onChange((value) => {
                    this.plugin.settings.uncheckedEmoji = value;
                    this.updateTestSection();
                }));

        new Setting(containerEl)
            .setName('Default Checked Emoji')
            .setDesc('Emoji to use for checked tasks')
            .addText(text => text
                .setPlaceholder('✅')
                .setValue(this.plugin.settings.checkedEmoji)
                .onChange((value) => {
                    this.plugin.settings.checkedEmoji = value;
                    this.updateTestSection();
                }));

        // Tag Mappings
        containerEl.createEl('h3', {text: 'Tag Mappings'});
        const tagMappingsContainer = containerEl.createDiv('tag-mappings');

        // Add existing tag mappings
        this.plugin.settings.tagMappings.forEach((mapping, index) => {
            const mappingContainer = tagMappingsContainer.createDiv('tag-mapping');

            new Setting(mappingContainer)
                .setName(`Tag #${mapping.tag}`)
                .addText(text => text
                    .setPlaceholder('tag name')
                    .setValue(mapping.tag)
                    .onChange((value) => {
                        this.plugin.settings.tagMappings[index].tag = value;
                        this.updateTestSection();
                    }))
                .addText(text => text
                    .setPlaceholder('unchecked emoji')
                    .setValue(mapping.uncheckedEmoji)
                    .onChange((value) => {
                        this.plugin.settings.tagMappings[index].uncheckedEmoji = value;
                        this.updateTestSection();
                    }))
                .addText(text => text
                    .setPlaceholder('checked emoji')
                    .setValue(mapping.checkedEmoji)
                    .onChange((value) => {
                        this.plugin.settings.tagMappings[index].checkedEmoji = value;
                        this.updateTestSection();
                    }))
                .addButton(button => button
                    .setIcon('trash')
                    .onClick(() => {
                        this.plugin.settings.tagMappings.splice(index, 1);
                        this.display();
                    }));
        });

        // Add New Tag Mapping button
        new Setting(tagMappingsContainer)
            .addButton(button => button
                .setButtonText('Add Tag Mapping')
                .onClick(() => {
                    this.plugin.settings.tagMappings.push({
                        tag: '',
                        uncheckedEmoji: '',
                        checkedEmoji: ''
                    });
                    this.display();
                }));

        // Jira Integration Settings
        containerEl.createEl('h3', {text: 'Jira Integration'});

        new Setting(containerEl)
            .setName('Enable Jira Integration')
            .setDesc('Enable/disable Jira integration')
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.jiraSettings.enabled)
                .onChange((value) => {
                    this.plugin.settings.jiraSettings.enabled = value;
                }));

        new Setting(containerEl)
            .setName('Trigger Word')
            .setDesc('Word that triggers Jira task insertion (e.g., @jira)')
            .addText(text => text
                .setPlaceholder('@jira')
                .setValue(this.plugin.settings.jiraSettings.triggerWord)
                .onChange((value) => {
                    this.plugin.settings.jiraSettings.triggerWord = value;
                }));

        new Setting(containerEl)
            .setName('Jira Base URL')
            .setDesc('Your Jira instance URL (e.g., https://your-domain.atlassian.net)')
            .addText(text => text
                .setPlaceholder('https://your-domain.atlassian.net')
                .setValue(this.plugin.settings.jiraSettings.baseUrl)
                .onChange((value) => {
                    this.plugin.settings.jiraSettings.baseUrl = value;
                }));

        new Setting(containerEl)
            .setName('Username')
            .setDesc('Your Jira email address')
            .addText(text => text
                .setPlaceholder('email@example.com')
                .setValue(this.plugin.settings.jiraSettings.username)
                .onChange((value) => {
                    this.plugin.settings.jiraSettings.username = value;
                }));

        new Setting(containerEl)
            .setName('API Token')
            .setDesc('Your Jira API token (from https://id.atlassian.com/manage-profile/security/api-tokens)')
            .addText(text => text
                .setPlaceholder('Enter your API token')
                .setValue(this.plugin.settings.jiraSettings.apiToken)
                .onChange((value) => {
                    this.plugin.settings.jiraSettings.apiToken = value;
                }));

        // Git Integration Settings
        containerEl.createEl('h3', {text: 'Git Integration'});

        new Setting(containerEl)
            .setName('GitHub Token')
            .setDesc('Your GitHub personal access token')
            .addText(text => text
                .setPlaceholder('ghp_...')
                .setValue(this.plugin.settings.gitSettings.githubToken)
                .onChange((value) => {
                    this.plugin.settings.gitSettings.githubToken = value;
                }));

        new Setting(containerEl)
            .setName('GitLab Token')
            .setDesc('Your GitLab personal access token')
            .addText(text => text
                .setPlaceholder('glpat-...')
                .setValue(this.plugin.settings.gitSettings.gitlabToken)
                .onChange((value) => {
                    this.plugin.settings.gitSettings.gitlabToken = value;
                }));

        new Setting(containerEl)
            .setName('GitLab URL')
            .setDesc('Your GitLab instance URL (e.g., https://gitlab.com)')
            .addText(text => text
                .setPlaceholder('https://gitlab.com')
                .setValue(this.plugin.settings.gitSettings.gitlabUrl)
                .onChange((value) => {
                    this.plugin.settings.gitSettings.gitlabUrl = value;
                }));

        // Report Settings
        containerEl.createEl('h2', {text: 'Report Settings'});

        new Setting(containerEl)
            .setName('Enable Report Feature')
            .setDesc('Enable/disable the report formatting feature')
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.reportSettings.enabled)
                .onChange((value) => {
                    this.plugin.settings.reportSettings.enabled = value;
                }));

        new Setting(containerEl)
            .setName('Show Section Headers')
            .setDesc('Show/hide section headers in the report')
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.reportSettings.showHeaders)
                .onChange((value) => {
                    this.plugin.settings.reportSettings.showHeaders = value;
                }));

        // Section Settings
        containerEl.createEl('h3', {text: 'Report Sections'});

        for (let i = 0; i < this.plugin.settings.reportSettings.sections.length; i++) {
            const section = this.plugin.settings.reportSettings.sections[i];
            const sectionContainer = containerEl.createDiv();
            sectionContainer.addClass('report-section-settings');

            new Setting(sectionContainer)
                .setName(`Section: ${section.name}`)
                .setDesc('Configure this section')
                .addToggle(toggle => toggle
                    .setValue(section.enabled)
                    .onChange((value) => {
                        section.enabled = value;
                    }))
                .addToggle(toggle => toggle
                    .setTooltip('Show section header')
                    .setValue(section.showHeader)
                    .onChange((value) => {
                        section.showHeader = value;
                    }))
                .addText(text => text
                    .setPlaceholder('Section content')
                    .setValue(section.content)
                    .onChange((value) => {
                        section.content = value;
                    }));
        }

        // Add New Section Button
        new Setting(containerEl)
            .setName('Add New Section')
            .setDesc('Add a new section to the report')
            .addButton(button => button
                .setButtonText('Add Section')
                .onClick(() => {
                    this.plugin.settings.reportSettings.sections.push({
                        name: 'New Section',
                        content: '',
                        enabled: true,
                        showHeader: true
                    });
                    this.display();
                }));

        // Apply All Settings button
        containerEl.createEl('h3', {text: 'Save Changes'});
        
        new Setting(containerEl)
            .setName('Apply All Settings')
            .setDesc('Save all changes made to the settings')
            .addButton(button => button
                .setButtonText('Apply')
                .setCta()
                .onClick(async () => {
                    await this.plugin.saveSettings();
                    new Notice('All settings have been saved');
                    this.plugin.refreshAllNotes();
                }));
    }
}
