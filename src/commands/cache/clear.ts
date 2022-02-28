import {Command, Flags} from '@oclif/core'
import ConfigManager, {ConfigStruct, IConfigStruct} from '../../config'
import * as inquirer from 'inquirer'
import * as fs from 'fs-extra'
import SpecialPaths from '../../types/specialPaths'
import * as Path from 'path'

export default class CacheClearCommand extends Command {
  static description = `Clear all cache.`
  static hidden = false
  static usage = 'tmplytr cache clear'
  static examples = [
    '$ tmplytr cache clear'
  ]

  async run() {
    const {args, flags} = await this.parse(CacheClearCommand);

    const result = (await inquirer.prompt([
      {
        type: "confirm",
        name: 'path',
        message: 'Are you sure you want to clear cache? This will delete all cache, including repos and placeholders.',
        default: false
      }
    ])).path;

    if(result) {
      fs.rmSync(SpecialPaths.CACHE, {recursive: true});
      fs.rmSync(Path.join(SpecialPaths.APPDATA, "placeholder_cache.json"));
      console.log("Cleared Cache!")
    } else {
      console.log("Cancelled.")
    }
  }
}
