# 安全策略 | Security Policy

感谢你关注 TaTa 的安全性。我们非常重视安全漏洞，并希望确保它们被负责任地披露和处理。

Thank you for caring about the security of TaTa. We take security vulnerabilities seriously and want to ensure they are disclosed and handled responsibly.

---

## 支持的版本 | Supported Versions

| 版本 | 是否支持 |
| ------- | -------- |
| 0.0.10 | :white_check_mark: |
| < 0.0.10 | :x: |

我们仅为最新发布版本提供安全修复。

We only provide security fixes for the latest released version.

---

## 报告漏洞 | Reporting a Vulnerability

**请不要通过公开的 GitHub Issue 报告安全漏洞。**

**Please do not report security vulnerabilities through public GitHub Issues.**

### 报告方式 | How to Report

1. **GitHub 私有安全报告（推荐）**：前往 [Security Advisories](https://github.com/wann-he/TataRepair/security/advisories/new) 提交
2. **邮件**：发送至项目维护者，包含以下信息：
   - 漏洞类型（如 XSS、命令注入、权限绕过等）
   - 受影响的版本与功能模块
   - 复现步骤
   - 潜在影响
   - 如有可能，提供修复建议

### 响应时间 | Response Time

- 我们将在 **72 小时内** 确认收到你的报告
- 初步评估将在 **7 天内** 完成
- 修复时间视漏洞严重程度而定，严重漏洞将优先处理

### 披露政策 | Disclosure Policy

- 在修复发布前，请勿公开披露漏洞详情
- 我们会在修复发布后致谢报告者（除非你要求匿名）

---

## 已知安全措施 | Known Security Measures

- AI 命令行模式仅允许执行 `ffmpeg` 命令，其他命令会被拒绝
- 通义千问 API 请求通过 Rust 后端 `post_request` 命令代理，避免前端直接暴露 API Key
- 用户 API Key 保存在本地 `conf/user.conf`，不会上传至任何服务器
- ImageMagick 调用通过 Rust 端 `std::process::Command`，不经过 Tauri shell scope，用户需自行确保 `magick_path` 指向可信的可执行文件

---

## 安全最佳实践 | Security Best Practices for Users

- 不要将软件安装在需要管理员权限的目录（如 C 盘 Program Files），以免配置写入权限问题
- 配置通义千问 AK 时，确保不在公共场合分享配置文件
- 使用 ImageMagick 模式时，确保 `magick_path` 指向官方来源的 ImageMagick 可执行文件
- 仅从 [GitHub Releases](https://github.com/wann-he/TataRepair/releases) 下载本软件，避免第三方来源的篡改
