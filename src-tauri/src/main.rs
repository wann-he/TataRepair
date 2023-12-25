#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]
use reqwest::header::CONTENT_TYPE;
use reqwest::header::{HeaderMap, HeaderValue, AUTHORIZATION};
use serde::{Deserialize, Serialize};
use tauri::Manager;
use tauri::{
  menu::{Menu, MenuItem},
  tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent}
};

fn main() {
    tauri::Builder::default()
        .setup(|app| {
            let show_i = MenuItem::with_id(app, "show", "显示", true, None::<&str>)?;
            let hide_i = MenuItem::with_id(app, "hide", "隐藏", true, None::<&str>)?;
            let quit_i = MenuItem::with_id(app, "quit", "退出", true, None::<&str>)?;
            let menu = Menu::with_items(app, &[&show_i,&hide_i,&quit_i])?;

            let _tray = TrayIconBuilder::new()
                  .icon(app.default_window_icon().unwrap().clone())
                  .menu(&menu)
                  .show_menu_on_left_click(false)
                  .on_menu_event(|app, event| match event.id.as_ref() {
                        "show" => {
                            println!("show menu item was clicked");
                            if let Some(window) = app.get_webview_window("main") {
                                let is_minimized =  window.is_minimized().unwrap();
                                let is_visible =  window.is_visible().unwrap();
                                println!("is_visible：{}",is_visible );
                                println!("is_minimized：{}",is_minimized);
                                if is_visible && is_minimized {
                                    let _ = window.unminimize();
                                }
                                if !is_visible {
                                    let _ = window.show();
                                    let _ = window.set_focus();
                                }
                            }
                        }
                        "hide" => {
                            println!("hide menu item was clicked");
                            if let Some(window) = app.get_webview_window("main") {
                                 println!("is_visible：{}", window.is_visible().unwrap());
                                 println!("is_minimized：{}", window.is_minimized().unwrap());
                                 let _ = window.hide();
                                }
                        }
                        "quit" => {
                            println!("quit menu item was clicked");
                            app.exit(0);
                        }
                        _ => {
                            println!("menu item {:?} not handled", event.id);
                        }
                  })
                  .on_tray_icon_event(|tray, event| match event {
                      TrayIconEvent::Click {
                        button: MouseButton::Left,
                        button_state: MouseButtonState::Up,
                        ..
                      } => {
                        println!("left click pressed and released");
                        // in this example, let's show and focus the main window when the tray is clicked
                        let app = tray.app_handle();
                        if let Some(window) = app.get_webview_window("main") {
                            let is_minimized =  window.is_minimized().unwrap();
                            let is_visible =  window.is_visible().unwrap();
                            println!("is_visible：{}",is_visible );
                            println!("is_minimized：{}",is_minimized);
                            if is_visible && is_minimized {
                                let _ = window.unminimize();
                            }
                            if !is_visible {
                                let _ = window.show();
                                    let _ = window.set_focus();
                                }
                            }
                      }
                      _ => {
                        println!("unhandled event {event:?}");
                      }
                    })
                  .build(app)?;
                  Ok(())
        })
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_clipboard_manager::init())
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_http::init())
        .plugin(tauri_plugin_os::init())
        .invoke_handler(tauri::generate_handler![
            post_request,
            convert_image_native,
            check_magick_available,
            convert_image_magick
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
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
async fn post_request(url: &str, token: &str, data: &str) -> Result<String, String> {
    let client = reqwest::Client::new();
    //     let headers = HeaderMap::from_iter([(AUTHORIZATION, HeaderValue::from_str(&format!("Bearer {}", token)).unwrap())]);
    let headers = HeaderMap::from_iter([
        (
            AUTHORIZATION,
            HeaderValue::from_str(&format!("Bearer {}", token)).unwrap(),
        ),
        (CONTENT_TYPE, HeaderValue::from_static("application/json")),
    ]);
    println!("<==============================================>");
    println!("url： {}", url.to_string());
    println!("token：{}", token.to_string());
    println!("data： {}", data.to_string());
    let chat_request: ChatRequest = serde_json::from_str(data).unwrap();
    println!("{:#?}", chat_request);

    let response = client
        .post(url)
        .headers(headers)
        .json(&chat_request)
        .send()
        .await
        .map_err(|e| format!("Failed to send request: {}", e))?;

    let text = response
        .text()
        .await
        .map_err(|e| format!("Failed to read response: {}", e))?;
    println!("错误：  {:#?}", text);
    println!("<==============================================>");
    Ok(text)
}

// ===================== 图片格式转换 =====================

use image::GenericImageView;
use image::ImageFormat;
use std::io::BufWriter;
use std::path::PathBuf;

#[derive(Debug, Deserialize)]
struct ConvertParams {
    /// 输入文件路径
    input: String,
    /// 输出文件路径
    output: String,
    /// 目标格式：png/jpg/jpeg/webp/gif/bmp/tiff/tga/ico/pnm 等（与 image crate 的 ImageFormat 枚举对应）
    format: String,
    /// 质量 1-100，仅对有损格式生效（jpg/webp）
    quality: Option<u8>,
    /// 缩放模式：none/width/height/percent/fixed
    resize_mode: Option<String>,
    /// 缩放数值（宽度/高度/百分比）
    resize_value: Option<u32>,
    /// 固定宽高模式下的高度
    resize_height: Option<u32>,
    /// 是否保持比例（fixed 模式下生效）
    keep_aspect: Option<bool>,
}

/// 将字符串格式名映射到 image crate 的 ImageFormat
fn parse_image_format(s: &str) -> Result<ImageFormat, String> {
    match s.to_lowercase().as_str() {
        "png" => Ok(ImageFormat::Png),
        "jpg" | "jpeg" => Ok(ImageFormat::Jpeg),
        "gif" => Ok(ImageFormat::Gif),
        "bmp" => Ok(ImageFormat::Bmp),
        "tiff" | "tif" => Ok(ImageFormat::Tiff),
        "webp" => Ok(ImageFormat::WebP),
        "ico" => Ok(ImageFormat::Ico),
        "tga" => Ok(ImageFormat::Tga),
        "pnm" | "ppm" | "pgm" | "pbm" => Ok(ImageFormat::Pnm),
        "qoi" => Ok(ImageFormat::Qoi),
        "hdr" => Ok(ImageFormat::Hdr),
        "dds" => Ok(ImageFormat::Dds),
        "avif" => Ok(ImageFormat::Avif),
        "heic" | "heif" => Err("HEIC/HEIF 不被 Rust image crate 原生支持，请切换到 ImageMagick 模式".into()),
        "jp2" | "j2k" => Err("JPEG2000 不被 Rust image crate 原生支持，请切换到 ImageMagick 模式".into()),
        "jxl" => Err("JPEG XL 不被 Rust image crate 原生支持，请切换到 ImageMagick 模式".into()),
        "psd" => Err("PSD 不被 Rust image crate 原生支持，请切换到 ImageMagick 模式".into()),
        "raw" | "cr2" | "nef" | "arw" | "dng" | "orf" | "raf" => {
            Err("RAW 不被 Rust image crate 原生支持，请切换到 ImageMagick 模式".into())
        }
        "sgi" | "xpm" | "xbm" | "svg" | "pdf" | "exr" | "ff" | "farbfeld" => {
            Err(format!("{} 不被 Rust image crate 默认 features 支持，请切换到 ImageMagick 模式", s))
        }
        other => Err(format!("不支持的输出格式: {}", other)),
    }
}

#[tauri::command]
async fn convert_image_native(params: ConvertParams) -> Result<String, String> {
    let input_path = PathBuf::from(&params.input);
    let output_path = PathBuf::from(&params.output);

    if !input_path.exists() {
        return Err(format!("输入文件不存在: {}", params.input));
    }

    // 确保输出目录存在
    if let Some(parent) = output_path.parent() {
        if !parent.as_os_str().is_empty() && !parent.exists() {
            std::fs::create_dir_all(parent).map_err(|e| format!("创建输出目录失败: {}", e))?;
        }
    }

    let fmt = parse_image_format(&params.format)?;

    // 读取图片（按通道解码，方便后续处理）
    let img = image::open(&input_path).map_err(|e| format!("读取图片失败: {}", e))?;

    // 缩放处理
    let processed = match params.resize_mode.as_deref().unwrap_or("none") {
        "none" => img,
        "width" => {
            let w = params.resize_value.unwrap_or(0);
            if w == 0 {
                img
            } else {
                img.resize(w, u32::MAX, image::imageops::FilterType::Lanczos3)
            }
        }
        "height" => {
            let h = params.resize_value.unwrap_or(0);
            if h == 0 {
                img
            } else {
                img.resize(u32::MAX, h, image::imageops::FilterType::Lanczos3)
            }
        }
        "percent" => {
            let p = params.resize_value.unwrap_or(100).max(1) as f32 / 100.0;
            let (w, h) = img.dimensions();
            let nw = ((w as f32) * p).round().max(1.0) as u32;
            let nh = ((h as f32) * p).round().max(1.0) as u32;
            img.resize(nw, nh, image::imageops::FilterType::Lanczos3)
        }
        "fixed" => {
            let w = params.resize_value.unwrap_or(0);
            let h = params.resize_height.unwrap_or(0);
            if w == 0 || h == 0 {
                img
            } else if params.keep_aspect.unwrap_or(true) {
                img.resize(w, h, image::imageops::FilterType::Lanczos3)
            } else {
                img.resize_exact(w, h, image::imageops::FilterType::Lanczos3)
            }
        }
        _ => img,
    };

    // 保存
    let file = std::fs::File::create(&output_path).map_err(|e| format!("创建输出文件失败: {}", e))?;
    let mut writer = BufWriter::new(file);

    // 质量处理（仅 jpeg/webp 生效）
    let q = params.quality.unwrap_or(92).clamp(1, 100);

    match fmt {
        ImageFormat::Jpeg => {
            let mut encoder = image::codecs::jpeg::JpegEncoder::new_with_quality(&mut writer, q);
            let rgb = processed.to_rgb8();
            encoder
                .encode(rgb.as_raw(), rgb.width(), rgb.height(), image::ExtendedColorType::Rgb8)
                .map_err(|e| format!("编码 JPEG 失败: {}", e))?;
        }
        ImageFormat::WebP => {
            let encoder = image::codecs::webp::WebPEncoder::new_lossless(&mut writer);
            let _ = encoder; // 暂未启用；改用下方通用写法
            processed
                .write_to(&mut writer, fmt)
                .map_err(|e| format!("编码 WebP 失败: {}", e))?;
        }
        _ => {
            processed
                .write_to(&mut writer, fmt)
                .map_err(|e| format!("编码失败: {}", e))?;
        }
    }

    Ok(params.output)
}

/// 校验系统中是否安装了 ImageMagick（magick --version）
/// 优先使用用户配置的 magick_path，否则在 PATH 中查找
#[tauri::command]
async fn check_magick_available(magick_path: Option<String>) -> Result<MagickCheckResult, String> {
    use std::process::Command;
    let exe = magick_path
        .as_deref()
        .filter(|s| !s.is_empty())
        .unwrap_or("magick");

    let output = Command::new(exe).arg("--version").output();

    match output {
        Ok(o) if o.status.success() => {
            let stdout = String::from_utf8_lossy(&o.stdout).to_string();
            let first_line = stdout.lines().next().unwrap_or("").to_string();
            Ok(MagickCheckResult {
                available: true,
                version: first_line,
                path: exe.to_string(),
            })
        }
        Ok(o) => {
            let stderr = String::from_utf8_lossy(&o.stderr).to_string();
            Ok(MagickCheckResult {
                available: false,
                version: stderr.lines().next().unwrap_or("").to_string(),
                path: exe.to_string(),
            })
        }
        Err(e) => Ok(MagickCheckResult {
            available: false,
            version: e.to_string(),
            path: exe.to_string(),
        }),
    }
}

#[derive(Debug, Serialize)]
struct MagickCheckResult {
    available: bool,
    version: String,
    path: String,
}

/// 使用 ImageMagick 进行图片转换（magick convert 命令）
#[tauri::command]
async fn convert_image_magick(
    magick_path: Option<String>,
    input: String,
    output: String,
    format: String,
    quality: Option<u8>,
    resize_mode: Option<String>,
    resize_value: Option<u32>,
    resize_height: Option<u32>,
    keep_aspect: Option<bool>,
) -> Result<String, String> {
    use std::process::Command;

    let exe = magick_path
        .as_deref()
        .filter(|s| !s.is_empty())
        .unwrap_or("magick");

    let mut args: Vec<String> = vec!["convert".to_string(), input.clone()];

    // 尺寸调整
    if let Some(mode) = resize_mode.as_deref() {
        if mode != "none" {
            let mut geo = String::new();
            if mode == "width" {
                geo = format!("{}x", resize_value.unwrap_or(0));
            } else if mode == "height" {
                geo = format!("x{}", resize_value.unwrap_or(0));
            } else if mode == "percent" {
                geo = format!("{}%", resize_value.unwrap_or(100));
            } else if mode == "fixed" {
                let w = resize_value.unwrap_or(0);
                let h = resize_height.unwrap_or(0);
                geo = format!("{}x{}", w, h);
                if !keep_aspect.unwrap_or(true) {
                    geo.push('!');
                }
            }
            if !geo.is_empty() {
                args.push("-resize".to_string());
                args.push(geo);
            }
        }
    }

    // 质量（仅对有损格式生效）
    if let Some(q) = quality {
        let fmt_lower = format.to_lowercase();
        if ["jpg", "jpeg", "webp", "avif", "heic", "heif", "jp2", "j2k", "jxl", "raw"].contains(&fmt_lower.as_str()) {
            args.push("-quality".to_string());
            args.push(q.to_string());
        }
    }

    args.push(output.clone());

    let result = Command::new(exe).args(&args).output();

    match result {
        Ok(o) if o.status.success() => Ok(output),
        Ok(o) => {
            let stderr = String::from_utf8_lossy(&o.stderr).to_string();
            Err(format!("magick 转换失败: {}", stderr.lines().next().unwrap_or("未知错误")))
        }
        Err(e) => Err(format!("执行 magick 失败: {}", e)),
    }
}