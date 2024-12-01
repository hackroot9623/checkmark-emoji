# Emoji Checklist Plugin for Obsidian

![drawing](https://github.com/user-attachments/assets/e4ae35cb-089f-4211-815e-3df6c8f4842b)

An Obsidian plugin that enhances your task lists with customizable emojis and Jira integration.

## Features

### Custom Emoji Checkboxes
- Replace standard checkboxes with customizable emojis
- Default emojis: ✅ for checked and ⬜️ for unchecked tasks
- Configurable through settings

### Tag-Based Emoji Mapping
- Define different emoji pairs for specific tags
  - Example: #important ⭐/✨ (unchecked/checked)
  - Example: #bug 🐛/🔨 (unchecked/checked)
  - Example: #idea 💡/✅ (unchecked/checked)
  - Example: #urgent 🚨/✔️ (unchecked/checked)
- Automatically applies different emoji styles based on task tags
- Customize both checked and unchecked states per tag

### Jira Integration
- Seamlessly insert Jira tasks into your notes
- Two ways to add tasks:
  1. Type `@Jira` (or your configured trigger word) to open task selector
  2. Use the command palette: "Insert Jira Issue"
- Features:
  - Shows tasks assigned to you
  - Displays task key, summary, and status
  - Inserts tasks as Markdown links with status
  - Direct links to Jira issues
  - Configurable trigger word

## Installation
### Obsidian Plugin Manager Installation
1. Open Obsidian Settings
2. Go to Community Plugins and disable Safe Mode
3. Click Browse and search for "Emoji Checklist"
4. Install the plugin and enable it

### Manual Installation
1. Download the plugin from GitHub
2. Extract the zip file
3. Open Obsidian Settings
4. Go to Community Plugins and disable Safe Mode
5. Build the project with:
 ```shell
   yarn run dev    
 ```
5. Create a folder named "obsidian-emoji-checklist" in your plugins folder
6. Copy this three files to the folder "obsidian-emoji-checklist"
![image](https://github.com/user-attachments/assets/276ad2af-2837-4592-b1bd-f2b3f2f78848)
7. Enable the plugin

## Configuration

### Emoji Settings
- Set default emoji for checked tasks
- Set default emoji for unchecked tasks
- Configure tag-specific emoji mappings

### Jira Settings
- Enable/Disable Jira integration
- Configure Jira connection:
  - Base URL (e.g., https://your-company.atlassian.net)
  - Username (your Jira email)
  - API Token (from https://id.atlassian.com/manage-profile/security/api-tokens)
  - Trigger Word (default: @Jira)

## Usage

### Basic Task Lists
- Create normal markdown task lists
- Plugin automatically replaces checkboxes with configured emojis
- Example:
  ```markdown
  - [ ] Unchecked task (shows ⬜️)
  - [x] Checked task (shows ✅)
  ```

### Tag-Based Tasks
- Add tags to tasks for specific emoji styles
- Example:
  ```markdown
  - [ ] #important Task with custom emoji
  ```

### Inserting Jira Tasks
1. Using Trigger Word:
   - Type your configured trigger (default: @jira)
   - Select task from popup menu
   - Task is inserted as Markdown link with status

2. Using Command Palette:
   - Press Ctrl + P
   - Search for "Insert Jira Issue"
   - Select task from popup menu

## Support

If you encounter any issues or have suggestions, please:
1. Check the plugin settings are correctly configured
2. For Jira issues, verify your API token and connection settings
3. Submit issues on our GitHub repository

## License

MIT License - see LICENSE file for details
