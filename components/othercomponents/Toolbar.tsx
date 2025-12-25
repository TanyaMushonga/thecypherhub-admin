"use client";

import React, { useCallback, useEffect, useState } from "react";
import { type Editor } from "@tiptap/react";
import toast from "react-hot-toast";
import {
  Bold,
  Strikethrough,
  Italic,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  Heading5,
  Heading6,
  Underline,
  Quote,
  Undo,
  Redo,
  Code,
  Link,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Braces,
  Grid3x3,
  BetweenHorizontalStart,
  TableRowsSplit,
  TableColumnsSplit,
  BetweenVerticalStart,
  Grid2x2X,
  Image as ImageIcon,
  Minus,
  Maximize2
} from "lucide-react";
import { TbTableExport } from "react-icons/tb";

import LinkDialog from "./urlDialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type Props = {
  editor: Editor | null;
  content: string;
};

const Toolbar = ({ editor, content }: Props) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [previousUrl, setPreviousUrl] = useState("");
  const [isTableActive, setIsTableActive] = useState(false);

  const openLinkDialog = useCallback(() => {
    const url = editor?.getAttributes("link").href || "";
    setPreviousUrl(url);
    setIsDialogOpen(true);
  }, [editor]);

  const handleImageUpload = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64String = reader.result as string;
          editor?.chain().focus().setImage({ src: base64String }).run();
        };
        reader.readAsDataURL(file);
      }
    },
    [editor]
  );

  useEffect(() => {
    if (!editor) return;

    const updateTableActiveState = () => {
      setIsTableActive(editor.isActive("table"));
    };

    editor.on("selectionUpdate", updateTableActiveState);

    return () => {
      editor.off("selectionUpdate", updateTableActiveState);
    };
  }, [editor]);

  const setLink = useCallback(
    (url: string) => {
      if (url === null) {
        return;
      }
      if (url === "") {
        editor?.chain().focus().extendMarkRange("link").unsetLink().run();

        return;
      }
      try {
        editor
          ?.chain()
          .focus()
          .extendMarkRange("link")
          .setLink({ href: url })
          .run();
      } catch (e) {
        toast.error((e as Error).message);
      }
    },
    [editor]
  );

  if (!editor) {
    return null;
  }

  const Separator = () => <div className="w-[1px] h-6 bg-blue-800 mx-1" />;

  const ToolbarButton = ({ 
    onClick, 
    isActive, 
    children, 
    title 
  }: { 
    onClick: (e: React.MouseEvent) => void, 
    isActive?: boolean, 
    children: React.ReactNode,
    title?: string 
  }) => (
    <button
      onClick={onClick}
      title={title}
      className={`p-1.5 rounded-md transition-colors ${
        isActive
          ? "bg-blue-600 text-white"
          : "text-slate-400 hover:bg-blue-800 hover:text-white"
      }`}
    >
      {children}
    </button>
  );

  return (
    <div className="w-full flex flex-wrap items-center gap-1 p-2 bg-blue-950">
       {/* Undo/Redo */}
       <div className="flex items-center gap-0.5">
          <ToolbarButton
            onClick={(e) => {
              e.preventDefault();
              editor.chain().focus().undo().run();
            }}
            title="Undo"
          >
            <Undo className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={(e) => {
              e.preventDefault();
              editor.chain().focus().redo().run();
            }}
            title="Redo"
          >
            <Redo className="w-4 h-4" />
          </ToolbarButton>
      </div>

       <Separator />

      {/* Headings */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center gap-1 px-2 py-1.5 text-slate-400 hover:bg-blue-800 hover:text-white rounded-md text-sm font-medium transition-colors">
            {editor.isActive('heading', { level: 1 }) ? 'Title' :
             editor.isActive('heading', { level: 2 }) ? 'Heading 1' :
             editor.isActive('heading', { level: 3 }) ? 'Heading 2' :
             'Normal'}
             <span className="text-xs ml-1">▼</span>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="bg-blue-950 border-blue-900 text-white min-w-[150px]">
           <DropdownMenuItem onClick={() => editor.chain().focus().setParagraph().run()}>
             Normal Text
           </DropdownMenuItem>
           <DropdownMenuItem onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}>
             <Heading1 className="w-4 h-4 mr-2" /> Title (H1)
           </DropdownMenuItem>
           <DropdownMenuItem onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
             <Heading2 className="w-4 h-4 mr-2" /> Heading 1 (H2)
           </DropdownMenuItem>
           <DropdownMenuItem onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>
             <Heading3 className="w-4 h-4 mr-2" /> Heading 2 (H3)
           </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Separator />

      {/* Formatting */}
      <div className="flex items-center gap-0.5">
        <ToolbarButton
          onClick={(e) => {
            e.preventDefault();
            editor.chain().focus().toggleBold().run();
          }}
          isActive={editor.isActive("bold")}
          title="Bold"
        >
          <Bold className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={(e) => {
            e.preventDefault();
            editor.chain().focus().toggleItalic().run();
          }}
          isActive={editor.isActive("italic")}
          title="Italic"
        >
          <Italic className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={(e) => {
            e.preventDefault();
            editor.chain().focus().toggleUnderline().run();
          }}
          isActive={editor.isActive("underline")}
          title="Underline"
        >
          <Underline className="w-4 h-4" />
        </ToolbarButton>
         <ToolbarButton
          onClick={(e) => {
            e.preventDefault();
            editor.chain().focus().toggleStrike().run();
          }}
          isActive={editor.isActive("strike")}
          title="Strikethrough"
        >
          <Strikethrough className="w-4 h-4" />
        </ToolbarButton>
         <ToolbarButton
          onClick={(e) => {
            e.preventDefault();
            editor.chain().focus().toggleCode().run();
          }}
          isActive={editor.isActive("code")}
          title="Inline Code"
        >
          <Code className="w-4 h-4" />
        </ToolbarButton>
      </div>

       <Separator />
      
      {/* Alignment */}
      <div className="flex items-center gap-0.5">
          <ToolbarButton
              onClick={(e) => { e.preventDefault(); editor.chain().focus().setTextAlign('left').run(); }}
              isActive={editor.isActive({ textAlign: 'left' })}
              title="Align Left"
          >
              <AlignLeft className="w-4 h-4" />
          </ToolbarButton>
           <ToolbarButton
              onClick={(e) => { e.preventDefault(); editor.chain().focus().setTextAlign('center').run(); }}
              isActive={editor.isActive({ textAlign: 'center' })}
              title="Align Center"
          >
              <AlignCenter className="w-4 h-4" />
          </ToolbarButton>
           <ToolbarButton
              onClick={(e) => { e.preventDefault(); editor.chain().focus().setTextAlign('right').run(); }}
              isActive={editor.isActive({ textAlign: 'right' })}
              title="Align Right"
          >
              <AlignRight className="w-4 h-4" />
          </ToolbarButton>
           <ToolbarButton
              onClick={(e) => { e.preventDefault(); editor.chain().focus().setTextAlign('justify').run(); }}
              isActive={editor.isActive({ textAlign: 'justify' })}
              title="Justify"
          >
              <AlignJustify className="w-4 h-4" />
          </ToolbarButton>
      </div>

       <Separator />

      {/* Lists */}
      <div className="flex items-center gap-0.5">
         <ToolbarButton
          onClick={(e) => {
            e.preventDefault();
            editor.chain().focus().toggleBulletList().run();
          }}
          isActive={editor.isActive("bulletList")}
          title="Bullet List"
        >
          <List className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={(e) => {
            e.preventDefault();
            editor.chain().focus().toggleOrderedList().run();
          }}
          isActive={editor.isActive("orderedList")}
          title="Numbered List"
        >
          <ListOrdered className="w-4 h-4" />
        </ToolbarButton>
      </div>
      
      <Separator />

      {/* Inserts */}
      <div className="flex items-center gap-0.5">
         <ToolbarButton
          onClick={(e) => {
            e.preventDefault();
            editor.chain().focus().toggleBlockquote().run();
          }}
          isActive={editor.isActive("blockquote")}
          title="Quote"
        >
          <Quote className="w-4 h-4" />
        </ToolbarButton>
        
        <ToolbarButton
          onClick={(e) => {
            e.preventDefault();
            editor.chain().focus().toggleCodeBlock().run();
          }}
          isActive={editor.isActive("codeBlock")}
          title="Code Block"
        >
          <Braces className="w-4 h-4" />
        </ToolbarButton>

         <ToolbarButton
          onClick={(e) => {
            e.preventDefault();
            editor.chain().focus().setHorizontalRule().run();
          }}
          title="Horizontal Rule"
        >
          <Minus className="w-4 h-4" />
        </ToolbarButton>

        <ToolbarButton
          onClick={(e) => {
            e.preventDefault();
            openLinkDialog();
          }}
          isActive={editor.isActive("link")}
          title="Link"
        >
          <Link className="w-4 h-4" />
        </ToolbarButton>

        <input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
          id="image-upload"
        />
        <label htmlFor="image-upload" className="p-1.5 rounded-md text-slate-400 hover:bg-blue-800 hover:text-white cursor-pointer" title="Insert Image">
          <ImageIcon className="w-4 h-4" />
        </label>
        
        {/* Table Dropdown */}
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                 <button className={`p-1.5 rounded-md transition-colors ${
                    isTableActive ? "bg-blue-600 text-white" : "text-slate-400 hover:bg-blue-800 hover:text-white"
                 }`} title="Table">
                    <Grid3x3 className="w-4 h-4" />
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-blue-950 border-blue-900 text-white">
                <DropdownMenuItem onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}>
                    Insert 3x3 Table
                </DropdownMenuItem>
                {isTableActive && (
                    <>
                        <DropdownMenuItem onClick={() => editor.chain().focus().addColumnBefore().run()}>Add Column Before</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => editor.chain().focus().addColumnAfter().run()}>Add Column After</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => editor.chain().focus().deleteColumn().run()}>Delete Column</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => editor.chain().focus().addRowBefore().run()}>Add Row Before</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => editor.chain().focus().addRowAfter().run()}>Add Row After</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => editor.chain().focus().deleteRow().run()}>Delete Row</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => editor.chain().focus().deleteTable().run()}>Delete Table</DropdownMenuItem>
                    </>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
      </div>

       <LinkDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSubmit={setLink}
        previousUrl={previousUrl}
      />
    </div>
  );
};

export default Toolbar;
