import * as Path from "path";
import * as fs from "fs";

import SpecialPaths from "../../types/paths.js";
import * as Logger from "../../logger.js";

export async function cacheIndex(args: any) {
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

  Logger.info(`Placeholder cache path - ${placeholderCachePath}`);

  Logger.info(`Placeholders cached - ${cache.size}`);

  let cachedRepos = 0;

  fs.readdirSync(SpecialPaths.CACHE)
    .filter(function (file) {
      return fs.statSync(Path.join(SpecialPaths.CACHE, file)).isDirectory();
    })
    .forEach((folder) => {
      const repos = fs
        .readdirSync(Path.join(SpecialPaths.CACHE, folder))
        .filter(function (file) {
          return fs
            .statSync(Path.join(SpecialPaths.CACHE, folder, file))
            .isDirectory();
        });
      cachedRepos = cachedRepos + repos.length;
    });

  Logger.info(`Repo cache path - ${SpecialPaths.CACHE}`);
  Logger.info(`Repos cached - ${cachedRepos}`);
}
