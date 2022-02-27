import SpecialPaths from './types/specialPaths'
import * as Path from 'path'
import * as fs from 'fs-extra';
import simpleGit from 'simple-git'
import * as inquirer from 'inquirer'
import TemplatrDefiner from './types/templatrDefiner'

export default class Utils {
  static async getProjectLocation(locationFlag?: string): Promise<string> {
    const projectLocation: string = Path.resolve(process.cwd(), locationFlag || (await inquirer.prompt([
      {
        type: 'input',
        name: 'path',
        message: 'Where do you want to create your template?',
        default: './',
      },
    ])).path);

    if (fs.existsSync(projectLocation)) {
      let overwrite = (await inquirer.prompt([
        {
          type: 'confirm',
          name: 'do',
          message: projectLocation + ' already exists. Do you want to overwrite? (this will delete everything)',
        },
      ])).do

      if (overwrite) fs.rmSync(projectLocation, {recursive: true})
      else {
        console.log("Cancelling creation...")
        process.exit(2);
      }
    }
    return projectLocation;
  }

  static async fetchRepository(owner: string, repo: string, useGitlab?: boolean, token?: string): Promise<string> {
    let repositoryURL: string;

    if(!token) {
      repositoryURL = (!useGitlab) ? `https://github.com/${owner}/${repo}.git` : `https://gitlab.com/${owner}/${repo}.git`;
    } else {
      repositoryURL = (!useGitlab) ? `https://${token}:x-oauth-basic@github.com/${owner}/${repo}.git` : `https://oauth2:${token}@somegitlab.com/${owner}/${repo}.git`;
    }

    const cloningTarget = Path.join(SpecialPaths.CACHE, owner, repo);

    if (fs.existsSync(cloningTarget)) {
      simpleGit(cloningTarget).pull( {'--force': null});
    } else {
      await simpleGit().clone(repositoryURL, cloningTarget, {}, (err, res) => {
            if (err) {
              console.log('There was an error cloning. Check if the repo is correct or that your internet works.')
              fs.rmSync(cloningTarget, {recursive: true})
              process.exit(1)
            }
      });
    }

    return cloningTarget;
  }

  static async copyCacheToFolder(cachedRepoLocation: string, projectLocation: string, templatr: TemplatrDefiner): Promise<void> {
    const pathToCopy: string = templatr.src !== undefined ? Path.join(cachedRepoLocation, templatr.src) : cachedRepoLocation;
    fs.copySync(pathToCopy, projectLocation);
  }

  static async promptPlaceholders(templateConfiguration: TemplatrDefiner, cache: Map<string, string>): Promise<any> {
    const prompts: any = [];

    templateConfiguration.placeholders.forEach(placeholder => {
      let defaultValue = "";
      if(placeholder.cachable) {
        if(cache.has(placeholder.match)) {
          defaultValue += cache.get(placeholder.match);
        }
      }

      prompts.push({
        type: 'input',
        name: placeholder.match,
        message: placeholder.prompt,
        default: defaultValue
      });
    });

    const results = inquirer.prompt(prompts);
    return results;
  }
}
