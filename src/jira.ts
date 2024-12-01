import { requestUrl, RequestUrlParam } from 'obsidian';
import type { JiraSettings } from './types';

export interface JiraTask {
    key: string;
    summary: string;
    url: string;
    status: string;
}

export class JiraClient {
    constructor(private settings: JiraSettings) {}

    private getAuthHeader(): string {
        // Ensure we're using the email address and API token
        const credentials = `${this.settings.username}:${this.settings.apiToken}`;
        // Convert to base64, handling Unicode characters correctly
        const base64Credentials = Buffer.from(credentials).toString('base64');
        return `Basic ${base64Credentials}`;
    }

    async testConnection(): Promise<boolean> {
        const baseUrl = this.settings.baseUrl.replace(/\/$/, '');
        const apiUrl = `${baseUrl}/rest/api/2/myself`;

        try {
            const response = await requestUrl({
                url: apiUrl,
                method: 'GET',
                headers: {
                    'Authorization': this.getAuthHeader(),
                    'Accept': 'application/json'
                }
            });

            return response.status === 200;
        } catch (error) {
            console.error('Connection test failed:', error);
            return false;
        }
    }

    async searchTasks(query: string): Promise<JiraTask[]> {
        if (!this.settings.enabled || !this.settings.baseUrl || !this.settings.apiToken) {
            throw new Error('Jira integration is not properly configured');
        }

        // Test connection first
        const isConnected = await this.testConnection();
        if (!isConnected) {
            throw new Error('Could not authenticate with Jira. Please check your credentials.');
        }

        // Ensure the base URL doesn't end with a slash
        const baseUrl = this.settings.baseUrl.replace(/\/$/, '');
        
        // Clean up the query to prevent JQL injection
        const sanitizedQuery = query.replace(/["']/g, '');
        
        // Handle special queries
        let jql: string;
        if (sanitizedQuery.toLowerCase() === 'my tasks' || sanitizedQuery.toLowerCase() === 'assigned to me') {
            jql = 'assignee = currentUser()';
        } else if (sanitizedQuery.toLowerCase().startsWith('my')) {
            // Handle "my open tasks", "my done tasks", etc.
            const status = sanitizedQuery.toLowerCase().includes('done') ? 'Done' : 
                          sanitizedQuery.toLowerCase().includes('open') ? 'Open' : null;
            
            jql = status 
                ? `assignee = currentUser() AND status = "${status}"`
                : `assignee = currentUser() AND (summary ~ "${sanitizedQuery}" OR description ~ "${sanitizedQuery}")`;
        } else {
            jql = `assignee = currentUser() AND (summary ~ "${sanitizedQuery}" OR description ~ "${sanitizedQuery}")`;
        }

        jql += ' ORDER BY updated DESC';
        
        console.log('JQL Query:', jql);
        const apiUrl = `${baseUrl}/rest/api/2/search?jql=${encodeURIComponent(jql)}&maxResults=10&fields=summary,status`;
        console.log('API URL:', apiUrl);

        const requestParams: RequestUrlParam = {
            url: apiUrl,
            method: 'GET',
            headers: {
                'Authorization': this.getAuthHeader(),
                'Accept': 'application/json'
            }
        };

        try {
            console.log('Making request...');
            const response = await requestUrl(requestParams);
            console.log('Response status:', response.status);
            
            if (response.status !== 200) {
                console.error('Error response:', response.text);
                throw new Error(`Jira API returned status ${response.status}: ${response.text}`);
            }

            if (!response.json || !response.json.issues) {
                console.error('Invalid response format:', response);
                throw new Error('Invalid response format from Jira API');
            }

            console.log('Found issues:', response.json.issues.length);
            return response.json.issues.map((issue: any) => ({
                key: issue.key,
                summary: issue.fields.summary,
                url: `${baseUrl}/browse/${issue.key}`,
                status: issue.fields.status?.name || 'Unknown'
            }));
        } catch (error) {
            console.error('Error details:', {
                message: error.message,
                status: error.status,
                response: error.response
            });

            if (error.status === 401 || error.status === 403) {
                throw new Error('Authentication failed. Please verify:\n1. Your email address is correct\n2. Your API token is correct\n3. You have the necessary permissions');
            }
            throw error;
        }
    }

    async formatTasksAsMarkdown(tasks: JiraTask[]): Promise<string> {
        return tasks.map(task => 
            `- [ ] [${task.key}: ${task.summary}](${task.url}) (${task.status})`
        ).join('\n');
    }
}
