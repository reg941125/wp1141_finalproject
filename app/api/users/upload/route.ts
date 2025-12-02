import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import cloudinary from '@/lib/cloudinary';

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as string; // 'avatar' or 'banner'

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: 'auto',
          folder: `tutoring-platform/${type}`,
          transformation: type === 'avatar' 
            ? [{ width: 400, height: 400, crop: 'fill', gravity: 'face' }]
            : [{ width: 1500, height: 500, crop: 'fill' }],
        },
        (error, result) => {
          if (error) {
            console.error('Cloudinary upload error:', error);
            reject(NextResponse.json(
              { error: 'Failed to upload file' },
              { status: 500 }
            ));
          } else {
            resolve(NextResponse.json({ url: result?.secure_url }));
          }
        }
      );

      uploadStream.end(buffer);
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}

