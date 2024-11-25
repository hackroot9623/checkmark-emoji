import type { MarkdownPostProcessor, MarkdownPostProcessorContext } from 'obsidian';
import { MarkdownRenderChild, MarkdownView } from 'obsidian';
import type EmojiChecklistPlugin from './main';

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

function findTagInLine(listItem: HTMLElement): string | null {
    // Get the full text content of the list item
    const text = listItem.textContent || '';
    console.log('Full task text:', text);

    // Look for tags in the text, ignoring any emojis at the start
    const tagMatch = text.replace(/^[^\w\s#]*\s*/, '').match(/#(\w+)/);
    if (tagMatch) {
        const tag = tagMatch[1];
        console.log('Found tag:', tag);
        return tag;
    }

    console.log('No tag found in text');
    return null;
}

function getEmojisForTag(plugin: EmojiChecklistPlugin, tag: string | null, isChecked: boolean): string {
    console.log('Getting emoji for tag:', tag, 'checked:', isChecked);
    console.log('Available mappings:', JSON.stringify(plugin.settings.tagMappings, null, 2));
    
    if (tag) {
        const mapping = plugin.settings.tagMappings.find(m => m.tag.toLowerCase() === tag.toLowerCase());
        if (mapping) {
            console.log('Found mapping for tag:', JSON.stringify(mapping, null, 2));
            const emoji = isChecked ? mapping.checkedEmoji : mapping.uncheckedEmoji;
            console.log('Using tag-specific emoji:', emoji);
            return emoji;
        }
        console.log('No mapping found for tag:', tag);
    }
    
    const defaultEmoji = isChecked ? plugin.settings.checkedEmoji : plugin.settings.uncheckedEmoji;
    console.log('Using default emoji:', defaultEmoji);
    return defaultEmoji;
}

export const processCheckboxes: MarkdownPostProcessor = function(
    this: EmojiChecklistPlugin,
    el: HTMLElement,
    ctx: MarkdownPostProcessorContext
) {
    console.log('Processing checkboxes with settings:', JSON.stringify(this.settings, null, 2));
    const checkboxes = el.querySelectorAll<HTMLInputElement>('li.task-list-item input[type="checkbox"]');
    console.log('Found checkboxes:', checkboxes.length);

    // Get the current view and editor
    const view = this.app.workspace.getActiveViewOfType(MarkdownView);
    const editor = view?.editor;
    const sectionInfo = ctx.getSectionInfo(el);

    checkboxes.forEach((checkbox, index) => {
        if (!(checkbox instanceof HTMLInputElement)) {
            console.log('Invalid checkbox element at index', index);
            return;
        }

        const listItem = checkbox.closest('li.task-list-item') as HTMLElement;
        if (!listItem) {
            console.log('No list item found for checkbox', index);
            return;
        }

        console.log('Processing checkbox', index, 'with HTML:', listItem.innerHTML);
        const tag = findTagInLine(listItem);
        console.log('Found tag for checkbox', index, ':', tag);
        
        const span = document.createElement('span');
        span.className = 'task-list-emoji';
        const emoji = getEmojisForTag(this, tag, checkbox.checked);
        console.log('Initial emoji for checkbox', index, ':', emoji);
        span.textContent = emoji;

        // Update the note content with the correct emoji
        if (editor && sectionInfo) {
            const lineText = editor.getLine(sectionInfo.lineStart + index);
            // Extract any existing emoji at the start of the line
            const existingEmojiMatch = lineText.match(/^([^\w\s#]*)\s*/);
            const existingEmoji = existingEmojiMatch ? existingEmojiMatch[1] : '';
            
            if (existingEmoji !== emoji) {
                const newText = lineText.replace(/^[^\w\s#]*\s*/, emoji + ' ');
                editor.transaction({
                    changes: [{
                        from: { line: sectionInfo.lineStart + index, ch: 0 },
                        to: { line: sectionInfo.lineStart + index, ch: lineText.length },
                        text: newText
                    }]
                });
            }
        }

        span.addEventListener('click', async (e) => {
            e.preventDefault();
            e.stopPropagation();

            checkbox.checked = !checkbox.checked;
            const newEmoji = getEmojisForTag(this, tag, checkbox.checked);
            console.log('New emoji after click:', newEmoji);
            span.textContent = newEmoji;

            // Update the note content
            if (editor && sectionInfo) {
                const lineText = editor.getLine(sectionInfo.lineStart + index);
                const newText = lineText.replace(/^[^\w\s#]*\s*/, newEmoji + ' ');
                
                editor.transaction({
                    changes: [{
                        from: { line: sectionInfo.lineStart + index, ch: 0 },
                        to: { line: sectionInfo.lineStart + index, ch: lineText.length },
                        text: newText
                    }]
                });
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
            const newEmoji = getEmojisForTag(this, tag, checkbox.checked);
            console.log('New emoji after change:', newEmoji);
            span.textContent = newEmoji;
            
            // Update the note content
            if (editor && sectionInfo) {
                const lineText = editor.getLine(sectionInfo.lineStart + index);
                const newText = lineText.replace(/^[^\w\s#]*\s*/, newEmoji + ' ');
                
                editor.transaction({
                    changes: [{
                        from: { line: sectionInfo.lineStart + index, ch: 0 },
                        to: { line: sectionInfo.lineStart + index, ch: lineText.length },
                        text: newText
                    }]
                });
            }
        });
    });
};
