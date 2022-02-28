import {Command, Flags} from '@oclif/core'
import ConfigManager, {ConfigStruct, IConfigStruct} from '../config'
import * as validUrl from 'valid-url'
import * as gitUrlParse from 'git-url-parse'
import * as commandExists from 'command-exists'
import Utils from '../utils'
import * as fs from 'fs-extra'
import * as Path from 'path'

const o2x = require('object-to-xml');

import TemplatrDefiner from '../types/templatrDefiner'

enum Format {
  JSON,
  XML
}

export default class ReadCommand extends Command {
  static description = `Get all placeholders on a project as json.`

  static usage = "tmpytr read {repo}"

  static hidden = false

  static examples = [
    '$ tmplytr read Lauriethefish/quest-mod-template'
  ]

  static flags = {
    gitlab: Flags.boolean({char: 'g', description: 'Use GitLab instead of GitHub'}),
    token: Flags.string({char: 't', description: "The gitlab or github token to authorize with."}),
    output: Flags.string({char: 'o', description: "Format to output as. (json, table, xml)"})
  }

  static args = [
    {name: 'repository', required: true},
  ]

  async run() {
    const {args, flags} = await this.parse(ReadCommand);
    const config: IConfigStruct = await ConfigManager.getConfig();

    let repo = args.repository.split('/')

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

    const templateConfiguration: TemplatrDefiner = JSON.parse(fs.readFileSync(Path.join(cachedRepoLocation, ".templatr"), {encoding: "utf-8"}));

    if(!flags.output) {
      console.table(templateConfiguration.placeholders);
      this.exit(0);
    } else {
      switch (flags.output.toLowerCase()) {
        case "json":
          console.log(JSON.stringify(templateConfiguration, null, 4));
          this.exit(0);
          break;
        case "xml":
          console.log(o2x(templateConfiguration));
          this.exit(0);
          break;
      default:
        console.table(templateConfiguration.placeholders)
      }
    }

  }
}
