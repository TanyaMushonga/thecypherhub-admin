"use client";
import React, { useState, useRef, useEffect } from "react";
import Tiptap from "./Tiptap";
import { Image as ImageIcon, Loader2 } from "lucide-react";
import { Button } from "../ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import BlogPreview from "./blogPreview";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import Image from "next/image";

interface BlogEditorProps {
  initialData?: ArticleFormData;
  isEditing?: boolean;
  onSubmit: (data: ArticleFormData, coverImage?: File) => Promise<void>;
  loading?: boolean;
}

const BlogEditor: React.FC<BlogEditorProps> = ({
  initialData,
  isEditing = false,
  onSubmit,
  loading = false,
}) => {
  const [content, setContent] = useState<ArticleFormData>({
    title: "",
    slug: "",
    description: "",
    category: "",
    content: "",
    keywords: [],
    collectionId: "",
    status: "unpublished",
  });
  const [collections, setCollections] = useState<Collection[]>([]);
  const [blogCover, setBlogCover] = useState<File>();
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [keywordInput, setKeywordInput] = useState("");
  const [error, setError] = useState("");
  const [clearEditor, setClearEditor] = useState(false);

  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const ref = useRef<HTMLInputElement>(null);

  // Load initial data if editing
  useEffect(() => {
    if (initialData) {
      setContent(initialData);
      if (initialData.coverImgUrl) {
        setCoverPreview(initialData.coverImgUrl);
      }
    }
  }, [initialData]);

  // Local Storage for drafts (only for new articles)
  useEffect(() => {
    if (!isEditing) {
      const savedContent = localStorage.getItem("blogContent");
      if (savedContent) {
        setContent((prev) => ({ ...prev, ...JSON.parse(savedContent) }));
      }
    }
  }, [isEditing]);

  // Fetch collections for dropdown
  useEffect(() => {
    const fetchCollections = async () => {
      try {
        const response = await fetch("/api/collections");
        if (response.ok) {
          const data = await response.json();
          setCollections(data);
        }
      } catch (err) {
        console.error("Error fetching collections:", err);
      }
    };
    fetchCollections();
  }, []);

  // Auto-save effect with debounce
  useEffect(() => {
    if (!isEditing) {
      // Don't save empty initial state if it matches default
      if (!content.title && !content.content && !content.slug) return;

      setIsSaving(true);

      const timeoutId = setTimeout(() => {
        localStorage.setItem("blogContent", JSON.stringify(content));
        setLastSaved(new Date());
        setIsSaving(false);
      }, 1000); // 1s debounce

      return () => clearTimeout(timeoutId);
    }
  }, [content, isEditing]);

  const handleContentChange = (newContent: string) => {
    setContent((prev) => ({ ...prev, content: newContent }));
  };

  const handleCoverChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      setBlogCover(file);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverPreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Validate dimensions
      try {
        const isValid = await validateImageDimensions(file);
        if (!isValid) {
          setError("The blog cover must be 1200x630 pixels");
        } else {
          setError("");
        }
      } catch {
        setError("Failed to validate image dimensions");
      }
    }
  };

  const validateImageDimensions = (file: File): Promise<boolean> => {
    return new Promise((resolve, reject) => {
      const img = new window.Image();
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
      e.preventDefault();
      if (!content.keywords.includes(keywordInput.trim())) {
        setContent((prev) => ({
          ...prev,
          keywords: [...(prev.keywords || []), keywordInput.trim()],
        }));
      }
      setKeywordInput("");
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
    setError("");

    if (!content.title) return setError("Title is required");
    if (content.title.length < 50 || content.title.length > 60) {
      return setError("Title must be between 50 and 60 characters");
    }
    if (!content.collectionId && !content.category)
      return setError("Category is required");
    if (!content.description) return setError("Description is required");
    if (!content.content) return setError("Content is required");
    if (!content.keywords || content.keywords.length === 0)
      return setError("Keywords are required");
    if (!content.slug) return setError("Slug is required");
    if (!isEditing && !blogCover) return setError("Cover Image is required");

    if (blogCover) {
      const isValidImage = await validateImageDimensions(blogCover);
      if (!isValidImage) {
        return setError("The blog cover must be 1200x630 pixels");
      }
    }

    try {
      await onSubmit(content, blogCover);
      if (!isEditing) {
        // Clear form after successful submission for new articles
        setContent({
          title: "",
          slug: "",
          description: "",
          category: "",
          content: "",
          keywords: [],
          collectionId: "",
          status: "unpublished",
        });
        setClearEditor(true);
        setBlogCover(undefined);
        setCoverPreview(null);
        localStorage.removeItem("blogContent");
        // Reset clearEditor trigger after a brief delay
        setTimeout(() => setClearEditor(false), 100);
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || "An error occurred");
      } else {
        setError("An error occurred");
      }
    }
  };

  const getSaveStatus = () => {
    if (isEditing) return "";
    if (isSaving) return "Saving...";
    if (lastSaved) return `Saved ${lastSaved.toLocaleTimeString()}`;
    return "";
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-4">
      <Link
        href="/articles"
        className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Articles</span>
      </Link>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-140px)]"
      >
        {/* Main Editor Section */}
        <div className="flex-1 flex flex-col gap-4 bg-blue-950/50 rounded-lg border border-blue-900 overflow-hidden h-full">
          <Tiptap
            immediatelyRender={false}
            content={content.content}
            onChange={(newContent: string) => handleContentChange(newContent)}
            clearEditor={clearEditor}
          />
        </div>

        {/* Sidebar Metadata Section */}
        <div className="w-full lg:w-[500px] flex flex-col gap-4 h-full overflow-y-auto no-scrollbar p-1">
          <div className="bg-blue-950 p-4 rounded-lg border border-blue-900 space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-white">
                Article Details
              </h2>
              <div className="flex items-center gap-2 text-xs text-sky-400 font-mono transition-opacity duration-300">
                {isSaving && <Loader2 className="w-3 h-3 animate-spin" />}
                <span>{getSaveStatus()}</span>
              </div>
            </div>

            {/* Title */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label
                  htmlFor="title"
                  className="text-sm font-medium text-slate-300"
                >
                  Title
                </label>
                <span
                  className={`text-xs ${
                    content.title.length >= 50 && content.title.length <= 60
                      ? "text-green-400"
                      : "text-red-400"
                  }`}
                >
                  {content.title.length}/60 chars (should be 50-60)
                </span>
              </div>
              <input
                type="text"
                id="title"
                className="w-full bg-blue-900/50 border border-blue-800 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-slate-500"
                placeholder="Article title"
                value={content.title}
                onChange={(e) =>
                  setContent((prev) => ({ ...prev, title: e.target.value }))
                }
              />
            </div>

            {/* Slug */}
            <div className="space-y-2">
              <label
                htmlFor="slug"
                className="text-sm font-medium text-slate-300"
              >
                Slug
              </label>
              <input
                type="text"
                id="slug"
                className="w-full bg-blue-900/50 border border-blue-800 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-slate-500 text-sm"
                placeholder="url-friendly-slug"
                value={content.slug}
                onChange={(e) =>
                  setContent((prev) => ({ ...prev, slug: e.target.value }))
                }
              />
            </div>
            {/* Category - Hidden if collection is selected */}
            {!content.collectionId && (
              <div className="space-y-2">
                <label
                  htmlFor="category"
                  className="text-sm font-medium text-slate-300"
                >
                  Category
                </label>
                <select
                  id="category"
                  className="w-full bg-blue-900/50 border border-blue-800 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={content.category || ""}
                  onChange={(e) =>
                    setContent((prev) => ({
                      ...prev,
                      category: e.target.value,
                    }))
                  }
                >
                  <option value="" disabled className="text-slate-500">
                    Select a category
                  </option>
                  <option value="system-design">System Design</option>
                  <option value="devops">DevOps</option>
                  <option value="web-development">Web Development</option>
                  <option value="mobile-development">Mobile Development</option>
                  <option value="others">Others</option>
                </select>
              </div>
            )}

            {/* Collection */}
            <div className="space-y-2">
              <label
                htmlFor="collection"
                className="text-sm font-medium text-slate-300"
              >
                Collection (Optional)
              </label>
              <select
                id="collection"
                className="w-full bg-blue-900/50 border border-blue-800 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={content.collectionId || ""}
                onChange={(e) =>
                  setContent((prev) => ({
                    ...prev,
                    collectionId: e.target.value,
                  }))
                }
              >
                <option value="">None</option>
                {collections.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Status */}
            <div className="space-y-2">
              <label
                htmlFor="status"
                className="text-sm font-medium text-slate-300"
              >
                Status
              </label>
              <select
                id="status"
                className="w-full bg-blue-900/50 border border-blue-800 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={content.status}
                onChange={(e) =>
                  setContent((prev) => ({
                    ...prev,
                    status: e.target.value as "published" | "unpublished",
                  }))
                }
              >
                <option value="published">Published</option>
                <option value="unpublished">
                  Unpublished (Checklist Only)
                </option>
              </select>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label
                htmlFor="description"
                className="text-sm font-medium text-slate-300"
              >
                Description
              </label>
              <textarea
                id="description"
                rows={3}
                className="w-full bg-blue-900/50 border border-blue-800 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-slate-500 resize-none"
                placeholder="Short description for SEO"
                value={content.description}
                onChange={(e) =>
                  setContent((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
              />
            </div>

            {/* Keywords */}
            <div className="space-y-2">
              <label
                htmlFor="keywords"
                className="text-sm font-medium text-slate-300"
              >
                Keywords
              </label>
              <input
                type="text"
                id="keywords"
                className="w-full bg-blue-900/50 border border-blue-800 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-slate-500"
                placeholder="Press Enter to add"
                value={keywordInput}
                onChange={(e) => setKeywordInput(e.target.value)}
                onKeyDown={handleKeywordInput}
              />
              <div className="flex flex-wrap gap-2 mt-2">
                {content.keywords?.map((keyword, index) => (
                  <span
                    key={index}
                    className="bg-blue-800 text-blue-100 px-2 py-0.5 rounded text-xs flex items-center gap-1 border border-blue-700"
                  >
                    {keyword}
                    <button
                      type="button"
                      onClick={() => handleRemoveKeyword(keyword)}
                      className="hover:text-red-300"
                    >
                      &times;
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Cover Image */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 block">
                Cover Image (1200x630)
              </label>
              <div className="flex items-center gap-4">
                <label
                  htmlFor="blog_cover"
                  className="cursor-pointer flex items-center justify-center w-full h-32 bg-blue-900/30 border-2 border-dashed border-blue-800 rounded-lg hover:bg-blue-900/50 hover:border-blue-700 transition-colors"
                >
                  {coverPreview ? (
                    <Image
                      width={1200}
                      height={630}
                      src={coverPreview}
                      alt="Cover Preview"
                      className="h-full w-full object-cover rounded-lg"
                    />
                  ) : (
                    <div className="flex flex-col items-center text-slate-400">
                      <ImageIcon className="w-8 h-8 mb-2" />
                      <span className="text-xs">Click to upload</span>
                    </div>
                  )}
                </label>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleCoverChange}
                  ref={ref}
                  id="blog_cover"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="pt-4 border-t border-blue-900 flex gap-3">
              <Sheet>
                <SheetTrigger asChild>
                  <Button
                    variant="outline"
                    className="flex-1 border-blue-700 text-blue-100 hover:bg-blue-800 hover:text-white bg-transparent"
                    type="button"
                  >
                    Preview
                  </Button>
                </SheetTrigger>
                <SheetContent className="bg-blue-950 border-l border-blue-900 text-white w-full sm:max-w-4xl overflow-y-auto no-scrollbar">
                  <SheetHeader className="mb-4">
                    <SheetTitle className="text-white">
                      Article Preview
                    </SheetTitle>
                  </SheetHeader>
                  <BlogPreview content={content.content} />
                </SheetContent>
              </Sheet>

              <Button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {loading
                  ? "Saving..."
                  : isEditing
                    ? "Update Article"
                    : "Publish Article"}
              </Button>
            </div>

            {error && (
              <div className="p-3 bg-red-900/20 border border-red-900/50 rounded text-red-200 text-sm text-center">
                {error}
              </div>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};

export default BlogEditor;
