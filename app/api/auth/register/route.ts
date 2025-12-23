import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import UserModel from '@/lib/models/User';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { sendVerificationEmail } from '@/lib/email';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: '請填寫所有欄位' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: '密碼長度至少需要 6 個字元' },
        { status: 400 }
      );
    }

    await dbConnect();

    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: '此電子郵件已被使用' },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // 生成驗證 token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationExpires = new Date();
    verificationExpires.setHours(verificationExpires.getHours() + 24); // 24 小時後過期

    const user = await UserModel.create({
      name,
      email,
      password: hashedPassword,
      image: 'https://res.cloudinary.com/dga4lpnml/image/upload/v1734963000/default-avatar_rbpybo.png',
      emailVerified: false,
      emailVerificationToken: verificationToken,
      emailVerificationExpires: verificationExpires,
    });

    // 發送驗證郵件
    const emailSent = await sendVerificationEmail(email, verificationToken, name);
    
    if (!emailSent) {
      console.error('驗證郵件發送失敗，但用戶已創建');
      // 即使郵件發送失敗，也返回成功，但提示用戶檢查郵件設定
    }

    return NextResponse.json(
      { 
        message: '註冊成功！請檢查您的電子郵件以驗證帳號。', 
        userId: user._id,
        emailSent 
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: '註冊失敗，請稍後再試' },
      { status: 500 }
    );
  }
}





