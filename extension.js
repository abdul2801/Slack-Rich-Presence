const vscode = require("vscode");
const fetch = require("node-fetch");
const path = require("path");
const fs = require("fs");

let token;
let idleTimeout = null;
let lastActiveTime = Date.now();

function activate(context) {
  token = vscode.workspace.getConfiguration("slackPresence").get("token");

  if (!token) {
    vscode.window.showWarningMessage("Slack token not set in settings.");
    return;
  }

  const markActive = () => {
    lastActiveTime = Date.now();
    if (idleTimeout) clearTimeout(idleTimeout);
    idleTimeout = setTimeout(checkIdle, 3 * 60 * 1000); // 3 mins
  };

  const checkIdle = () => {
    const idleFor = Date.now() - lastActiveTime;
    if (idleFor >= 3 * 60 * 1000) {
      sendSlackStatus("Idle in VSCode", ":hourglass_flowing_sand:");
    }
  };

  const updateSlackStatus = async () => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) return;

    markActive();

    const filePath = editor.document.fileName;
    const fileName = path.basename(filePath);
    const workspaceFolders = vscode.workspace.workspaceFolders;
    const workspaceName = workspaceFolders?.[0]?.name || "No Workspace";

    let githubRemote = null;
    try {
      const gitConfigPath = path.join(
        workspaceFolders[0].uri.fsPath,
        ".git",
        "config"
      );
      const config = fs.readFileSync(gitConfigPath, "utf8");
      const match = config.match(/url = (https?:\/\/github\.com[^\s]+)/);
      console.log("MATCH", match);
      if (match) {
        githubRemote = match[1]
          .replace(/\.git$/, "") // Remove .git only at the end
          .replace(/\/$/, ""); // Remove trailing slash
        console.log(`GitHub remote detected: ${githubRemote}`);
      }
    } catch (err) {
      console.log("Error reading git config:", err);
    }

    const suffix = githubRemote ? `\n(GitHub: ${githubRemote})` : "";
    const statusText = `Editing ${fileName} in ${workspaceName}${suffix}`;
    console.log(`Setting Slack status: ${statusText}`);
    await sendSlackStatus(statusText, ":computer:");
  };

  context.subscriptions.push(
    vscode.window.onDidChangeActiveTextEditor(updateSlackStatus),
    vscode.workspace.onDidOpenTextDocument(updateSlackStatus),
    vscode.window.onDidChangeWindowState((state) => {
      if (state.focused) {
        updateSlackStatus();
      }
    })
  );

  updateSlackStatus();
}

async function sendSlackStatus(text, emoji = ":computer:", expiration = 0) {
  try {
    await fetch("https://slack.com/api/users.profile.set", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        profile: {
          status_text: text,
          status_emoji: emoji,
          status_expiration: expiration,
        },
      }),
    });
  } catch (err) {
    console.error("Failed to update Slack status:", err);
  }
}

async function deactivate() {
  await sendSlackStatus("", "", 0); 
}

module.exports = {
  activate,
  deactivate,
};
