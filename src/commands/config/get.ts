import ConfigManager, { IConfigStruct } from "../../managers/config.js";
import * as Logger from "../../logger.js";

export async function configGet(key: string, args: any) {
  const config: IConfigStruct = await ConfigManager.getConfig();

  const obj = config as any;
  Logger.info(obj[args.key]);
}
