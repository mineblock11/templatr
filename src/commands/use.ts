import * as fs from "fs";
import * as Path from "path";
import glob from "glob";
import { isBinaryFile } from "isbinaryfile";
import * as validUrl from "valid-url";
import gitUrlParse from "git-url-parse";
import commandExists from "command-exists";
import chalk from "chalk";

import SpecialPaths from "../types/paths.js";
import * as Logger from "../logger.js";
import Utils from "../utils/common.js";
import ConfigManager, { IConfigStruct } from "../managers/config.js";
import UseFormat, { ErrorTypes } from "../types/useFormat.js";
import { V1, V2 } from "../types/templatr.js";

async function inputUsage(jsonInput: UseFormat) {
  const cachedRepoLocation = await Utils.fetchRepository(
    jsonInput.owner,
    jsonInput.repo,
    jsonInput.gitlab,
    jsonInput.token
  );
  if (!fs.existsSync(Path.join(cachedRepoLocation, ".templatr"))) {
    console.error(ErrorTypes.NOTLF);
    fs.rmSync(cachedRepoLocation, { recursive: true });
    process.exit(1);
  }
  const templateConfiguration: V1 | V2 = JSON.parse(
    fs.readFileSync(Path.join(cachedRepoLocation, ".templatr"), {
      encoding: "utf-8",
    })
  );
  await Utils.copyCacheToFolder(
    cachedRepoLocation,
    jsonInput.projectLocation,
    templateConfiguration
  );

  glob(
    jsonInput.projectLocation + "/**/*",
    { dot: true, nodir: true },
    (err: any, filePaths: any[]) => {
      filePaths.forEach(async (file: string) => {
        if (await isBinaryFile(file)) {
          return;
        }
        let contents = fs.readFileSync(file, { encoding: "utf-8" });
        jsonInput.replacements.forEach((replacement) => {
          const toFill = replacement.replacement;
          contents = contents.replace(
            new RegExp(replacement.match, "g"),
            toFill
          );
        });
        fs.writeFileSync(file, contents);
      });
    }
  );
  console.log("DONE");
}

export async function use(repository: string, flags: any) {
  const config: IConfigStruct = await ConfigManager.getConfig();

  if (flags.input != undefined) {
    const jsonInput: UseFormat = JSON.parse(flags.input);
    inputUsage(jsonInput);
    process.exit(0);
  }

  let repo = repository.split("/");

  if (repo.length != 2) {
    if (validUrl.isUri(repository)) {
      const parsed = gitUrlParse(repository);
      repo = [parsed.owner, parsed.name];
    } else {
      Logger.err("Invalid repo!");
      process.exit(1);
    }
  }

  if (!(await commandExists("git"))) {
    Logger.err("Git is not installed!");
    process.exit(1);
  }

  const token = flags.gitlab
    ? config.glToken || flags.token
    : config.ghToken || flags.token;

  const cachedRepoLocation = await Utils.fetchRepository(
    repo[0],
    repo[1],
    flags.gitlab,
    token
  );

  if (!fs.existsSync(Path.join(cachedRepoLocation, ".templatr"))) {
    Logger.err("Repo does not have a .templatr file!");
    fs.rmSync(cachedRepoLocation, { recursive: true });
    process.exit(1);
  }

  const projectLocation = await Utils.getProjectLocation();

  const templateConfiguration: V1 | V2 = JSON.parse(
    fs.readFileSync(Path.join(cachedRepoLocation, ".templatr"), {
      encoding: "utf-8",
    })
  );

  await Utils.copyCacheToFolder(
    cachedRepoLocation,
    projectLocation,
    templateConfiguration
  );

  Logger.info(
    "You will now be prompted to fill in the placeholders specified in '.templatr'"
  );

  const placeholderCachePath = Path.join(
    SpecialPaths.APPDATA,
    "placeholder_cache.json"
  );
  if (!fs.existsSync(placeholderCachePath)) {
    const c_cache: Map<string, string> = new Map<string, string>();
    c_cache.set("example-templatr-placeholder", "dorime");
    fs.writeFileSync(
      placeholderCachePath,
      JSON.stringify(Object.fromEntries(c_cache), null, 4)
    );
  }

  const cache: Map<string, string> = new Map<string, string>(
    Object.entries(
      JSON.parse(fs.readFileSync(placeholderCachePath, { encoding: "utf-8" }))
    )
  );

  const results = await Utils.promptPlaceholders(templateConfiguration, cache);

  Logger.info(
    "Filling in placeholders. This may take a while depending on the amount of placeholders present."
  );

  const matches: string[] = [];

  templateConfiguration.placeholders.forEach((placeholder) => {
    matches.push(placeholder.match);
    if (placeholder.cachable) {
      cache.set(placeholder.match, results[placeholder.match]);
    }
  });

  fs.writeFileSync(
    placeholderCachePath,
    JSON.stringify(Object.fromEntries(cache), null, 4)
  );

  glob(
    projectLocation + "/**/*",
    { dot: true, nodir: true },
    (err, filePaths) => {
      filePaths.forEach(async (file) => {
        if (await isBinaryFile(file)) {
          return;
        }
        let contents = fs.readFileSync(file, { encoding: "utf-8" });
        matches.forEach((match) => {
          const toFill = results[match];
          contents = contents.replace(new RegExp(match, "g"), toFill);
        });
        fs.writeFileSync(file, contents);
      });
    }
  );

  Logger.info("Done! Created project.");
}
