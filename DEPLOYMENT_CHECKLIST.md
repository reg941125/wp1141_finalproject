# Vercel 部署檢查清單

## ✅ 已檢查項目

### 1. 配置文件
- ✅ `package.json` - 依賴項正確
- ✅ `next.config.js` - 圖片域名配置正確
- ✅ `tsconfig.json` - TypeScript 配置正確
- ✅ `.gitignore` - 環境變數文件已忽略
- ✅ `vercel.json` - Vercel 配置存在

### 2. 環境變數需求

在 Vercel 環境變數設定中需要配置以下變數：

#### 必需變數：
```
MONGODB_URI=your_mongodb_atlas_connection_string
NEXTAUTH_URL=https://your-domain.vercel.app
NEXTAUTH_SECRET=your_nextauth_secret_key (至少 32 字符)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

#### 注意事項：
- `NEXTAUTH_URL` 必須設定為你的 Vercel 部署 URL（例如：`https://your-app.vercel.app`）
- `NEXTAUTH_SECRET` 可以使用以下命令生成：
  ```bash
  openssl rand -base64 32
  ```
  或使用線上工具：https://generate-secret.vercel.app/32

### 3. Google OAuth 設定

在 Google Cloud Console 中，確保已添加以下授權的重新導向 URI：
- `https://your-domain.vercel.app/api/auth/callback/google`

### 4. MongoDB Atlas 設定

- ✅ 確保 Network Access 允許所有 IP（`0.0.0.0/0`）或至少允許 Vercel 的 IP
- ✅ 確保資料庫使用者權限正確

### 5. 代碼檢查

#### 潛在問題：
1. ⚠️ **NextAuth v5 配置**：需要確保 `NEXTAUTH_SECRET` 或 `AUTH_SECRET` 已設定
2. ✅ **資料庫連接**：使用連接池，適合 Vercel Serverless
3. ✅ **圖片域名**：已配置 Cloudinary 和 Google 圖片域名
4. ✅ **環境變數檢查**：代碼中有適當的錯誤處理

### 6. 部署步驟

1. **推送代碼到 GitHub**
   ```bash
   git add .
   git commit -m "準備部署到 Vercel"
   git push origin main
   ```

2. **在 Vercel 中連接專案**
   - 前往 https://vercel.com
   - 點擊 "New Project"
   - 導入你的 GitHub 倉庫
   - 選擇框架：Next.js

3. **設定環境變數**
   - 在 Vercel 專案設定中添加所有必需的環境變數
   - 確保 `NEXTAUTH_URL` 設定為你的 Vercel URL

4. **部署**
   - Vercel 會自動檢測 Next.js 並開始構建
   - 等待構建完成

5. **驗證部署**
   - 檢查構建日誌是否有錯誤
   - 訪問部署的 URL 測試功能
   - 測試登入、註冊、上傳等功能

### 7. 常見問題排查

#### 構建失敗
- 檢查構建日誌中的錯誤訊息
- 確認所有依賴項都已正確安裝
- 確認 TypeScript 類型錯誤已修復

#### 運行時錯誤
- 檢查環境變數是否正確設定
- 檢查 MongoDB 連接是否正常
- 檢查 NextAuth 配置是否正確

#### OAuth 錯誤
- 確認 Google OAuth 的重新導向 URI 已正確設定
- 確認 `NEXTAUTH_URL` 與實際部署 URL 一致

#### 圖片上傳失敗
- 確認 Cloudinary 環境變數正確
- 檢查 Cloudinary Dashboard 的用量限制

### 8. 性能優化建議

- ✅ 使用 MongoDB 連接池（已實現）
- ✅ 圖片使用 Cloudinary CDN（已配置）
- ✅ 使用 Next.js Image 組件優化圖片（已使用）
- 考慮添加緩存策略
- 考慮使用 ISR（Incremental Static Regeneration）優化靜態頁面

## ⚠️ 需要手動檢查的項目

1. **環境變數**：確保所有環境變數在 Vercel 中正確設定
2. **Google OAuth**：確保重新導向 URI 包含生產環境 URL
3. **MongoDB Atlas**：確保 Network Access 允許 Vercel IP
4. **構建測試**：在本地運行 `npm run build` 確保沒有構建錯誤
5. **安裝依賴**：運行 `npm install` 安裝新增的依賴（clsx, tailwind-merge）

## 📝 部署後檢查清單

- [ ] 首頁可以正常訪問
- [ ] 登入功能正常（Google OAuth 和 Credentials）
- [ ] 註冊功能正常
- [ ] 題目討論區可以發文和回覆
- [ ] 家教專區可以發布和查看
- [ ] 題目與筆記專區可以上傳和編輯
- [ ] 個人檔案可以查看和編輯
- [ ] 圖片上傳功能正常
- [ ] 聊天功能正常
- [ ] 深色模式切換正常

