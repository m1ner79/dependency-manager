const github = require('@actions/github');
const core = require('@actions/core');

async function run() {
    const gitHubKey = process.env.GITHUB_TOKEN || core.getInput('github_token', { required: true });
    const octokit = github.getOctokit(gitHubKey);
    const query = "@asyncapi/generator user:asyncapi";
    
    // const { data: pullRequest } = await octokit.pulls.get({
    //     owner: 'octokit',
    //     repo: 'rest.js',
    //     pull_number: 123,
    //     mediaType: {
    //       format: 'diff'
    //     }
    // });
    const response = await octokit.search.repos({
        q:query
      });

    console.log(response);
}

run();