import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import dbConnect from '@/lib/db';
import UserModel from '@/lib/models/User';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const token = searchParams.get('token');

    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/acddd176-38e7-479e-a07f-6d43aae07252',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/api/auth/verify-email/route.ts:11',message:'Verify email request received',data:{hasToken:!!token,tokenLength:token?.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion

    if (!token) {
      return NextResponse.json(
        { error: '無效的驗證連結' },
        { status: 400 }
      );
    }

    await dbConnect();

    // 查找用戶並驗證 token
    const user = await UserModel.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: new Date() }, // token 尚未過期
    });

    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/acddd176-38e7-479e-a07f-6d43aae07252',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/api/auth/verify-email/route.ts:28',message:'User found with token',data:{userFound:!!user,userId:user?._id?.toString(),emailVerified:user?.emailVerified},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion

    // 如果找不到用戶（token 無效或已過期），檢查是否已經驗證過
    if (!user) {
      // 嘗試通過 token 查找用戶（即使過期）
      const userWithExpiredToken = await UserModel.findOne({
        emailVerificationToken: token,
      });

      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/acddd176-38e7-479e-a07f-6d43aae07252',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/api/auth/verify-email/route.ts:36',message:'Checking expired token user',data:{userFound:!!userWithExpiredToken,emailVerified:userWithExpiredToken?.emailVerified,hasToken:!!userWithExpiredToken?.emailVerificationToken},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
      // #endregion

      // 如果找到用戶但 token 已過期，檢查是否已經驗證過
      if (userWithExpiredToken) {
        if (userWithExpiredToken.emailVerified) {
          return NextResponse.json({
            message: '您的電子郵件已經驗證過了',
            verified: true,
          });
        } else {
          // Token 已過期但未驗證
          return NextResponse.json(
            { error: '驗證連結已過期。請重新註冊或聯繫客服。' },
            { status: 400 }
          );
        }
      }

      // 如果找不到用戶，可能是 token 無效或用戶已經驗證過並清除了 token
      // 這種情況下，我們無法確定用戶狀態，返回友好訊息
      return NextResponse.json(
        { error: '無效的驗證連結。如果您已經驗證過帳號，可以直接登入。' },
        { status: 400 }
      );
    }

    // 如果已經驗證過，直接返回成功
    if (user.emailVerified) {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/acddd176-38e7-479e-a07f-6d43aae07252',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/api/auth/verify-email/route.ts:52',message:'User already verified',data:{userId:user._id.toString()},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
      // #endregion

      return NextResponse.json({
        message: '您的電子郵件已經驗證過了',
        verified: true,
      });
    }

    // 更新用戶為已驗證狀態，並清除驗證 token
    user.emailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/acddd176-38e7-479e-a07f-6d43aae07252',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/api/auth/verify-email/route.ts:65',message:'Email verified successfully',data:{userId:user._id.toString()},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
    // #endregion

    return NextResponse.json({
      message: '電子郵件驗證成功！',
      verified: true,
    });
  } catch (error) {
    console.error('Error verifying email:', error);
    
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/acddd176-38e7-479e-a07f-6d43aae07252',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/api/auth/verify-email/route.ts:75',message:'Error in verify email',data:{error:error instanceof Error ? error.message : String(error)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
    // #endregion

    return NextResponse.json(
      { error: '發生錯誤，請稍後再試' },
      { status: 500 }
    );
  }
}

