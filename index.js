const github = require('@actions/github');
const core = require('@actions/core');
const path = require('path');
const simpleGit = require('simple-git');
const {mkdir} = require('fs').promises;

async function clone(remote, dir, git) {
  try {
    return await git
      .silent(true)
      .clone(remote, dir, {'--depth': 1});
  } catch (e) {
    throw e;
  }
}

async function createBranch(branchName, git) {
  try {
    return await git
      .silent(true)
      .checkout(`-b${branchName}`);
  } catch (e) {
    throw e;
  }
}

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
  //items.name  items.html_url
  //console.log(res.items);

  for (const item of res.items) {
    const dir = path.join(process.cwd(), '../clones', item.name);
    await mkdir(dir, { recursive: true });
    const branch = 'bump';
    const options = {baseDir: dir};
    const git = simpleGit(options);
    await clone(item.html_url, dir, git);
    await createBranch(branch, git);
  }
}

run();