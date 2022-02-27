import {Command, Flags} from '@oclif/core'
import ConfigManager, {ConfigStruct, IConfigStruct} from '../../config'

export default class ConfigGetCommand extends Command {
  static description = `Get all config values.`

  // hide the command from help
  static hidden = false

  // custom usage string for help
  // this overrides the default usage
  static usage = 'tmplytr config'

  // examples to add to help
  // each can be multiline
  static examples = [
    '$ tmplytr config'
  ]

  async run() {
    const {args, flags} = await this.parse(ConfigGetCommand);
    const config: IConfigStruct = await ConfigManager.getConfig();

    console.table(config as any);
  }
}
