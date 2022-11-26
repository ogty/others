#![cfg_attr(
  all(not(debug_assertions), target_os = "windows"),
  windows_subsystem = "windows"
)]

use std::fs::File;
use std::io::{Write};

fn main() {
  tauri::Builder::default()
    .invoke_handler(tauri::generate_handler![
      write,
    ])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}

#[tauri::command]
fn write(path: String, content: String) -> Result<(), String> {
    let base_path = "/Users/**********/Desktop/";
    let mut file = File::create(base_path.to_owned() + &path).unwrap();
    file.write_all(content.as_bytes()).unwrap();
    Ok(())
}
