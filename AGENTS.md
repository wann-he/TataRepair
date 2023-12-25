# TaTa 项目 AGENTS.md

## 项目概述

- **名称**: TaTa
- **版本**: 0.0.10
- **产品标识**: `com.minority.dev`
- **技术栈**: Vue 3 + TypeScript + Vite + Element Plus + Tauri v2 + Rust
- **应用类型**: 桌面端多媒体处理工具（图片修复、视频转4K、文件小工具、音视频工具）
- **开发语言**: 前端 Vue/TS，后端 Rust

## 项目结构

```
Tata/
├── index.html                  # 入口 HTML
├── package.json                # Node 依赖与脚本
├── vite.config.ts              # Vite 配置
├── tsconfig.json               # TypeScript 配置
├── auto-imports.d.ts           # unplugin-auto-import 类型声明
├── components.d.ts             # unplugin-vue-components 类型声明
├── src/
│   ├── main.ts                 # Vue 应用入口
│   ├── App.vue                 # 根组件（含自定义标题栏与侧边导航）
│   ├── style.scss              # 全局 SCSS 样式
│   ├── vite-env.d.ts           # Vite 环境类型
│   ├── assets/                 # 静态资源（图标、主题样式）
│   │   ├── style/
│   │   │   ├── dark.scss       # 深色模式变量
│   │   │   ├── light.scss      # 浅色模式变量
│   │   │   └── theme.scss      # Element Plus 主题定制
│   │   └── *.svg               # 图标资源
│   ├── components/             # Vue 页面/业务组件
│   │   ├── pic-job.vue         # 图片修复页面
│   │   ├── video-job.vue       # 视频转4K页面
│   │   ├── file-job.vue        # 文件小工具页面
│   │   ├── media.vue           # 音视频工具页面
│   │   ├── img-convert.vue     # 图片格式转换页面（双模式：原生库 / ImageMagick）
│   │   ├── setting.vue         # 设置页面
│   │   ├── copyright.vue       # 版权信息页面
│   │   ├── video-card.vue      # 视频任务卡片（全局注册）
│   │   └── media-card-pair.vue # 媒体对比卡片
│   ├── router/
│   │   └── index.ts            # Vue Router 配置（Hash 模式）
│   ├── script/                 # 业务逻辑脚本
│   │   ├── constants.ts        # 常量与选项配置（模型、放大倍数等）
│   │   ├── filetools.ts        # 文件操作工具（提级、重命名、提取、合并隐藏）
│   │   ├── mp4ToImg.ts         # 视频处理核心（ffmpeg 调用、图片/视频互转）
│   │   ├── media.ts            # 音视频处理逻辑
│   │   ├── openai.ts           # AI 对话与 ffmpeg 命令生成（OpenAI / 通义千问）
│   │   ├── settings.ts         # 用户配置读写
│   │   ├── notification.ts     # 系统通知封装
│   │   ├── operation-history.ts# 操作历史记录
│   │   ├── undo-operation.ts   # 撤销操作逻辑
│   │   ├── imageFormats.ts     # 图片格式定义与双模式过滤工具
│   │   └── init.ts             # 初始化逻辑
│   ├── store/
│   │   └── index.ts            # 全局状态（仅 pids 数组）
│   ├── system/
│   │   └── index.ts            # 系统级窗口操作（最小化、关闭）
│   └── utils/
│       ├── formatTime.ts       # 时间格式化
│       └── throttle.ts         # 节流函数
├── src-tauri/                  # Tauri 后端（Rust）
│   ├── Cargo.toml              # Rust 依赖配置
│   ├── tauri.conf.json         # Tauri 核心配置
│   ├── build.rs                # Tauri 构建脚本
│   ├── src/main.rs             # Rust 入口（托盘、自定义命令）
│   ├── capabilities/           # Tauri 权限配置（v2 Capability）
│   │   ├── desktop.json        # 桌面端通用权限
│   │   └── migrated.json       # 从 v1 迁移的完整权限集
│   ├── conf/
│   │   └── user.conf           # 用户配置文件（打包资源）
│   ├── icons/                  # 应用图标（多尺寸）
│   └── gen/schemas/            # Tauri 生成的 ACL Schema
└── public/
    └── index.html / vite.svg
```

## 前端组件及使用方式

### 全局注册组件

在 `src/main.ts` 中全局注册：
- `ElementPlus` —— UI 框架
- `@element-plus/icons-vue` 所有图标
- `VideoCard`（`src/components/video-card.vue`）

### 路由与页面组件

| 路由 | 组件 | 功能说明 |
|------|------|----------|
| `/` / `/pic-job` | `pic-job.vue` | 图片修复：支持拖拽/选择图片，选择模型（Real-ESRGAN / SRMD）与放大倍数，批量处理 |
| `/video-job` | `video-job.vue` | 视频转4K：选择模型、编码方式、视频后缀、多线程，批量视频超分 |
| `/file-job` | `file-job.vue` | 文件小工具：文件提级、批量重命名、文件名提取、合并隐藏（图片+压缩包） |
| `/media` | `media.vue` | 音视频工具：音频提取、视频格式/倍速转换、AI 命令行模式 |
| `/img-convert` | `img-convert.vue` | 图片格式转换：支持 21 种格式互转，双模式（Rust 原生 image crate / 用户本地 ImageMagick），可选缩放 |
| `/setting` | `setting.vue` | 设置：通义千问 AK、可选模型配置、图片转换模式与 magick 路径 |
| `/copyright` | `copyright.vue` | 版权与开源协议说明 |

### 公共子组件

- **`video-card.vue`**
  - 用途：展示视频任务列表与多阶段进度
  - 关键 Props：`videos: Videoo[]`
  - 自动监听 `videos` 变化并调用 `getVideoInfo` 获取元数据

- **`media-card-pair.vue`**
  - 用途：左右对比展示媒体信息
  - 关键 Props：`mediaPairs: { left: MediaInfo; right: MediaInfo }[]`

### App.vue 布局

- **顶部标题栏**：自定义 SVG 按钮（主题切换、最小化、最大化/还原、关闭），`data-tauri-drag-region` 支持拖拽
- **左侧导航菜单**：垂直折叠菜单，路由跳转至各功能页
- **主内容区**：`<router-view>` + `<KeepAlive>` 缓存页面状态

## 核心依赖

### 前端 (package.json)

| 依赖 | 版本 | 说明 |
|------|------|------|
| `vue` | ^3.4.21 | 前端框架 |
| `vue-router` | ^4.6.4 | 路由 |
| `element-plus` | ^2.7.8 | UI 组件库 |
| `@element-plus/icons-vue` | ^2.0.9 | 图标库 |
| `@tauri-apps/api` | ^2.9.1 | Tauri 前端 API |
| `@tauri-apps/plugin-dialog` | ^2.7.0 | 文件/目录选择对话框 |
| `@tauri-apps/plugin-fs` | ^2.5.0 | 文件系统 |
| `@tauri-apps/plugin-shell` | ^2.3.5 | Shell 调用 |
| `@tauri-apps/plugin-*` | ^2.x | 其他 Tauri 官方插件（http, notification, os, process, clipboard, global-shortcut） |
| `openai` | ^4.56.0 | OpenAI SDK（AI 命令生成） |
| `pathe` | ^1.1.2 | 路径处理 |

### 开发依赖

- `vite` ^5.2.0 + `@vitejs/plugin-vue` ^5.0.4
- `typescript` ^5.2.2 + `vue-tsc` ^2.0.6
- `sass` ^1.54.4
- `unplugin-auto-import` / `unplugin-vue-components` —— Element Plus 自动导入
- `@tauri-apps/cli` ^2.9.6

### Rust (Cargo.toml)

| 依赖 | 版本 | 说明 |
|------|------|------|
| `tauri` | 2 | 核心框架，启用 `protocol-asset`, `tray-icon` |
| `tauri-build` | 2 | 构建依赖 |
| `serde` / `serde_json` | 1.x | 序列化 |
| `reqwest` | 0.11 | HTTP 客户端（Rust 侧） |
| `tokio` | 1 | 异步运行时 |
| `tauri-plugin-*` | 2 | 各官方插件对应 Rust 端 |
| `image` | 0.25 | 原生图片处理（PNG/JPEG/GIF/BMP/TIFF/WebP/ICO/TGA/PNM/HDR/DDS/QOI） |

## Tauri 重点配置

### tauri.conf.json

```json
{
  "build": {
    "beforeBuildCommand": "yarn build",
    "beforeDevCommand": "yarn dev",
    "frontendDist": "../dist",
    "devUrl": "http://localhost:5173"
  },
  "bundle": {
    "productName": "TaTa",
    "mainBinaryName": "TaTa",
    "version": "0.0.10",
    "identifier": "com.minority.dev",
    "category": "DeveloperTool",
    "targets": ["nsis"],
    "externalBin": [
      "bin/ffmpeg/ffmpeg",
      "bin/ffmpeg/ffprobe",
      "bin/realesrgan/realesrgan-ncnn-vulkan",
      "bin/srmd/srmd-ncnn-vulkan"
    ],
    "resources": [
      "bin",
      "models",
      "models-srmd",
      "conf"
    ],
    "icon": ["icons/32x32.png", "icons/128x128.png", "icons/128x128@2x.png", "icons/icon.icns", "icons/icon.ico"],
    "windows": {
      "wix": { "language": ["zh-CN"] }
    }
  },
  "app": {
    "withGlobalTauri": true,
    "windows": [{
      "title": "TaTa",
      "width": 1000,
      "height": 768,
      "minWidth": 800,
      "minHeight": 512,
      "decorations": false,
      "center": true,
      "dragDropEnabled": false,
      "useHttpsScheme": true
    }],
    "security": {
      "assetProtocol": { "scope": ["*"], "enable": true },
      "csp": "default-src: 'self'; media-src 'self' asset:; connect-src ipc: http://ipc.localhost"
    }
  },
  "plugins": {
    "shell": { "open": "*" }
  }
}
```

### 可执行文件 / Sidecar 配置

Tauri 将以下外部二进制作为 `sidecar` 打包：

| 路径 | 用途 |
|------|------|
| `bin/ffmpeg/ffmpeg` | 音视频处理核心 |
| `bin/ffmpeg/ffprobe` | 音视频信息探测 |
| `bin/realesrgan/realesrgan-ncnn-vulkan` | Real-ESRGAN 图片/视频超分 |
| `bin/srmd/srmd-ncnn-vulkan` | SRMD 老照片修复 |

调用方式：
```ts
import { Command } from '@tauri-apps/plugin-shell'
Command.sidecar('bin/ffmpeg/ffmpeg', ['-i', input, output])
```

> **ImageMagick 不再作为 sidecar 打包**。图片格式转换功能由 Rust 端 `image` crate 提供基础能力，扩展格式（HEIC/RAW/PSD/SVG/PDF 等）由用户本地安装的 ImageMagick 提供（需在设置页配置 `magick_path`），由 Rust 端通过 `std::process::Command` 调用。

### 权限配置 (Capability)

#### `src-tauri/capabilities/migrated.json`

这是从 Tauri v1 迁移而来的**主要权限文件**，授予 `main` 窗口：

- **文件系统**: `fs:allow-read-file`, `fs:allow-write-file`, `fs:allow-read-dir`, `fs:allow-mkdir`, `fs:allow-remove`, `fs:allow-rename`, `fs:allow-exists` 等
  - Scope: `$RESOURCE/*`, `C:/**/*`, `D:/**/*`, `E:/**/*`, `F:/**/*`
- **窗口控制**: 最大化、最小化、隐藏、显示、关闭、设置大小/位置等全套权限
- **Shell 执行**: 
  - Sidecar: `bin/ffmpeg/ffmpeg`, `bin/ffmpeg/ffprobe`, `bin/realesrgan/realesrgan-ncnn-vulkan`, `bin/srmd/srmd-ncnn-vulkan`
  - 系统命令: `cmd` (Windows), `node`
- **Shell 打开**: `shell:allow-open`
- **对话框**: `dialog:allow-open`, `dialog:allow-save`, `dialog:allow-message`, `dialog:allow-ask`, `dialog:allow-confirm`
- **HTTP**: 允许所有 `http://**/` 和 `https://**/` 请求
- **通知**: `notification:default`
- **全局快捷键**: 注册/注销
- **OS 信息**: 平台、版本、架构等
- **进程**: 重启/退出
- **剪贴板**: 读写文本

#### `src-tauri/capabilities/desktop.json`

- 平台: `macOS`, `windows`, `linux`
- 权限: `global-shortcut:default`

## Rust 后端核心逻辑 (`src-tauri/src/main.rs`)

### 托盘 (System Tray)

- 左键点击托盘图标：显示/恢复主窗口
- 右键菜单：显示 / 隐藏 / 退出
- 使用 `TrayIconBuilder` + `Menu` 构建

### 自定义命令

```rust
#[tauri::command]
async fn post_request(url: &str, token: &str, data: &str) -> Result<String, String>

#[tauri::command]
async fn convert_image_native(params: ConvertParams) -> Result<String, String>

#[tauri::command]
async fn convert_image_magick(input: String, output: String,
                              magick_path: Option<String>) -> Result<String, String>

#[tauri::command]
async fn check_magick_available(magick_path: Option<String>)
    -> Result<MagickCheckResult, String>
```

- **`post_request`**：代理发送 HTTP POST 请求（用于调用通义千问 API）
- **`convert_image_native`**：使用 Rust `image` crate 进行图片读取、缩放、编码输出（支持 4 种缩放模式、JPEG 质量参数）
- **`convert_image_magick`**：通过 `std::process::Command` 调用本地 `magick` 二进制进行转换
- **`check_magick_available`**：执行 `magick --version` 校验本地 ImageMagick 是否安装可用
- 前端调用：`invoke('post_request', { url, token, data })` 等

### 插件初始化

```rust
.plugin(tauri_plugin_notification::init())
.plugin(tauri_plugin_global_shortcut::init())
.plugin(tauri_plugin_shell::init())
.plugin(tauri_plugin_fs::init())
.plugin(tauri_plugin_clipboard_manager::init())
.plugin(tauri_plugin_process::init())
.plugin(tauri_plugin_dialog::init())
.plugin(tauri_plugin_http::init())
.plugin(tauri_plugin_os::init())
```

## 业务脚本说明

### `script/mp4ToImg.ts`

- **视频转图片序列**: `video2Img()` —— 调用 `ffmpeg` 提取帧
- **图片序列转视频**: `img2Video()` —— 调用 `ffmpeg` 合成视频
- **视频超分处理**: 调用 `realesrgan-ncnn-vulkan` 或 `srmd-ncnn-vulkan` sidecar
- **视频信息获取**: `getVideoInfo()` —— 使用 `ffprobe` 获取分辨率、时长、帧率、比特率

### `script/filetools.ts`

- `upgradeFile2Curr()` —— 文件提级（将子目录文件移至当前目录）
- 批量重命名、文件名提取、合并隐藏等文件操作
- 使用 `@tauri-apps/plugin-fs` 进行文件系统操作

### `script/openai.ts`

- `completeChat()` —— 根据用户自然语言需求生成 ffmpeg 命令
- 支持 **OpenAI GPT** 和 **通义千问 (Qwen)** 两种模型
- 通义千问通过 Rust 侧 `post_request` 命令代理请求（解决 CORS）
- Prompt 模板要求 AI 仅返回 ffmpeg 命令行，不做多余解释

### `script/settings.ts`

- `readConfig()` / `setConfig()` —— 读写 `conf/user.conf`（打包资源路径）
- 配置结构：
  ```ts
  interface UserConf {
      gpt: { ak: string; model: 'gpt-3.5-turbo-1106' | 'gpt-4o-mini' }
      qwen: { ak: string; models: string[]; optional_models: string[] }
      img_convert: {
          mode: 'native' | 'magick'   // 图片转换模式
          magick_path: string          // magick 可执行文件绝对路径
      }
  }
  ```
- `readConfig` 对老用户配置做兜底（缺字段时使用默认值），保证向后兼容

### `script/imageFormats.ts`

- 定义 21 种图片格式的元数据（`extensions` / `magickFormat` / `nativeFormat` / `hasQuality`）
- 提供 `getInputFormats(mode)` / `getOutputFormats(mode)` / `isExtensionSupported(ext, mode)` 等工具
- **展示以 magick 支持的格式为准**（始终列出 21 种），native 模式自动将不支持的格式置灰（`disabled`）

### `components/img-convert.vue`

- 顶部模式标签：实时显示当前转换模式（原生/magick）
- 输入格式选择器 + 输出格式选择器：根据所选模式动态过滤/置灰
- 文件选择对话框与拖拽上传：根据模式动态切换 `extensions` 过滤器
- 缩放选项：不缩放 / 按宽度 / 按高度 / 固定宽高 / 按百分比（保留可配置保持宽高比）
- 转换完成后支持打开输出目录

## 构建与运行

### 开发

```bash
yarn dev          # 启动 Vite 开发服务器
yarn tauri:dev    # 启动 Tauri 开发模式
```

### 生产构建

```bash
yarn build        # Vite 构建前端
yarn tauri:build  # Tauri 打包桌面应用
```

### 脚本

```json
{
  "tauri": "tauri",
  "tauri:dev": "tauri dev",
  "tauri:build": "tauri build",
  "build": "vite build",
  "dev": "vite"
}
```

## 主题与样式

- **Element Plus 主题定制**: `src/assets/style/theme.scss`
- **深色模式**: `src/assets/style/dark.scss`
- **浅色模式**: `src/assets/style/light.scss`
- **全局样式**: `src/style.scss`（自定义标题栏、拖拽区域、滚动条等）
- **暗黑模式切换**: 使用 `@vueuse/core` 的 `useDark` / `useToggle`

## 注意事项

1. **自定义标题栏**: `decorations: false`，完全由 Vue 实现窗口控制（最小化、最大化、关闭）
2. **禁止右键**: `document.oncontextmenu = () => false`
3. **Sidecar 路径**: 所有外部二进制通过 `Command.sidecar()` 调用，需在 `tauri.conf.json > bundle > externalBin` 声明
4. **资源目录**: `bin/`, `models/`, `models-srmd/`, `conf/` 会被打包进应用资源目录，运行时通过 `resolveResource()` 访问
5. **窗口拖拽**: 标题栏元素添加 `data-tauri-drag-region` 属性实现拖拽移动
6. **AI 功能**: 需要用户手动配置通义千问 AK，配置保存在 `conf/user.conf`
7. **图片转换双模式**:
   - **native 模式**（默认）：由 Rust `image` crate 处理，仅支持 `imageFormats.ts` 中 `nativeFormat` 非空的格式
   - **magick 模式**：由 Rust 端 `std::process::Command` 调用本地 `magick` 可执行文件，支持全部 21 种格式（需用户自行安装 ImageMagick）
   - 设置页提供「测试是否可用」按钮：调用 `check_magick_available` 校验 `magick --version`，失败时提示并提供 [ImageMagick 下载页](https://imagemagick.org/download/#gsc.tab=0)
   - 切换模式时，UI 自动重新过滤可用的输入/输出格式（不支持的置灰）
8. **magick 命令通过 Rust 端 `std::process::Command` 调用**，不经过 Tauri shell scope，因此 settings 中 `magick_path` 可填写任意路径而无需额外权限配置
9. **打包目标**: `targets: ["nsis"]`，使用 NSIS 安装程序（不再生成 MSI，避免 WiX `light.exe` 失败问题）

## 文档维护规范

为帮助后续 Agent、贡献者和维护者快速理解项目，所有可能显著影响项目结构、功能、配置或依赖的变更，都应及时同步到以下文档：

### 必须同步的文档

| 文档 | 用途 | 何时更新 |
|------|------|----------|
| `README.md` | 面向中文用户的主说明文档 | 新增功能、修改安装/使用方式、变更依赖、调整项目结构、更新版本号与更新日志时 |
| `README_EN.md` | 面向英文用户的说明文档 | `README.md` 发生上述变更时，必须同步更新英文版，保持两份文档结构一致 |
| `AGENTS.md` | 面向 AI 助手与维护者的项目上下文 | 发生架构调整、新增/移除模块、修改核心配置、变更权限或安全策略、新增重要业务脚本时 |

### 同步原则

1. **先读后改**：修改前先读取相关文档，确保上下文一致。
2. **双语文档同步**：`README.md` 与 `README_EN.md` 应保持章节结构一致；中文版变更后，英文版应同步翻译。
3. **版本号与更新日志**：
   - 版本号维护在 `src-tauri/tauri.conf.json` 的 `version` 字段。
   - 发布前同步更新 `README.md` / `README_EN.md` 的「更新日志 / Changelog」章节，并更新顶部的 version badge。
4. **依赖与配置**：新增前端依赖、Rust crate、外部二进制或用户配置字段时，需同步更新 `AGENTS.md` 的依赖表、项目结构、配置结构说明。
5. **图片与静态资源**：若向 `.github/assets/` 等目录新增或移动 README 用图，需同步更新所有引用这些图片的 Markdown 文件路径。
6. **代码审查扫描**：执行代码扫描或合并请求审查时，若发现文档与实际代码不一致，应视情况更新文档，或在审查意见中明确要求更新文档。

### README 中的固定章节

维护时请保留以下章节，并在变更时同步更新内容：

- 功能特性 / Features
- 技术栈 / Tech Stack
- 项目结构 / Project Structure
- 开发指南 / Development Guide
- 打包构建 / Build
- 下载与安装 / Download and Installation
- 使用说明 / Usage
- 常见问题 / FAQ
- 更新日志 / Changelog
- 开源维护说明 / Open Source Maintenance Notes
- 致谢 / Acknowledgements
- 许可证 / License
- 请作者喝杯咖啡 / Buy Me a Coffee
