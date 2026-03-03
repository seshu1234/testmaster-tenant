"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  Code,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import "katex/dist/katex.min.css";
import { InlineMath, BlockMath } from "react-katex";
import * as React from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
}

import { Editor } from "@tiptap/react";

const MenuBar = ({ editor }: { editor: Editor | null }) => {
  if (!editor) {
    return null;
  }

  const buttons = [
    {
      icon: Bold,
      title: "Bold",
      action: () => editor.chain().focus().toggleBold().run(),
      isActive: editor.isActive("bold"),
    },
    {
      icon: Italic,
      title: "Italic",
      action: () => editor.chain().focus().toggleItalic().run(),
      isActive: editor.isActive("italic"),
    },
    {
      icon: List,
      title: "Bullet List",
      action: () => editor.chain().focus().toggleBulletList().run(),
      isActive: editor.isActive("bulletList"),
    },
    {
      icon: ListOrdered,
      title: "Ordered List",
      action: () => editor.chain().focus().toggleOrderedList().run(),
      isActive: editor.isActive("orderedList"),
    },
    {
      icon: Quote,
      title: "Blockquote",
      action: () => editor.chain().focus().toggleBlockquote().run(),
      isActive: editor.isActive("blockquote"),
    },
    {
      icon: Code,
      title: "Code Block",
      action: () => editor.chain().focus().toggleCodeBlock().run(),
      isActive: editor.isActive("codeBlock"),
    },
  ];

  return (
    <div className="flex flex-wrap gap-1 p-2 border-b bg-zinc-50 dark:bg-zinc-900/50">
      <TooltipProvider>
        {buttons.map((btn, i) => (
          <SafeTooltip key={i} content={btn.title}>
            <Button
              type="button"
              variant={btn.isActive ? "secondary" : "ghost"}
              size="icon"
              className="h-8 w-8"
              onClick={btn.action}
            >
              <btn.icon className="h-4 w-4" />
            </Button>
          </SafeTooltip>
        ))}
        
        <div className="w-px h-6 bg-zinc-300 dark:bg-zinc-700 mx-1 self-center" />
        
        <SafeTooltip content="Undo">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => editor.chain().focus().undo().run()}
          >
            <Undo className="h-4 w-4" />
          </Button>
        </SafeTooltip>
        
        <SafeTooltip content="Redo">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => editor.chain().focus().redo().run()}
          >
            <Redo className="h-4 w-4" />
          </Button>
        </SafeTooltip>
      </TooltipProvider>
    </div>
  );
};

// Helper component to handle cases where Tooltip might be missing
const SafeTooltip = ({ children, content }: { children: React.ReactNode, content: string }) => {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        {children}
      </TooltipTrigger>
      <TooltipContent>{content}</TooltipContent>
    </Tooltip>
  );
};

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
}

export function RichTextEditor({ content, onChange, placeholder }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: {
          keepMarks: true,
          keepAttributes: false,
        },
        orderedList: {
          keepMarks: true,
          keepAttributes: false,
        },
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-sm dark:prose-invert max-w-none focus:outline-none min-h-[200px] p-4",
        placeholder: placeholder || "Start typing...",
      },
    },
  });

  return (
    <div className="rounded-md border bg-white dark:bg-zinc-950 overflow-hidden">
      <MenuBar editor={editor} />
      <EditorContent editor={editor} />
      
      {/* Preview Section for LaTeX */}
      <div className="p-4 border-t bg-zinc-50/50 dark:bg-zinc-900/30 text-xs">
        <div className="font-semibold mb-1 text-muted-foreground uppercase tracking-wider">Math Preview</div>
        <div className="min-h-[20px] overflow-x-auto">
          {content.includes('$') ? (
             <div className="space-y-2">
                {content.split('\n').map((line, i) => {
                  if (line.includes('$$')) {
                    const math = line.match(/\$\$(.*?)\$\$/)?.[1];
                    return math ? <BlockMath key={i} math={math} /> : null;
                  }
                  if (line.includes('$')) {
                    return (
                      <div key={i} className="flex flex-wrap gap-2">
                        {line.split('$').map((part, j) => 
                          j % 2 === 1 ? <InlineMath key={j} math={part} /> : <span key={j}>{part}</span>
                        )}
                      </div>
                    );
                  }
                  return null;
                })}
             </div>
          ) : (
            <span className="italic text-muted-foreground">Type math using $...$ for inline or $$...$$ for block</span>
          )}
        </div>
      </div>
    </div>
  );
}
