#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]
use tauri::api::dir::read_dir;
use tauri::api::dir::is_dir;
// use std::path::PathBuf;
// use tauri::{api::path::resolve_path, command};

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            read_dir_file,
            read_dir_file_count,
            trans_path,
            trans_path_arr
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#[tauri::command]
fn read_dir_file(path: String) -> Vec<String> {
    let mut arr: Vec<String> = vec![];
    for item in read_dir(path,false).unwrap() {
        let result = is_dir(item.path.as_path());
        match result {
            Ok(value) => {
                arr.push(item.name.unwrap());
                println!("成功！结果是: {}", value);
            }
            Err(error) => {
                println!("发生错误：{:#?}", error);
            }
        }
    }
    return arr;
}

#[tauri::command]
fn read_dir_file_count(path: String) -> i32 {
    let dir = read_dir(path,false).unwrap();
    let mut count: i32 = 0;
    for _ in dir {
        count += 1;
    }
    return count;
}

#[tauri::command]
fn trans_path(path: String) -> String {
    println!("{}", path);
    let mut str = String::new();
    for chart in path.chars() {
        if chart.to_string() == "\\".to_string() {
            str += "/"
        } else {
            str += chart.to_string().as_str();
        }
        // println!("{}", chart);
    }
    return str;
}

#[tauri::command]
fn trans_path_arr(arr: Vec<String>) -> Vec<String> {
    arr.iter()
        .map(|s| s.replace("\\", "/"))
        .collect()
}
//
// async fn locate_executable(path: String) -> Result<PathBuf, Box<dyn std::error::Error>> {
//     let path = resolve_path(path)?;
//     Ok(path)
// }
//
// async fn run_executable(path: String) -> Result<(), Box<dyn std::error::Error>> {
//     let exe_path = locate_executable(path).await?;
//     let status = std::process::Command::new(&exe_path)
//         .status()
//         .expect("Failed to execute my_executable");
//
//     if status.success() {
//         Ok(())
//     } else {
//         Err(format!("my_executable exited with an error: {}", status).into())
//     }
// }
//
// #[command]
// fn run_executable_command(path: String) -> Result<(), Box<dyn std::error::Error>> {
//     run_executable(path).expect("Failed to execute the .exe file");
//     Ok(())
// }