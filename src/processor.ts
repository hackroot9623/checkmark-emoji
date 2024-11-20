import type { MarkdownPostProcessor } from 'obsidian';
import type EmojiChecklistPlugin from './main';

export const processCheckboxes: MarkdownPostProcessor = function(this: EmojiChecklistPlugin, el: HTMLElement) {
    const checkboxes = el.querySelectorAll('.task-list-item-checkbox');
    
    checkboxes.forEach((checkbox: Element) => {
        if (checkbox instanceof HTMLInputElement) {
            const span = document.createElement('span');
            span.textContent = checkbox.checked ? this.settings.checkedEmoji : this.settings.uncheckedEmoji;

            span.addEventListener('click', (e) => {
                e.preventDefault();
                checkbox.click();
                span.textContent = checkbox.checked ? this.settings.checkedEmoji : this.settings.uncheckedEmoji;
            });

            checkbox.style.display = 'none';
            checkbox.after(span);
        }
    });
};