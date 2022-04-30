import { readJSON } from "fs-extra";
import * as fs from "fs";
import * as Path from "path";

import paths from "../types/paths.js";

export interface IConfigStruct {
  ghToken?: string;
  glToken?: string;
  doUpdateCache: boolean;
}

export class ConfigStruct implements IConfigStruct {
  constructor(userConfig: IConfigStruct) {
    this._glToken = userConfig.glToken;
    this._ghToken = userConfig.ghToken;
    this._updateCache = userConfig.doUpdateCache;
  }

  get ghToken(): string | undefined {
    return this._ghToken;
  }

  set ghToken(value: string | undefined) {
    this._ghToken = value;
  }
  get doUpdateCache(): boolean {
    return this._updateCache;
  }

  set doUpdateCache(value: boolean) {
    this._updateCache = value;
  }
  get glToken(): string | undefined {
    return this._glToken;
  }

  set glToken(value: string | undefined) {
    this._glToken = value;
  }

  private _ghToken: string | undefined;
  private _glToken: string | undefined;
  private _updateCache: boolean = false;
}

export default class ConfigManager {
  static async getConfig(): Promise<IConfigStruct> {
    let userConfig: IConfigStruct;
    if (!fs.existsSync(paths.CONFIG)) {
      console.log("Missing config - generating default.");
      userConfig = {
        doUpdateCache: true,
        ghToken: undefined,
        glToken: undefined,
      };

      if (!fs.existsSync(paths.APPDATA)) {
        fs.mkdirSync(paths.APPDATA, { recursive: true });
      }

      fs.writeFileSync(
        paths.CONFIG,
        JSON.stringify(
          userConfig,
          function (k, v) {
            return v === undefined ? null : v;
          },
          4
        )
      );
    }
    userConfig = await readJSON(paths.CONFIG);
    return userConfig;
  }

  static async saveConfig(config: IConfigStruct): Promise<void> {
    // function(k, v) { return v === undefined ? null : v; }
    await fs.writeFileSync(
      paths.CONFIG,
      JSON.stringify(
        config,
        function (k, v) {
          return v === undefined ? null : v;
        },
        4
      )
    );
  }
}
