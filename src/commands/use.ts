import {Command, Flags} from '@oclif/core'
import * as Path from 'path'

import * as inquirer from 'inquirer'

import * as fs from 'fs'
import * as fse from 'fs-extra'
import TemplatrDefiner from '../types/templatrDefiner'

import {glob} from 'glob'
import SpecialPaths from '../types/specialPaths'
import ConfigManager, {IConfigStruct} from '../config'
import Utils from '../utils'

import * as commandExists from 'command-exists'
import * as gitUrlParse from 'git-url-parse'
import * as validUrl from 'valid-url'
import {isBinaryFile} from 'isbinaryfile'
import UseFormat, {ErrorTypes} from '../types/useFormat'

export default class Use extends Command {
  static description = 'Use a template from a specified GitHub repository.'

  static examples = [
    'templatr use Lauriethefish/quest-mod-template',
    'templatr use gitlab/test -g',
    'templatr use user/privaterepo --token=A_VERY_SECRET_TOKEN',
  ]

  static flags = {
    gitlab: Flags.boolean({char: 'g', description: 'Use GitLab instead of GitHub'}),
    location: Flags.string({char: 'l', description: 'Where to create a project to.'}),
    token: Flags.string({char: 't', description: "The gitlab or github token to authorize with."}),
    input: Flags.string({char: 'i', description: "JSON input, useful for external use via programming ect."})
  }

  static args = [
    {name: 'repository'}
  ]

  public async run(): Promise<void> {
    const {args, flags} = await this.parse(Use);

    const config: IConfigStruct = await ConfigManager.getConfig();

    if(flags.input != undefined) {
      const jsonInput: UseFormat = JSON.parse(flags.input);
      const cachedRepoLocation = await Utils.fetchRepository(jsonInput.owner, jsonInput.repo, jsonInput.gitlab, jsonInput.token);
      if (!fs.existsSync(Path.join(cachedRepoLocation, '.templatr'))) {
        console.error(ErrorTypes.NOTLF)
        fs.rmSync(cachedRepoLocation, {recursive: true})
        this.exit(1);
      }
      const templateConfiguration: TemplatrDefiner = JSON.parse(fs.readFileSync(Path.join(cachedRepoLocation, ".templatr"), {encoding: "utf-8"}));
      await Utils.copyCacheToFolder(cachedRepoLocation, jsonInput.projectLocation, templateConfiguration);

      glob(jsonInput.projectLocation + "/**/*", { dot: true, nodir: true }, (err, filePaths) => {
        filePaths.forEach(async file => {
          if(await isBinaryFile(file)) {
            return;
          }
          let contents = fs.readFileSync(file, {encoding: "utf-8"});
          jsonInput.replacements.forEach(replacement => {
            const toFill = replacement.replacement;
            contents = contents.replace(new RegExp(replacement.match, 'g'), toFill);
          })
          fs.writeFileSync(file, contents);
        });
      });
      console.log("DONE")
      this.exit(0)
    }

    let repo = args.repository.split('/');

    if (repo.length != 2) {
      if(validUrl.isUri(args.repository)) {
        const parsed = gitUrlParse(args.repository);
        repo = [parsed.owner, parsed.name];
      } else {
        console.error('Invalid repo!')
        this.exit(1);
      }
    }

    if(!await commandExists('git')) {
      console.log('Git is not installed!');
      this.exit(1);
    }

    const token = (flags.gitlab) ? config.glToken || flags.token : config.ghToken || flags.token;

    const cachedRepoLocation = await Utils.fetchRepository(repo[0], repo[1], flags.gitlab, token);

    if (!fs.existsSync(Path.join(cachedRepoLocation, '.templatr'))) {
      console.error('Repo does not have a .templatr file!')
      fs.rmSync(cachedRepoLocation, {recursive: true})
      this.exit(1);
    }

    const projectLocation = await Utils.getProjectLocation();

    const templateConfiguration: TemplatrDefiner = JSON.parse(fs.readFileSync(Path.join(cachedRepoLocation, ".templatr"), {encoding: "utf-8"}));

    await Utils.copyCacheToFolder(cachedRepoLocation, projectLocation, templateConfiguration);

    console.log("You will now be prompted to fill in the placeholders specified in '.templatr'");

    const placeholderCachePath = Path.join(SpecialPaths.APPDATA, "placeholder_cache.json");
    if(!fs.existsSync(placeholderCachePath)) {
      const c_cache: Map<string, string> = new Map<string, string>();
      c_cache.set("example-templatr-placeholder", "dorime");
      fs.writeFileSync(placeholderCachePath, JSON.stringify(Object.fromEntries(c_cache), null, 4));
    }

    const cache: Map<string, string> = new Map<string, string>(Object.entries(JSON.parse(fs.readFileSync(placeholderCachePath, {encoding: "utf-8"}))));

    const results = await Utils.promptPlaceholders(templateConfiguration, cache);

    console.log("Filling in placeholders. This may take a while depending on the amount of placeholders present.");

    const matches: string[] = [];

    templateConfiguration.placeholders.forEach(placeholder => {
      matches.push(placeholder.match);
      if(placeholder.cachable) {
        cache.set(placeholder.match, results[placeholder.match]);
      }
    });

    fs.writeFileSync(placeholderCachePath, JSON.stringify(Object.fromEntries(cache), null, 4));

    glob(projectLocation + "/**/*", { dot: true, nodir: true }, (err, filePaths) => {
      filePaths.forEach(async file => {
        if(await isBinaryFile(file)) {
          return;
        }
        let contents = fs.readFileSync(file, {encoding: "utf-8"});
        matches.forEach(match => {
          const toFill = results[match];
          contents = contents.replace(new RegExp(match, 'g'), toFill);
        });
        fs.writeFileSync(file, contents);
      });
    })

    console.log("Done! Created project.");
  }
}
