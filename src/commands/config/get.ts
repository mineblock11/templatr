import {Command, Flags} from '@oclif/core'
import ConfigManager, {ConfigStruct, IConfigStruct} from '../../config'

export default class ConfigGetCommand extends Command {
  static description = `Get a config value by its key.`

  // hide the command from help
  static hidden = false

  // custom usage string for help
  // this overrides the default usage
  static usage = 'tmplytr config get {key}'

  // examples to add to help
  // each can be multiline
  static examples = [
    '$ tmplytr config get ghToken',
    '$ tmplytr config get doUpdateCache',
  ]

  static args = [
    {name: "key"},
  ]

  async run() {
    const {args, flags} = await this.parse(ConfigGetCommand);
    const config: IConfigStruct = await ConfigManager.getConfig();

    const obj = config as any;
    this.log(obj[args.key]);
  }
}
