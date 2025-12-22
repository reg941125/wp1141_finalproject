/**
 * Cloudinary 工具函數
 * 用於生成可下載和可預覽的 URL
 */

/**
 * 從 Cloudinary URL 提取 public_id
 */
export function extractPublicIdFromUrl(url: string): string | null {
  try {
    // Cloudinary URL 格式: https://res.cloudinary.com/{cloud_name}/{resource_type}/upload/{version}/{public_id}.{format}
    const urlParts = url.split('/');
    const uploadIndex = urlParts.findIndex(part => part === 'upload');
    
    if (uploadIndex === -1) {
      return null;
    }

    // 提取 public_id（在 upload 之後的部分，跳過版本號）
    const publicIdParts = urlParts.slice(uploadIndex + 2);
    if (publicIdParts.length === 0) {
      return null;
    }

    // 移除副檔名和查詢參數
    const publicIdWithExt = publicIdParts.join('/');
    const publicId = publicIdWithExt.split('.')[0].split('?')[0];
    
    return publicId;
  } catch (error) {
    console.error('Error extracting public_id:', error);
    return null;
  }
}

/**
 * 生成可下載的 URL（添加 fl_attachment 參數）
 */
export function getDownloadUrl(cloudinaryUrl: string): string {
  if (!cloudinaryUrl || !cloudinaryUrl.includes('cloudinary.com')) {
    return cloudinaryUrl;
  }

  try {
    const url = new URL(cloudinaryUrl);
    
    // 移除可能導致問題的參數
    url.searchParams.delete('s'); // 移除簽名（如果存在）
    url.searchParams.delete('_a'); // 移除認證參數
    
    // 添加 fl_attachment 參數強制下載
    url.searchParams.set('fl_attachment', '');
    
    return url.toString();
  } catch (error) {
    // 如果 URL 解析失敗，直接添加參數
    const separator = cloudinaryUrl.includes('?') ? '&' : '?';
    return `${cloudinaryUrl}${separator}fl_attachment`;
  }
}

/**
 * 生成可預覽的 URL（確保是公開的）
 */
export function getPreviewUrl(cloudinaryUrl: string): string {
  if (!cloudinaryUrl || !cloudinaryUrl.includes('cloudinary.com')) {
    return cloudinaryUrl;
  }

  try {
    const url = new URL(cloudinaryUrl);
    
    // 移除可能導致 401 錯誤的參數
    url.searchParams.delete('s'); // 移除簽名
    url.searchParams.delete('_a'); // 移除認證參數
    url.searchParams.delete('fl_attachment'); // 移除下載參數（如果存在）
    
    return url.toString();
  } catch (error) {
    // 如果 URL 解析失敗，返回原 URL
    console.error('Error parsing Cloudinary URL:', error);
    return cloudinaryUrl;
  }
}

