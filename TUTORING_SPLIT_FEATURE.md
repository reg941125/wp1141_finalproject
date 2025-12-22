# 家教專區分頁功能

## 功能概述

將原本的家教專區拆分成兩個獨立頁面：
1. **徵學生** (`/tutoring/seeking-students`)
2. **徵家教** (`/tutoring/seeking-tutors`)

### 主要改進
- ✅ 移除「類型」篩選器
- ✅ 每個頁面只顯示對應類型的招生文
- ✅ Navbar 添加下拉選單方便切換
- ✅ 保持原有的所有功能（按讚、標籤篩選、時薪篩選等）

---

## 路由結構

```
/tutoring                           → 重定向到 /tutoring/seeking-students
/tutoring/seeking-students          → 徵學生頁面
/tutoring/seeking-tutors            → 徵家教頁面
/tutoring/[id]                      → 招生文詳情頁（保持不變）
```

---

## 使用者介面

### Navbar（桌面版）

**原本**：
```
題目討論 | 家教專區 | 題目與筆記
```

**現在**：
```
題目討論 | 家教專區 ▼ | 題目與筆記
            ├─ 徵學生
            └─ 徵家教
```

### Navbar（移動版）

點擊選單圖示後，家教專區下方會展開兩個子選項：
```
題目討論
家教專區
  徵學生
  徵家教
題目與筆記
訊息
```

---

## 頁面功能

### 徵學生頁面 (`/tutoring/seeking-students`)

#### 標題
`徵學生`

#### 篩選條件
- 教育程度（國小、國中、高中、大學）
- 最低時薪
- 最高時薪
- 標籤

**移除的篩選器**：類型篩選（因為已固定為 `seeking_student`）

#### 顯示內容
- 只顯示類型為 `seeking_student` 的招生文
- 不顯示「徵家教」、「徵學生」的類型標籤（因為已經固定）

#### 發布按鈕
點擊「發布徵人訊息」時，對話框預設類型為「徵學生」

---

### 徵家教頁面 (`/tutoring/seeking-tutors`)

#### 標題
`徵家教`

#### 篩選條件
- 教育程度（國小、國中、高中、大學）
- 最低時薪
- 最高時薪
- 標籤

**移除的篩選器**：類型篩選（因為已固定為 `seeking_tutor`）

#### 顯示內容
- 只顯示類型為 `seeking_tutor` 的招生文
- 不顯示「徵家教」、「徵學生」的類型標籤（因為已經固定）

#### 發布按鈕
點擊「發布徵人訊息」時，對話框預設類型為「徵家教」

---

## 技術實現

### 1. 新增頁面

#### `/app/(main)/tutoring/seeking-students/page.tsx`
- 固定 `typeFilter` 為 `'seeking_student'`
- 移除類型選擇器
- 標題改為「徵學生」
- 傳遞 `defaultType="seeking_student"` 給 `JobPostingDialog`

#### `/app/(main)/tutoring/seeking-tutors/page.tsx`
- 固定 `typeFilter` 為 `'seeking_tutor'`
- 移除類型選擇器
- 標題改為「徵家教」
- 傳遞 `defaultType="seeking_tutor"` 給 `JobPostingDialog`

#### `/app/(main)/tutoring/page.tsx`
- 簡化為重定向頁面
- 自動導向 `/tutoring/seeking-students`

---

### 2. 修改 Navbar 組件

#### 新增 State
```typescript
const [isTutoringMenuOpen, setIsTutoringMenuOpen] = useState(false);
const tutoringMenuRef = useRef<HTMLDivElement>(null);
```

#### 桌面版下拉選單
```tsx
<div className="relative" ref={tutoringMenuRef}>
  <button onClick={() => setIsTutoringMenuOpen(!isTutoringMenuOpen)}>
    家教專區 ▼
  </button>
  {isTutoringMenuOpen && (
    <div className="dropdown-menu">
      <Link href="/tutoring/seeking-students">徵學生</Link>
      <Link href="/tutoring/seeking-tutors">徵家教</Link>
    </div>
  )}
</div>
```

#### 移動版展開選項
```tsx
<div>
  <div className="title">家教專區</div>
  <Link href="/tutoring/seeking-students">徵學生</Link>
  <Link href="/tutoring/seeking-tutors">徵家教</Link>
</div>
```

#### 點擊外部關閉
更新 `useEffect` 來監聽 `isTutoringMenuOpen`，點擊外部時關閉下拉選單。

---

### 3. 修改 JobPostingDialog 組件

#### 新增 Prop
```typescript
interface JobPostingDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: JobPostingData) => void;
  defaultType?: 'seeking_tutor' | 'seeking_student'; // 新增
}
```

#### 使用 defaultType
```typescript
export default function JobPostingDialog({
  isOpen,
  onClose,
  onSubmit,
  defaultType = 'seeking_tutor', // 預設值
}: JobPostingDialogProps) {
  const [formData, setFormData] = useState<JobPostingData>({
    type: defaultType, // 使用傳入的 defaultType
    // ...
  });
```

---

## 資料流程

### 發布招生文

**徵學生頁面**：
```
使用者點擊「發布徵人訊息」
    ↓
<JobPostingDialog defaultType="seeking_student" />
    ↓
對話框預設選擇「徵學生」
    ↓
使用者填寫表單並提交
    ↓
POST /api/jobs { type: "seeking_student", ... }
    ↓
重新載入徵學生列表
```

**徵家教頁面**：
```
使用者點擊「發布徵人訊息」
    ↓
<JobPostingDialog defaultType="seeking_tutor" />
    ↓
對話框預設選擇「徵家教」
    ↓
使用者填寫表單並提交
    ↓
POST /api/jobs { type: "seeking_tutor", ... }
    ↓
重新載入徵家教列表
```

### 篩選招生文

**API 請求**：
```typescript
// 徵學生
const params = new URLSearchParams();
params.append('type', 'seeking_student'); // 固定
if (tagFilter) params.append('tag', tagFilter);
if (educationFilter !== 'all') params.append('educationLevel', educationFilter);
// ...

const response = await fetch(`/api/jobs?${params.toString()}`);
```

**後端處理**：
- `/api/jobs` 接收 `type` 參數並只返回對應類型的招生文
- 其他篩選邏輯保持不變

---

## 優勢

### 🎯 使用體驗提升
1. **更清晰的分類**：徵學生和徵家教分開，不會混淆
2. **更快的篩選**：不需要先選擇類型才能瀏覽
3. **更直觀的導航**：從選單直接選擇想看的類型

### 📊 介面簡化
1. **減少篩選選項**：移除類型篩選器，減少認知負擔
2. **頁面更簡潔**：不顯示類型標籤，因為已經明確
3. **佈局更整齊**：篩選器從 4 欄變成 3 欄

### 💡 功能完整性
1. **保留所有功能**：按讚、標籤篩選、時薪篩選等都保留
2. **發布體驗優化**：自動預設正確的招生類型
3. **向下相容**：`/tutoring` 路徑自動重定向，不會404

---

## 對比表

| 功能 | 舊版 | 新版 |
|------|------|------|
| 類型篩選器 | ✅ 有 | ❌ 移除 |
| 頁面導航 | 單一頁面 | 兩個獨立頁面 + 下拉選單 |
| 類型標籤 | ✅ 顯示 | ❌ 不顯示（已固定） |
| 發布預設類型 | 徵家教 | 根據當前頁面 |
| 篩選器數量 | 4 個 | 3 個 |
| URL 結構 | `/tutoring` | `/tutoring/seeking-students` 或 `/tutoring/seeking-tutors` |

---

## 測試場景

### ✅ 基本功能測試

1. **導航測試**
   - [ ] 點擊 Navbar 的「家教專區」顯示下拉選單
   - [ ] 點擊「徵學生」進入徵學生頁面
   - [ ] 點擊「徵家教」進入徵家教頁面
   - [ ] 點擊外部，下拉選單關閉

2. **徵學生頁面**
   - [ ] 標題顯示「徵學生」
   - [ ] 只顯示 `seeking_student` 類型的招生文
   - [ ] 沒有類型篩選器
   - [ ] 點擊「發布徵人訊息」，對話框預設為「徵學生」

3. **徵家教頁面**
   - [ ] 標題顯示「徵家教」
   - [ ] 只顯示 `seeking_tutor` 類型的招生文
   - [ ] 沒有類型篩選器
   - [ ] 點擊「發布徵人訊息」，對話框預設為「徵家教」

4. **篩選功能**
   - [ ] 教育程度篩選正常
   - [ ] 時薪篩選正常
   - [ ] 標籤篩選正常
   - [ ] 按讚功能正常

5. **響應式設計**
   - [ ] 移動版選單顯示家教專區的子選項
   - [ ] 點擊子選項正確導航
   - [ ] 選單自動關閉

6. **重定向測試**
   - [ ] 訪問 `/tutoring` 自動重定向到 `/tutoring/seeking-students`
   - [ ] 顯示「正在導向...」提示

---

## 未來改進建議

### 1. 頁面記憶
- 記住使用者上次瀏覽的是徵學生還是徵家教
- 下次訪問 `/tutoring` 時導向上次的頁面

### 2. 數量顯示
- 在 Navbar 下拉選單中顯示每種類型的招生文數量
```
家教專區 ▼
  ├─ 徵學生 (12)
  └─ 徵家教 (8)
```

### 3. 快速切換
- 在頁面頂部添加切換按鈕
```
[ 徵學生 ] | [ 徵家教 ]
     ↑ 當前頁面
```

### 4. URL 參數過濾
- 支援 URL 參數來保留篩選狀態
- 例如：`/tutoring/seeking-students?tag=數學&education=high`

---

## 相關檔案

### 新增
- `app/(main)/tutoring/seeking-students/page.tsx`
- `app/(main)/tutoring/seeking-tutors/page.tsx`

### 修改
- `app/(main)/tutoring/page.tsx` - 簡化為重定向
- `components/Navbar.tsx` - 添加下拉選單
- `components/JobPostingDialog.tsx` - 添加 `defaultType` prop

### 保持不變
- `app/(main)/tutoring/[id]/page.tsx` - 招生文詳情頁
- `app/api/jobs/route.ts` - API 端點
- `components/JobPostingDialog.tsx` - 對話框主體邏輯

---

## 總結

這次更新成功將家教專區拆分為兩個專注的頁面：
- ✅ **更清晰**：徵學生和徵家教分開
- ✅ **更簡潔**：移除不必要的類型篩選器
- ✅ **更直觀**：下拉選單方便切換
- ✅ **功能完整**：保留所有原有功能
- ✅ **向下相容**：舊連結自動重定向

是現代 web 應用的標準做法，提升了使用者體驗和介面清晰度！

