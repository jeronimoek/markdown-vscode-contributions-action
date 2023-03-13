# Markdown VSCode Contributions

This package allows generating and updating tables in markdown format containing VSCode Contributions data with just a few commands

## Installation

Using npm:

```shell
npm i --save-dev markdown-vscode-contributions
```

## Usage

`updateContributions.js`

```js
import { markdownVscodeContributions } from "markdown-vscode-contributions";

markdownVscodeContributions({
  packagePath: "package.json",
  inputPath: "README-raw.md",
  outputPath: "README.md",
});
```

### Parameters:

| Parameter   | Description                                                   | Default value      |
| ----------- | ------------------------------------------------------------- | ------------------ |
| packagePath | Path to the package file, relative to the current root folder | `'package.json'`   |
| inputPath   | Path to the input file, relative to the current root folder   | `'README.md'`      |
| outputPath  | Path to the output file, relative to the current root folder  | inputPath value \* |

<sub>\* by default overwrites the original input file</sub>

In your `package.json` file you should have contributions defined. Example:

```json
{
    "..."
    "contributes": {
        "commands": [
            {
                "command": "color-picker-universal.translateColors",
                "title": "Translate colors to another format",
                "category": "Color Picker Universal"
            }
        ],
    }
}
```

Then in your markdown file (e.g. `README.md`) you need a markdown comment with the following format:

\[//]: # "vscode-table-`contributionName`(`Column1`|`Column2`:`Column2 alias`)"

- The alias of each column is optional
- Spaces won't be trimmed

[SEE SUPPORTED VALUES](/README_TABLES.md)

Example:

```markdown
### Commands

[//]: # "vscode-table-commands(title:Name|command)"
```

After running `updateContributions.js` you will get the following output:

```markdown
### Commands

[//]: # "vscode-table-commands(title:Name|command)"

| Name                               | command                                |
| ---------------------------------- | -------------------------------------- |
| Translate colors to another format | color-picker-universal.translateColors |
```
