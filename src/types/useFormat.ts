export enum ErrorTypes {
  NOTLF = "NoTemplatrFile",
  NOGIT = "NoGit",
  BADCLONE = "BadClone",
}

/**
  {
    "owner": "Lauriethefish",
    "repo": "quest-mod-template",
    "replacements": [
      {
         "match": "#{ndkpath}"
         "replacement": "C:/SDKs/android-ndk-r24/"
      },
      {
        "match": "#{id}",
        "replacement": "noodle"
      },
      {
        "match": "#{name}",
        "replacement": "Noodle Extensions"
      },
      {
        "match": "#{author}",
        "replacement": "StackDoubleFlow? Cant remember lol"
      },
      {
        "match": "#{description}",
        "replacement": "Noodle Extensions, duh."
      }
    ],
    "projectLocation": "G:/Dev/QuestMods/Noodle/"
    "gitlab": false,
    "token": null
  }
 */

interface Replacement {
  match: string;
  replacement: string;
}

export default interface UseFormat {
  // Note ?: means optional, : means required

  owner: string;
  repo: string;
  replacements: Replacement[];
  // Project location, where to create the project. All contents of the template will be copied to this folder.
  projectLocation: string;

  // GitHub/GitLab token
  token?: string;

  // Specify true if GitLab is to be used.
  gitlab?: boolean;
}
