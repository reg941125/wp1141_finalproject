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

### Email (SMTP) - 用於忘記密碼功能

#### 使用 Gmail

1. 前往 [Google Account](https://myaccount.google.com/)
2. 前往「安全性」→「兩步驟驗證」（如果尚未啟用，請先啟用）
3. 前往「應用程式密碼」：
   - 選擇「應用程式」：郵件
   - 選擇「裝置」：其他（自訂名稱）
   - 點擊「產生」
   - 複製產生的 16 位元應用程式密碼
4. 填入環境變數：
   ```
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your_email@gmail.com
   SMTP_PASSWORD=your_16_digit_app_password
   SMTP_FROM=your_email@gmail.com
   ```

#### 使用其他 SMTP 服務

根據您的 SMTP 服務提供商設定：
- `SMTP_HOST`: SMTP 伺服器地址（例如：smtp.gmail.com）
- `SMTP_PORT`: SMTP 端口（通常為 587 或 465）
- `SMTP_USER`: SMTP 使用者名稱（通常是您的電子郵件）
- `SMTP_PASSWORD`: SMTP 密碼或應用程式密碼
- `SMTP_FROM`: 發送郵件的地址（通常與 SMTP_USER 相同）

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

### 郵件發送失敗
- 確認 SMTP 設定正確
- 如果使用 Gmail，確認已啟用兩步驟驗證並使用應用程式密碼
- 確認 SMTP 端口正確（587 用於 TLS，465 用於 SSL）
- 檢查防火牆是否阻擋 SMTP 連接

### PostHog Analytics (選填)

PostHog 是一個開源的產品分析平台，用於追蹤用戶行為和分析產品使用情況。

1. 前往 [PostHog](https://posthog.com/)
2. 註冊/登入帳號（有免費方案）
3. 建立新專案
4. 在專案設定中複製 Project API Key
5. 填入環境變數：
   ```
   NEXT_PUBLIC_POSTHOG_KEY=your_posthog_project_api_key
   NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com
   NEXT_PUBLIC_POSTHOG_SESSION_RECORDING=false  # 設為 true 啟用 session recording
   ```

**注意**：
- PostHog 是選填功能，如果不設定環境變數，應用程式仍可正常運作
- `NEXT_PUBLIC_POSTHOG_HOST` 預設為 `https://us.i.posthog.com`，如果使用其他地區的 PostHog 實例，請修改此值
- Session recording 會記錄用戶的瀏覽行為，請確保符合隱私政策要求




