import chalk from "chalk";

export function info(...args: any[]) {
  args.forEach((element) => {
    console.log(chalk.blue(element));
  });
}

export function err(...args: any[]) {
  args.forEach((element) => {
    console.log(chalk.red(element));
  });
}

export function warn(...args: any[]) {
  args.forEach((element) => {
    console.log(chalk.yellow(element));
  });
}
