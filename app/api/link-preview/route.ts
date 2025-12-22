import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

export const dynamic = 'force-dynamic';

interface LinkMetadata {
  title: string;
  description: string;
  image?: string;
  url: string;
  siteName?: string;
  favicon?: string;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get('url');

    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      );
    }

    // 驗證 URL 格式
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(url);
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid URL' },
        { status: 400 }
      );
    }

    // 只允許 http 和 https 協議
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      return NextResponse.json(
        { error: 'Invalid URL protocol' },
        { status: 400 }
      );
    }

    // 獲取網頁內容
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; LinkPreviewBot/1.0)',
      },
      // 設置超時
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch URL' },
        { status: response.status }
      );
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // 提取 Open Graph 和其他元數據
    const metadata: LinkMetadata = {
      title: '',
      description: '',
      url: url,
    };

    // 獲取標題
    metadata.title = 
      $('meta[property="og:title"]').attr('content') ||
      $('meta[name="twitter:title"]').attr('content') ||
      $('title').text() ||
      parsedUrl.hostname;

    // 獲取描述
    metadata.description = 
      $('meta[property="og:description"]').attr('content') ||
      $('meta[name="twitter:description"]').attr('content') ||
      $('meta[name="description"]').attr('content') ||
      '';

    // 獲取圖片
    const ogImage = $('meta[property="og:image"]').attr('content');
    const twitterImage = $('meta[name="twitter:image"]').attr('content');
    let imageUrl = ogImage || twitterImage;

    // 如果圖片 URL 是相對路徑，轉換為絕對路徑
    if (imageUrl && !imageUrl.startsWith('http')) {
      if (imageUrl.startsWith('//')) {
        imageUrl = `${parsedUrl.protocol}${imageUrl}`;
      } else if (imageUrl.startsWith('/')) {
        imageUrl = `${parsedUrl.protocol}//${parsedUrl.host}${imageUrl}`;
      } else {
        imageUrl = `${parsedUrl.protocol}//${parsedUrl.host}/${imageUrl}`;
      }
    }
    metadata.image = imageUrl;

    // 獲取網站名稱
    metadata.siteName = 
      $('meta[property="og:site_name"]').attr('content') ||
      parsedUrl.hostname;

    // 獲取 favicon
    let favicon = $('link[rel="icon"]').attr('href') || 
                  $('link[rel="shortcut icon"]').attr('href') ||
                  $('link[rel="apple-touch-icon"]').attr('href');
    
    if (favicon && !favicon.startsWith('http')) {
      if (favicon.startsWith('//')) {
        favicon = `${parsedUrl.protocol}${favicon}`;
      } else if (favicon.startsWith('/')) {
        favicon = `${parsedUrl.protocol}//${parsedUrl.host}${favicon}`;
      } else {
        favicon = `${parsedUrl.protocol}//${parsedUrl.host}/${favicon}`;
      }
    }
    metadata.favicon = favicon || `${parsedUrl.protocol}//${parsedUrl.host}/favicon.ico`;

    // 截斷過長的文本
    if (metadata.title.length > 100) {
      metadata.title = metadata.title.substring(0, 100) + '...';
    }
    if (metadata.description.length > 200) {
      metadata.description = metadata.description.substring(0, 200) + '...';
    }

    return NextResponse.json(metadata);
  } catch (error) {
    console.error('Error fetching link preview:', error);
    return NextResponse.json(
      { error: 'Failed to generate preview' },
      { status: 500 }
    );
  }
}

