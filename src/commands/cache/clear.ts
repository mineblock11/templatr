import inquirer from "inquirer";

import * as Path from "path";
import * as fs from "fs";

import SpecialPaths from "../../types/paths.js";
import * as Logger from "../../logger.js";

export async function cacheClear(args: any) {
  const result = (
    await inquirer.prompt([
      {
        type: "confirm",
        name: "path",
        message:
          "Are you sure you want to clear cache? This will delete all cache, including repos and placeholders.",
        default: false,
      },
    ])
  ).path;

  if (result) {
    fs.rmSync(SpecialPaths.CACHE, { recursive: true });
    fs.rmSync(Path.join(SpecialPaths.APPDATA, "placeholder_cache.json"));
    Logger.info("Cleared Cache!");
  } else {
    Logger.err("Cancelled.");
  }
}
