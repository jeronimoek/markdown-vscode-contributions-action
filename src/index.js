import core from "@actions/core";
import { markdownVscodeContributions } from "markdown-vscode-contributions";
import git from "./helpers/git";

async function run() {
  try {
    let gitCommitMessage = core.getInput("git-message");
    const gitUserName = core.getInput("git-user-name");
    const gitUserEmail = core.getInput("git-user-email");
    const gitPush = core.getBooleanInput("git-push");
    const gitBranch = core.getInput("git-branch").replace("refs/heads/", "");
    const inputPath = core.getInput("input-path");
    const outputPath = core.getInput("output-path") || inputPath;
    const packagePath = core.getInput("package-path");
    const skipGitPull = core.getBooleanInput("skip-git-pull");
    const skipCommit = core.getBooleanInput("skip-commit");
    const skipOnNoChanges = core.getBooleanInput("skip-on-no-changes");
    const gitUrl = core.getInput("git-url");
    const gitPath = core.getInput("git-path");
    const skipCi = core.getBooleanInput("skip-ci");

    if (skipCi) {
      gitCommitMessage += " [skip ci]";
    }

    core.info(`Using "${gitUserName}" as git user.name`);
    core.info(`Using "${gitUserEmail}" as git user.email`);
    core.info(`Using "${packagePath}" as package.json file path`);
    core.info(`Using "${inputPath}" as input markdown file path`);
    core.info(`Using "${outputPath}" as output markdown file path`);
    core.info(`Using "${gitUrl}" as gitUrl`);
    core.info(`Using "${gitBranch}" as gitBranch`);
    core.info(`Using "${gitPath}" as gitPath`);

    if (!skipGitPull) {
      core.info("Pull to make sure we have the full git history");
      await git.pull();
    }

    let markdownPrev = "";
    if (fs.existsSync(outputPath)) {
      markdownPrev = fs.readFileSync(outputPath, "utf8");
    }

    const markdownOutput = markdownVscodeContributions({
      packagePath,
      inputPath,
      outputPath,
    });

    const markdownChanged = markdownPrev !== markdownOutput;

    if (skipOnNoChanges && !markdownChanged) {
      core.info(
        "Markdown hasn't changed and skip-on-no-changes is enabled so we skip this step"
      );
      core.setOutput("skipped", "true");
      return;
    }

    if (!skipCommit) {
      await git.add(".");
      await git.commit(gitCommitMessage);
    }

    if (gitPush) {
      try {
        core.info("Push all changes");
        await git.push(gitBranch);
      } catch (error) {
        console.error(error);
        core.setFailed(error);
        return;
      }
    } else {
      core.info("We're not going to push GIT changes");
    }

    // Set outputs so other actions (for example actions/create-release) can use it
    core.setOutput("markdown_output", markdownOutput);
    core.setOutput("markdown_changed", String(markdownChanged));
    core.setOutput("skipped", "false");
  } catch (error) {
    core.setFailed(error);
  }
}

process.on("unhandledRejection", (reason) => {
  let error = `Unhandled Rejection occurred. ${reason.stack}`;
  console.error(error);
  core.setFailed(error);
});

run();
