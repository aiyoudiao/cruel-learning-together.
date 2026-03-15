const GITHUB_API_BASE = 'https://api.github.com';

export interface GitHubConfig {
  owner: string;
  repo: string;
  token: string;
}

export interface CheckinData {
  date: string;
  users: Array<{
    github: string;
    title?: string;
    category: string;
    content_md: string;
    assets: string[];
    tags: string[];
    timestamp: string;
  }>;
}

export class GitHubAPI {
  private config: GitHubConfig;

  constructor(config: GitHubConfig) {
    this.config = config;
  }

  private getHeaders() {
    return {
      'Authorization': `token ${this.config.token}`,
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
    };
  }

  async createOrUpdateFile(path: string, content: string, message: string): Promise<void> {
    const url = `${GITHUB_API_BASE}/repos/${this.config.owner}/${this.config.repo}/contents/${path}`;

    const getResponse = await fetch(url, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    let sha: string | undefined;

    if (getResponse.ok) {
      const data = await getResponse.json();
      sha = data.sha;
    }

    const response = await fetch(url, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify({
        message,
        content: btoa(unescape(encodeURIComponent(content))),
        sha,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to create/update file: ${response.statusText}`);
    }
  }

  async getFile(path: string): Promise<string | null> {
    const url = `${GITHUB_API_BASE}/repos/${this.config.owner}/${this.config.repo}/contents/${path}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`Failed to get file: ${response.statusText}`);
    }

    const data = await response.json();
    return atob(data.content);
  }

  async submitCheckin(
    username: string,
    title: string,
    category: string,
    content: string,
    assets: string[],
    tags: string[],
    date: string
  ): Promise<void> {
    const today = date || new Date().toISOString().split('T')[0];
    const checkinPath = `checkins/${category}/${today}.json`;

    const existingData = await this.getFile(checkinPath);
    let checkinData: CheckinData;

    if (existingData) {
      checkinData = JSON.parse(existingData);
    } else {
      checkinData = {
        date: today,
        users: [],
      };
    }

    const userCheckin = {
      github: username,
      title: title,
      category: category,
      content_md: content,
      assets: assets,
      tags: tags,
      timestamp: new Date().toISOString(),
    };

    const existingUserIndex = checkinData.users.findIndex(u => u.github === username);

    if (existingUserIndex >= 0) {
      // Update existing checkin
      checkinData.users[existingUserIndex] = userCheckin;
    } else {
      // Add new checkin
      checkinData.users.push(userCheckin);
    }

    await this.createOrUpdateFile(
      checkinPath,
      JSON.stringify(checkinData, null, 2),
      `Update checkin for ${username} in ${category} on ${today}`
    );
  }
}
