#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]
use tauri::api::dir::read_dir;
use tauri::api::dir::is_dir;
use tauri::SystemTray;
use tauri::{CustomMenuItem, SystemTrayMenu, SystemTrayMenuItem,SystemTrayEvent};
use tauri::Manager;
use reqwest::header::{HeaderMap, HeaderValue, AUTHORIZATION};
use serde::{Deserialize, Serialize};
use serde_json::json;
// use std::path::PathBuf;
// use tauri::{api::path::resolve_path, command};




fn main() {
    let quit = CustomMenuItem::new("quit".to_string(), "退出");
    let hide = CustomMenuItem::new("hide".to_string(), "隐藏");
    let tray_menu = SystemTrayMenu::new()
        .add_item(hide)
        .add_native_item(SystemTrayMenuItem::Separator)
        .add_item(quit);
    let system_tray = SystemTray::new().with_menu(tray_menu);

    tauri::Builder::default()
        .system_tray(system_tray)
        .on_system_tray_event(|app, event| match event {
              SystemTrayEvent::LeftClick {
                position: _,
                size: _,
                ..
              } => {
                println!("system tray received a left click");
              }
              SystemTrayEvent::RightClick {
                position: _,
                size: _,
                ..
              } => {
                println!("system tray received a right click");
              }
              SystemTrayEvent::DoubleClick {
                position: _,
                size: _,
                ..
              } => {
                println!("system tray received a double click");
                let window = app.get_window("main").unwrap();
                window.show().unwrap();
              }
              SystemTrayEvent::MenuItemClick { id, .. } => {
                match id.as_str() {
                  "quit" => {
                    std::process::exit(0);
                  }
                  "hide" => {
                    let window = app.get_window("main").unwrap();
                    window.hide().unwrap();
                  }
                  _ => {}
                }
              }
              _ => {}
            })
        .invoke_handler(tauri::generate_handler![
            read_dir_file,
            read_dir_file_count,
            trans_path,
            trans_path_arr,
            post_request
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


#[derive(Debug, Deserialize, Serialize)]
struct Message {
    role: String,
    content: String,
}

#[derive(Debug, Deserialize, Serialize)]
struct ChatRequest {
    model: String,
    messages: Vec<Message>,
}


#[tauri::command]
async fn post_request(url:&str,token: &str ,data:&str) -> Result<String, String> {
    let client = reqwest::Client::new();
    let headers = HeaderMap::from_iter([(AUTHORIZATION, HeaderValue::from_str(&format!("Bearer {}", token)).unwrap())]);
    println!("<==============================================>");
    let chat_request: ChatRequest = serde_json::from_str(data).unwrap();
    println!("{:#?}", chat_request);
       let body = json!(chat_request);
      let response = client
        .post(url)
        .headers(headers)
        .json(&body)
        .send()
        .await
        .map_err(|e| format!("Failed to send request: {}", e))?;

    let text = response.text().await.map_err(|e| format!("Failed to read response: {}", e))?;
    println!("{:#?}", text);
    println!("<==============================================>");
    Ok(text)
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