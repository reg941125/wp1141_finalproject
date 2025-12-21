# 題目與筆記功能恢復指南

## 📦 備份說明

為了半階段驗收，「題目與筆記」功能已暫時改為「開發中」狀態。
原有的功能代碼已完整保留在備份文件中。

## 📂 備份文件位置

```
app/(main)/library/
├── page.backup.tsx          # 原始主頁面
├── upload/
│   └── page.backup.tsx      # 原始上傳頁面
└── edit/[id]/
    └── page.backup.tsx      # 原始編輯頁面
```

## 🔄 恢復功能步驟

當需要恢復原始功能時，執行以下命令：

```bash
cd /home/liftleaf/webprogramming/finalproject

# 恢復主頁面
mv app/\(main\)/library/page.backup.tsx app/\(main\)/library/page.tsx

# 恢復上傳頁面
mv app/\(main\)/library/upload/page.backup.tsx app/\(main\)/library/upload/page.tsx

# 恢復編輯頁面
mv app/\(main\)/library/edit/\[id\]/page.backup.tsx app/\(main\)/library/edit/\[id\]/page.tsx
```

或使用單行命令：

```bash
cd /home/liftleaf/webprogramming/finalproject && \
mv app/\(main\)/library/page.backup.tsx app/\(main\)/library/page.tsx && \
mv app/\(main\)/library/upload/page.backup.tsx app/\(main\)/library/upload/page.tsx && \
mv app/\(main\)/library/edit/\[id\]/page.backup.tsx app/\(main\)/library/edit/\[id\]/page.tsx
```

## ✨ 現有功能說明

### 當前顯示（開發中頁面）：
- ✅ 美觀的「開發中」placeholder 頁面
- ✅ 說明即將推出的功能
- ✅ 開發進度條（裝飾性）
- ✅ 返回首頁按鈕
- ✅ 深色模式支持

### 備份的原始功能：
- ✅ 瀏覽所有題目文件
- ✅ 上傳新題目
- ✅ 編輯自己的題目
- ✅ 查看題目詳情
- ✅ 在個人檔案顯示題目

## 🔒 安全性

- 所有原始功能代碼完整保留
- 用戶無法訪問未完成的功能
- 自動重定向到主頁面（upload 和 edit 路由）
- 不會影響其他功能模塊

## 📝 注意事項

1. **備份文件不要刪除**：`.backup.tsx` 文件包含完整的原始代碼
2. **API 路由仍然存在**：相關的 `/api/questions` 路由仍在運作
3. **數據庫數據保留**：MongoDB 中的題目數據完全保留
4. **恢復後需重啟**：恢復文件後需要重啟開發服務器

## 🚀 驗收後的開發計劃

恢復功能後可繼續開發：
- [ ] 題目分類系統
- [ ] 搜尋和篩選功能
- [ ] 題目評分和評論
- [ ] 檔案預覽功能
- [ ] 收藏和書籤功能

