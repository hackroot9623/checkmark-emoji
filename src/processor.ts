import type {MarkdownPostProcessor, MarkdownPostProcessorContext} from 'obsidian';
import {MarkdownRenderChild, MarkdownView} from 'obsidian';
import type EmojiChecklistPlugin from './main';

interface EditorChange {
    from: { line: number; ch: number };
    to: { line: number; ch: number };
    text: string;
}

class EmojiRenderChild extends MarkdownRenderChild {
    constructor(private readonly span: HTMLSpanElement) {
        super(span);
    }

    onunload(): void {
        // Cleanup handled by parent
    }
}

export class CheckboxProcessor {
    private static findTagInLine(listItem: HTMLElement): string | null {
        const text = listItem.textContent || '';
        const tagMatch = text.replace(/^[^\w\s#]*\s*/, '').match(/#(\w+)/);
        return tagMatch ? tagMatch[1] : null;
    }

    private static getEmojisForTag(
        plugin: EmojiChecklistPlugin,
        tag: string | null,
        isChecked: boolean
    ): string {
        if (!tag) {
            return isChecked ? plugin.settings.checkedEmoji : plugin.settings.uncheckedEmoji;
        }

        const mapping = plugin.settings.tagMappings.find((m) => m.tag === tag);
        if (!mapping) {
            return isChecked ? plugin.settings.checkedEmoji : plugin.settings.uncheckedEmoji;
        }

        return isChecked ? mapping.checkedEmoji : mapping.uncheckedEmoji;
    }

    private static updateEditorContent(
        editor: any,
        lineIndex: number,
        newEmoji: string
    ): void {
        const lineText = editor.getLine(lineIndex);
        const newText = lineText.replace(/^[^\w\s#]*\s*/, `${newEmoji} `);

        const change: EditorChange = {
            from: { line: lineIndex, ch: 0 },
            to: { line: lineIndex, ch: lineText.length },
            text: newText
        };

        editor.transaction({ changes: [change] });
    }

    private static createEmojiSpan(emoji: string): HTMLSpanElement {
        const span = document.createElement('span');
        span.className = 'task-list-emoji';
        span.textContent = emoji;
        return span;
    }

    private static styleContainer(container: HTMLElement | null): void {
        if (container) {
            container.style.display = 'inline-block';
            container.style.verticalAlign = 'top';
            container.style.marginRight = '0.5em';
        }
    }

    private static setupEventListeners(
        plugin: EmojiChecklistPlugin,
        checkbox: HTMLInputElement,
        span: HTMLSpanElement,
        tag: string | null,
        index: number,
        editor: any,
        sectionInfo: any,
        ctx: MarkdownPostProcessorContext
    ): void {
        const updateEmoji = (isChecked: boolean): void => {
            const newEmoji = this.getEmojisForTag(plugin, tag, isChecked);
            span.textContent = newEmoji;

            if (editor && sectionInfo) {
                this.updateEditorContent(editor, sectionInfo.lineStart + index, newEmoji);
            }
        };

        const toggleCheckbox = async () => {
            checkbox.checked = !checkbox.checked;
            updateEmoji(checkbox.checked);

            // Create and dispatch both change and click events
            checkbox.dispatchEvent(new Event('change', { bubbles: true }));
            checkbox.dispatchEvent(new Event('click', { bubbles: true }));

            if (ctx.sourcePath) {
                ctx.addChild(new EmojiRenderChild(span));
            }
        };

        span.addEventListener('click', async (e) => {
            e.preventDefault();
            e.stopPropagation();
            await toggleCheckbox();
        });

        checkbox.addEventListener('change', () => {
            updateEmoji(checkbox.checked);
        });
    }

    public static async processCheckbox(
        plugin: EmojiChecklistPlugin,
        checkbox: HTMLInputElement,
        index: number,
        editor: any,
        sectionInfo: any,
        ctx: MarkdownPostProcessorContext
    ): Promise<void> {
        const listItem = checkbox.closest('li.task-list-item') as HTMLElement;
        if (!listItem) return;

        const tag = this.findTagInLine(listItem);
        const emoji = this.getEmojisForTag(plugin, tag, checkbox.checked);
        const span = this.createEmojiSpan(emoji);

        if (editor && sectionInfo) {
            this.updateEditorContent(editor, sectionInfo.lineStart + index, emoji);
        }

        this.setupEventListeners(
            plugin,
            checkbox,
            span,
            tag,
            index,
            editor,
            sectionInfo,
            ctx
        );

        this.styleContainer(checkbox.parentElement);
        checkbox.style.display = 'none';
        checkbox.after(span);
    }
}

export const processCheckboxes: MarkdownPostProcessor = function(
    this: EmojiChecklistPlugin,
    el: HTMLElement,
    ctx: MarkdownPostProcessorContext
): void {
    const checkboxes = el.querySelectorAll<HTMLInputElement>('li.task-list-item input[type="checkbox"]');
    const view = this.app.workspace.getActiveViewOfType(MarkdownView);
    const editor = view?.editor;
    const sectionInfo = ctx.getSectionInfo(el);

    checkboxes.forEach((checkbox, index) => {
        if (!(checkbox instanceof HTMLInputElement)) return;

        CheckboxProcessor.processCheckbox(
            this,
            checkbox,
            index,
            editor,
            sectionInfo,
            ctx
        );
    });
};
