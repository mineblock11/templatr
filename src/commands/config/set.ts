import ConfigManager, { IConfigStruct } from "../../managers/config.js";
import * as Logger from "../../logger.js";

export async function configSet(key: string, value: any, args: any) {
  const config: IConfigStruct = await ConfigManager.getConfig();

  switch (key) {
    case "ghToken":
      config.ghToken = value;
      break;
    case "doUpdateCache":
      config.doUpdateCache = value === "true";
      break;
    case "glToken":
      config.glToken = value;
      break;
  }

  await ConfigManager.saveConfig(config);
  Logger.info("Saved Config!");
}
