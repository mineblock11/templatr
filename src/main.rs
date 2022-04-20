use clap::{Parser, Subcommand};

mod config;

#[derive(Parser, Debug)]
#[clap(version = "2.0.0", author = "Millzy & cal117")]

struct Opts {
    #[clap(subcommand)]
    subcmd: MainCommand,
}

#[derive(Subcommand, Debug, Clone)]
enum MainCommand {

}

fn main() {
    config::init_config();

    match (Opts::parse() as Opts).subcmd {

    }
}