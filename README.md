# Templatr

Create project from templates on GitHub and GitLab - specified by a `.templatr` file.

## Installation

Download the latest executable from the release tab, extract and add to path.

## Usage

```bash
templatr use Lauriethefish/quest-mod-template
# Will then follow you through a wizard allowing you to fill in all placeholders.
```

## Example `.templatr` file:

This uses all required features except `src` and `cachable`

`src` can be defined when the template is not in the root of the repo.

```json
{
  "name": "Quest Mod Template",
  "author": "Lauriethefish",
  "src": "./template",
  "description": "Template for creating QuestPatcher/BMBF mods for the Oculus Quest.",
  "placeholders": [
    {
      "match": "#{ndkpath}",
      "prompt": "The path to the android NDK",
      "cachable": true
    },
    {
      "match": "#{id}",
      "prompt": "The ID of the mod"
    },
    {
      "match": "#{name}",
      "prompt": "The name of the mod"
    },
    {
      "match": "#{author}",
      "prompt": "The author of the mod"
    },
    {
      "match": "#{description}",
      "prompt": "The description of the mod"
    }
  ]
}

```

