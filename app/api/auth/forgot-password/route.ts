import { NextResponse } from 'next/server';
import crypto from 'crypto';
import dbConnect from '@/lib/db';
import UserModel from '@/lib/models/User';
import { sendPasswordResetEmail } from '@/lib/email';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: '請輸入電子郵件地址' },
        { status: 400 }
      );
    }

    await dbConnect();

    // 查找用戶
    const user = await UserModel.findOne({ email });

    // 為了安全，即使用戶不存在也返回成功訊息
    // 這樣可以防止惡意用戶通過這個 API 來探測哪些 email 已註冊
    if (!user || !user.password) {
      // 如果是 Google OAuth 用戶（沒有密碼），也返回成功
      return NextResponse.json({
        message: '如果該電子郵件已註冊，重設密碼的連結已發送到您的電子郵件',
      });
    }

    // 生成重置 token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date();
    resetTokenExpiry.setHours(resetTokenExpiry.getHours() + 1); // 1 小時後過期

    // 保存 token 到資料庫
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = resetTokenExpiry;
    await user.save();

    // 發送郵件
    const emailSent = await sendPasswordResetEmail(email, resetToken);

    if (!emailSent) {
      // 如果郵件發送失敗，清除 token
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save();

      console.error('郵件發送失敗，請檢查：');
      console.error('1. SMTP 環境變數是否正確設定');
      console.error('2. Gmail 是否已啟用「允許安全性較低的應用程式」或使用應用程式密碼');
      console.error('3. 網路連接是否正常');

      return NextResponse.json(
        { error: '郵件發送失敗，請檢查 SMTP 設定或稍後再試' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: '如果該電子郵件已註冊，重設密碼的連結已發送到您的電子郵件',
    });
  } catch (error) {
    console.error('Error in forgot-password:', error);
    return NextResponse.json(
      { error: '發生錯誤，請稍後再試' },
      { status: 500 }
    );
  }
}

