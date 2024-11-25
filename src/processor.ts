import type { MarkdownPostProcessor, MarkdownPostProcessorContext } from 'obsidian';
import type EmojiChecklistPlugin from './main';
import { MarkdownRenderChild, MarkdownView } from 'obsidian';

class EmojiRenderChild extends MarkdownRenderChild {
    private span: HTMLSpanElement;

    constructor(span: HTMLSpanElement) {
        super(span);
        this.span = span;
    }

    onunload() {
        // Optional: Add any cleanup logic if needed
    }
}

export const processCheckboxes: MarkdownPostProcessor = function(
    this: EmojiChecklistPlugin,
    el: HTMLElement,
    ctx: MarkdownPostProcessorContext
) {
    const checkboxes = el.querySelectorAll('.contains-task-list input[type="checkbox"]');

    checkboxes.forEach((checkbox: Element) => {
        if (checkbox instanceof HTMLInputElement) {
            const span = document.createElement('span');
            span.className = 'task-list-emoji';
            span.textContent = checkbox.checked ? this.settings.checkedEmoji : this.settings.uncheckedEmoji;

            span.addEventListener('click', async (e) => {
                e.preventDefault();
                e.stopPropagation();

                checkbox.checked = !checkbox.checked;
                span.textContent = checkbox.checked ? this.settings.checkedEmoji : this.settings.uncheckedEmoji;

                // Get the current view
                const view = this.app.workspace.getActiveViewOfType(MarkdownView);
                if (view) {
                    const editor = view.editor;
                    const sectionInfo = ctx.getSectionInfo(el);
                    
                    if (sectionInfo) {
                        const lineText = editor.getLine(sectionInfo.lineStart);
                        const newText = checkbox.checked 
                            ? lineText.replace('[ ]', '[x]')
                            : lineText.replace('[x]', '[ ]');
                        
                        editor.transaction({
                            changes: [{
                                from: { line: sectionInfo.lineStart, ch: 0 },
                                to: { line: sectionInfo.lineStart, ch: lineText.length },
                                text: newText
                            }]
                        });
                    }
                }

                checkbox.dispatchEvent(new Event('change', { bubbles: true }));

                const sourcePath = ctx.sourcePath;
                if (sourcePath) {
                    const renderChild = new EmojiRenderChild(span);
                    ctx.addChild(renderChild);
                }
            });

            const container = checkbox.parentElement;
            if (container) {
                container.style.display = 'flex';
                container.style.alignItems = 'center';
                container.style.gap = '0.5em';
            }

            checkbox.style.display = 'none';
            checkbox.after(span);

            checkbox.addEventListener('change', () => {
                span.textContent = checkbox.checked ? this.settings.checkedEmoji : this.settings.uncheckedEmoji;
            });
        }
    });
};
