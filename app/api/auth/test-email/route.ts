import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // 檢查環境變數
    const smtpConfig = {
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      user: process.env.SMTP_USER,
      password: process.env.SMTP_PASSWORD ? '***已設定***' : '未設定',
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
    };

    if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
      return NextResponse.json({
        success: false,
        error: 'SMTP 環境變數未設定',
        config: smtpConfig,
      });
    }

    // 創建 transporter
    const transporter = nodemailer.createTransport({
      host: smtpConfig.host,
      port: smtpConfig.port,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    // 測試連接
    await transporter.verify();
    console.log('SMTP 連接驗證成功');

    return NextResponse.json({
      success: true,
      message: 'SMTP 配置正確，連接成功',
      config: smtpConfig,
    });
  } catch (error: any) {
    console.error('SMTP 測試失敗:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      details: {
        code: error.code,
        command: error.command,
        response: error.response,
        responseCode: error.responseCode,
      },
    }, { status: 500 });
  }
}

