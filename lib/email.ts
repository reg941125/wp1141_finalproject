import nodemailer from 'nodemailer';

// 驗證環境變數
if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
  console.warn('警告: SMTP 環境變數未設定，郵件發送功能將無法使用');
}

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false, // 允許自簽名證書
  },
});

export async function sendPasswordResetEmail(email: string, resetToken: string) {
  const resetUrl = `${process.env.NEXTAUTH_URL || process.env.AUTH_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;

  const mailOptions = {
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to: email,
    subject: '重設密碼 - 家教網平台',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #2563eb;">重設密碼</h2>
        <p>您好，</p>
        <p>我們收到了您重設密碼的請求。請點擊以下連結來重設您的密碼：</p>
        <p style="margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">重設密碼</a>
        </p>
        <p>或者複製以下連結到瀏覽器：</p>
        <p style="word-break: break-all; color: #2563eb;">${resetUrl}</p>
        <p style="margin-top: 30px; color: #666; font-size: 14px;">
          此連結將在 1 小時後過期。如果您沒有請求重設密碼，請忽略此郵件。
        </p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        <p style="color: #999; font-size: 12px;">此郵件由系統自動發送，請勿回覆。</p>
      </div>
    `,
  };

  try {
    // 驗證 SMTP 配置
    if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
      console.error('SMTP 環境變數未設定');
      throw new Error('SMTP 環境變數未設定');
    }

    // 發送郵件（不驗證連接，直接發送以減少延遲）
    const info = await transporter.sendMail(mailOptions);
    console.log('郵件發送成功:', {
      messageId: info.messageId,
      to: email,
      accepted: info.accepted,
      rejected: info.rejected,
    });
    return true;
  } catch (error: any) {
    console.error('郵件發送失敗:', {
      message: error.message,
      code: error.code,
      command: error.command,
      response: error.response,
      responseCode: error.responseCode,
      stack: error.stack,
    });
    
    // 如果是認證錯誤，提供更詳細的錯誤訊息
    if (error.code === 'EAUTH' || error.responseCode === 535) {
      console.error('SMTP 認證失敗，請檢查：');
      console.error('1. SMTP_USER 和 SMTP_PASSWORD 是否正確');
      console.error('2. 如果使用 Gmail，請確認使用應用程式密碼而非一般密碼');
      console.error('3. 確認已啟用「允許安全性較低的應用程式」或使用應用程式密碼');
    }
    
    return false;
  }
}

