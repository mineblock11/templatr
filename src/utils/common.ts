import * as Path from "path";
import * as fs from "fs-extra";
import simpleGit from "simple-git";
import inquirer from "inquirer";

import { V1, V2 } from "../types/templatr.js";
import SpecialPaths from "../types/paths.js";

export default class Utils {
  static async getProjectLocation(locationFlag?: string): Promise<string> {
    let projectLocation: string = Path.resolve(
      process.cwd(),
      locationFlag ||
        (
          await inquirer.prompt([
            {
              type: "input",
              name: "path",
              message: "Where do you want to create your template?",
              default: "./",
            },
          ])
        ).path
    );

    if (fs.existsSync(projectLocation)) {
      let overwrite = (
        await inquirer.prompt([
          {
            type: "confirm",
            name: "do",
            message:
              projectLocation +
              " already exists. Are you sure you want to continue? Any conflicting files will be overriden by the template.",
          },
        ])
      ).do;

      if (!overwrite) {
        console.log("Cancelling creation...");
        process.exit(2);
      }
    }
    return projectLocation;
  }

  static async fetchRepository(
    owner: string,
    repo: string,
    useGitlab?: boolean,
    token?: string
  ): Promise<string> {
    let repositoryURL: string;

    if (!token) {
      repositoryURL = !useGitlab
        ? `https://github.com/${owner}/${repo}.git`
        : `https://gitlab.com/${owner}/${repo}.git`;
    } else {
      repositoryURL = !useGitlab
        ? `https://${token}:x-oauth-basic@github.com/${owner}/${repo}.git`
        : `https://oauth2:${token}@somegitlab.com/${owner}/${repo}.git`;
    }

    const cloningTarget = Path.join(SpecialPaths.CACHE, owner, repo);

    if (fs.existsSync(cloningTarget)) {
      simpleGit(cloningTarget).pull({ "--force": null });
    } else {
      await simpleGit().clone(repositoryURL, cloningTarget, {}, (err, res) => {
        if (err) {
          console.log(
            "There was an error cloning. Check if the repo is correct or that your internet works."
          );
          process.exit(1);
        }
      });
    }

    return cloningTarget;
  }

  static async copyCacheToFolder(
    cachedRepoLocation: string,
    projectLocation: string,
    templatr: V1 | V2
  ): Promise<void> {
    const pathToCopy: string =
      templatr.src !== undefined
        ? Path.join(cachedRepoLocation, templatr.src)
        : cachedRepoLocation;
    fs.copySync(pathToCopy, projectLocation);
  }

  static async promptPlaceholders(
    templateConfiguration: V1 | V2,
    cache: Map<string, string>
  ): Promise<any> {
    const prompts: any = [];

    if (templateConfiguration._version == "2") {
      let prerunInfo = (templateConfiguration as V2).prerunInfo;
      if (prerunInfo != undefined) {
        console.log(prerunInfo);
      }
    }

    templateConfiguration.placeholders.forEach((placeholder) => {
      let defaultValue = "";
      if (placeholder.cachable) {
        if (cache.has(placeholder.match)) {
          defaultValue += cache.get(placeholder.match);
        }
      }

      prompts.push({
        type: "input",
        name: placeholder.match,
        message: placeholder.prompt,
        default: defaultValue,
      });
    });

    const results = inquirer.prompt(prompts);

    // if (templateConfiguration._version == "2") {
    //   let postrunInfo = (templateConfiguration as V2).prerunInfo;
    //   if (postrunInfo != undefined) {
    //     console.log(postrunInfo);
    //   }
    // }

    return results;
  }
}
