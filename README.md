# Slack Rich Presence for VS Code

This Visual Studio Code extension updates your Slack status to show the file you're currently editing, along with the workspace name and a clickable GitHub link if the workspace is a GitHub repository. It also sets your status to "Idle in VSCode" after 3 minutes of inactivity.

## Features

- **Dynamic Status Updates**: Automatically updates your Slack status with the current file and workspace name.
- **GitHub Integration**: Includes a GitHub link if the workspace is a GitHub repository.
- **Idle Detection**: Changes status to "Idle in VSCode" after 3 minutes of inactivity.

## Setup

### 1. Obtain a Slack Token
1. Go to your Slack workspace settings and create a token with `profile:write` permission.
2. In VS Code, open settings.json.
3. Set the `slackPresence.token` configuration to your Slack token.

### 3. Status Format Example
```
Editing extension.js in Slack-Rich-Presence
(GitHub: https://github.com/your-username/your-repo)
```

## Requirements
- A valid Slack token with `profile:write` permission.
- An active VS Code workspace.
