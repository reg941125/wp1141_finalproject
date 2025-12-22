/**
 * 數據遷移腳本：將貼文的 subject 欄位轉為 tags
 * 
 * 運行方式：
 * npx ts-node scripts/migrate-subject-to-tags.ts
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

// 載入環境變數
dotenv.config({ path: path.join(__dirname, '../.env.local') });

// Post Schema（簡化版）
const PostSchema = new mongoose.Schema({
  title: String,
  content: String,
  tags: [String],
  level: String,
  subject: String,
  authorId: mongoose.Schema.Types.ObjectId,
  views: { type: Number, default: 0 },
  likes: { type: Number, default: 0 },
  createdAt: Date,
  updatedAt: Date,
});

const Post = mongoose.models.Post || mongoose.model('Post', PostSchema);

async function migrateSubjectToTags() {
  try {
    // 連接數據庫
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI not found in environment variables');
    }

    console.log('正在連接數據庫...');
    await mongoose.connect(mongoUri);
    console.log('✅ 數據庫連接成功');

    // 查找所有有 subject 欄位的貼文
    const postsWithSubject = await Post.find({
      subject: { $exists: true, $ne: null, $ne: '' }
    });

    console.log(`\n找到 ${postsWithSubject.length} 篇有科目的貼文`);

    if (postsWithSubject.length === 0) {
      console.log('沒有需要遷移的貼文');
      return;
    }

    let migratedCount = 0;
    let skippedCount = 0;

    for (const post of postsWithSubject) {
      const subject = post.subject.trim();
      
      // 檢查 tags 中是否已經包含這個 subject
      if (post.tags && post.tags.includes(subject)) {
        console.log(`⏭️  跳過: "${post.title}" (subject "${subject}" 已在 tags 中)`);
        skippedCount++;
        continue;
      }

      // 將 subject 加入 tags
      const updatedTags = [...(post.tags || []), subject];
      
      await Post.updateOne(
        { _id: post._id },
        { 
          $set: { tags: updatedTags },
          // 可選：移除 subject 欄位（如果確定不再需要）
          // $unset: { subject: '' }
        }
      );

      console.log(`✅ 已遷移: "${post.title}" - 將科目 "${subject}" 加入標籤`);
      migratedCount++;
    }

    console.log(`\n遷移完成！`);
    console.log(`✅ 成功遷移: ${migratedCount} 篇`);
    console.log(`⏭️  已跳過: ${skippedCount} 篇`);
    console.log(`📊 總計: ${postsWithSubject.length} 篇`);

  } catch (error) {
    console.error('❌ 遷移失敗:', error);
    throw error;
  } finally {
    // 關閉數據庫連接
    await mongoose.disconnect();
    console.log('\n數據庫連接已關閉');
  }
}

// 執行遷移
migrateSubjectToTags()
  .then(() => {
    console.log('\n🎉 遷移腳本執行完成！');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ 遷移腳本執行失敗:', error);
    process.exit(1);
  });


