# 贡献指南 | Contributing Guide

感谢你对 TaTa 项目的关注！欢迎通过以下方式参与贡献。

Thank you for your interest in the TaTa project! We welcome contributions in the following ways.

---

## 贡献方式

### 报告 Bug

1. 在 [Issues](https://github.com/wann-he/TataRepair/issues) 中搜索是否已有相同问题
2. 如无重复，使用 **Bug Report** 模板创建新 Issue
3. 请提供尽可能详细的信息：操作系统、软件版本、复现步骤、预期行为与实际行为

### 提出功能建议

1. 在 [Issues](https://github.com/wann-he/TataRepair/issues) 中搜索是否已有相同建议
2. 如无重复，使用 **Feature Request** 模板创建新 Issue
3. 描述你期望的功能与使用场景

### 提交代码

#### 开发环境准备

参考 [README - 开发指南](./README.md#开发指南) 搭建开发环境。

#### 提交流程

1. **Fork** 本仓库到你的 GitHub 账号
2. 从 `main` 分支创建新的功能分支：
   ```bash
   git checkout -b feature/your-feature-name
   # 或
   git checkout -b fix/your-fix-name
   ```
3. 进行开发与测试，确保 `npm run tauri:dev` 可正常启动
4. 提交代码，commit message 请遵循以下格式：
   ```
   type(scope): 简短描述

   可选的详细说明
   ```
   - **type**: `feat`（新功能）/ `fix`（修复）/ `docs`（文档）/ `style`（样式）/ `refactor`（重构）/ `chore`（构建/工具）
   - **scope**: 可选，如 `video` / `image` / `file` / `media` / `rust` 等
   - 示例：`feat(image): 新增 HEIC 格式支持` / `fix(video): 修复多线程进度显示异常`
5. 推送到你的 Fork 并创建 **Pull Request** 至本仓库的 `main` 分支
6. 在 PR 描述中说明变更内容与关联的 Issue（如有）

#### 代码规范

- **前端**：Vue 3 组合式 API + TypeScript，遵循项目已有代码风格
- **后端**：Rust，遵循 `cargo fmt` 和 `cargo clippy` 规范
- **样式**：使用项目已有的 SCSS 变量与 Element Plus 主题系统
- **不要**引入不必要的依赖
- **不要**修改与本次变更无关的代码

#### 注意事项

- 外部二进制文件（ffmpeg / realesrgan / srmd）与模型文件**不要提交到仓库**
- `conf/user.conf` 结构变更时，务必在 `src/script/settings.ts` 的 `readConfig()` 中为老用户提供默认值
- 新增 Tauri 权限时，需同步更新 `src-tauri/capabilities/` 下的权限配置
- 新增 sidecar 时，需同步更新 `tauri.conf.json` 的 `externalBin` 字段与权限配置

### 完善文档

- 修复文档中的错误或不准确之处
- 补充使用示例或常见问题
- 翻译文档（中英双语）

---

## 行为准则

- 友善、尊重地对待每一位贡献者
- 专注于问题本身，不对个人进行攻击
- 欢迎不同水平的开发者参与，乐于帮助新人

---

## 许可证

提交代码即表示你同意你的贡献将按照本项目的 [LICENSE](./LICENSE) 进行授权。
