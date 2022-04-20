# Templatr

Create project from templates on GitHub and GitLab - specified by a `.templatr` file.

## Usage

```bash
templatr new quest-mod-template "https://github.com/Lauriethefish/quest-mod-template.git"
# This only needs to be done once, then the template is saved to the config
templatr use quest-mod-template
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


