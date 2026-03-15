import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { common, createLowlight } from 'lowlight';
import { useEffect, useCallback, useState } from 'react';
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

const MenuButton = ({ 
  onClick, 
  active = false, 
  disabled = false, 
  children, 
  title 
}: { 
  onClick: () => void; 
  active?: boolean; 
  disabled?: boolean; 
  children: React.ReactNode; 
  title?: string;
}) => (
  <button
    onClick={onClick}
    disabled={disabled}
    title={title}
    type="button"
    className={`
      p-2 rounded-lg transition-all duration-200
      ${active 
        ? 'bg-solana-primary text-white shadow-neon-purple' 
        : 'text-gray-400 hover:text-white hover:bg-white/10'}
      ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
    `}
  >
    {children}
  </button>
);

export function RichEditor({
  content,
  onChange,
  onImageUpload,
  onVideoUpload,
  onAudioUpload,
  placeholder = 'Start typing...'
}: RichEditorProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({
        inline: true,
        allowBase64: false, // Disable default Base64 behavior where possible
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-solana-primary hover:text-solana-secondary underline',
        },
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
        class: 'prose prose-invert max-w-none focus:outline-none min-h-[200px] text-gray-300',
      },
      handlePaste: (view, event) => {
        const items = Array.from(event.clipboardData?.files || []);
        const images = items.filter(item => item.type.startsWith('image/'));
        
        if (images.length > 0 && onImageUpload) {
          event.preventDefault(); // Prevent default base64 insertion
          
          images.forEach(async (image) => {
            try {
              // Optionally insert a loading placeholder here
              const url = await onImageUpload(image);
              if (url) {
                const { schema } = view.state;
                const node = schema.nodes.image.create({ src: url });
                const transaction = view.state.tr.replaceSelectionWith(node);
                view.dispatch(transaction);
              }
            } catch (error) {
              console.error('Failed to upload pasted image', error);
            }
          });
          return true;
        }
        return false;
      },
      handleDrop: (view, event) => {
        const items = Array.from(event.dataTransfer?.files || []);
        const images = items.filter(item => item.type.startsWith('image/'));
        
        if (images.length > 0 && onImageUpload) {
          event.preventDefault();
          
          const coordinates = view.posAtCoords({ left: event.clientX, top: event.clientY });
          
          images.forEach(async (image) => {
            try {
              const url = await onImageUpload(image);
              if (url) {
                const { schema } = view.state;
                const node = schema.nodes.image.create({ src: url });
                
                let transaction;
                if (coordinates) {
                  transaction = view.state.tr.insert(coordinates.pos, node);
                } else {
                  transaction = view.state.tr.replaceSelectionWith(node);
                }
                view.dispatch(transaction);
              }
            } catch (error) {
              console.error('Failed to upload dropped image', error);
            }
          });
          return true;
        }
        return false;
      }
    },
  });

  const handleImageUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || !event.target.files[0] || !onImageUpload) return;
    try {
      const url = await onImageUpload(event.target.files[0]);
      editor?.chain().focus().setImage({ src: url }).run();
    } catch (error) {
      console.error('Image upload failed', error);
    }
    event.target.value = '';
  }, [editor, onImageUpload]);

  const handleVideoUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || !event.target.files[0] || !onVideoUpload) return;
    try {
      const url = await onVideoUpload(event.target.files[0]);
      const videoHtml = `<video controls src="${url}" class="rounded-lg w-full my-4 border border-white/10"></video>`;
      editor?.chain().focus().insertContent(videoHtml).run();
    } catch (error) {
      console.error('Video upload failed', error);
    }
    event.target.value = '';
  }, [editor, onVideoUpload]);

  const handleAudioUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || !event.target.files[0] || !onAudioUpload) return;
    try {
      const url = await onAudioUpload(event.target.files[0]);
      const audioHtml = `<audio controls src="${url}" class="w-full my-4"></audio>`;
      editor?.chain().focus().insertContent(audioHtml).run();
    } catch (error) {
      console.error('Audio upload failed', error);
    }
    event.target.value = '';
  }, [editor, onAudioUpload]);

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content, { emitUpdate: false });
    }
  }, [content, editor]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isFullscreen]);

  const clearContent = () => {
    if (window.confirm('确定要清空编辑器内容吗？')) {
      editor?.commands.clearContent();
      editor?.commands.focus();
    }
  };

  if (!editor) {
    return <div className="p-8 text-center text-gray-500 animate-pulse">Initializing Neural Interface...</div>;
  }

  return (
    <div className={`flex flex-col bg-black/30 border border-white/10 rounded-xl overflow-hidden backdrop-blur-sm transition-all duration-300 ${
      isFullscreen ? 'fixed inset-0 z-50 bg-gray-900/95 m-0 rounded-none' : ''
    }`}>
      {/* Toolbar */}
      <div className="flex flex-wrap gap-1 p-2 bg-white/5 border-b border-white/5 items-center">
        <MenuButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive('bold')}
          title="Bold"
        >
          <span className="font-bold">B</span>
        </MenuButton>
        <MenuButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive('italic')}
          title="Italic"
        >
          <span className="italic">I</span>
        </MenuButton>
        <MenuButton
          onClick={() => editor.chain().focus().toggleCode().run()}
          active={editor.isActive('code')}
          title="Code"
        >
          <span className="font-mono text-xs">{'<>'}</span>
        </MenuButton>
        
        <div className="w-px h-6 bg-white/10 mx-1 self-center" />

        <MenuButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          active={editor.isActive('heading', { level: 1 })}
          title="H1"
        >
          H1
        </MenuButton>
        <MenuButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          active={editor.isActive('heading', { level: 2 })}
          title="H2"
        >
          H2
        </MenuButton>

        <div className="w-px h-6 bg-white/10 mx-1 self-center" />

        <MenuButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive('bulletList')}
          title="Bullet List"
        >
          •
        </MenuButton>
        <MenuButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive('orderedList')}
          title="Ordered List"
        >
          1.
        </MenuButton>
        <MenuButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          active={editor.isActive('blockquote')}
          title="Quote"
        >
          "
        </MenuButton>

        <div className="w-px h-6 bg-white/10 mx-1 self-center" />

        <label className="cursor-pointer p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-all" title="Upload Image">
          📷
          <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
        </label>
        <label className="cursor-pointer p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-all" title="Upload Video">
          🎬
          <input type="file" accept="video/*" onChange={handleVideoUpload} className="hidden" />
        </label>
        <label className="cursor-pointer p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-all" title="Upload Audio">
          🎵
          <input type="file" accept="audio/*" onChange={handleAudioUpload} className="hidden" />
        </label>

        <div className="flex-1" /> {/* Spacer */}

        <MenuButton
          onClick={clearContent}
          title="Clear Content"
        >
          🗑️
        </MenuButton>
        
        <MenuButton
          onClick={() => setIsFullscreen(!isFullscreen)}
          active={isFullscreen}
          title={isFullscreen ? "Exit Fullscreen (Esc)" : "Enter Fullscreen"}
        >
          {isFullscreen ? '↙️' : '↗️'}
        </MenuButton>
      </div>

      {/* Editor Content */}
      <div className={`p-4 ${isFullscreen ? 'flex-1 overflow-auto max-w-4xl mx-auto w-full' : 'min-h-[300px]'}`}>
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
