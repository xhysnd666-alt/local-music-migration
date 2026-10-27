const $ = (id) => document.getElementById(id);

const I18N = {
  "brand.name": { zh: "音乐迁移", en: "Music Transfer" },
  "brand.tag": { zh: "本地工具", en: "Local tool" },
  "steps.direction": { zh: "选择方向", en: "Direction" },
  "steps.accounts": { zh: "连接账号", en: "Accounts" },
  "steps.match": { zh: "匹配预览", en: "Match preview" },
  "steps.write": { zh: "写入", en: "Write" },
  "steps.verify": { zh: "核对", en: "Verify" },
  "sidebar.note": { zh: "数据仅保存在本机 data 目录", en: "Data stays in the local data folder" },
  "flow.title": { zh: "这次要迁移什么", en: "What to migrate" },
  "flow.swap": { zh: "⇄ 交换", en: "⇄ Swap" },
  "flow.from": { zh: "从", en: "From" },
  "flow.to": { zh: "到", en: "To" },
  "flow.hint": {
    zh: "{source} → {dest}：喜欢歌曲写入目标平台的收藏，歌单按原名分别建立。",
    en: "{source} → {dest}: liked songs go to your favorites, playlists are recreated under their original names.",
  },
  "services.title": { zh: "支持的音乐服务", en: "Supported services" },
  "services.pickSource": { zh: "设为来源", en: "As source" },
  "services.pickTarget": { zh: "设为目标", en: "As target" },
  "services.hint": {
    zh: "点击一个“可用”的服务，把它设为你当前选择的来源或目标；其余为即将支持。",
    en: "Click an available service to set it as source or target; the rest are coming soon.",
  },
  "services.available": { zh: "可用", en: "Available" },
  "services.comingSoon": { zh: "即将支持", en: "Coming soon" },
  "netease.title": { zh: "网易云登录与导出", en: "NetEase login & export" },
  "netease.qr": { zh: "生成登录二维码", en: "Show login QR" },
  "netease.export": { zh: "导出我的歌单", en: "Export my playlists" },
  "netease.qrHint": { zh: "用网易云音乐 App 扫码并确认", en: "Scan with the NetEase Cloud Music app" },
  "exported.title": { zh: "已导出的歌单", en: "Exported playlists" },
  "exported.hint": {
    zh: "这些是本次已读取到的歌单；点开任意一项可以核对具体曲目。",
    en: "These playlists were read; click any row to inspect its tracks.",
  },
  "exported.search": { zh: "搜索歌单", en: "Search playlists" },
  "exported.liked": { zh: "喜欢歌曲", en: "Liked songs" },
  "exported.available": { zh: "可迁移", en: "Available" },
  "exported.missing": { zh: "缺失", en: "Missing" },
  "exported.failed": { zh: "未导出的歌单", en: "Not exported" },
  "exported.failedHint": {
    zh: "网易云显示审核中，暂时无法读取这些歌单。",
    en: "NetEase reports these playlists are under review, so they could not be read.",
  },
  "exported.none": { zh: "没有匹配结果", en: "No matching playlists" },
  "exported.showAll": { zh: "显示全部", en: "Show all" },
  "exported.collapse": { zh: "收起", en: "Collapse" },
  "exported.loading": { zh: "加载中...", en: "Loading..." },
  "exported.count": { zh: "共 {count} 个歌单", en: "{count} playlists" },
  "stats.liked": { zh: "喜欢歌曲", en: "Liked songs" },
  "stats.playlists": { zh: "歌单", en: "Playlists" },
  "stats.entries": { zh: "总条目", en: "Entries" },
  "stats.unique": { zh: "去重后", en: "Unique" },
  "spotify.title": { zh: "Spotify 授权", en: "Spotify authorization" },
  "spotify.clientId": { zh: "Spotify Client ID", en: "Spotify Client ID" },
  "spotify.clientIdPlaceholder": { zh: "例如 713ba9d9...", en: "e.g. 713ba9d9..." },
  "spotify.login": { zh: "打开 Spotify 授权", en: "Authorize Spotify" },
  "spotify.logout": { zh: "退出授权", en: "Log out" },
  "spotify.redirect": { zh: "回调地址：", en: "Redirect URI: " },
  "match.title": { zh: "匹配预览", en: "Match preview" },
  "match.hint": { zh: "只读取，不会写入你的 Spotify", en: "Read-only, nothing is written" },
  "match.delay": { zh: "每次搜索间隔（毫秒，至少 3000）", en: "Delay between searches (ms, 3000 minimum)" },
  "match.start": { zh: "开始匹配预览", en: "Start match preview" },
  "common.cancel": { zh: "取消", en: "Cancel" },
  "apply.title": { zh: "写入 Spotify", en: "Write to Spotify" },
  "apply.hint": {
    zh: "喜欢歌曲进入 Liked Songs；其余歌单按原名分别建立私有歌单。",
    en: "Liked songs go to Liked Songs; other playlists are created as private with their original names.",
  },
  "apply.start": { zh: "确认并写入", en: "Confirm & write" },
  "apply.confirm": {
    zh: "确认把喜欢歌曲写入 Liked Songs，并按原名创建歌单？此操作会修改你的 Spotify 库。",
    en: "Confirm writing liked songs to Liked Songs and recreating playlists under their original names? This modifies your Spotify library.",
  },
  "verify.title": { zh: "核对结果", en: "Verify results" },
  "verify.start": { zh: "开始核对", en: "Start verification" },
  "log.title": { zh: "运行日志", en: "Log" },
  "status.notLoggedIn": { zh: "未登录", en: "Not logged in" },
  "status.loggingIn": { zh: "登录成功，正在获取账号信息", en: "Logged in, loading account" },
  "status.netease": { zh: "已登录：{nickname}（{uid}）", en: "Logged in: {nickname} ({uid})" },
  "status.spotify": { zh: "已授权：{name}（{country}）", en: "Authorized: {name} ({country})" },
  "badge.received": { zh: "已接收", en: "Received" },
  "common.requestFailed": { zh: "请求失败（{status}）", en: "Request failed ({status})" },
  "log.loadStateFailed": { zh: "加载状态失败：{error}", en: "Failed to load state: {error}" },
  "log.manualUrl": { zh: "请手动打开登录链接：{url}", en: "Open this login link manually: {url}" },
  "log.scanQr": { zh: "请用网易云 App 扫码", en: "Scan with the NetEase Cloud Music app" },
  "log.neteaseLoginSuccess": { zh: "网易云登录成功", en: "NetEase login successful" },
  "log.qrScanned": { zh: "已扫码，请在手机上确认", en: "Scanned, confirm on your phone" },
  "log.loginFailed": { zh: "登录失败：{error}", en: "Login failed: {error}" },
  "log.exportStart": { zh: "开始导出，可能需要几分钟", en: "Export started, this may take a few minutes" },
  "log.exportDone": { zh: "导出完成", en: "Export finished" },
  "log.exportFailed": { zh: "导出失败：{error}", en: "Export failed: {error}" },
  "log.clientIdRequired": { zh: "请先填写 Spotify Client ID", en: "Enter your Spotify Client ID first" },
  "log.spotifyWindow": {
    zh: "授权窗口已打开，完成后回来刷新状态",
    en: "Authorization window opened, come back and refresh when done",
  },
  "log.spotifyLoginFailed": { zh: "Spotify 登录失败：{error}", en: "Spotify login failed: {error}" },
  "log.matchStart": { zh: "开始匹配（间隔 {delay}ms）", en: "Matching started (delay {delay}ms)" },
  "log.matchDone": { zh: "匹配完成", en: "Matching finished" },
  "log.matchFailed": { zh: "匹配失败：{error}", en: "Matching failed: {error}" },
  "log.applyStart": { zh: "开始写入 Spotify", en: "Writing to Spotify" },
  "log.applyDone": { zh: "写入完成", en: "Writing finished" },
  "log.applyFailed": { zh: "写入失败：{error}", en: "Writing failed: {error}" },
  "log.verifyDone": { zh: "核对完成", en: "Verification finished" },
  "log.verifyFailed": { zh: "核对失败：{error}", en: "Verification failed: {error}" },
  "log.comingSoon": { zh: "{name}：即将支持", en: "{name}: coming soon" },
  "err.qrExpired": { zh: "二维码已过期，请重新生成", en: "QR code expired, generate a new one" },
  "err.loginTimeout": { zh: "登录等待超时", en: "Login timed out" },
};

let currentLang = localStorage.getItem("migrate-lang") || "zh";

function t(key, vars = {}) {
  const entry = I18N[key];
  let text = entry ? entry[currentLang] || entry.zh || key : key;
  for (const [name, value] of Object.entries(vars)) {
    text = text.replaceAll(`{${name}}`, String(value));
  }
  return text;
}

function serviceDisplayName(service) {
  return currentLang === "en" ? service.nameEn || service.name : service.name;
}

function applyLang() {
  currentLang = currentLang === "en" ? "en" : "zh";
  localStorage.setItem("migrate-lang", currentLang);
  document.documentElement.lang = currentLang === "en" ? "en" : "zh-CN";
  document.querySelectorAll(".lang-toggle button").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.lang === currentLang);
  });
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    el.textContent = t(el.dataset.i18n);
  });
  document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
    el.placeholder = t(el.dataset.i18nPlaceholder);
  });
  renderFlowOptions();
  renderServiceGrid();
  renderFlow();
  refreshState().catch((err) => log(t("log.loadStateFailed", { error: err.message })));
}

const SPOTIFY_PATH =
  "M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.48.66.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141 4.2-1.381 9.6-.72 13.32 1.56.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z";
const NOTE_PATH =
  "M13.046 9.388a3.919 3.919 0 0 0-.66.19c-.809.312-1.447.991-1.666 1.775a2.269 2.269 0 0 0-.074.81c.048.546.333 1.05.764 1.35a1.483 1.483 0 0 0 2.01-.286c.406-.531.355-1.183.24-1.636-.098-.387-.22-.816-.345-1.249a64.76 64.76 0 0 1-.269-.954zm-.82 10.07c-3.984 0-7.224-3.24-7.224-7.223 0-.98.226-3.02 1.884-4.822A7.188 7.188 0 0 1 9.502 5.6a.792.792 0 1 1 .587 1.472 5.619 5.619 0 0 0-2.795 2.462 5.538 5.538 0 0 0-.707 2.7 5.645 5.645 0 0 0 5.638 5.638c1.844 0 3.627-.953 4.542-2.428 1.042-1.68.772-3.931-.627-5.238a3.299 3.299 0 0 0-1.437-.777c.172.589.334 1.18.494 1.772.284 1.12.1 2.181-.519 2.989-.39.51-.956.888-1.592 1.064a3.038 3.038 0 0 1-2.58-.44 3.45 3.45 0 0 1-1.44-2.514c-.04-.467.002-.93.128-1.376.35-1.256 1.356-2.339 2.622-2.826a5.5 5.5 0 0 1 .823-.246l-.134-.505c-.37-1.371.25-2.579 1.547-3.007.329-.109.68-.145 1.025-.105.792.09 1.476.592 1.709 1.023.258.507-.096 1.153-.706 1.153a.788.788 0 0 1-.54-.213c-.088-.08-.163-.174-.259-.247a.825.825 0 0 0-.632-.166.807.807 0 0 0-.634.551c-.056.191-.031.406.02.595.07.256.159.597.217.82 1.11.098 2.162.54 2.97 1.296 1.974 1.844 2.35 4.886.892 7.233-1.197 1.93-3.509 3.177-5.889 3.177zM0 12c0 6.627 5.373 12 12 12s12-5.373 12-12S18.627 0 12 0 0 5.373 0 12Z";
const APPLE_MUSIC_PATH =
  "M23.994 6.124a9.23 9.23 0 00-.24-2.19c-.317-1.31-1.062-2.31-2.18-3.043a5.022 5.022 0 00-1.877-.726 10.496 10.496 0 00-1.564-.15c-.04-.003-.083-.01-.124-.013H5.986c-.152.01-.303.017-.455.026-.747.043-1.49.123-2.193.4-1.336.53-2.3 1.452-2.865 2.78-.192.448-.292.925-.363 1.408-.056.392-.088.785-.1 1.18 0 .032-.007.062-.01.093v12.223c.01.14.017.283.027.424.05.815.154 1.624.497 2.373.65 1.42 1.738 2.353 3.234 2.801.42.127.856.187 1.293.228.555.053 1.11.06 1.667.06h11.03a12.5 12.5 0 001.57-.1c.822-.106 1.596-.35 2.295-.81a5.046 5.046 0 001.88-2.207c.186-.42.293-.87.37-1.324.113-.675.138-1.358.137-2.04-.002-3.8 0-7.595-.003-11.393zm-6.423 3.99v5.712c0 .417-.058.827-.244 1.206-.29.59-.76.962-1.388 1.14-.35.1-.706.157-1.07.173-.95.045-1.773-.6-1.943-1.536a1.88 1.88 0 011.038-2.022c.323-.16.67-.25 1.018-.324.378-.082.758-.153 1.134-.24.274-.063.457-.23.51-.516a.904.904 0 00.02-.193c0-1.815 0-3.63-.002-5.443a.725.725 0 00-.026-.185c-.04-.15-.15-.243-.304-.234-.16.01-.318.035-.475.066-.76.15-1.52.303-2.28.456l-2.325.47-1.374.278c-.016.003-.032.01-.048.013-.277.077-.377.203-.39.49-.002.042 0 .086 0 .13-.002 2.602 0 5.204-.003 7.805 0 .42-.047.836-.215 1.227-.278.64-.77 1.04-1.434 1.233-.35.1-.71.16-1.075.172-.96.036-1.755-.6-1.92-1.544-.14-.812.23-1.685 1.154-2.075.357-.15.73-.232 1.108-.31.287-.06.575-.116.86-.177.383-.083.583-.323.6-.714v-.15c0-2.96 0-5.922.002-8.882 0-.123.013-.25.042-.37.07-.285.273-.448.546-.518.255-.066.515-.112.774-.165.733-.15 1.466-.296 2.2-.444l2.27-.46c.67-.134 1.34-.27 2.01-.403.22-.043.442-.088.663-.106.31-.025.523.17.554.482.008.073.012.148.012.223.002 1.91.002 3.822 0 5.732z";
const YOUTUBE_MUSIC_PATH =
  "M12 0C5.376 0 0 5.376 0 12s5.376 12 12 12 12-5.376 12-12S18.624 0 12 0zm0 19.104c-3.924 0-7.104-3.18-7.104-7.104S8.076 4.896 12 4.896s7.104 3.18 7.104 7.104-3.18 7.104-7.104 7.104zm0-13.332c-3.432 0-6.228 2.796-6.228 6.228S8.568 18.228 12 18.228s6.228-2.796 6.228-6.228S15.432 5.772 12 5.772zM9.684 15.54V8.46L15.816 12l-6.132 3.54z";
const DEEZER_PATH =
  "M.693 10.024c.381 0 .693-1.256.693-2.807 0-1.55-.312-2.807-.693-2.807C.312 4.41 0 5.666 0 7.217s.312 2.808.693 2.808ZM21.038 1.56c-.364 0-.684.805-.91 2.096C19.765 1.446 19.184 0 18.526 0c-.78 0-1.464 2.036-1.784 5-.312-2.158-.788-3.536-1.325-3.536-.745 0-1.386 2.704-1.62 6.472-.442-1.932-1.083-3.145-1.793-3.145s-1.35 1.213-1.793 3.145c-.242-3.76-.874-6.463-1.628-6.463-.537 0-1.013 1.378-1.325 3.535C6.938 2.036 6.262 0 5.474 0c-.658 0-1.247 1.447-1.602 3.665-.217-1.291-.546-2.105-.91-2.105-.675 0-1.221 2.807-1.221 6.272 0 3.466.546 6.273 1.221 6.273.277 0 .537-.476.736-1.273.32 2.928.996 4.938 1.776 4.938.606 0 1.143-1.204 1.507-3.11.251 3.622.875 6.195 1.602 6.195.46 0 .875-1.023 1.187-2.677C10.142 21.6 11 24 12.004 24c1.005 0 1.863-2.4 2.235-5.822.312 1.654.727 2.677 1.186 2.677.728 0 1.352-2.573 1.603-6.195.364 1.906.9 3.11 1.507 3.11.78 0 1.455-2.01 1.775-4.938.208.797.46 1.273.737 1.273.675 0 1.22-2.807 1.22-6.273-.008-3.457-.553-6.272-1.23-6.272ZM23.307 10.024c.381 0 .693-1.256.693-2.807 0-1.55-.312-2.807-.693-2.807-.381 0-.693 1.256-.693 2.807s.312 2.808.693 2.808Z";
const TIDAL_PATH =
  "M12.012 3.992L8.008 7.996 4.004 3.992 0 7.996 4.004 12l4.004-4.004L12.012 12l-4.004 4.004 4.004 4.004 4.004-4.004L12.012 12l4.004-4.004-4.004-4.004zM16.042 7.996l3.979-3.979L24 7.996l-3.979 3.979z";
const SOUNDCLOUD_PATH =
  "M23.999 14.165c-.052 1.796-1.612 3.169-3.4 3.169h-8.18a.68.68 0 0 1-.675-.683V7.862a.747.747 0 0 1 .452-.724s.75-.513 2.333-.513a5.364 5.364 0 0 1 2.763.755 5.433 5.433 0 0 1 2.57 3.54c.282-.08.574-.121.868-.12.884 0 1.73.358 2.347.992s.948 1.49.922 2.373ZM10.721 8.421c.247 2.98.427 5.697 0 8.672a.264.264 0 0 1-.53 0c-.395-2.946-.22-5.718 0-8.672a.264.264 0 0 1 .53 0ZM9.072 9.448c.285 2.659.37 4.986-.006 7.655a.277.277 0 0 1-.55 0c-.331-2.63-.256-5.02 0-7.655a.277.277 0 0 1 .556 0Zm-1.663-.257c.27 2.726.39 5.171 0 7.904a.266.266 0 0 1-.532 0c-.38-2.69-.257-5.21 0-7.904a.266.266 0 0 1 .532 0Zm-1.647.77a26.108 26.108 0 0 1-.008 7.147.272.272 0 0 1-.542 0 27.955 27.955 0 0 1 0-7.147.275.275 0 0 1 .55 0Zm-1.67 1.769c.421 1.865.228 3.5-.029 5.388a.257.257 0 0 1-.514 0c-.21-1.858-.398-3.549 0-5.389a.272.272 0 0 1 .543 0Zm-1.655-.273c.388 1.897.26 3.508-.01 5.412-.026.28-.514.283-.54 0-.244-1.878-.347-3.54-.01-5.412a.283.283 0 0 1 .56 0Zm-1.668.911c.4 1.268.257 2.292-.026 3.572a.257.257 0 0 1-.514 0c-.241-1.262-.354-2.312-.023-3.572a.283.283 0 0 1 .563 0Z";
const PANDORA_PATH =
  "M1.882 0v24H8.32a1.085 1.085 0 001.085-1.085v-4.61h1.612c7.88 0 11.103-4.442 11.103-9.636C22.119 2.257 17.247 0 12.662 0H1.882Z";
const LASTFM_PATH =
  "M10.584 17.21l-.88-2.392s-1.43 1.594-3.573 1.594c-1.897 0-3.244-1.649-3.244-4.288 0-3.382 1.704-4.591 3.381-4.591 2.42 0 3.189 1.567 3.849 3.574l.88 2.749c.88 2.666 2.529 4.81 7.285 4.81 3.409 0 5.718-1.044 5.718-3.793 0-2.227-1.265-3.381-3.63-3.931l-1.758-.385c-1.21-.275-1.567-.77-1.567-1.595 0-.934.742-1.484 1.952-1.484 1.32 0 2.034.495 2.144 1.677l2.749-.33c-.22-2.474-1.924-3.492-4.729-3.492-2.474 0-4.893.935-4.893 3.932 0 1.87.907 3.051 3.189 3.601l1.87.44c1.402.33 1.869.907 1.869 1.704 0 1.017-.99 1.43-2.86 1.43-2.776 0-3.93-1.457-4.59-3.464l-.907-2.75c-1.155-3.573-2.997-4.893-6.653-4.893C2.144 5.333 0 7.89 0 12.233c0 4.18 2.144 6.434 5.993 6.434 3.106 0 4.591-1.457 4.591-1.457z";
const BANDCAMP_PATH =
  "M0 18.75l7.437-13.5H24l-7.438 13.5H0z";

const SERVICES = {
  netease: {
    key: "netease",
    name: "网易云音乐",
    nameEn: "NetEase Cloud Music",
    color: "#d33a31",
    glow: "rgba(211, 58, 49, 0.28)",
    path: NOTE_PATH,
    enabled: true,
  },
  spotify: {
    key: "spotify",
    name: "Spotify",
    color: "#1db954",
    glow: "rgba(29, 185, 84, 0.3)",
    path: SPOTIFY_PATH,
    enabled: true,
  },
  applemusic: {
    key: "applemusic",
    name: "Apple Music",
    color: "#fa243c",
    glow: "rgba(250, 36, 60, 0.25)",
    path: APPLE_MUSIC_PATH,
    enabled: false,
  },
  youtubemusic: {
    key: "youtubemusic",
    name: "YouTube Music",
    color: "#ff0000",
    glow: "rgba(255, 0, 0, 0.22)",
    path: YOUTUBE_MUSIC_PATH,
    enabled: false,
  },
  deezer: {
    key: "deezer",
    name: "Deezer",
    color: "#a238ff",
    glow: "rgba(162, 56, 255, 0.25)",
    path: DEEZER_PATH,
    enabled: false,
  },
  tidal: {
    key: "tidal",
    name: "TIDAL",
    color: "#000000",
    glow: "rgba(0, 0, 0, 0.25)",
    path: TIDAL_PATH,
    enabled: false,
  },
  soundcloud: {
    key: "soundcloud",
    name: "SoundCloud",
    color: "#ff5500",
    glow: "rgba(255, 85, 0, 0.25)",
    path: SOUNDCLOUD_PATH,
    enabled: false,
  },
  pandora: {
    key: "pandora",
    name: "Pandora",
    color: "#3668ff",
    glow: "rgba(54, 104, 255, 0.25)",
    path: PANDORA_PATH,
    enabled: false,
  },
  lastdotfm: {
    key: "lastdotfm",
    name: "Last.fm",
    color: "#d51007",
    glow: "rgba(213, 16, 7, 0.25)",
    path: LASTFM_PATH,
    enabled: false,
  },
  bandcamp: {
    key: "bandcamp",
    name: "Bandcamp",
    color: "#629aa9",
    glow: "rgba(98, 154, 169, 0.25)",
    path: BANDCAMP_PATH,
    enabled: false,
  },
};

const FLOW = { source: "netease", dest: "spotify" };

function renderFlowOptions() {
  const source = $("sourceSelect");
  const dest = $("destSelect");
  const options = Object.values(SERVICES)
    .filter((s) => s.enabled)
    .map(
      (s) => `<option value="${s.key}" data-color="${s.color}">${serviceDisplayName(s)}</option>`,
    )
    .join("");
  source.innerHTML = options;
  dest.innerHTML = options;
  source.value = FLOW.source;
  dest.value = FLOW.dest;
}

let pickMode = "source";

function renderServiceGrid() {
  const grid = $("serviceGrid");
  if (!grid) return;
  grid.innerHTML = Object.values(SERVICES)
    .map((s) => {
      const state = t(s.enabled ? "services.available" : "services.comingSoon");
      const displayName = serviceDisplayName(s);
      return `
        <button class="service-tile ${s.enabled ? "" : "disabled"}"
          data-key="${s.key}" title="${displayName}">
          <span class="service-logo" style="--service-color:${s.color}">
            <svg viewBox="0 0 24 24"><path d="${s.path}"/></svg>
          </span>
          <span class="service-name">${displayName}</span>
          <span class="service-state">${state}</span>
        </button>`;
    })
    .join("");
  grid.querySelectorAll(".service-tile").forEach((tile) => {
    tile.addEventListener("click", () => {
      const key = tile.dataset.key;
      const service = SERVICES[key];
      if (!service?.enabled) {
        log(t("log.comingSoon", { name: serviceDisplayName(service) || key }));
        return;
      }
      FLOW[pickMode] = key;
      $(pickMode === "source" ? "sourceSelect" : "destSelect").value = key;
      renderFlow();
      pulseBadge();
      renderServiceGrid();
    });
  });
}

function setPickMode(mode) {
  pickMode = mode;
  document.querySelectorAll(".pick-toggle button").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.mode === mode);
  });
  renderServiceGrid();
}

function renderFlow() {
  const source = SERVICES[FLOW.source] || SERVICES.netease;
  const dest = SERVICES[FLOW.dest] || SERVICES.spotify;
  const root = document.documentElement;
  root.style.setProperty("--from", source.color);
  root.style.setProperty("--to", dest.color);
  root.style.setProperty("--to-glow", dest.glow);
  root.style.setProperty("--fog-a", source.color);
  root.style.setProperty("--fog-b", dest.color);
  $("sourceLogo").style.setProperty("--brand", source.color);
  $("sourceLogo").style.setProperty("--glow", source.glow);
  $("destLogo").style.setProperty("--brand", dest.color);
  $("destLogo").style.setProperty("--glow", dest.glow);
  $("sourceIcon").querySelector("path").setAttribute("d", source.path);
  $("destIcon").querySelector("path").setAttribute("d", dest.path);
  $("sourceName").textContent = serviceDisplayName(source);
  $("destName").textContent = serviceDisplayName(dest);
  document.querySelectorAll(".particle").forEach((p) => {
    p.style.setProperty("--to", dest.color);
    p.style.setProperty("--to-glow", dest.glow);
  });
  $("badge").style.setProperty("--to", dest.color);
  $("badge").style.setProperty("--to-glow", dest.glow);
  $("badge").textContent = t("badge.received");
  $("flowHint").textContent = t("flow.hint", {
    source: serviceDisplayName(source),
    dest: serviceDisplayName(dest),
  });
}

function pulseBadge() {
  const badge = $("badge");
  badge.classList.remove("pop");
  $("destNode").classList.remove("receive");
  void badge.offsetWidth;
  $("destNode").classList.add("receive");
  badge.classList.add("pop");
}

function setStep(activeStep) {
  document.querySelectorAll(".step").forEach((el) => {
    const step = Number(el.dataset.step);
    el.classList.toggle("active", step === activeStep);
    el.classList.toggle("done", step < activeStep);
  });
}

function log(msg) {
  const el = $('log');
  el.textContent += `[${new Date().toLocaleTimeString()}] ${msg}\n`;
  el.scrollTop = el.scrollHeight;
}

function show(el, visible = true) {
  el.classList.toggle('hidden', !visible);
}

async function api(path, options = {}) {
  const res = await fetch(path, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || t("common.requestFailed", { status: res.status }));
  return data;
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function animateNumber(el, to) {
  const from = Number(el.dataset.value || 0);
  const start = performance.now();
  const duration = 650;
  function step(now) {
    const progress = Math.min(1, (now - start) / duration);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(from + (to - from) * eased).toLocaleString("en-US");
    if (progress < 1) {
      requestAnimationFrame(step);
    } else {
      el.dataset.value = String(to);
    }
  }
  requestAnimationFrame(step);
}

async function pollJob(jobId, progressEl, onDone) {
  for (;;) {
    const job = await api(`/api/job/${jobId}`);
    if (job.progress) {
      show(progressEl);
      progressEl.textContent = `${job.progress.message}（${job.progress.done}/${job.progress.total || '?'}）`;
    }
    if (job.status === 'done') {
      onDone(job.result);
      return;
    }
    if (job.status === 'error') {
      throw new Error(job.error);
    }
    await sleep(1200);
  }
}

async function refreshState() {
  const state = await api('/api/state');
  if (state.netease) {
    $('neteaseStatus').textContent = t("status.netease", {
      nickname: state.netease.nickname,
      uid: state.netease.uid,
    });
    $('neteaseStatus').classList.add('ok');
  }
  if (state.netease || state.source) {
    show($('exportBtn'));
  }
  if (state.spotify) {
    $('spotifyStatus').textContent = t("status.spotify", {
      name: state.spotify.display_name || state.spotify.id,
      country: state.spotify.country || "",
    });
    $('spotifyStatus').classList.add('ok');
  }
  if (state.source) {
    animateNumber($('statLiked'), state.source.liked);
    animateNumber($('statPlaylists'), state.source.playlists);
    animateNumber($('statTracks'), state.source.total_entries);
    animateNumber($('statUnique'), state.source.unique_tracks);
  }
  if (state.plan) {
    $('planSummary').textContent = JSON.stringify(state.plan, null, 2);
  }
  if (state.applied) {
    $('applySummary').textContent = JSON.stringify(state.applied, null, 2);
  }
  let activeStep = 1;
  if (state.source) activeStep = Math.max(activeStep, 2);
  if (state.spotify) activeStep = Math.max(activeStep, 2);
  if (state.plan) activeStep = Math.max(activeStep, 3);
  if (state.applied) activeStep = Math.max(activeStep, 4);
  setStep(activeStep);
  if (state.source) await loadExportedPlaylists();
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

let exportedData = null;
const exportedOpen = new Set();
const exportedTrackLimit = new Map();
const exportedTrackCache = new Map();

async function loadExportedPlaylists() {
  try {
    exportedData = await api("/api/source/playlists");
    renderExportedList();
    renderFailedExports();
  } catch (err) {
    log(t("log.loadStateFailed", { error: err.message }));
  }
}

function exportedRows() {
  if (!exportedData) return [];
  return [
    {
      key: "liked",
      name: t("exported.liked"),
      available: exportedData.liked.available,
      unavailable: exportedData.liked.unavailable,
    },
    ...exportedData.playlists.map((p) => ({
      key: `playlist:${p.id}`,
      name: p.name,
      available: p.available,
      unavailable: p.unavailable,
    })),
  ];
}

function renderExportedList() {
  if (!exportedData) return;
  const query = ($("playlistSearch")?.value || "").trim().toLowerCase();
  const rows = exportedRows().filter((row) => row.name.toLowerCase().includes(query));
  $("exportedCount").textContent = t("exported.count", { count: exportedRows().length });
  if (!rows.length) {
    $("exportedList").innerHTML = `<div class="playlist-empty">${t("exported.none")}</div>`;
    return;
  }
  $("exportedList").innerHTML = rows
    .map(
      (row) => `
      <div class="playlist-item" data-key="${escapeHtml(row.key)}">
        <button class="playlist-row">
          <span class="playlist-chevron">›</span>
          <span class="playlist-name">${escapeHtml(row.name)}</span>
          <span class="playlist-pills">
            <span class="pill available">${row.available} ${t("exported.available")}</span>
            ${row.unavailable ? `<span class="pill missing">${row.unavailable} ${t("exported.missing")}</span>` : ""}
          </span>
        </button>
        <div class="playlist-detail hidden"></div>
      </div>`
    )
    .join("");

  $("exportedList").querySelectorAll(".playlist-item").forEach((item) => {
    const key = item.dataset.key;
    const row = item.querySelector(".playlist-row");
    row.addEventListener("click", () => togglePlaylistDetail(key, item));
    if (exportedOpen.has(key)) {
      item.classList.add("open");
      loadPlaylistDetail(key, item.querySelector(".playlist-detail"));
    }
  });
}

async function togglePlaylistDetail(key, item) {
  const detail = item.querySelector(".playlist-detail");
  if (exportedOpen.has(key)) {
    exportedOpen.delete(key);
    item.classList.remove("open");
    detail.classList.add("hidden");
    return;
  }
  exportedOpen.add(key);
  item.classList.add("open");
  detail.classList.remove("hidden");
  await loadPlaylistDetail(key, detail);
}

async function loadPlaylistDetail(key, detail) {
  detail.innerHTML = `<div class="playlist-loading">${t("exported.loading")}</div>`;
  try {
    let data = exportedTrackCache.get(key);
    if (!data) {
      data = key === "liked"
        ? await api("/api/source/liked")
        : await api(`/api/source/playlist/${encodeURIComponent(key.slice("playlist:".length))}`);
      exportedTrackCache.set(key, data);
    }
    renderTrackList(key, detail, data.tracks || []);
  } catch (err) {
    detail.innerHTML = `<div class="playlist-loading">${escapeHtml(err.message)}</div>`;
  }
}

function renderTrackList(key, detail, tracks) {
  const limit = exportedTrackLimit.get(key) || 200;
  const visible = tracks.slice(0, limit);
  detail.innerHTML = `
    <div class="track-list">
      ${visible
        .map(
          (track, index) => `
          <div class="track-row">
            <span class="track-index">${index + 1}</span>
            <span class="track-main">
              <b>${escapeHtml(track.name)}</b>
              <small>${escapeHtml((track.artists || []).join(" / "))}</small>
            </span>
          </div>`
        )
        .join("")}
    </div>
    ${
      tracks.length > limit
        ? `<button class="btn subtle track-more">${t("exported.showAll")}（${tracks.length}）</button>`
        : ""
    }`;
  const more = detail.querySelector(".track-more");
  if (more) {
    more.addEventListener("click", () => {
      exportedTrackLimit.set(key, tracks.length);
      renderTrackList(key, detail, tracks);
    });
  }
}

function renderFailedExports() {
  const failed = exportedData?.failed || [];
  if (!failed.length) {
    $("failedExports").innerHTML = "";
    return;
  }
  $("failedExports").innerHTML = `
    <div class="failed-box">
      <b>${t("exported.failed")}</b>
      <p>${t("exported.failedHint")}</p>
      <div>${failed.map((p) => `<span class="failed-name">${escapeHtml(p.name)} · ${escapeHtml(p.id)}</span>`).join("")}</div>
    </div>`;
}

async function startNeteaseQr() {
  try {
    $('qrWrap').classList.add('hidden');
    const data = await api('/api/netease/qr', { method: 'POST' });
    if (data.qrimg) {
      $('qrImg').src = data.qrimg;
      show($('qrWrap'));
    } else if (data.qrUrl) {
      log(t("log.manualUrl", { url: data.qrUrl }));
    }
    log(t("log.scanQr"));
    for (let i = 0; i < 150; i += 1) {
      await sleep(2000);
      const check = await api(`/api/netease/qr/check?key=${encodeURIComponent(data.key)}`);
      if (check.code === 803) {
        log(t("log.neteaseLoginSuccess"));
        $('neteaseStatus').textContent = t("status.loggingIn");
        await refreshState();
        return;
      }
      if (check.code === 800) throw new Error(t("err.qrExpired"));
      if (check.code === 802) log(t("log.qrScanned"));
    }
    throw new Error(t("err.loginTimeout"));
  } catch (err) {
    log(t("log.loginFailed", { error: err.message }));
  }
}

async function startExport() {
  try {
    $('exportBtn').disabled = true;
    const { jobId } = await api('/api/netease/export', { method: 'POST' });
    log(t("log.exportStart"));
    await pollJob(jobId, $('exportProgress'), (result) => {
      log(t("log.exportDone"));
      show($('exportProgress'), false);
    });
    await refreshState();
  } catch (err) {
    log(t("log.exportFailed", { error: err.message }));
  } finally {
    $('exportBtn').disabled = false;
  }
}

async function startSpotifyLogin() {
  const clientId = $('clientId').value.trim();
  if (!clientId) {
    log(t("log.clientIdRequired"));
    return;
  }
  try {
    const { url } = await api('/api/spotify/login', { method: 'POST', body: JSON.stringify({ clientId }) });
    window.open(url, '_blank', 'noopener');
    log(t("log.spotifyWindow"));
  } catch (err) {
    log(t("log.spotifyLoginFailed", { error: err.message }));
  }
}

async function logoutSpotify() {
  await api('/api/spotify/logout', { method: 'POST' });
  $('spotifyStatus').textContent = t("status.notLoggedIn");
  await refreshState();
}

async function startMatch() {
  const delay = Math.max(3000, Number($('delay').value || 3000));
  try {
    $('matchBtn').disabled = true;
    show($('cancelBtn'));
    const { jobId } = await api('/api/match', { method: 'POST', body: JSON.stringify({ delay }) });
    log(t("log.matchStart", { delay }));
    await pollJob(jobId, $('matchProgress'), (result) => {
      log(t("log.matchDone"));
      show($('matchProgress'), false);
    });
    await refreshState();
  } catch (err) {
    log(t("log.matchFailed", { error: err.message }));
  } finally {
    $('matchBtn').disabled = false;
    show($('cancelBtn'), false);
  }
}

async function startApply() {
  const applyConfirm = t("apply.confirm");
  if (!confirm(applyConfirm)) return;
  try {
    $('applyBtn').disabled = true;
    const { jobId } = await api('/api/apply', { method: 'POST' });
    log(t("log.applyStart"));
    await pollJob(jobId, $('applyProgress'), (result) => {
      log(t("log.applyDone"));
      show($('applyProgress'), false);
    });
    await refreshState();
  } catch (err) {
    log(t("log.applyFailed", { error: err.message }));
  } finally {
    $('applyBtn').disabled = false;
  }
}

async function startVerify() {
  try {
    $('verifyBtn').disabled = true;
    const { jobId } = await api('/api/verify', { method: 'POST' });
    await pollJob(jobId, $('verifyProgress'), (result) => {
      $('verifySummary').textContent = JSON.stringify(result, null, 2);
      log(t("log.verifyDone"));
      show($('verifyProgress'), false);
    });
  } catch (err) {
    log(t("log.verifyFailed", { error: err.message }));
  } finally {
    $('verifyBtn').disabled = false;
  }
}

$('neteaseQrBtn').addEventListener('click', startNeteaseQr);
$('exportBtn').addEventListener('click', startExport);
$('spotifyLoginBtn').addEventListener('click', startSpotifyLogin);
$('spotifyLogoutBtn').addEventListener('click', logoutSpotify);
$('matchBtn').addEventListener('click', startMatch);
$('applyBtn').addEventListener('click', startApply);
$('verifyBtn').addEventListener('click', startVerify);

$('sourceSelect').addEventListener('change', (e) => {
  FLOW.source = e.target.value;
  renderFlow();
  pulseBadge();
});
$('destSelect').addEventListener('change', (e) => {
  FLOW.dest = e.target.value;
  renderFlow();
  pulseBadge();
});
$('swapBtn').addEventListener('click', () => {
  [FLOW.source, FLOW.dest] = [FLOW.dest, FLOW.source];
  $('sourceSelect').value = FLOW.source;
  $('destSelect').value = FLOW.dest;
  renderFlow();
  pulseBadge();
});

document.querySelectorAll('.card').forEach((card) => {
  card.addEventListener('pointermove', (e) => {
    const rect = card.getBoundingClientRect();
    card.style.setProperty('--mx', `${e.clientX - rect.left}px`);
    card.style.setProperty('--my', `${e.clientY - rect.top}px`);
  });
});

document.querySelectorAll('.pick-toggle button').forEach((btn) => {
  btn.addEventListener('click', () => setPickMode(btn.dataset.mode));
});

$('playlistSearch').addEventListener('input', renderExportedList);

document.querySelectorAll('.lang-toggle button').forEach((btn) => {
  btn.addEventListener('click', () => {
    if (currentLang !== btn.dataset.lang) {
      currentLang = btn.dataset.lang;
      applyLang();
    }
  });
});

applyLang();
pulseBadge();
