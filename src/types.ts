export interface EmojiChecklistSettings {
    uncheckedEmoji: string;
    checkedEmoji: string;
}

export const DEFAULT_SETTINGS: EmojiChecklistSettings = {
    uncheckedEmoji: '⭕',
    checkedEmoji: '✅'
};