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

### Report Generation
![image](https://github.com/user-attachments/assets/7b1ded63-ca6f-437a-821e-e287866864ef)

- Generate formatted reports from your task lists
- Features:
  - Automatically formats selected tasks with emojis
  - Tag-specific emoji support (e.g., #stopper tasks use 🛑)
  - Adds 📅 to dates for better visibility
  - Organizes tasks into sections (regular tasks and stoppers)
  - Copies formatted content to clipboard
- Perfect for:
  - Daily standups
  - Progress reports
  - Task summaries
  - Team updates

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
6. Copy this three files to the folder "obsidian-emoji-checklist".

![image](https://github.com/user-attachments/assets/276ad2af-2837-4592-b1bd-f2b3f2f78848)

8. Enable the plugin

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
   - Type your configured trigger (default: @Jira)
   - Select task from popup menu
     
  ![image](https://github.com/user-attachments/assets/d32f042f-cf6c-4a34-8406-f3ec153f2024)
  
   - Task is inserted as Markdown link with status
     
  ![image](https://github.com/user-attachments/assets/e41a24c4-5501-4340-bb81-d43167a694c6)


2. Using Command Palette:
   - Press Ctrl + P
   - Search for "Insert Jira Issue"
     
  ![image](https://github.com/user-attachments/assets/0a61cb43-4094-4dec-8867-a0b974cbc000)

   - Select task from popup menu
     
  ![image](https://github.com/user-attachments/assets/d32f042f-cf6c-4a34-8406-f3ec153f2024)

## Support

If you encounter any issues or have suggestions, please:
1. Check the plugin settings are correctly configured
2. For Jira issues, verify your API token and connection settings
3. Submit issues on our GitHub repository

## License

MIT License - see LICENSE file for details
