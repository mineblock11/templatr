import {Command, Flags} from '@oclif/core'
import ConfigManager, {ConfigStruct, IConfigStruct} from '../../config'
import * as Path from 'path'
import SpecialPaths from '../../types/specialPaths'
import * as fs from 'fs-extra'
import * as validUrl from 'valid-url'
import * as gitUrlParse from 'git-url-parse'

const o2x = require('object-to-xml');

export default class CacheGetCommand extends Command {
  static description = `Get cache by its type.`

  // hide the command from help
  static hidden = false

  // custom usage string for help
  // this overrides the default usage
  static usage = 'tmplytr cache get {placeholders/repos} [repo owner]'

  // examples to add to help
  // each can be multiline
  static examples = [
    '$ tmplytr cache get placeholders',
    '$ tmplytr cache get repos Lauriethefish',
    '$ tmplytr cache get repos',
  ]

  static flags = {
    output: Flags.string({char: 'o', description: "Format to output as. (json, table, xml)", default: "table"})
  }

  static args = [
    {name: "type", required: true},
    {name: "repo", required: false}
  ]

  async run() {
    const {args, flags} = await this.parse(CacheGetCommand);

    const placeholderCachePath = Path.join(SpecialPaths.APPDATA, "placeholder_cache.json");
    if(!fs.existsSync(placeholderCachePath)) {
      const c_cache: Map<string, string> = new Map<string, string>();
      c_cache.set("example-templatr-placeholder", "dorime");
      fs.writeFileSync(placeholderCachePath, JSON.stringify(Object.fromEntries(c_cache), null, 4));
    }

    const cache: Map<string, string> = new Map<string, string>(Object.entries(JSON.parse(fs.readFileSync(placeholderCachePath, {encoding: "utf-8"}))));

    const repos: Map<string, string[]> = new Map<string, string[]>();

    fs.readdirSync(SpecialPaths.CACHE).filter(function (file) {
      return fs.statSync(Path.join(SpecialPaths.CACHE, file)).isDirectory();
    }).forEach(folder => {
      const repos_e = fs.readdirSync(Path.join(SpecialPaths.CACHE, folder)).filter(function (file) {
        return fs.statSync(Path.join(SpecialPaths.CACHE, folder, file)).isDirectory();
      });
      repos.set(folder, repos_e);
    });

    switch (args.type.toLowerCase()) {
      case "placeholders":
        switch (flags.output) {
          case "json":
            console.log(JSON.stringify(Object.fromEntries(cache)));
            break;
          case "xml":
            console.log(o2x(Object.fromEntries(cache)));
            break;
          default:
            console.table(Object.fromEntries(cache));
            break;
        }
        break;
    case "repos":
        let repo;
        try {
          repo = args.repo.split("/");
        } catch(ignored) {
          repo = args.repo;
        }
        if(repo == undefined) {
          const repos_a: any = {}
          repos.forEach((value: string[], key: string) => {
            repos_a[key] = value;
          });
          switch (flags.output) {
            case "json":
              console.log(JSON.stringify(repos_a));
              break;
            case "xml":
              console.log(o2x(repos_a));
              break;
            default:
              console.table(repos_a);
              break;
          }
          break;
        }
        if (repo.length != 2) {

          switch (flags.output) {
            case "json":
              console.log(JSON.stringify(repos.get(repo)));
              break;
            case "xml":
              console.log(o2x(repos.get(repo)));
              break;
            default:
              console.table(repos.get(repo));
              break;
          }
          break;
        } else {
          console.log("Invalid format.")
        }
    }
  }
}
