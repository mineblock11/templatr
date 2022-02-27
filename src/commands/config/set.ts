import {Command, Flags} from '@oclif/core'
import ConfigManager, {ConfigStruct, IConfigStruct} from '../../config'

export default class ConfigSetCommand extends Command {
  static description = `Set a config value by its key.`

  // hide the command from help
  static hidden = false

  // custom usage string for help
  // this overrides the default usage
  static usage = 'tmplytr config set {key} {value}'

  // examples to add to help
  // each can be multiline
  static examples = [
    '$ tmplytr config set ghToken "abcdeeznts"',
    '$ tmplytr config set doUpdateCache false',
  ]

  static args = [
    {name: "key"},
    {name: "value"}
  ]

  async run() {
    const {args, flags} = await this.parse(ConfigSetCommand);
    const config: IConfigStruct = await ConfigManager.getConfig();

    switch (args.key) {
      case "ghToken":
        config.ghToken = args.value;
        break;
      case "doUpdateCache":
        config.doUpdateCache = (args.value === 'true');
        break;
      case "glToken":
        config.glToken = args.value;
        break;
    }

    await ConfigManager.saveConfig(config);
    this.log("Saved Config!")
  }
}
