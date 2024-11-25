export interface TagEmojiMapping {
    tag: string;
    uncheckedEmoji: string;
    checkedEmoji: string;
}

export interface EmojiChecklistSettings {
    checkedEmoji: string;
    uncheckedEmoji: string;
    tagMappings: TagEmojiMapping[];
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
    ]
};