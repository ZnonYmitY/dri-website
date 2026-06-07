# DRI 网站

这是 AI DRI 指南针网站项目。当前采用纯静态站点结构，可以直接通过 GitHub Pages 发布。

当前首页支持文字编辑、图片上传替换、一键保存到浏览器、导出新 HTML、自测题结果弹窗和 DRI 定义浮窗。

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

更多维护说明见 [WEBSITE.md](WEBSITE.md)。
