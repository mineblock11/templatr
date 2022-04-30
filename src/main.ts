#!/usr/bin/env node

import { program } from "commander";
import { cacheClear } from "./commands/cache/clear.js";
import { cacheIndex } from "./commands/cache/index.js";
import { configGet } from "./commands/config/get.js";

import { configIndex } from "./commands/config/index.js";
import { configSet } from "./commands/config/set.js";
import { use } from "./commands/use.js";

program
  .name("templatr")
  .description(
    "Generate projects from a template. Fill in defined placeholders from a .templatr file"
  )
  .version("2.0.0");

program
  .command("use")
  .description("Use a template from a specified git repository.")
  .argument("<repo>", "repo to clone")
  .alias("u")
  .option("-g, --gitlab", "Use GitLab instead of GitHub")
  .option("-t, --token", "The auth token to use if required.")
  .option(
    "-i, --input",
    "Input json, useful for external programs to interact."
  )
  .action(use);

// Config

const config = program
  .command("config")
  .description("Get all config values.")
  .action(configIndex);

config
  .command("get")
  .argument("<key>", "The key of the config.")
  .description("Get a config value.")
  .action(configGet);

config
  .command("set")
  .argument("<key>", "The key of the config.")
  .argument("<value>", "The value to set.")
  .description("Set a config value.")
  .action(configSet);

const cache = program
  .command("cache")
  .description("Get infomation on cache.")
  .action(cacheIndex);

cache.command("clear").description("Clear Cache").action(cacheClear);

program.showHelpAfterError();
program.showSuggestionAfterError();

program.parse();
