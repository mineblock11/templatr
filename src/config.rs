use std::collections::HashMap;
use std::{default, fs};
use std::fs::create_dir_all;
use std::fs::File;
use std::io::Write;
use std::path::Path;
use directories::ProjectDirs;
use serde::{Serialize, Deserialize};

#[derive(Serialize, Deserialize, Debug)]
pub struct Config {
    templates: HashMap<String, String>
}

pub fn init_config() {
    let config: Config = load_config();
    save_config(&config);
}

pub fn load_config() -> Config {
    if let Some(proj_dirs) = ProjectDirs::from("dev", "millzy", "templatr") {
        let config_dir = proj_dirs.config_dir();

        let path = Path::new(config_dir);
        if !path.exists() {
            fs::create_dir_all(path);
        }

        let config_file = fs::read_to_string(config_dir.join("templatr.json"))
            .unwrap_or("".to_string());

        let config: Config =   serde_json::from_str(config_file.as_str())
            .unwrap_or(Config {
                templates: Default::default()
            });

        return config;
    }
    return Config {
        templates: Default::default()
    }
}

pub fn save_config(config: &Config) {
    if let Some(proj_dirs) = ProjectDirs::from("dev", "millzy", "templatr") {
        let config_str: String = serde_json::to_string(config).unwrap();

        let config_dir = proj_dirs.config_dir();
        let mut file = File::create(config_dir.join("templatr.json")).unwrap();
        file.write_all(config_str.as_str().as_ref());
    }
}