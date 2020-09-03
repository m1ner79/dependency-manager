const github = require('@actions/github');
const core = require('@actions/core');

async function run() {
  const gitHubKey = process.env.GITHUB_TOKEN || core.getInput('github_token', { required: true });
  const octokit = github.getOctokit(gitHubKey);
  //const query = "user%3Am1ner79+m1ner_test_package&type=Code";
  const query1 = '"asyncapi/html-template" in:file';

  // const { data: pullRequest } = await octokit.pulls.get({
  //     owner: 'octokit',
  //     repo: 'rest.js',
  //     pull_number: 123,
  //     mediaType: {
  //       format: 'diff'
  //     }
  // });
  const response = await octokit.search.code({
    q: query1
  });

  console.log(response);
}

run();