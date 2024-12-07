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

    async getAllGitHubPRs(): Promise<any[]> {
        try {
            // First get all repositories the user has access to
            const reposResponse = await requestUrl({
                url: 'https://api.github.com/user/repos?affiliation=owner,collaborator,organization_member&sort=updated',
                headers: this.getHeaders(false),
            });

            // Get open PRs from each repository
            const allPRs = await Promise.all(
                reposResponse.json.map(async (repo: any) => {
                    const response = await requestUrl({
                        url: `https://api.github.com/repos/${repo.full_name}/pulls?state=open`,
                        headers: this.getHeaders(false),
                    });
                    return response.json.map((pr: any) => ({
                        ...pr,
                        repository: repo.full_name
                    }));
                })
            );

            // Flatten the array of arrays and sort by updated date
            return allPRs.flat().sort((a, b) => 
                new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
            );
        } catch (error) {
            console.error('Error fetching GitHub PRs:', error);
            throw error;
        }
    }

    async getAllGitLabMRs(): Promise<any[]> {
        try {
            // First get all projects the user has access to
            const projectsResponse = await requestUrl({
                url: `${this.settings.gitlabUrl}/api/v4/projects?membership=true&sort=desc`,
                headers: this.getHeaders(true),
            });

            // Get open MRs from each project
            const allMRs = await Promise.all(
                projectsResponse.json.map(async (project: any) => {
                    const response = await requestUrl({
                        url: `${this.settings.gitlabUrl}/api/v4/projects/${project.id}/merge_requests?state=opened`,
                        headers: this.getHeaders(true),
                    });
                    return response.json.map((mr: any) => ({
                        ...mr,
                        repository: project.path_with_namespace
                    }));
                })
            );

            // Flatten the array of arrays and sort by updated date
            return allMRs.flat().sort((a, b) => 
                new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
            );
        } catch (error) {
            console.error('Error fetching GitLab MRs:', error);
            throw error;
        }
    }

    getSettings(): GitSettings {
        return this.settings;
    }
}
