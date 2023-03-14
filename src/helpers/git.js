import core from "@actions/core";
import exec from "@actions/exec";

const { GITHUB_REPOSITORY, ENV } = process.env;

export default new (class Git {
  constructor() {
    const githubToken = core.getInput("github-token");

    // Make the Github token secret
    core.setSecret(githubToken);

    const gitUserName = core.getInput("git-user-name");
    const gitUserEmail = core.getInput("git-user-email");
    const gitUrl = core.getInput("git-url");

    // Set config
    this.config("user.name", gitUserName);
    this.config("user.email", gitUserEmail);

    // Update the origin
    if (githubToken) {
      this.updateOrigin(
        `https://x-access-token:${githubToken}@${gitUrl}/${GITHUB_REPOSITORY}.git`
      );
    }
  }

  exec = (command) =>
    new Promise(async (resolve, reject) => {
      let execOutput = "";

      const options = {
        listeners: {
          stdout: (data) => {
            execOutput += data.toString();
          },
        },
      };

      const exitCode = await exec.exec(`git ${command}`, null, options);

      if (exitCode === 0) {
        resolve(execOutput);
      } else {
        reject(`Command "git ${command}" exited with code ${exitCode}.`);
      }
    });

  config = (prop, value) => this.exec(`config ${prop} "${value}"`);

  add = (file) => this.exec(`add ${file}`);

  commit = (message) => this.exec(`commit -m "${message}"`);

  pull = async () => {
    const args = ["pull"];

    // Check if the repo is unshallow
    if (await this.isShallow()) {
      args.push("--unshallow");
    }

    args.push("--tags");
    args.push(core.getInput("git-pull-method"));

    return this.exec(args.join(" "));
  };

  push = (branch) => this.exec(`push origin ${branch} --follow-tags`);

  isShallow = async () => {
    const isShallow = await this.exec("rev-parse --is-shallow-repository");

    return isShallow.trim().replace("\n", "") === "true";
  };

  updateOrigin = (repo) => this.exec(`remote set-url origin ${repo}`);
})();
