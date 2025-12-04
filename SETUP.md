# 環境變數設定指南

## 步驟 1: 複製環境變數檔案

```bash
cp .env.example .env.local
```

## 步驟 2: 設定各項服務

### MongoDB Atlas

1. 前往 [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. 註冊/登入帳號
3. 建立新的 Cluster（選擇免費方案即可）
4. 建立資料庫使用者（Database Access）
5. 設定網路存取（Network Access）- 允許所有 IP 或加入你的 IP
6. 點擊 "Connect" → "Connect your application"
7. 複製連接字串，替換 `<password>` 和 `<database>` 名稱
8. 將連接字串填入 `MONGODB_URI`

### NextAuth Secret

產生一個隨機字串：

```bash
# Windows PowerShell
[Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes((New-Guid).ToString()))

# 或使用線上工具產生隨機字串
# https://generate-secret.vercel.app/32
```

將產生的字串填入 `NEXTAUTH_SECRET`

### Google OAuth

1. 前往 [Google Cloud Console](https://console.cloud.google.com/)
2. 建立新專案或選擇現有專案
3. 啟用 Google+ API
4. 前往 "憑證" → "建立憑證" → "OAuth 2.0 用戶端 ID"
5. 應用程式類型選擇 "網頁應用程式"
6. 授權的重新導向 URI 加入：
   - `http://localhost:3000/api/auth/callback/google` (開發環境)
   - `https://your-domain.com/api/auth/callback/google` (生產環境)
7. 複製 Client ID 和 Client Secret 填入對應環境變數

### Cloudinary

1. 前往 [Cloudinary](https://cloudinary.com/)
2. 註冊/登入帳號（免費方案即可）
3. 前往 Dashboard
4. 複製以下資訊：
   - Cloud name
   - API Key
   - API Secret
5. 填入對應環境變數

## 步驟 3: 測試設定

1. 確認 `.env.local` 檔案已建立並填入所有必要的環境變數
2. 執行開發伺服器：

```bash
npm run dev
```

3. 訪問 `http://localhost:3000`
4. 測試註冊/登入功能
5. 測試各項功能是否正常運作

## 常見問題

### MongoDB 連線失敗
- 確認 Network Access 已允許你的 IP
- 確認連接字串中的密碼和資料庫名稱正確
- 確認 Cluster 已啟動

### Google OAuth 錯誤
- 確認授權的重新導向 URI 設定正確
- 確認 Client ID 和 Secret 正確
- 確認已啟用 Google+ API

### Cloudinary 上傳失敗
- 確認 API Key 和 Secret 正確
- 確認 Cloud name 正確
- 檢查 Cloudinary Dashboard 的用量限制


