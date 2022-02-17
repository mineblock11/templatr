import {Command, Flags} from '@oclif/core'
import specialPaths from '../types/specialPaths'
import * as Path from 'path'
import simpleGit, {SimpleGit, SimpleGitOptions} from 'simple-git'

import * as inquirer from 'inquirer'

import * as fs from 'fs'
import * as fse from 'fs-extra'
import TemplatrDefiner from '../types/templatrDefiner'

import {glob} from 'glob'
import Placeholder from '../types/placeholder'
import SpecialPaths from '../types/specialPaths'

export default class Use extends Command {
  static description = 'describe the command here'

  static examples = [
    'templatr use Lauriethefish/quest-mod-template',
    'templatr use gitlab/test -g',
    'templatr use ',
  ]

  static flags = {
    gitlab: Flags.boolean({char: 'g', description: 'Use GitLab instead of GitHub'}),
    location: Flags.string({char: 'l', description: 'Where to create a project to.'}),
  }

  static args = [
    {name: 'repo'},
  ]

  public async run(): Promise<void> {
    const {args, flags} = await this.parse(Use)

    const useGitLab: boolean = flags.gitlab

    const repo = args.repo.split('/')

    if (repo.length != 2) {
      console.error('Invalid repo! Must be in format username/repo!')
      return
    }

    const url = useGitLab ? 'https://gitlab.com/' + repo[0] + '/' + repo[1] + '.git' : 'https://github.com/' + repo[0] + '/' + repo[1] + '.git'
    const localOwner = Path.join(specialPaths.CACHE, repo[0])
    const local = Path.join(specialPaths.CACHE, repo[0], repo[1])
    const cacheExists = fs.existsSync(local)

    if (cacheExists) console.log('Found cache for ' + url)
    else {
      fs.mkdirSync(local, {recursive: true})
      const git: SimpleGit = simpleGit(localOwner)
      console.log('Cloning into cache... please wait')
      await git.clone(url, {}, (err, res) => {
        if (err) {
          console.log('There was an error cloning. Check if the repo is correct or that your internet works.')
          fs.rmSync(local, {recursive: true})
          process.exit(1)
        }
      })
    }

    if (!fs.existsSync(Path.join(local, '.templatr'))) {
      console.log('Repo does not have a .templatr file!')
      fs.rmSync(local, {recursive: true})
      process.exit(2)
    }

    const projectLocation: string = flags.location || (await inquirer.prompt([
      {
        type: 'input',
        name: 'path',
        message: 'Where do you want to create your template?',
        default: '.',
      },
    ])).path

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

    const templatr: TemplatrDefiner = JSON.parse(fs.readFileSync(Path.join(local, ".templatr"), {encoding: "utf-8"}));
    const pathToCopy: string = templatr.src !== undefined ? Path.join(local, templatr.src) : local;

    // copy
    fse.copySync(pathToCopy, projectLocation);

    console.log("You will now be prompted to fill in the placeholders specified in '.templatr'");

    const prompts: any = [];

    const placeholderCachePath = Path.join(SpecialPaths.APPDATA, "placeholder_cache.json");

    if(!fs.existsSync(placeholderCachePath)) {
      const c_cache: Map<string, string> = new Map<string, string>();
      c_cache.set("example-templatr-placeholder", "dorime");
      fs.writeFileSync(placeholderCachePath, JSON.stringify(Object.fromEntries(c_cache), null, 4));
    }

    const cache: Map<string, string> = new Map<string, string>(Object.entries(JSON.parse(fs.readFileSync(placeholderCachePath, {encoding: "utf-8"}))));

    templatr.placeholders.forEach(placeholder => {
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

    const results: any = await inquirer.prompt(prompts);

    console.log("Filling in placeholders. This may take a while...");

    const matches: string[] = [];

    templatr.placeholders.forEach(placeholder => {
      matches.push(placeholder.match);
      if(placeholder.cachable) {
        console.log("Saving cache for " + placeholder.match + " to " + results[placeholder.match]);
        cache.set(placeholder.match, results[placeholder.match]);
      }
    });

    fs.writeFileSync(placeholderCachePath, JSON.stringify(Object.fromEntries(cache), null, 4));

    glob(projectLocation + "/**/*", { dot: true, nodir: true }, (err, filePaths) => {
      filePaths.forEach(file => {
        let contents = fs.readFileSync(file, {encoding: "utf-8"});
        matches.forEach(match => {
          const toFill = results[match];
          contents = contents.replace(match, toFill);
        });
        fs.writeFileSync(file, contents);
      });
    })

    console.log("Done! Created project.");
  }
}
