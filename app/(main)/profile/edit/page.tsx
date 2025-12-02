'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import MarkdownEditor from '@/components/MarkdownEditor';
import Image from 'next/image';

export default function EditProfilePage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [bio, setBio] = useState('');
  const [teachingExperience, setTeachingExperience] = useState('');
  const [username, setUsername] = useState('');
  const [image, setImage] = useState('');
  const [bannerImage, setBannerImage] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [usernameError, setUsernameError] = useState('');

  useEffect(() => {
    if (!session) {
      router.push('/login');
      return;
    }
    fetchProfile();
  }, [session]);

  const fetchProfile = async () => {
    try {
      const response = await fetch(`/api/users/${session?.user?.id}`);
      if (response.ok) {
        const data = await response.json();
        setBio(data.bio || '');
        setTeachingExperience(data.teachingExperience || '');
        setUsername(data.username || '');
        setImage(data.image || '');
        setBannerImage(data.bannerImage || '');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'avatar');

      const response = await fetch('/api/users/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setImage(data.url);
      }
    } catch (error) {
      console.error('Error uploading avatar:', error);
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingBanner(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'banner');

      const response = await fetch('/api/users/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setBannerImage(data.url);
      }
    } catch (error) {
      console.error('Error uploading banner:', error);
    } finally {
      setUploadingBanner(false);
    }
  };

  const checkUsername = async (value: string) => {
    if (!value) {
      setUsernameError('');
      return;
    }

    if (!/^[a-z0-9_]+$/.test(value)) {
      setUsernameError('只能包含小寫字母、數字和底線');
      return;
    }

    try {
      const response = await fetch('/api/users/check-username', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: value,
          userId: session?.user?.id,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (!data.available) {
          setUsernameError('此用戶名已被使用');
        } else {
          setUsernameError('');
        }
      }
    } catch (error) {
      console.error('Error checking username:', error);
    }
  };

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase();
    setUsername(value);
    checkUsername(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user?.id) return;

    if (usernameError) {
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(`/api/users/${session.user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bio,
          teachingExperience,
          username: username || undefined,
          image,
          bannerImage,
        }),
      });

      if (response.ok) {
        const userData = await response.json();
        // Redirect to username if available, otherwise use ID
        const profilePath = userData.username || session.user.id;
        router.push(`/profile/${profilePath}`);
      } else {
        const error = await response.json();
        if (error.error === 'Username already taken') {
          setUsernameError('此用戶名已被使用');
        }
      }
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="max-w-4xl mx-auto px-4 py-8">載入中...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto bg-white min-h-screen">
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold mb-6">編輯個人檔案</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Banner Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              背景圖片
            </label>
            <div className="relative h-48 bg-gray-200 rounded-lg overflow-hidden">
              {bannerImage && (
                <Image
                  src={bannerImage}
                  alt="Banner"
                  fill
                  className="object-cover"
                />
              )}
              <div className="absolute inset-0 flex items-center justify-center">
                <label className="cursor-pointer bg-black bg-opacity-50 text-white px-4 py-2 rounded hover:bg-opacity-70">
                  {uploadingBanner ? '上傳中...' : bannerImage ? '更換背景' : '上傳背景'}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleBannerUpload}
                    disabled={uploadingBanner}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Avatar Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              個人頭像
            </label>
            <div className="flex items-center space-x-4">
              <div className="relative w-24 h-24 rounded-full overflow-hidden bg-gray-200">
                {image ? (
                  <Image
                    src={image}
                    alt="Avatar"
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    無頭像
                  </div>
                )}
              </div>
              <label className="cursor-pointer border border-gray-300 rounded-md px-4 py-2 hover:bg-gray-50">
                {uploadingAvatar ? '上傳中...' : '上傳頭像'}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  disabled={uploadingAvatar}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Username */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              用戶名 (Username)
            </label>
            <div className="flex items-center space-x-2">
              <span className="text-gray-500">@</span>
              <input
                type="text"
                value={username}
                onChange={handleUsernameChange}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="username"
                pattern="[a-z0-9_]+"
              />
            </div>
            {usernameError && (
              <p className="mt-1 text-sm text-red-600">{usernameError}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              只能包含小寫字母、數字和底線。設定後可用 @username 訪問您的檔案
            </p>
          </div>

          {/* Bio */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              自我介紹
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={4}
              placeholder="介紹一下自己..."
            />
          </div>

          {/* Teaching Experience */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              教學經歷
            </label>
            <MarkdownEditor
              value={teachingExperience}
              onChange={setTeachingExperience}
              placeholder="輸入您的教學經歷..."
            />
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={saving || !!usernameError}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? '儲存中...' : '儲存'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

