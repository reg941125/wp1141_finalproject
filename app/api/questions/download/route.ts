import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import cloudinary from '@/lib/cloudinary';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const fileUrl = searchParams.get('url');

    if (!fileUrl) {
      return NextResponse.json(
        { error: 'Missing file URL' },
        { status: 400 }
      );
    }

    // 驗證 URL 是否為 Cloudinary URL
    if (!fileUrl.includes('cloudinary.com')) {
      return NextResponse.json(
        { error: 'Invalid file URL' },
        { status: 400 }
      );
    }

    // 從 Cloudinary URL 提取 public_id
    const urlParts = fileUrl.split('/');
    const uploadIndex = urlParts.findIndex(part => part === 'upload');
    if (uploadIndex === -1) {
      return NextResponse.json(
        { error: 'Invalid Cloudinary URL format' },
        { status: 400 }
      );
    }

    // 提取 public_id（在 upload 之後的部分）
    const publicIdParts = urlParts.slice(uploadIndex + 2); // 跳過 'upload' 和版本號
    const publicId = publicIdParts.join('/').split('.')[0]; // 移除副檔名

    // 生成簽名 URL（用於下載）
    const signedUrl = cloudinary.url(publicId, {
      resource_type: 'auto',
      attachment: true, // 強制下載
      secure: true,
    });

    // 重定向到簽名 URL
    return NextResponse.redirect(signedUrl);
  } catch (error) {
    console.error('Error generating download URL:', error);
    return NextResponse.json(
      { error: 'Failed to generate download URL' },
      { status: 500 }
    );
  }
}

