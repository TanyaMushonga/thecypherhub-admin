"use client";
import React, { useState, useRef, useEffect } from "react";
import Tiptap from "./Tiptap";
import toast from "react-hot-toast";
import { Image as ImageIcon } from "lucide-react";
import { Button } from "../ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import BlogPreview from "./blogPreview";

type blogContent = {
  title: string;
  slug: string;
  description: string;
  category: string;
  content: string;
  keywords: string[];
};

const CreateBlog = () => {
  const [content, setContent] = useState<blogContent>({
    title: "",
    slug: "",
    description: "",
    category: "",
    content: "",
    keywords: [],
  });
  const [blogCover, setBlogCover] = useState<File>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [clearEditor, setClearEditor] = useState(false);
  const [keywordInput, setKeywordInput] = useState("");

  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const ref = useRef<HTMLInputElement>(null);

  // Load saved content on mount
  useEffect(() => {
    const savedContent = localStorage.getItem("blogContent");
    if (savedContent) {
      try {
        const parsed = JSON.parse(savedContent);
        setContent(parsed);
      } catch (e) {
        console.error("Failed to parse saved draft", e);
      }
    }
  }, []);

  // Auto-save effect with debounce
  useEffect(() => {
    // Don't save empty initial state if it matches default
    if (!content.title && !content.content && !content.slug) return;

    setIsSaving(true);
    
    const timeoutId = setTimeout(() => {
      localStorage.setItem("blogContent", JSON.stringify(content));
      setLastSaved(new Date());
      setIsSaving(false);
    }, 1000); // 1s debounce

    return () => clearTimeout(timeoutId);
  }, [content]);

  const handleContentChange = (newContent: string) => {
    setContent((prev) => ({ ...prev, content: newContent }));
  };

  const validateImageDimensions = (file: File): Promise<boolean> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = URL.createObjectURL(file);
      img.onload = () => {
        if (img.width === 1200 && img.height === 630) {
          resolve(true);
        } else {
          resolve(false);
        }
      };
      img.onerror = () => {
        reject(new Error("Failed to load image"));
      };
    });
  };

  const handleKeywordInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && keywordInput.trim()) {
      setContent((prev) => ({
        ...prev,
        keywords: [...(prev.keywords || []), keywordInput.trim()],
      }));
      setKeywordInput("");
      e.preventDefault();
    }
  };

  const handleRemoveKeyword = (keyword: string) => {
    setContent((prev) => ({
      ...prev,
      keywords: prev?.keywords?.filter((k) => k !== keyword),
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    console.log("Submitting blog content:", content);
    console.log("Blog cover:", blogCover);

    if (!content.title) {
      console.log("Validation failed: Title missing");
      setError("Title is required");
      setLoading(false);
      return;
    } else if (!content.category) {
      console.log("Validation failed: Category missing");
      setError("Category is required");
      setLoading(false);
      return;
    } else if (!content.description) {
      console.log("Validation failed: Description missing");
      setError("Description is required");
      setLoading(false);
      return;
    } else if (!content.content) {
      console.log("Validation failed: Content missing");
      setError("Content is required");
      setLoading(false);
      return;
    } else if (!content.keywords || content.keywords.length === 0) {
      console.log("Validation failed: Keywords missing");
      setError("Keywords is required");
      setLoading(false);
      return;
    } else if (!content.slug) {
      console.log("Validation failed: Slug missing");
      setError("Slug is required");
      setLoading(false);
      return;
    } else if (!blogCover) {
      console.log("Validation failed: Cover Image missing");
      setError("Cover Image is required");
      setLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append("title", content.title);
    formData.append("description", content.description);
    formData.append("category", content.category);
    formData.append("content", content.content);
    formData.append("keywords", JSON.stringify(content.keywords));
    formData.append("slug", content.slug);
    if (blogCover) {
      formData.append("coverImgUrl", blogCover);
    }

    const response = await fetch("/api/add-blog", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      setError("Error creating blog");
      setLoading(false);
      throw new Error(await response.text());
    } else {
      toast.success("Blog created successfully");
      setLoading(false);
      setContent({
        title: "",
        slug: "",
        description: "",
        category: "",
        content: "",
        keywords: [],
      });
      setClearEditor(true);
      setBlogCover(undefined);
      localStorage.removeItem("blogContent");
      localStorage.removeItem("blogCover");
    }
  };

  const getSaveStatus = () => {
    if (isSaving) return "Saving...";
    if (lastSaved) return `Saved ${lastSaved.toLocaleTimeString()}`;
    return "";
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full grid place-items-center mx-auto"
    >
      <div className="w-full flex flex-row gap-20 justify-center">
        <div className="w-1/2">
          <Tiptap
            immediatelyRender={false}
            content={content.content}
            onChange={(newContent: string) => handleContentChange(newContent)}
            clearEditor={clearEditor}
          />
        </div>
        <div className="w-1/2 pe-10">
          <div className="flex flex-row gap-3">
            <div className="flex flex-col w-full mb-4">
              <label htmlFor="title" className="text-sky-300">
                Title
              </label>
              <input
                type="text"
                id="title"
                className="w-full border border-sky-300 rounded-md px-2 py-1"
                value={content.title}
                onChange={(e) =>
                  setContent((prev) => ({ ...prev, title: e.target.value }))
                }
              />
            </div>
            
            <div className="flex justify-end mb-2">
                 <span className="text-xs text-sky-400 font-mono transition-opacity duration-300">
                    {getSaveStatus()}
                  </span>
            </div>

            <div className="flex flex-col w-full mb-4">
              <label htmlFor="tags" className="text-sky-300">
                Category
              </label>
              <select
                id="tags"
                className="w-full border border-sky-300 rounded-md px-2 py-1"
                value={content.category}
                onChange={(e) =>
                  setContent((prev) => ({ ...prev, category: e.target.value }))
                }
              >
                <option value="" disabled>
                  Select a category
                </option>
                <option value="system-design">System Design</option>
                <option value="devops">DevOps</option>
                <option value="web-development">Web Development</option>
                <option value="mobile-development">Mobile Development</option>
                <option value="mobile-development">Others</option>
              </select>
            </div>
          </div>
          <div className="flex flex-col w-full mb-4">
            <label htmlFor="description" className="text-sky-300">
              Description
            </label>
            <textarea
              id="description"
              className="w-full border border-sky-300 rounded-md px-2 py-1"
              value={content.description}
              onChange={(e) =>
                setContent((prev) => ({ ...prev, description: e.target.value }))
              }
            ></textarea>
          </div>
          <div className="flex flex-row w-full mb-4">
            <label htmlFor="blog_cover" className="text-sky-300 cursor-pointer">
              <ImageIcon className="w-10 h-10" />
            </label>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => setBlogCover(e.target.files?.[0])}
              ref={ref}
              id="blog_cover"
            />

            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant={"default"}
                  className="bg-blue-200 text-black ms-5 hover:bg-blue-300"
                  type="button"
                >
                  Preview
                </Button>
              </SheetTrigger>
              <SheetContent className="bg-blue-950">
                <SheetHeader>
                  <SheetTitle className="text-white">Preview</SheetTitle>
                  <BlogPreview content={content.content} />
                </SheetHeader>
              </SheetContent>
            </Sheet>

            <Button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white ms-5 hover:bg-blue-700"
            >
              {loading ? "Publishing..." : "Publish"}
            </Button>
          </div>
          <div className="flex flex-col w-full mb-4">
            <div className="flex flex-row gap-2">
              <div className="flex flex-col w-full mb-4">
                <label htmlFor="keywords" className="text-sky-300">
                  Keywords
                </label>
                <input
                  type="text"
                  id="keywords"
                  className="w-full border border-sky-300 rounded-md px-2 py-1"
                  value={keywordInput}
                  onChange={(e) => setKeywordInput(e.target.value)}
                  onKeyDown={handleKeywordInput}
                  placeholder="Type a keyword and press Enter"
                />
              </div>
              <div className="flex flex-col w-full mb-4">
                <label htmlFor="title" className="text-sky-300">
                  Slug
                </label>
                <input
                  type="text"
                  id="slug"
                  className="w-full border border-sky-300 rounded-md px-2 py-1"
                  value={content.slug}
                  onChange={(e) =>
                    setContent((prev) => ({ ...prev, slug: e.target.value }))
                  }
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {content?.keywords?.map((keyword, index) => (
                <span
                  key={index}
                  className="bg-sky-300 text-white px-2 py-1 rounded-md cursor-pointer"
                  onClick={() => handleRemoveKeyword(keyword)}
                >
                  {keyword} &times;
                </span>
              ))}
            </div>
          </div>
          {loading && (
            <p className="text-green-500 text-2xl font-semibold">
              Uploading your blog
            </p>
          )}
          {error && (
            <p className="text-red-500 text-2xl font-semibold">{error}</p>
          )}
        </div>
      </div>
    </form>
  );
};

export default CreateBlog;
