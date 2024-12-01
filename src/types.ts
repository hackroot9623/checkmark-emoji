export interface TagEmojiMapping {
    tag: string;
    uncheckedEmoji: string;
    checkedEmoji: string;
}

export interface JiraSettings {
    enabled: boolean;
    baseUrl: string;
    username: string;
    apiToken: string;
    triggerWord: string;
}

export interface EmojiChecklistSettings {
    checkedEmoji: string;
    uncheckedEmoji: string;
    tagMappings: TagEmojiMapping[];
    jiraSettings: JiraSettings;
}

export const DEFAULT_SETTINGS: EmojiChecklistSettings = {
    checkedEmoji: '✅',
    uncheckedEmoji: '⬜️',
    tagMappings: [
        {
            tag: 'stopper',
            uncheckedEmoji: '🛑',
            checkedEmoji: '✅'
        }
    ],
    jiraSettings: {
        enabled: false,
        baseUrl: '',
        username: '',
        apiToken: '',
        triggerWord: '@Jira'
    }
};