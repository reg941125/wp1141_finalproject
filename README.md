# 家教網平台

一個全端家教網平台，包含題目討論區、家教專區、題目與筆記專區、個人檔案系統。  
posthog link: https://us.posthog.com/shared/rS4f_31fGuaEheXdicw5e7uwyknDGA  
vercel deploy link: https://wp1141-finalproject.vercel.app/

## 功能說明
- 登入系統
    - 可自行選擇使用站內註冊或 Google OAuth
    - 註冊後會傳送信件驗證
    - 若站內註冊使用的是 Gmail，日後登入也可以直接透過 Google OAuth 登入（同一支郵件但不同註冊途徑會視為同個帳號）
    - 忘記密碼時可以透過傳送的信件重設密碼

- 題目討論
    - 可讓使用者瀏覽網站上使用者發問的題目
    - 也可以透過搜尋關鍵字、選擇特定標籤找到想要的貼文
    - 使用者可以對貼文按讚，點進貼文後可以查看按讚者；點擊留言圖示可以進入留言區；也可以點擊分享貼文圖示，將該貼文複製到其他地方
    - 貼文會顯示按讚數、留言數，以及瀏覽次數
    - 發文區
        - 可以輸入標題、標籤、科目等基本資訊
        - 文章輸入框支援 Markdown 與 Latex 輸入：大框架語法和 Markdown 一樣，數學式部分使用 `/in{}` (行內數學式) 或 `/block{}` (區塊數學式) 將數學式框起來。請特別注意這兩個指令是正斜線，但其中的數學式指令是反斜線，例如：$\sqrt{2}$ 的指令是 `/in{\sqrt{2}}`。
        - 支援檔案上傳功能，將會以區塊形式出現在文章中。使用者可以自由在前後加字。如果偵測到是圖片，將會以圖片形式出現。
        - 支援連結。若連結中有預覽內容，將會顯示在貼文中。如果連結是此網站的其他貼文，複製連結過來將會特別顯示嵌入內容。
    - 每篇文都會顯示發文的使用者，可以點擊查看該使用者的 profile。
- 家教專區
    - 為求版面整潔，分成了徵家教、徵學生兩個頁面。
    - 發布徵人訊息
        - 可以選擇徵選類型，輸入標題、學生程度、時薪區間、標籤、詳細要求。
    - 使用者一樣可以點擊查看個人檔案。（私訊方法請見個人檔案）
- 題目與筆記
    - 可以瀏覽使用者上傳的各樣題庫等資料。
    - 可以透過關鍵字或標籤搜尋各樣資料。
    - 分享題目 / 筆記
        - 可以輸入名稱/描述
        - 可以選擇科目 (目前只有高中版本的科目；如有其他科目，請選擇其他)、難度、標籤
        - 可以選擇上傳檔案來當作題庫，也可以直接在文字內容中輸入想要的內容
        - 可以選擇是否公開 / 是否顯示在個人檔案中
    - 可以點進使用者上傳的檔案並下載。
- 訊息
    - 可以和其他使用者傳訊息。
    - 若有未讀訊息，將會自動捲動至未讀訊息處；若沒有，會自動捲動至最下方。
    - 傳送的每則訊息除了顯示傳送時間，也有雙階段打勾：第一個勾代表訊息有傳送成功，第二個勾代表對方有打開聊天室閱讀訊息（即已讀）。
    - 可以使用搜尋功能尋找聊天室使用者。
- 個人檔案
    - 可以瀏覽自己的個人頁面。可以選擇自己的教育程度、教學經歷、徵人訊息等顯示在上面。自己上傳過的筆記資料（有選擇顯示在個人檔案中的）也會顯示在個人頁面中。
    - 在編輯個人檔案中，可以編輯 banner、profile picture、用戶名等。其中教學經歷可使用 Markdown 與 LaTeX 語法。
- 其他
     - 全站搜尋功能（放大鏡）：可以搜尋全站的資料，包括題目討論、家教專區、題目與筆記，以及使用者個人檔案。
     - 通知（小鈴鐺）：當使用者發的貼文收到按讚，或有人追蹤，將在通知裡收到。

- 管理後台
    - 在網址後加上 `/admin`
    - 輸入管理者密碼（放在 README.md 中）
    - 可以刪除使用者與發布公告

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

# 應用程式 URL（用於分享連結等功能）
NEXT_PUBLIC_APP_URL=http://localhost:3000

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

# Admin Password (for admin panel)
ADMIN_PASSWORD=your_admin_password
```

**注意**: 如果未設定 `ADMIN_PASSWORD`，預設密碼為 `admin123456`。建議在生產環境中設定一個強密碼。

**管理員密碼建議**: 使用以下命令生成一個安全的隨機密碼：
```bash
node -e "console.log(require('crypto').randomBytes(16).toString('hex'))"
```

例如，生成的密碼可能是：`c0a6831930d3f2d26cf124a919ac636d`

## 前置需求

在開始之前，請確保您的系統已安裝以下軟體：

- **Node.js**: 18.0.0 或更高版本
- **npm**: 9.0.0 或更高版本（通常隨 Node.js 一起安裝）
- **Git**: 用於克隆專案

您可以透過以下命令檢查版本：

```bash
node --version
npm --version
git --version
```

## 本地安裝與測試步驟

### 步驟 1: 克隆專案

```bash
# 如果專案在 GitHub 上
git clone <repository-url>
cd wp1141_finalproject

# 或直接下載並解壓縮專案檔案
```

### 步驟 2: 安裝依賴套件

```bash
npm install
```

此步驟會安裝所有必要的 npm 套件，包括 Next.js、React、MongoDB 驅動程式等。安裝過程可能需要幾分鐘。

### 步驟 3: 設定環境變數

#### 3.1 建立環境變數檔案

在專案根目錄建立 `.env.local` 檔案：

```bash
# Windows (PowerShell)
New-Item -Path .env.local -ItemType File

# macOS/Linux
touch .env.local
```

#### 3.2 取得各項服務的憑證

**MongoDB Atlas（資料庫）:**

1. 前往 [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. 註冊帳號並建立免費叢集（Free Tier）
3. 建立資料庫使用者（Database Access）
4. 設定網路存取（Network Access），允許所有 IP（0.0.0.0/0）或您的 IP
5. 點擊 "Connect" → "Connect your application"
6. 複製連接字串，格式類似：`mongodb+srv://username:password@cluster.mongodb.net/dbname?retryWrites=true&w=majority`

**NextAuth Secret（認證密鑰）:**

生成一個隨機字串作為 `NEXTAUTH_SECRET`：

```bash
# 使用 OpenSSL（如果已安裝）
openssl rand -base64 32

# 或使用 Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

**Google OAuth（選用，用於 Google 登入）:**

1. 前往 [Google Cloud Console](https://console.cloud.google.com/)
2. 建立新專案或選擇現有專案
3. 啟用 Google+ API
4. 前往 "憑證" → "建立憑證" → "OAuth 用戶端 ID"
5. 應用程式類型選擇 "網頁應用程式"
6. 授權的重新導向 URI 設定為：`http://localhost:3000/api/auth/callback/google`
7. 複製 Client ID 和 Client Secret

**Cloudinary（檔案儲存，選用）:**

1. 前往 [Cloudinary](https://cloudinary.com/)
2. 註冊免費帳號
3. 在 Dashboard 中找到：
   - Cloud Name
   - API Key
   - API Secret

**Email SMTP（用於密碼重設，選用）:**

如果使用 Gmail：

1. 前往 Google 帳號設定 → 安全性
2. 啟用「兩步驟驗證」
3. 前往「應用程式密碼」
4. 選擇「郵件」和「其他（自訂名稱）」
5. 產生應用程式密碼並複製

#### 3.3 填入環境變數

將以下內容填入 `.env.local`，並替換為您的實際值：

```env
# MongoDB
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname?retryWrites=true&w=majority

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_generated_secret_key_here

# 應用程式 URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Google OAuth（選用）
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Cloudinary（選用，用於檔案上傳）
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Email SMTP（選用，用於密碼重設功能）
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password
SMTP_FROM=your_email@gmail.com
```

**注意事項：**
- `.env.local` 檔案已加入 `.gitignore`，不會被提交到版本控制
- 如果某些功能不需要（如 Google OAuth、Cloudinary），可以暫時不填寫，但相關功能將無法使用
- MongoDB URI 是**必須的**，否則應用程式無法啟動

### 步驟 4: 啟動開發伺服器

```bash
npm run dev
```

成功啟動後，您應該會看到類似以下的訊息：

```
  ▲ Next.js 14.2.0
  - Local:        http://localhost:3000
  - Ready in 2.3s
```

在瀏覽器中開啟 `http://localhost:3000` 即可看到應用程式。

### 步驟 5: 測試各項功能

#### 5.1 測試認證系統

**註冊新帳號：**
1. 前往首頁，點擊「登入」
2. 選擇「註冊」標籤
3. 填入姓名、電子郵件、密碼
4. 點擊「註冊」
5. 確認可以成功註冊並自動登入

**Google OAuth 登入（如果已設定）：**
1. 點擊「使用 Google 登入」
2. 選擇 Google 帳號
3. 確認可以成功登入

**忘記密碼功能（如果已設定 SMTP）：**
1. 在登入頁面點擊「忘記密碼？」
2. 輸入註冊的電子郵件
3. 檢查郵件收件匣（可能需要在垃圾郵件中查找）
4. 點擊郵件中的重設連結
5. 設定新密碼並確認可以成功登入

#### 5.2 測試題目討論區

1. 登入後，在首頁可以看到題目列表
2. 點擊「新增題目」或「發問」按鈕
3. 填寫標題、內容（支援 Markdown 和 LaTeX）
4. 選擇標籤、年級、科目
5. 發布後確認題目出現在列表中
6. 點擊題目進入詳情頁
7. 測試新增解答功能
8. 測試點讚功能
9. 測試分享功能

**LaTeX 測試：**
在內容中輸入：
- 行內數學：`這是行內數學 \in{x^2 + y^2 = z^2}`
- 區塊數學：`\block{\int_{0}^{\infty} e^{-x^2} dx = \frac{\sqrt{\pi}}{2}}`

#### 5.3 測試家教專區

**徵家教功能：**
1. 前往「家教專區」→「徵家教」
2. 點擊「發布徵家教訊息」
3. 填寫標題、描述、標籤、教育程度、時薪範圍、詳細要求
4. 發布後確認出現在列表中
5. 點擊進入詳情頁查看

**徵學生功能：**
1. 前往「家教專區」→「徵學生」
2. 重複上述步驟測試

**編輯與刪除：**
1. 發布後，在詳情頁應該可以看到「編輯」和「刪除」按鈕（僅限自己的貼文）
2. 測試編輯功能
3. 測試刪除功能

#### 5.4 測試題目與筆記專區

1. 前往「題目與筆記」頁面
2. 測試篩選功能（科目、難度、標籤）
3. 測試搜尋功能

**上傳檔案：**
1. 點擊「上傳檔案」按鈕
2. 選擇檔案（PDF、圖片等）
3. 填寫名稱、描述、科目、難度、標籤
4. 選擇是否公開
5. 選擇「儲存成草稿」或「發布」
6. 確認檔案出現在列表中

**新增筆記：**
1. 點擊「新增筆記」按鈕
2. 填寫名稱、描述、科目、難度、標籤
3. 在編輯器中輸入 Markdown 內容（支援 LaTeX）
4. 選擇「儲存成草稿」或「發布」
5. 確認筆記出現在列表中

**草稿功能：**
1. 點擊「我的草稿」按鈕
2. 確認可以看到所有草稿
3. 點擊草稿進行編輯
4. 測試「儲存成草稿」和「發布」按鈕

**查看與下載：**
1. 點擊列表中的檔案/筆記
2. 確認可以查看內容
3. 測試下載功能（如果有檔案）

#### 5.5 測試個人檔案

1. 點擊導航列中的使用者名稱或頭像
2. 前往個人檔案頁面
3. 確認可以看到：
   - 個人資訊（姓名、自我介紹、教學經歷）
   - 公開的題目與筆記
   - 發布的家教/學生徵求訊息

**編輯個人檔案：**
1. 點擊「編輯個人檔案」
2. 修改姓名、自我介紹、教學經歷、教育程度
3. 上傳頭像（如果已設定 Cloudinary）
4. 儲存後確認變更已生效

#### 5.6 測試訊息功能

1. 點擊導航列中的「訊息」圖示
2. 確認可以看到對話列表
3. 點擊對話進入聊天頁面
4. 輸入訊息並發送
5. 確認訊息顯示正確
6. 測試已讀/未讀狀態

### 步驟 6: 建置測試

確認所有功能正常後，測試生產建置：

```bash
# 建置專案
npm run build

# 如果建置成功，啟動生產模式
npm start
```

生產模式會在 `http://localhost:3000` 運行，但這是優化後的版本，用於測試生產環境的行為。

## 常見問題排除

### 問題 1: MongoDB 連線失敗

**錯誤訊息：** `MongooseError: Operation timed out` 或 `MongoNetworkError`

**解決方法：**
1. 確認 MongoDB Atlas 中的網路存取設定允許您的 IP
2. 確認 MongoDB URI 格式正確
3. 檢查防火牆設定
4. 確認資料庫使用者名稱和密碼正確

### 問題 2: NextAuth 錯誤

**錯誤訊息：** `NEXTAUTH_SECRET is not set`

**解決方法：**
1. 確認 `.env.local` 檔案存在
2. 確認 `NEXTAUTH_SECRET` 已設定
3. 重新啟動開發伺服器

### 問題 3: Google OAuth 錯誤

**錯誤訊息：** `redirect_uri_mismatch`

**解決方法：**
1. 確認 Google Cloud Console 中的授權重新導向 URI 設定為：`http://localhost:3000/api/auth/callback/google`
2. 確認 `NEXTAUTH_URL` 環境變數設定為 `http://localhost:3000`

### 問題 4: Cloudinary 上傳失敗

**錯誤訊息：** `Invalid API key` 或 `Upload failed`

**解決方法：**
1. 確認 Cloudinary 的三個環境變數都已正確設定
2. 確認 API Key 和 API Secret 正確
3. 檢查 Cloudinary Dashboard 中的設定

### 問題 5: Email 發送失敗

**錯誤訊息：** `SMTP connection failed` 或 `Authentication failed`

**解決方法：**
1. 如果使用 Gmail，確認已啟用「兩步驟驗證」並使用「應用程式密碼」
2. 確認 SMTP 設定正確（Gmail 使用 `smtp.gmail.com:587`）
3. 檢查防火牆是否阻擋 SMTP 連線

### 問題 6: 建置錯誤

**錯誤訊息：** `Type error` 或 `Module not found`

**解決方法：**
1. 刪除 `node_modules` 和 `package-lock.json`
2. 重新執行 `npm install`
3. 確認所有 TypeScript 類型錯誤已修復
4. 執行 `npm run build` 查看詳細錯誤訊息

### 問題 7: 頁面無法載入或顯示空白

**解決方法：**
1. 檢查瀏覽器控制台是否有錯誤訊息
2. 確認開發伺服器正在運行
3. 確認 MongoDB 連線正常
4. 清除瀏覽器快取並重新載入

## 開發指令

```bash
# 安裝依賴
npm install

# 開發模式（熱重載）
npm run dev

# 建置專案
npm run build

# 生產模式
npm start

# 執行 Lint 檢查
npm run lint
```

## 其他注意事項

- **開發模式**：使用 `npm run dev` 時，Next.js 會啟用熱重載（Hot Reload），修改程式碼後會自動重新編譯
- **環境變數**：修改 `.env.local` 後需要重新啟動開發伺服器才會生效
- **資料庫**：首次運行時，MongoDB 會自動建立必要的集合（collections）
- **快取**：如果遇到奇怪的問題，嘗試清除 `.next` 資料夾並重新建置

## LaTeX 語法

- `\in{equation}` - 行內數學式
- `\block{equation}` - 區塊數學式

## 管理員後台

專案包含一個管理員後台系統，可以管理用戶和發布公告。

### 訪問管理員後台

1. 訪問 `/admin/login` 頁面
2. 輸入管理員密碼（預設為 `admin123456` 或環境變數 `ADMIN_PASSWORD` 設定的值）
3. 登入後即可訪問管理後台

### 管理員功能

- **用戶管理**：查看所有用戶列表，可以刪除用戶帳號
- **公告管理**：發布、查看和刪除系統公告
- 公告會自動顯示在首頁頂部，所有用戶都可以看到

### 安全建議

- 在生產環境中，務必設定一個強密碼作為 `ADMIN_PASSWORD` 環境變數
- 建議定期更換管理員密碼
- 管理員後台使用 cookie-based 認證，登出後會清除 session

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