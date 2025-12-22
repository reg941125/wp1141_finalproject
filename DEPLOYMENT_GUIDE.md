# 部署指南

## 環境變量設置

### 必要的環境變量

在部署到生產環境時，請確保設置以下環境變量：

#### 1. `NEXT_PUBLIC_APP_URL`
應用程式的公開 URL，用於生成分享連結等功能。

**開發環境**:
```
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**生產環境**（請替換為你的實際域名）:
```
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

#### 2. `MONGODB_URI`
MongoDB 資料庫連接字串

```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database-name
```

#### 3. `NEXTAUTH_SECRET`
NextAuth.js 的加密密鑰（至少 32 字符）

```bash
# 生成隨機密鑰
openssl rand -base64 32
```

#### 4. `NEXTAUTH_URL`
應用程式的完整 URL（包含協議）

**生產環境**:
```
NEXTAUTH_URL=https://your-domain.com
```

---

## Vercel 部署步驟

1. 在 Vercel Dashboard 中，進入你的專案設置
2. 點擊 "Environment Variables"
3. 添加以下環境變量：
   - `NEXT_PUBLIC_APP_URL` = `https://your-domain.vercel.app`
   - `MONGODB_URI` = 你的 MongoDB 連接字串
   - `NEXTAUTH_SECRET` = 你生成的密鑰
   - `NEXTAUTH_URL` = `https://your-domain.vercel.app`

4. 重新部署應用程式

---

## 其他部署平台

### Netlify
在 Site settings → Build & deploy → Environment 中添加環境變量

### Railway
在專案設置的 Variables 標籤中添加環境變量

### Docker
在 `docker-compose.yml` 或 `.env` 文件中設置環境變量

---

## 貼文分享功能說明

### 自動使用正確的域名
分享功能會自動使用 `NEXT_PUBLIC_APP_URL` 環境變量：
- 如果設置了 `NEXT_PUBLIC_APP_URL`，使用該值
- 否則使用 `window.location.origin`（當前域名）

### 貼文連結內嵌功能
當用戶在貼文或回答中貼上貼文連結時，系統會自動：
1. 檢測格式為 `https://domain.com/questions/[postId]` 的連結
2. 將連結轉換為內嵌的貼文預覽卡片
3. 顯示貼文的標題、內容摘要、作者、統計資料等
4. 用戶可以直接點擊卡片查看完整貼文

支援的連結格式：
- `http://localhost:3000/questions/[24位16進制ID]`
- `https://your-domain.com/questions/[24位16進制ID]`

---

## 測試部署

部署後，請測試以下功能：
1. ✅ 分享按鈕生成的連結是否使用正確的域名
2. ✅ 複製的連結是否可以正常訪問
3. ✅ 在貼文中貼上連結是否正確顯示內嵌預覽
4. ✅ 內嵌預覽的數據是否正確載入
5. ✅ 點擊內嵌預覽是否能正常跳轉

---

## 故障排除

### 分享連結仍然顯示 localhost
- 檢查是否正確設置了 `NEXT_PUBLIC_APP_URL` 環境變量
- 確認環境變量在部署平台上已保存並生效
- 重新部署應用程式

### 內嵌預覽無法載入
- 檢查 API 路由 `/api/posts/[id]` 是否正常工作
- 確認資料庫連接正常
- 查看瀏覽器控制台的錯誤訊息

### 環境變量不生效
- 確認變量名稱正確（區分大小寫）
- `NEXT_PUBLIC_` 開頭的變量會在客戶端可用
- 重新構建和部署應用程式

