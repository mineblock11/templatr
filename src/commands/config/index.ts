import ConfigManager, { IConfigStruct } from "../../managers/config.js";

export async function configIndex(args: any) {
  const config: IConfigStruct = await ConfigManager.getConfig();

  console.table(config as any);
}
