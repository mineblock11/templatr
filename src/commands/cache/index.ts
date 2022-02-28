import {Command, Flags} from '@oclif/core'
import ConfigManager, {ConfigStruct, IConfigStruct} from '../../config'
import * as Path from 'path'
import SpecialPaths from '../../types/specialPaths'
import * as fs from 'fs-extra'

export default class CacheCommand extends Command {
  static description = `Get cache infomation.`

  // hide the command from help
  static hidden = false

  // custom usage string for help
  // this overrides the default usage
  static usage = 'tmplytr cache'

  // examples to add to help
  // each can be multiline
  static examples = [
    '$ tmplytr cache'
  ]

  async run() {
    const placeholderCachePath = Path.join(SpecialPaths.APPDATA, "placeholder_cache.json");
    if(!fs.existsSync(placeholderCachePath)) {
      const c_cache: Map<string, string> = new Map<string, string>();
      c_cache.set("example-templatr-placeholder", "dorime");
      fs.writeFileSync(placeholderCachePath, JSON.stringify(Object.fromEntries(c_cache), null, 4));
    }

    const cache: Map<string, string> = new Map<string, string>(Object.entries(JSON.parse(fs.readFileSync(placeholderCachePath, {encoding: "utf-8"}))));

    console.log(`Placeholder cache path - ${placeholderCachePath}`);

    console.log(`Placeholders cached - ${cache.size}`);

    let cachedRepos = 0;

    fs.readdirSync(SpecialPaths.CACHE).filter(function (file) {
      return fs.statSync(Path.join(SpecialPaths.CACHE, file)).isDirectory();
    }).forEach(folder => {
      const repos = fs.readdirSync(Path.join(SpecialPaths.CACHE, folder)).filter(function (file) {
        return fs.statSync(Path.join(SpecialPaths.CACHE, folder, file)).isDirectory();
      });
      cachedRepos = cachedRepos + repos.length;
    });

    console.log(`Repo cache path - ${SpecialPaths.CACHE}`);
    console.log(`Repos cached - ${cachedRepos}`)
  }
}
