import { requestUrl, RequestUrlParam } from 'obsidian';
import { GitSettings } from './types';

export class GitIntegration {
    private settings: GitSettings;

    constructor(settings: GitSettings) {
        this.settings = settings;
    }

    private getHeaders(isGitLab: boolean): Record<string, string> {
        return {
            'Authorization': `Bearer ${isGitLab ? this.settings.gitlabToken : this.settings.githubToken}`,
            'Content-Type': 'application/json',
        };
    }

    async getLastMergedCommit(repository: string, isGitLab: boolean): Promise<any> {
        try {
            if (isGitLab) {
                const encodedRepo = encodeURIComponent(repository);
                const url = `${this.settings.gitlabUrl}/api/v4/projects/${encodedRepo}/merge_requests?state=merged&order_by=updated_at&sort=desc&per_page=1`;
                const response = await requestUrl({
                    url,
                    headers: this.getHeaders(true),
                });
                return response.json[0];
            } else {
                const [owner, repo] = repository.split('/');
                const url = `https://api.github.com/repos/${owner}/${repo}/pulls?state=closed&sort=updated&direction=desc&per_page=1`;
                const response = await requestUrl({
                    url,
                    headers: this.getHeaders(false),
                });
                return response.json[0];
            }
        } catch (error) {
            console.error('Error fetching last merged commit:', error);
            throw error;
        }
    }

    async getPendingMergeRequests(repository: string, isGitLab: boolean): Promise<any[]> {
        try {
            if (isGitLab) {
                const encodedRepo = encodeURIComponent(repository);
                const url = `${this.settings.gitlabUrl}/api/v4/projects/${encodedRepo}/merge_requests?state=opened`;
                const response = await requestUrl({
                    url,
                    headers: this.getHeaders(true),
                });
                return response.json;
            } else {
                const [owner, repo] = repository.split('/');
                const url = `https://api.github.com/repos/${owner}/${repo}/pulls?state=open`;
                const response = await requestUrl({
                    url,
                    headers: this.getHeaders(false),
                });
                return response.json;
            }
        } catch (error) {
            console.error('Error fetching pending merge requests:', error);
            throw error;
        }
    }
}
