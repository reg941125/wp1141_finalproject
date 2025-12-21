'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import MarkdownEditor from '@/components/MarkdownEditor';
import MarkdownRenderer from '@/components/MarkdownRenderer';
import jsPDF from 'jspdf';

interface QuestionFile {
  _id: string;
  name: string;
  description: string;
  content: string;
  showOnProfile: boolean;
  authorId: {
    _id: string;
  };
}

export default function EditQuestionPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [file, setFile] = useState<QuestionFile | null>(null);
  const [content, setContent] = useState('');
  const [showOnProfile, setShowOnProfile] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchFile = useCallback(async () => {
    try {
      const response = await fetch(`/api/questions/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setFile(data);
        setContent(data.content || '');
        setShowOnProfile(data.showOnProfile || false);
      }
    } catch (error) {
      console.error('Error fetching file:', error);
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    if (params.id) {
      fetchFile();
    }
  }, [params.id, fetchFile]);

  const handleSave = async () => {
    if (!file) return;

    setSaving(true);
    try {
      const response = await fetch(`/api/questions/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
          showOnProfile,
        }),
      });

      if (response.ok) {
        alert('儲存成功');
      }
    } catch (error) {
      console.error('Error saving file:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleExportPDF = async () => {
    const doc = new jsPDF();
    const element = document.getElementById('content-preview');
    
    if (element) {
      // Simple text extraction for PDF
      const text = element.innerText || element.textContent || '';
      const lines = doc.splitTextToSize(text, 180);
      let y = 10;
      lines.forEach((line: string) => {
        if (y > 280) {
          doc.addPage();
          y = 10;
        }
        doc.text(line, 10, y);
        y += 7;
      });
      doc.save(`${file?.name || 'document'}.pdf`);
    }
  };

  if (loading) {
    return <div className="max-w-4xl mx-auto px-4 py-8 text-gray-900 dark:text-white">載入中...</div>;
  }

  if (!file) {
    return <div className="max-w-4xl mx-auto px-4 py-8 text-gray-900 dark:text-white">題目不存在</div>;
  }

  if (session?.user?.id !== file.authorId._id.toString()) {
    return <div className="max-w-4xl mx-auto px-4 py-8 text-gray-900 dark:text-white">無權限編輯此題目</div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{file.name}</h1>
        <div className="flex space-x-4">
          <button
            onClick={handleExportPDF}
            className="px-4 py-2 bg-green-600 dark:bg-green-700 text-white rounded-md hover:bg-green-700 dark:hover:bg-green-600 transition-colors"
          >
            匯出 PDF
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 disabled:opacity-50 transition-colors"
          >
            {saving ? '儲存中...' : '儲存'}
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-6 mb-6 transition-colors">
        <p className="text-gray-600 dark:text-gray-300 mb-4">{file.description}</p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-6 mb-4 transition-colors">
        <div className="mb-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={showOnProfile}
              onChange={(e) => setShowOnProfile(e.target.checked)}
              className="mr-2"
            />
            <span className="text-sm text-gray-900 dark:text-white">顯示在個人檔案上</span>
          </label>
        </div>
        <MarkdownEditor
          value={content}
          onChange={setContent}
          placeholder="編輯題目內容..."
        />
      </div>

      <div id="content-preview" className="hidden">
        <MarkdownRenderer content={content} />
      </div>
    </div>
  );
}

