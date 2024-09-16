import { request } from "@octokit/request";
import { fetchVerificationKeys } from "./index.js";

async function main() {
    const token = process.env.GITHUB_TOKEN;
    if (!token) throw new Error("GITHUB_TOKEN is not defined");

    const r = request.defaults({
        headers: {
            Authorization: `token ${token}`,
        }
    });

    const { id, keys } = await fetchVerificationKeys({ token });
    const cache = { id, keys };

    const firstRateLimitCheck = await r("GET /rate_limit");
    const firstRateLimitRemaining = firstRateLimitCheck.data.resources.core.remaining;
    console.log("Rate limit after fetching keys:", firstRateLimitRemaining);

    const response = await fetchVerificationKeys({ token, cache });

    const secondRateLimitCheck = await r("GET /rate_limit");
    const secondRateLimitRemaining = secondRateLimitCheck.data.resources.core.remaining;
    console.log("Rate limit after fetching keys from cache:", secondRateLimitRemaining);
}

main().catch(console.error);
