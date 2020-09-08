const github = require('@actions/github');
const core = require('@actions/core');

async function run() {
  const gitHubKey = process.env.GITHUB_TOKEN || core.getInput('github_token', { required: true });
  const user = process.env.GH_USER || core.getInput('user');

  //use below if action should work for organisation
  const org = process.env.GH_ORG || core.getInput('org');

  const package = process.env.PACKAGE || core.getInput('package', { required: true });

  const octokit = github.getOctokit(gitHubKey);

  let scope = '';
  
  if (user) {
    scope = `user:${user}`;
  } else if (org) {
    scope = `org:${org}`;
  } 

  const query = (`"${package}" ${scope} in:file`);

  const {data: res} = await octokit.search.repos({
    q: query
  });

  console.log(res.total_count);
}

run();