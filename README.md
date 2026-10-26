# 音乐迁移 · Local Music Transfer

一个只在本机运行的网易云音乐 → Spotify 歌单迁移工具。界面在浏览器中打开，数据保存在本机，不依赖云端数据库。

English version: [README.en.md](README.en.md)

## 功能

- 网易云音乐 App 扫码登录
- 导出“我喜欢的音乐”和全部用户歌单
- Spotify OAuth PKCE 授权，不需要 Client Secret
- 歌曲匹配预览：标题、歌手、专辑、时长和版本信息综合判断
- 喜欢的歌曲写入 Spotify Liked Songs
- 其他歌单按原名建立 Spotify 私有歌单
- 断点续跑、去重、已存在歌曲跳过
- 写入后核对结果
- 中英文界面切换
- 本地数据目录，不上传歌单或授权信息

目前真正可用的服务是网易云音乐和 Spotify。Apple Music、YouTube Music、Deezer、TIDAL、SoundCloud、Pandora、Last.fm、Bandcamp 在界面中标记为“即将支持”，用于后续扩展。

## 快速开始

需要 Node.js 18 或更高版本。

```bash
npm install
npm start
```

Windows 也可以直接双击 `start.bat`。

浏览器打开：

```text
http://127.0.0.1:8787
```

首次使用 Spotify 前，需要在 [Spotify Developer Dashboard](https://developer.spotify.com/dashboard) 创建一个 Web API App，并添加回调地址：

```text
http://127.0.0.1:8787/callback
```

Spotify 当前要求 Web API 应用使用 Premium 账号。把 Client ID 填进网页即可，不需要 Client Secret。

## 使用流程

1. 打开“网易云登录与导出”，生成二维码并用网易云音乐 App 扫码。
2. 点击“导出我的歌单”，等待导出完成。
3. 在“已导出的歌单”面板核对喜欢歌曲、歌单数量和具体曲目；因审核未能读取的歌单会单独列出。
4. 在 Spotify 卡片中填写 Client ID，点击“打开 Spotify 授权”。
5. 进入“匹配预览”，建议把搜索间隔设为 1000 毫秒，先查看匹配、待确认和未找到的统计。
6. 确认无误后点击“确认并写入”。喜欢歌曲进入 Liked Songs，其余歌单按原名创建。
7. 最后点击“开始核对”，检查目标 Spotify 歌单是否包含对应曲目。

## 数据与安全

- `data/` 保存本地授权状态和导出数据，已被 `.gitignore` 排除。
- 工具不会读取或保存你的网易云密码，也不会保存 Spotify 密码。
- Spotify 使用 OAuth PKCE，不保存 Client Secret。
- 如果清空 `data/`，需要重新扫码和授权 Spotify。
- 不要在公开仓库、截图或聊天中分享 `data/` 目录。

## 目录结构

```text
local-migrate-site/
├─ public/            网页界面
│  ├─ index.html
│  ├─ style.css
│  └─ app.js
├─ server.mjs         本地 Node.js 服务、网易云和 Spotify API
├─ package.json
├─ start.bat          Windows 启动脚本
├─ README.md          中文说明
├─ README.en.md       English guide
├─ HANDOUT.md         中文快速使用手册
└─ HANDOUT.en.md      English quick-start handout
```

## 已知限制

- Spotify Web API 需要 Premium 账号。
- 搜索接口有滚动限流。遇到 429 时不要连续重试，应按响应中的 `Retry-After` 等待，或把搜索间隔调大。
- 网易云的社区 API 不是官方长期稳定接口，接口变化可能导致导出失效。
- 现场版、Remix、伴奏、地区下架和同名歌曲可能无法精确匹配，需要人工复核。
- 迁移的是歌曲引用，不下载或上传音频文件。
- 因网易云审核而无法读取的歌单无法迁移，系统会单独报告。

## 后续扩展

服务列表和传送动画都由 `public/app.js` 顶部的 `SERVICES` 配置驱动。要增加平台，需要补一个服务的名称、品牌色、SVG Logo、启用状态，以及对应平台的导出、授权和匹配适配器。

## License

仅用于个人音乐库迁移。使用第三方平台接口时，请遵守对应平台的服务条款。

