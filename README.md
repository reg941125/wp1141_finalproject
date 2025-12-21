# 家教網平台

一個全端家教網平台，包含題目討論區、家教專區、題目與筆記專區、個人檔案系統。

## 功能特色

- **題目討論區**: 可以發問題目，其他用戶可以解答（支援 Markdown、LaTeX、圖片上傳）
- **家教專區**: 可以發布徵家教或徵學生的訊息，支援多種篩選條件
- **題目與筆記專區**: 可以上傳和管理題目檔案，支援 Markdown 編輯和 PDF 匯出
- **個人檔案**: 類似 X (Twitter) 的個人檔案系統，可以顯示教學經歷、題目和徵人訊息

## 技術棧

- **前端框架**: Next.js 14+ (App Router) with TypeScript
- **認證**: NextAuth.js v5 (Auth.js)
- **資料庫**: MongoDB Atlas with Mongoose
- **檔案儲存**: Cloudinary
- **樣式**: TailwindCSS
- **LaTeX 渲染**: MathJax
- **Markdown**: react-markdown
- **PDF 匯出**: jsPDF
- **部署**: Vercel

## 環境變數設定

複製 `.env.example` 並建立 `.env.local`，填入以下環境變數：

```env
# MongoDB
MONGODB_URI=your_mongodb_atlas_connection_string

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret_key

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Email (for password reset)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password
SMTP_FROM=your_email@gmail.com
```

## 安裝與執行

```bash
# 安裝依賴
npm install

# 開發模式
npm run dev

# 建置
npm run build

# 生產模式
npm start
```

## LaTeX 語法

- `\in{equation}` - 行內數學式
- `\block{equation}` - 區塊數學式

## 部署

專案已設定好 Vercel 部署配置，可以直接推送到 GitHub 並在 Vercel 上部署。

## 專案結構

```
├── app/                    # Next.js App Router 頁面
│   ├── (auth)/            # 認證相關頁面
│   ├── (main)/            # 主要功能頁面
│   └── api/               # API routes
├── components/            # React 元件
├── lib/                   # 工具函數和設定
│   ├── models/           # Mongoose models
│   ├── auth.ts           # NextAuth 設定
│   └── db.ts             # MongoDB 連線
└── types/                 # TypeScript 型別定義
```
