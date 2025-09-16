import type {GitHubSearchUsersResponse} from "../../types/response/github-api/SearchProfilesResponse.type.ts";

export default class GithubApi {
    static async searchProfiles(search: string): Promise<GitHubSearchUsersResponse> {
        const queryParams = new URLSearchParams({ q: search });
        const response = await fetch(`https://api.github.com/search/users?${queryParams}`)

        if (response.ok) {
            return response.json()
        }

        throw response
    }
}