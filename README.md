# TaTa

> 基于 ffmpeg 与 Real-ESRGAN / SRMD 的桌面端多媒体处理工具，支持动漫视频转 4K、图片修复、图片格式转换、文件小工具与音视频工具。

[![Version](https://img.shields.io/badge/version-0.0.10-blue.svg)](./src-tauri/tauri.conf.json)
[![Tauri](https://img.shields.io/badge/Tauri-v2-orange.svg)](https://tauri.app)
[![Vue](https://img.shields.io/badge/Vue-3.4-brightgreen.svg)](https://vuejs.org)
[![Platform](https://img.shields.io/badge/platform-windows-lightgrey.svg)](#下载与安装)
[![GitHub stars](https://img.shields.io/github/stars/wann-he/TaTa?style=social)](https://github.com/wann-he/TataRepair/stargazers)

本项目在 [mp4To4K-rust](https://github.com/Minori-ty/mp4To4K-rust) 基础上优化再开发，修复了原项目无法使用的问题，并陆续新增了多项功能。如果你觉得这个软件对你有帮助，欢迎 Star 支持。

[简体中文](./README.md) | [English](./README_EN.md)

---

## 目录

- [功能特性](#功能特性)
- [技术栈](#技术栈)
- [项目结构](#项目结构)
- [开发指南](#开发指南)
- [打包构建](#打包构建)
- [下载与安装](#下载与安装)
- [使用说明](#使用说明)
- [常见问题](#常见问题)
- [更新日志](#更新日志)
- [开源维护说明](#开源维护说明)
- [致谢](#致谢)
- [许可证](#许可证)

---

## 功能特性

### 图片与视频修复

- **图片修复**：支持拖拽/选择图片批量处理，可选择 Real-ESRGAN 或 SRMD 模型与放大倍数
- **视频转 4K**：选择模型、编码方式、视频后缀、多线程数，批量进行视频超分

### 图片格式转换

- 支持 **21 种图片格式**互转（PNG / JPEG / GIF / BMP / TIFF / WebP / ICO / TGA / PNM / HDR / DDS / QOI / HEIC / RAW / PSD / SVG / PDF 等）
- **双模式切换**：
  - **原生模式（默认）**：由 Rust `image` crate 处理，无需额外依赖，覆盖常见格式
  - **ImageMagick 模式**：调用用户本地 `magick` 可执行文件，支持全部 21 种格式（需自行安装 ImageMagick）
- 缩放选项：不缩放 / 按宽度 / 按高度 / 固定宽高 / 按百分比

### 文件小工具

- **文件提级**：将选中文件夹下所有子文件夹的文件提取到当前目录
- **批量重命名**：根据选中规则批量重命名文件夹下所有文件
- **文件名提取**：批量提取文件名
- **合并隐藏**：图片 + 压缩包合并隐藏

### 音视频工具

- **音频提取**：批量提取视频中的音频文件至同目录
- **视频格式转换**：批量转换视频至指定格式
- **视频倍速转换**
- **AI 命令行模式**：配置[通义千问模型 AK](https://help.aliyun.com/zh/model-studio/getting-started/first-api-call-to-qwen) 后，可根据自然语言描述生成 ffmpeg 命令并执行

### 其他特性

- **暗黑模式**：支持浅色 / 深色外观切换
- **系统托盘**：最小化到托盘，右键菜单支持显示 / 隐藏 / 退出
- **自定义标题栏**：原生窗口控制（最小化、最大化、关闭）+ 拖拽移动
- **操作历史与撤销**：记录文件操作历史，支持撤销
- **系统通知**：任务完成时推送系统通知
- **全局快捷键**：支持自定义全局快捷键

---

## 技术栈

| 层级 | 技术 | 说明 |
|------|------|------|
| 前端框架 | Vue 3 + TypeScript | 组合式 API |
| 构建工具 | Vite 5 | 开发与打包 |
| UI 组件库 | Element Plus 2.7 | 自动按需导入 |
| 路由 | Vue Router 4 | Hash 模式 |
| 桌面框架 | Tauri v2 | Rust 后端 |
| 后端语言 | Rust (edition 2021) | 异步 tokio |
| 图片处理 | image crate 0.25 | Rust 原生图片编解码 |
| HTTP 客户端 | reqwest 0.11 | Rust 侧代理请求 |
| AI SDK | openai 4.x | 通义千问 / GPT 命令生成 |
| 外部二进制 | ffmpeg / ffprobe / realesrgan-ncnn-vulkan / srmd-ncnn-vulkan | 作为 sidecar 打包 |

---

## 项目结构

```
TaTa/
├── src/                        # 前端源码
│   ├── components/             # 页面组件（pic-job / video-job / file-job / media / img-convert / setting / copyright）
│   ├── script/                 # 业务逻辑（视频处理、文件工具、AI、设置、图片格式等）
│   ├── router/                 # 路由配置
│   ├── store/                  # 全局状态
│   ├── system/                 # 窗口操作
│   ├── utils/                  # 工具函数
│   └── assets/                 # 静态资源与主题样式
├── src-tauri/                  # Tauri 后端
│   ├── src/main.rs             # Rust 入口（托盘、自定义命令）
│   ├── bin/                    # 外部可执行文件（ffmpeg / realesrgan / srmd）
│   ├── models/                 # Real-ESRGAN 模型
│   ├── models-srmd/            # SRMD 模型
│   ├── conf/user.conf          # 用户配置文件
│   ├── capabilities/           # Tauri v2 权限配置
│   └── tauri.conf.json         # Tauri 核心配置
├── package.json
└── vite.config.ts
```

详细架构与组件说明参见 [AGENTS.md](./AGENTS.md)。

---

## 开发指南

### 环境要求

- [Node.js](https://nodejs.org/) 18+ 与 npm / yarn
- [Rust](https://www.rust-lang.org/) 1.80+（含 cargo）
- [Tauri CLI v2](https://tauri.app/start/prerequisites/) 的系统依赖

### 步骤

1. **克隆代码**

   ```bash
   git clone https://github.com/wann-he/TaTa.git
   cd TaTa
   ```  

2. **下载外部二进制与模型**（仓库不包含这些大文件）

   将以下文件放入对应目录：

   | 文件 | 目标目录 |
   |------|----------|
   | `ffmpeg.exe` / `ffprobe.exe` | `src-tauri/bin/ffmpeg/` |
   | `realesrgan-ncnn-vulkan.exe` | `src-tauri/bin/realesrgan/` |
   | `srmd-ncnn-vulkan.exe` | `src-tauri/bin/srmd/` |
   | Real-ESRGAN 训练模型（如 `realesr-animevideov3-x4.pth` 等） | `src-tauri/models/` |
   | SRMD 模型 | `src-tauri/models-srmd/` |

   > 下载地址：
   > - ffmpeg: <https://www.gyan.dev/ffmpeg/builds/> 或 <https://github.com/BtbN/FFmpeg-Builds/releases>
   > - Real-ESRGAN: <https://github.com/xinntao/Real-ESRGAN/releases>
   > - SRMD: <https://github.com/cszn/SRMD>（需自行编译或寻找预编译版本）

3. **安装依赖**

   ```bash
   npm install
   # 或
   yarn
   ```

4. **启动开发模式**

   ```bash
   npm run tauri:dev
   ```

---

## 打包构建

```bash
npm run tauri:build
```

打包完成后，在 `src-tauri/target/release/bundle/` 目录下可找到相关文件：

- `nsis/` 目录下为 `.exe` 安装程序
- `msi/` 目录下为 `.msi` 安装程序（如启用）

> 当前默认打包目标为 `nsis`，使用 NSIS 安装程序。如需其他目标，请修改 `src-tauri/tauri.conf.json` 中的 `bundle.targets` 字段。

---

## 下载与安装

- 前往 [Releases 页面](https://github.com/wann-he/TaTa/releases) 下载最新版本的安装包
- 双击 `.exe` 安装程序按提示完成安装
- **建议不要安装在 C 盘**，否则写配置可能因权限原因失败

> 当前仅配置了 Windows 系统下的打包。更多平台配置参见 [Tauri 官方文档](https://tauri.app/zh-cn/)。

---

## 使用说明

### AI 命令行模式

1. 前往[阿里云百炼](https://help.aliyun.com/zh/model-studio/getting-started/first-api-call-to-qwen)开通通义千问服务并获取 API Key
2. 在应用「设置」页面填入 AK，并选择模型
3. 在「音视频工具 - 命令行模式-AI」中用自然语言描述需求，AI 会生成 ffmpeg 命令
4. 也可直接在「生成命令」框内手动输入 ffmpeg 命令执行

> 注意：仅支持 ffmpeg 命令，其他命令无法执行。

### 图片转换模式切换

- **原生模式**：开箱即用，支持常见格式
- **ImageMagick 模式**：需先安装 [ImageMagick](https://imagemagick.org/download/#gsc.tab=0)，并在设置页配置 `magick` 可执行文件路径，点击「测试是否可用」校验

### 配置文件

用户配置保存在 `conf/user.conf`，结构如下：

```json
{
  "gpt": { "ak": "" },
  "qwen": {
    "ak": "",
    "models": ["qwen-plus", "qwen-max", "qwen-turbo"],
    "optional_models": ["qwen-plus", "qwen-max", "qwen-turbo"]
  },
  "img_convert": {
    "mode": "native",
    "magick_path": ""
  }
}
```

配置读取对老用户做了字段兜底（缺字段时使用默认值），保证向后兼容。

---

## 常见问题

**Q：视频超分很慢？**
A：视频任务比较依赖硬件环境。参考原作者数据：5 秒视频放大 4 倍约需 5-8 分钟。实测在 6 核 16G 的 Win11 电脑上，2 倍放大一个 5s、360P 视频，多线程数 5，需要 2 分钟以上。如果电脑配置一般，请谨慎选择「多线程」执行，容易造成电脑死机。

**Q：Real-ESRGAN 对真人视频效果不好？**
A：realesrgan 相关模型适用于动漫动画相关的画面修复，在其他类型视频上可能表现不尽如人意。可尝试切换 SRMD 模型用于老照片/老视频修复。

**Q：不知道相关配置含义？**
A：使用默认选项即可。

**Q：配置写入失败？**
A：尽量不要把软件安装在 C 盘，不然写配置可能因权限原因失败。

---

## 更新日志

### v0.0.10

- 新增图片格式转换功能（21 种格式互转，双模式：原生 / ImageMagick）
- 新增 SRMD 模型支持（老照片修复）
- 新增系统托盘（最小化到托盘 + 右键菜单）
- 新增操作历史与撤销功能
- 新增系统通知与全局快捷键支持
- 升级至 Tauri v2
- 优化用户配置向后兼容

### v0.0.8

- 新增文件小工具：文件提级、批量重命名
- 新增音视频工具：音频提取、视频格式转换
- 新增暗黑模式
- 新增 AI 命令行模式（通义千问生成 ffmpeg 命令）

### v0.0.3 及以前

- 基础图片修复与视频转 4K 功能
- 基于 [mp4To4K-rust](https://github.com/Minori-ty/mp4To4K-rust) 优化再开发

---

## 开源维护说明

本项目维护过程中有以下注意事项，供贡献者与维护者参考：

### 1. 许可证合规

- 本项目使用了基于 **GPL 协议**的 [ffmpeg](https://github.com/FFmpeg/FFmpeg) 和基于 **BSD 协议**的 [Real-ESRGAN](https://github.com/xinntao/Real-ESRGAN)
- 由于 ffmpeg 采用 GPL，分发时需注意 GPL 传染性条款；Real-ESRGAN 采用 BSD，需保留版权声明
- 二次开发商用被允许，但作者不对二次开发的软件承担任何后果

### 2. 大文件与二进制管理

- `ffmpeg`、`ffprobe`、`realesrgan-ncnn-vulkan`、`srmd-ncnn-vulkan` 可执行文件及模型文件**不纳入版本控制**（已在 `.gitignore` 中排除）
- 用户/开发者需自行下载放入对应目录，README 中已说明
- 如需分发预编译包，建议通过 **GitHub Releases** 上传，而非提交到仓库

### 3. 版本号管理

- 版本号维护在 `src-tauri/tauri.conf.json` 的 `version` 字段
- 建议遵循 [语义化版本](https://semver.org/lang/zh-CN/)（SemVer）：`MAJOR.MINOR.PATCH`
- 每次发布前同步更新版本号与「更新日志」章节

### 4. 向后兼容

- `conf/user.conf` 配置结构变更时，`readConfig()` 已做字段兜底处理
- 新增配置字段时，务必在读取逻辑中为老用户提供默认值，避免升级后配置失效

### 5. 安全注意事项

- AI 命令行模式仅允许执行 ffmpeg 命令，其他命令被拒绝
- 通义千问 API 请求通过 Rust 侧 `post_request` 命令代理，避免前端直接暴露 AK 与跨域问题
- 用户 AK 保存在本地 `conf/user.conf`，不会上传任何服务器
- **建议添加 `SECURITY.md`** 说明安全漏洞上报流程

### 6. 贡献流程建议

- 欢迎通过 Issue 反馈 Bug 或提出功能建议
- PR 请基于最新 `main` 分支，并确保 `npm run tauri:dev` 可正常启动
- **建议添加 `CONTRIBUTING.md`** 与 `.github/ISSUE_TEMPLATE/` 规范协作流程

### 7. Release 流程

1. 更新 `src-tauri/tauri.conf.json` 中的 `version`
2. 更新 README「更新日志」章节
3. 执行 `npm run tauri:build` 生成安装包
4. 在 GitHub 创建新 Release，上传 `.exe` / `.msi` 安装包
5. 填写 Release Notes，标注变更与已知问题

### 8. 学术引用

Real-ESRGAN 为学术项目，若用于研究用途，请按上游仓库要求引用相关论文。详见 <https://github.com/xinntao/Real-ESRGAN#citation>。

---

## 致谢

- [mp4To4K-rust](https://github.com/Minori-ty/mp4To4K-rust) —— 原项目基础
- [FFmpeg](https://github.com/FFmpeg/FFmpeg) —— 音视频处理核心（GPL）
- [Real-ESRGAN](https://github.com/xinntao/Real-ESRGAN) —— 图片/视频超分模型（BSD）
- [SRMD](https://github.com/cszn/SRMD) —— 老照片修复模型
- [Tauri](https://tauri.app) —— 桌面应用框架
- [Vue 3](https://vuejs.org) / [Element Plus](https://element-plus.org) —— 前端框架与组件库
- [ImageMagick](https://imagemagick.org) —— 扩展图片格式转换支持

---

## 许可证

本软件**开源免费、非商用**，仅供学习和日常使用。软件没有任何读取隐私的程序。

- 本软件使用了基于 GPL 协议的 [ffmpeg](https://github.com/FFmpeg/FFmpeg) 和基于 BSD 协议的 [Real-ESRGAN](https://github.com/xinntao/Real-ESRGAN)，两者均是开源可商用协议
- 本软件允许二次开发商用，但是本作者不对二次开发的软件承担任何后果

> 项目地址：<https://github.com/wann-he/TaTa>

---

## 请作者喝杯咖啡

如果这个项目对你有帮助，欢迎请作者喝杯咖啡！☕

| 支付宝 | 微信支付 |
|--------|----------|
| ![支付宝](./.github/assets/alipay.png) | ![微信支付](./.github/assets/weixin.png) |
