# DRI 网站

这是 AI DRI 指南针网站项目。当前采用纯静态站点结构，可以直接通过 GitHub Pages 发布。

当前首页参考 Claude 的 warm editorial 风格，配色使用新桥青与宣纸白为主，并支持文字编辑、图片上传替换、本地保存、连接 GitHub 后云端保存、导出新 HTML、自测题滑出结果卡片、DRI 定义 hover 浮窗和 FAQ 展开。

顶部前四个 tab 已有原型子页面：
- `guide.html`：5 个 AI 核心概念速通
- `map.html`：7 个能力维度地图
- `cases.html`：5 个常见误区
- `resources.html`：成长路径

## 本地预览

```bash
python3 -m http.server 8000
```

然后访问：

```text
http://localhost:8000
```

## 发布方式

当前推荐使用 GitHub Pages 的 `Deploy from a branch`，从 `main` 分支根目录发布。

公开访问链接：

```text
https://znonymity.github.io/dri-website/
```

## 2026-06-07 重要更新

- 增加网页端编辑模式：开启后可直接点击页面文字修改，也可替换带 `data-editable-image` 的图片。
- 增加多页面原型：首页、核心概念、能力地图、常见误区、成长路径页面已打通导航。
- 增加云端状态文件：网页端发布会写入 `site-state.json`，用于多设备共享编辑后的页面内容。
- 修复 `/dri-website/` 与 `/dri-website/index.html` 状态不互通的问题，首页统一识别为同一个页面。
- 修复导航 tab 改名后不同页面不同步的问题，tab 文案会通过统一状态同步。
- 修复云端首次发布时 token 使用错误的问题。
- 增加缓存刷新版本号，避免手机或其他设备继续加载旧版 `script.js` / `styles.css`。
- 云端读取改为 no-cache，减少“网页端已保存，手机端刷新不到”的情况。

## 网页端编辑与保存

### 1. 进入编辑模式

打开公开网站后，点击右上角 `编辑模式`。

进入编辑模式后：

- 点击文字可以直接修改。
- 点击可编辑图片区域可以上传替换图片。
- 修改 tab 名称后，会同步到其他页面的导航。

### 2. 保存到本机

点击 `保存本机` 会把当前页面内容保存到当前浏览器的 `localStorage`。

适用场景：

- 临时改稿。
- 只想在当前电脑或当前手机里预览。

注意：本机保存不会上传到 GitHub，其他设备看不到。

### 3. 发布到云端

点击 `连接 GitHub`，粘贴 GitHub fine-grained token。token 需要满足：

- Repository access：选择 `Only select repositories`，并只选择 `dri-website`。
- Repository permissions：给 `Contents` 设置 `Read and write`。
- 不需要开启 Account permissions。

连接成功后，点击 `发布云端`。

发布成功后会更新仓库里的 `site-state.json`。其他设备打开网站时会自动读取云端状态，也可以手动点击 `从云端刷新`。

注意：GitHub token 只保存在当前浏览器本地，不会写入仓库。但如果 token 被截图、复制到聊天或泄露，需要立刻在 GitHub 删除并重新生成。

### 4. 从云端刷新

在另一台设备打开网站后，点击 `从云端刷新`。

如果没有看到最新内容，优先尝试：

```text
https://znonymity.github.io/dri-website/index.html?v=cloud3
```

这可以绕过部分浏览器缓存，强制加载新版页面脚本。

### 5. 导出 HTML

点击 `导出 HTML` 会下载一个包含当前编辑内容的新 HTML 文件。

适用场景：

- 离线备份当前页面。
- 把当前版本发给别人单独查看。

注意：导出 HTML 不等于云端发布，不会自动更新 GitHub Pages。

## 常见问题

### 为什么电脑改了，手机看不到？

通常有三种原因：

- 只点了 `保存本机`，没有点 `发布云端`。
- 手机浏览器缓存了旧脚本，需要打开带 `?v=cloud3` 的链接或刷新页面。
- token 权限不对，导致 `site-state.json` 没有写入成功。

### 云端保存失败怎么办？

先看页面提示里的状态码：

- `401`：token 无效、过期或已撤销。
- `403`：token 没有 `Contents: Read and write` 权限，或没有选中 `dri-website` 仓库。
- `409`：远端文件刚被其他设备更新，需要先 `从云端刷新`，再重新发布。

更多维护说明见 [WEBSITE.md](WEBSITE.md)。
