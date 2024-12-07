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

export interface ReportSection {
    name: string;
    content: string;
    enabled: boolean;
    showHeader: boolean;
}

export interface ReportSettings {
    enabled: boolean;
    sections: ReportSection[];
    showHeaders: boolean;
}

export interface GitSettings {
    githubToken: string;
    gitlabToken: string;
    gitlabUrl: string;
}

export interface EmojiChecklistSettings {
    checkedEmoji: string;
    uncheckedEmoji: string;
    tagMappings: TagEmojiMapping[];
    jiraSettings: JiraSettings;
    reportSettings: ReportSettings;
    gitSettings: GitSettings;
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
        triggerWord: '@jira'
    },
    reportSettings: {
        enabled: true,
        showHeaders: true,
        sections: [
            {
                name: 'GREETINGS',
                content: 'Good Morning everyone',
                enabled: true,
                showHeader: true
            },
            {
                name: 'DATE',
                content: '',
                enabled: true,
                showHeader: false
            },
            {
                name: 'BODY',
                content: '',
                enabled: true,
                showHeader: true
            },
            {
                name: 'STOPPERS',
                content: '',
                enabled: true,
                showHeader: true
            }
        ]
    },
    gitSettings: {
        githubToken: '',
        gitlabToken: '',
        gitlabUrl: ''
    }
};