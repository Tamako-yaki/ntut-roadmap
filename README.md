# NTUT EE Roadmap

`index.html` 是可攜式的單檔網頁版，不需要 Node.js、npm、React 或任何額外套件。

## 使用方式

直接以 Chrome、Firefox、Safari 或 Edge 開啟 `index.html` 即可。它也可放到任何靜態網站服務（例如 GitHub Pages、Cloudflare Pages 或自己的網頁空間）後，用網址在手機、平板與電腦上使用。

## 資料保存與跨裝置

勾選的選修與「跨域+自由」學分會存在**目前這個瀏覽器／裝置**的 localStorage 中；不會自動傳到雲端，也不會離開你的裝置。

要手動移轉資料：在舊裝置按「匯出規劃」複製資料，在新裝置開啟同一頁後按「匯入規劃」貼上即可。若希望每台裝置自動同步，還需要部署網站並連接帳號／資料庫服務。

原始 `ntut_roadmap.jsx` 仍保留未動；它是 React 元件，而且依賴原內嵌環境的 `window.storage`，因此不能直接用一般瀏覽器開啟。
