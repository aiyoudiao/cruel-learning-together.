import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { common, createLowlight } from 'lowlight';
import { useEffect, useCallback } from 'react';
import './RichEditor.css';

const lowlight = createLowlight(common);

interface RichEditorProps {
  content: string;
  onChange: (content: string) => void;
  onImageUpload?: (file: File) => Promise<string>;
  onVideoUpload?: (file: File) => Promise<string>;
  onAudioUpload?: (file: File) => Promise<string>;
  placeholder?: string;
}

export function RichEditor({
  content,
  onChange,
  onImageUpload,
  onVideoUpload,
  onAudioUpload,
  placeholder = '开始输入你的学习内容...'
}: RichEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({
        inline: true,
        allowBase64: true,
      }),
      Link.configure({
        openOnClick: false,
      }),
      Placeholder.configure({
        placeholder,
      }),
      CodeBlockLowlight.configure({
        lowlight,
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'rich-editor-content',
      },
    },
  });

  const handleImageUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || !event.target.files[0] || !onImageUpload) return;

    const file = event.target.files[0];
    try {
      const url = await onImageUpload(file);
      editor?.chain().focus().setImage({ src: url }).run();
    } catch (error) {
      console.error('图片上传失败:', error);
      alert('图片上传失败，请重试');
    }
    event.target.value = '';
  }, [editor, onImageUpload]);

  const handleVideoUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || !event.target.files[0] || !onVideoUpload) return;

    const file = event.target.files[0];
    try {
      const url = await onVideoUpload(file);
      const videoHtml = `<video controls src="${url}" style="max-width: 100%;"></video>`;
      editor?.chain().focus().insertContent(videoHtml).run();
    } catch (error) {
      console.error('视频上传失败:', error);
      alert('视频上传失败，请重试');
    }
    event.target.value = '';
  }, [editor, onVideoUpload]);

  const handleAudioUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || !event.target.files[0] || !onAudioUpload) return;

    const file = event.target.files[0];
    try {
      const url = await onAudioUpload(file);
      const audioHtml = `<audio controls src="${url}" style="width: 100%;"></audio>`;
      editor?.chain().focus().insertContent(audioHtml).run();
    } catch (error) {
      console.error('音频上传失败:', error);
      alert('音频上传失败，请重试');
    }
    event.target.value = '';
  }, [editor, onAudioUpload]);

  const handlePaste = useCallback(async (event: React.ClipboardEvent) => {
    const items = event.clipboardData?.items;
    if (!items) return;

    for (const item of items) {
      if (item.type.indexOf('image') !== -1) {
        event.preventDefault();
        const file = item.getAsFile();
        if (file && onImageUpload) {
          try {
            const url = await onImageUpload(file);
            editor?.chain().focus().setImage({ src: url }).run();
          } catch (error) {
            console.error('粘贴图片上传失败:', error);
          }
        }
        break;
      }
    }
  }, [editor, onImageUpload]);

  const handleDrop = useCallback(async (event: React.DragEvent) => {
    event.preventDefault();
    const files = event.dataTransfer?.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const fileType = file.type;

    try {
      if (fileType.startsWith('image/') && onImageUpload) {
        const url = await onImageUpload(file);
        editor?.chain().focus().setImage({ src: url }).run();
      } else if (fileType.startsWith('video/') && onVideoUpload) {
        const url = await onVideoUpload(file);
        const videoHtml = `<video controls src="${url}" style="max-width: 100%;"></video>`;
        editor?.chain().focus().insertContent(videoHtml).run();
      } else if (fileType.startsWith('audio/') && onAudioUpload) {
        const url = await onAudioUpload(file);
        const audioHtml = `<audio controls src="${url}" style="width: 100%;"></audio>`;
        editor?.chain().focus().insertContent(audioHtml).run();
      }
    } catch (error) {
      console.error('文件上传失败:', error);
      alert('文件上传失败，请重试');
    }
  }, [editor, onImageUpload, onVideoUpload, onAudioUpload]);

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
  }, []);

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  if (!editor) {
    return <div className="rich-editor-loading">加载编辑器...</div>;
  }

  // 修复 JSX 结构，确保所有 div 标签正确闭合
  return (
    <div className="rich-editor">
      <div className="rich-editor-toolbar">
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          disabled={!editor.can().chain().focus().toggleBold().run()}
          className={editor.isActive('bold') ? 'is-active' : ''}
          title="粗体"
        >
          <strong>B</strong>
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          disabled={!editor.can().chain().focus().toggleItalic().run()}
          className={editor.isActive('italic') ? 'is-active' : ''}
          title="斜体"
        >
          <em>I</em>
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={editor.isActive('heading', { level: 1 }) ? 'is-active' : ''}
          title="标题 1"
        >
          H1
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={editor.isActive('heading', { level: 2 }) ? 'is-active' : ''}
          title="标题 2"
        >
          H2
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={editor.isActive('heading', { level: 3 }) ? 'is-active' : ''}
          title="标题 3"
        >
          H3
        </button>
        <button
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={editor.isActive('codeBlock') ? 'is-active' : ''}
          title="代码块"
        >
          &lt;/&gt;
        </button>
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={editor.isActive('bulletList') ? 'is-active' : ''}
          title="无序列表"
        >
          • 列表
        </button>
        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={editor.isActive('orderedList') ? 'is-active' : ''}
          title="有序列表"
        >
          1. 列表
        </button>
        <button
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={editor.isActive('blockquote') ? 'is-active' : ''}
          title="引用"
        >
          " 引用
        </button>
        <div className="toolbar-divider"></div>
        <label className="toolbar-button" title="插入图片">
          📷 图片
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            style={{ display: 'none' }}
          />
        </label>
        {onVideoUpload && (
          <label className="toolbar-button" title="插入视频">
            🎬 视频
            <input
              type="file"
              accept="video/*"
              onChange={handleVideoUpload}
              style={{ display: 'none' }}
            />
          </label>
        )}
        {onAudioUpload && (
          <label className="toolbar-button" title="插入音频">
            🎵 音频
            <input
              type="file"
              accept="audio/*"
              onChange={handleAudioUpload}
              style={{ display: 'none' }}
            />
          </label>
        )}
        <button
          onClick={() => {
            const url = window.prompt('输入链接地址:');
            if (url) {
              editor.chain().focus().setLink({ href: url }).run();
            }
          }}
          title="插入链接"
        >
          🔗 链接
        </button>
        <button
          onClick={() => editor.chain().focus().unsetLink().run()}
          disabled={!editor.isActive('link')}
          title="移除链接"
        >
          🔗 移除链接
        </button>
        <div className="toolbar-divider"></div>
        <button
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().chain().focus().undo().run()}
          title="撤销"
        >
          ↩ 撤销
        </button>
        <button
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().chain().focus().redo().run()}
          title="重做"
        >
          ↪ 重做
        </button>
      </div>
      <div
        className="rich-editor-container"
        onPaste={handlePaste}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
