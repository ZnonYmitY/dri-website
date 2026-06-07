# 网站维护说明

## 公开发布方案

本项目可以通过 GitHub 解决公开访问问题。推荐使用 GitHub Pages：把网站代码推送到 GitHub 仓库后，在仓库设置中开启 Pages，即可生成一个公开 URL，其他人可以直接访问。

适用场景：
- 静态网站：HTML、CSS、JavaScript、React/Vue/Vite 构建后的前端页面。
- 展示型网站：个人主页、项目介绍页、活动页、作品集、文档站。
- 不需要后端数据库或私有服务的轻量应用。

不适用或需要额外方案的场景：
- 需要长期运行后端服务。
- 需要数据库、登录态、服务端接口或复杂权限控制。
- 需要隐藏源码或部署私有业务逻辑。

如果后续网站需要后端能力，可以保留 GitHub 托管代码，同时把线上部署迁移到 Vercel、Netlify、Cloudflare Pages 或自有服务器。

## GitHub Pages 操作流程

1. 在 GitHub 创建一个新仓库，例如 `dri-website`。
2. 在本地项目中绑定远程仓库：

```bash
git remote add origin git@github.com:<your-name>/dri-website.git
```

3. 提交并推送代码：

```bash
git add .
git commit -m "Initial website setup"
git push -u origin main
```

4. 打开 GitHub 仓库页面，进入 `Settings` -> `Pages`。
5. 在 `Build and deployment` 中选择发布方式：
   - 如果是纯静态 HTML：选择 `Deploy from a branch`，分支选 `main`，目录选 `/root`。
   - 如果是 Vite/React 等构建型项目：选择 `GitHub Actions`，配置自动构建并发布 `dist` 目录。
6. 保存后等待 GitHub Pages 构建完成。
7. 获得公开访问链接，通常格式为：

```text
https://<your-name>.github.io/dri-website/
```

## 网站内容概要

当前状态：待补充。

建议维护以下信息：
- 网站名称：
- 目标用户：
- 核心用途：
- 首页传达的第一信息：
- 主要页面：
- 重要内容模块：

## 功能特点

当前状态：待补充。

建议维护以下信息：
- 核心功能：
- 辅助功能：
- 数据来源：
- 是否需要搜索、筛选、排序：
- 是否需要表单、下载、分享：
- 是否需要适配移动端：

## 交互细节

当前状态：待补充。

建议维护以下信息：
- 首屏交互：
- 导航方式：
- 按钮和链接行为：
- 表单校验：
- 加载、空状态和错误状态：
- 移动端交互：
- 键盘或无障碍支持：

## 后续维护约定

- 每次新增页面时，同步更新“网站内容概要”。
- 每次新增功能时，同步更新“功能特点”。
- 每次改变用户操作路径时，同步更新“交互细节”。
- 每次部署方式变化时，同步更新“公开发布方案”。
- 每次发布前，确认 GitHub Pages 或线上环境能正常访问。
