const github = require('@actions/github');
const core = require('@actions/core');
const path = require('path');
const simpleGit = require('simple-git');
const {mkdir, readFile} = require('fs').promises;
const klaw = require('klaw');

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

  const ignore = process.env.IGNORE|| core.getInput('ignore');

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

  for (const item of res.items) {
    const dir = path.join(process.cwd(), './clones', item.name);
    await mkdir(dir, { recursive: true });
    const branch = 'bump';
    const options = {baseDir: dir};
    const git = simpleGit(options);
    await clone(item.html_url, dir, git);
    await createBranch(branch, git);

    for await (const file of klaw(dir)) {
      if (file.path.endsWith('package.json') && !isPathIgnored(file.path, ignore)) {
        const packageJson = await readPackageJson(file.path,item.name);
        console.log(packageJson);
      }
    }
  }
}
async function readPackageJson(path, repoName) {
  try {
    return JSON.parse(
      await readFile(path, 'utf8')
    );
  } catch (error) {
    console.error(`Problems with ${path} in ${repoName} repository`, error.message);
  }
}
function isPathIgnored(path, ignore) {
  const endsWith = (element) => path.endsWith(`${element  }/package.json`);
  const ignoreArray = ignore.split(', ');
  return ignoreArray.some(endsWith);
}

run();