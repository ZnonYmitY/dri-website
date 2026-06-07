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

## 网页端编辑保存

网页端默认先保存到当前浏览器。若要让其他设备也看到修改，需要在编辑模式点击“连接云端”，粘贴具备 `Contents: Read and write` 权限的 GitHub fine-grained token；之后点击“一键保存”会更新仓库中的 `site-state.json`，其他设备打开页面时会自动读取这份公共状态。

公开访问链接：

```text
https://znonymity.github.io/dri-website/
```

更多维护说明见 [WEBSITE.md](WEBSITE.md)。
