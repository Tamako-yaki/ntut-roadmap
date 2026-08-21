# NTUT EE Roadmap

`index.html` 是可攜式的單檔網頁版，不需要 Node.js、npm、React 或任何額外套件。

## 使用方式

直接以 Chrome、Firefox、Safari 或 Edge 開啟 `index.html` 即可。它也可放到任何靜態網站服務（例如 GitHub Pages、Cloudflare Pages 或自己的網頁空間）後，用網址在手機、平板與電腦上使用。

## 一鍵部署到 GitHub Pages

本專案已經自動部署到 GitHub Pages！你可以直接訪問：

**🌐 https://tamako-yaki.github.io/ntut-roadmap/**

### 手動更新部署

如果你修改了 `index.html` 或其他檔案，可以按照以下步驟更新部署：

```bash
# 1. 提交你的修改
git add .
git commit -m "你的修改訊息"

# 2. 推送到 GitHub
git push
```

GitHub Pages 通常會在幾分鐘內自動更新。

### 從零開始部署

如果你要在自己的帳號下部署：

1. **Fork 本倉庫** 到你的 GitHub 帳號
2. **設定 GitHub Pages**：
   - 進入倉庫設定 → Pages
   - 來源選擇 `master` 分支 `/ (root)` 目錄
   - 點擊 Save
3. 部署完成後，你的網站會在 `https://<你的用戶名>.github.io/ntut-roadmap/` 可用

## 資料保存與跨裝置

勾選的選修與「跨域+自由」學分會存在**目前這個瀏覽器／裝置**的 localStorage 中；不會自動傳到雲端，也不會離開你的裝置。

要手動移轉資料：在舊裝置按「匯出規劃」複製資料，在新裝置開啟同一頁後按「匯入規劃」貼上即可。若希望每台裝置自動同步，還需要部署網站並連接帳號／資料庫服務。

## 專案結構

- `index.html` - 可獨立運行的網頁版本，所有功能完整
- `ntut_roadmap.jsx` - 原始 React 組件版本（依賴 `window.storage`，需特定環境執行）
- `README.md` - 本說明文件

原始 `ntut_roadmap.jsx` 仍保留未動；它是 React 元件，而且依賴原內嵌環境的 `window.storage`，因此不能直接用一般瀏覽器開啟。
