import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Bold, Italic, List, Code, Image as ImageIcon } from "lucide-react";
import hljs from "highlight.js";
import "highlight.js/styles/github.css";

interface RichTextEditorProps {
  value: string;
  onChange: (data: string) => void;
}

function RichTextEditor({ value, onChange }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [images, setImages] = useState<string[]>([]);

  // 🔹 Simpan posisi kursor sebelum perubahan teks
  const saveCursorPosition = () => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return null;
    return selection.getRangeAt(0);
  };

  // 🔹 Pulihkan posisi kursor setelah perubahan teks
  const restoreCursorPosition = (range: Range | null) => {
    if (range) {
      const selection = window.getSelection();
      if (selection) {
        selection.removeAllRanges();
        selection.addRange(range);
      }
    }
  };

  const execCommand = (command: string, event: React.MouseEvent) => {
    event.preventDefault(); // Hindari submit form
    if (editorRef.current) {
      editorRef.current.focus();
      document.execCommand(command, false);
      updateValue();
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string;
        setImages((prev) => [...prev, imageUrl]);

        if (editorRef.current) {
          const img = document.createElement("img");
          img.src = imageUrl;
          img.className = "max-w-full h-auto my-4";
          editorRef.current.appendChild(img);
          updateValue();
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const insertCodeBlock = (event: React.MouseEvent) => {
    event.preventDefault();
    if (editorRef.current) {
      const code = document.createElement("pre");
      code.className = "bg-muted p-4 rounded-lg my-4";
      code.contentEditable = "true";
      code.innerHTML = '<code class="language-javascript">// Your code here</code>';
      editorRef.current.appendChild(code);
      hljs.highlightElement(code);
      updateValue();
    }
  };

  const updateValue = () => {
    if (editorRef.current) {
      const cursorPos = saveCursorPosition(); // 🔹 Simpan posisi kursor
      onChange(editorRef.current.innerHTML);
      restoreCursorPosition(cursorPos); // 🔹 Pulihkan posisi kursor
    }
  };

  // 🔹 Perbarui editor jika `value` berubah dari luar
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value;
    }
  }, [value]);

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData("text/plain");
    document.execCommand("insertText", false, text);
  };

  return (
    <div className="border rounded-lg">
      <div className="border-b bg-muted p-2 flex gap-2 flex-wrap">
        <Button type="button" variant="ghost" size="icon" onClick={(e) => execCommand("bold", e)}>
          <Bold className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="icon" onClick={(e) => execCommand("italic", e)}>
          <Italic className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="icon" onClick={(e) => execCommand("insertUnorderedList", e)}>
          <List className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="icon" onClick={insertCodeBlock}>
          <Code className="h-4 w-4" />
        </Button>
        <div className="relative">
          <input
            type="file"
            multiple
            accept="image/*"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            onChange={handleImageUpload}
          />
          <Button type="button" variant="ghost" size="icon">
            <ImageIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div
        ref={editorRef}
        className="min-h-[200px] p-4 prose prose-sm max-w-none focus:outline-none"
        contentEditable
        onInput={updateValue}
        onPaste={handlePaste}
      />
    </div>
  );
}

const ContentEditor = RichTextEditor;
export { ContentEditor };
export default ContentEditor;

