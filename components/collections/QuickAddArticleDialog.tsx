"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, CheckCircle2, X } from "lucide-react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import toast from "react-hot-toast";
import axios from "axios";
import { useRouter } from "next/navigation";

interface QuickAddArticleDialogProps {
  collectionId: string;
  collectionCategory?: string;
}

export function QuickAddArticleDialog({
  collectionId,
  collectionCategory,
}: QuickAddArticleDialogProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const [addSuccess, setAddSuccess] = useState(false);
  const [backendError, setBackendError] = useState<string | null>(null);

  const [newArtTitle, setNewArtTitle] = useState("");
  const [newArtSlug, setNewArtSlug] = useState("");
  const [newArtDesc, setNewArtDesc] = useState("");
  const [newArtKeywords, setNewArtKeywords] = useState<string[]>([]);
  const [keywordInput, setKeywordInput] = useState("");
  const [newArtCover, setNewArtCover] = useState<File | null>(null);
  const [newArtCoverPreview, setNewArtCoverPreview] = useState<string | null>(
    null
  );
  const [newArtDate, setNewArtDate] = useState("");

  const validateImage = (file: File): Promise<boolean> => {
    return new Promise((resolve) => {
      const img = new window.Image();
      img.onload = () => {
        if (img.width < 1200 || img.height < 630) {
          toast.error("Image too small. Minimum 1200x630 required.");
          resolve(false);
        } else {
          resolve(true);
        }
      };
      img.onerror = () => resolve(false);
      img.src = URL.createObjectURL(file);
    });
  };

  const handleKeywordAdd = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === "Enter" || e.key === ",") && keywordInput.trim()) {
      e.preventDefault();
      const tag = keywordInput.trim().replace(/,$/, "");
      if (tag && !newArtKeywords.includes(tag)) {
        setNewArtKeywords([...newArtKeywords, tag]);
      }
      setKeywordInput("");
    }
  };

  const removeKeyword = (tag: string) => {
    setNewArtKeywords(newArtKeywords.filter((k) => k !== tag));
  };

  const handleQuickAddArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    setBackendError(null);

    if (newArtTitle.length < 50 || newArtTitle.length > 60) {
      toast.error("Title must be between 50 and 60 characters");
      return;
    }

    if (newArtCover) {
      const isValid = await validateImage(newArtCover);
      if (!isValid) return;
    }

    setAddLoading(true);
    try {
      const formData = new FormData();
      formData.append("title", newArtTitle);
      formData.append(
        "slug",
        newArtSlug ||
          newArtTitle
            .toLowerCase()
            .replace(/ /g, "-")
            .replace(/[^\w-]+/g, "")
      );
      formData.append("description", newArtDesc);
      formData.append("keywords", JSON.stringify(newArtKeywords));
      formData.append("status", "unpublished");
      formData.append("collectionId", collectionId);
      if (collectionCategory) formData.append("category", collectionCategory);
      if (newArtDate) formData.append("publishedAt", newArtDate);
      if (newArtCover) formData.append("coverImgUrl", newArtCover);
      formData.append("content", "");

      await axios.post("/api/add-blog", formData);
      toast.success("Shell article added to series");
      setAddSuccess(true);
      router.refresh();
    } catch (err: unknown) {
      console.error(err);
      const errorMsg =
        err instanceof axios.AxiosError && err.response?.data?.message
          ? err.response.data.message
          : "Failed to add article shell";
      setBackendError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setAddLoading(false);
    }
  };

  const resetQuickAdd = () => {
    setNewArtTitle("");
    setNewArtSlug("");
    setNewArtDesc("");
    setNewArtKeywords([]);
    setKeywordInput("");
    setNewArtCover(null);
    setNewArtCoverPreview(null);
    setNewArtDate("");
    setAddSuccess(false);
    setBackendError(null);
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open);
        if (!open) resetQuickAdd();
      }}
    >
      <DialogTrigger asChild>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Add Article to collection
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-slate-900 border-slate-800 text-white sm:max-w-[500px] max-h-[90vh] overflow-y-auto dark">
        {!addSuccess && (
          <DialogHeader>
            <DialogTitle>Add Article to collection</DialogTitle>
            <DialogDescription className="text-slate-400">
              Capture basic article info now, write content later.
            </DialogDescription>
          </DialogHeader>
        )}

        {addSuccess ? (
          <div className="py-2 space-y-8 text-center overflow-x-hidden px-1 flex flex-col items-center">
            <div className="flex flex-col items-center gap-4 mt-4">
              <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center border border-green-500/20 shadow-[0_0_20px_rgba(34,197,94,0.1)]">
                <CheckCircle2 className="w-12 h-12 text-green-500" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-white tracking-tight">
                  Article Added!
                </h3>
                <p className="text-slate-400 text-sm max-w-[320px] leading-relaxed">
                  The shell article &quot;{newArtTitle}&quot; is now tracked in
                  your project roadmap.
                </p>
              </div>
            </div>

            <div className="w-full max-w-sm mx-auto space-y-6">
              <Card className="bg-slate-950/40 border-slate-800 text-left overflow-hidden shadow-xl backdrop-blur-md">
                {newArtCoverPreview && (
                  <div className="h-40 w-full relative group">
                    <Image
                      src={newArtCoverPreview}
                      alt="Preview"
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 to-transparent" />
                  </div>
                )}
                <CardContent className="p-5">
                  <h4 className="text-white font-semibold text-base truncate">
                    {newArtTitle}
                  </h4>
                  <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                    {newArtDesc || "No description provided"}
                  </p>
                </CardContent>
              </Card>

              <div className="flex gap-4 w-full">
                <Button
                  variant="outline"
                  onClick={() => setIsOpen(false)}
                  className="flex-1 border-slate-800 bg-transparent hover:bg-slate-800 whitespace-nowrap overflow-hidden text-ellipsis"
                >
                  Dismiss
                </Button>
                <Button
                  onClick={() =>
                    router.push(
                      `/article/${
                        newArtSlug ||
                        newArtTitle
                          .toLowerCase()
                          .replace(/ /g, "-")
                          .replace(/[^\w-]+/g, "")
                      }/edit`
                    )
                  }
                  className="flex-1 bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-600/20 whitespace-nowrap overflow-hidden text-ellipsis"
                >
                  Open Editor
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleQuickAddArticle} className="space-y-4 py-4">
            {backendError && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm">
                {backendError}
              </div>
            )}
            <div className="space-y-1.5">
              <div className="flex justify-between items-end">
                <Label htmlFor="artTitle">Article Title</Label>
                <span
                  className={`text-[10px] font-mono ${newArtTitle.length < 50 || newArtTitle.length > 60 ? "text-red-400" : "text-green-400"}`}
                >
                  {newArtTitle.length}/60
                </span>
              </div>
              <Input
                id="artTitle"
                value={newArtTitle}
                onChange={(e) => {
                  setNewArtTitle(e.target.value);
                  if (!newArtSlug) {
                    setNewArtSlug(
                      e.target.value
                        .toLowerCase()
                        .replace(/ /g, "-")
                        .replace(/[^\w-]+/g, "")
                    );
                  }
                }}
                className="bg-blue-950/50 border-blue-900 focus:ring-blue-500 placeholder:text-slate-500"
                placeholder="The Big AI Move (50-60 characters)"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="artSlug">Slug</Label>
              <Input
                id="artSlug"
                value={newArtSlug}
                onChange={(e) => setNewArtSlug(e.target.value)}
                className="bg-blue-950/50 border-blue-900 focus:ring-blue-500 font-mono text-xs placeholder:text-slate-500"
                placeholder="the-big-ai-move"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="artDate">Planned/Publish Date</Label>
              <Input
                id="artDate"
                type="date"
                value={newArtDate}
                min={new Date().toISOString().split("T")[0]}
                onChange={(e) => setNewArtDate(e.target.value)}
                className="bg-blue-950/50 border-blue-900 focus:ring-blue-500 text-white [color-scheme:dark]"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="artDesc">Description</Label>
              <Textarea
                id="artDesc"
                value={newArtDesc}
                onChange={(e) => setNewArtDesc(e.target.value)}
                className="bg-blue-950/50 border-blue-900 focus:ring-blue-500 h-20 text-sm placeholder:text-slate-500"
                placeholder="Brief summary used for SEO and cards"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="artKeywords">Keywords</Label>
              <div className="flex flex-wrap gap-2 mb-2">
                {newArtKeywords.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="bg-blue-500/20 text-blue-300 border-blue-800 flex items-center gap-1"
                  >
                    {tag}
                    <X
                      className="w-3 h-3 cursor-pointer hover:text-white"
                      onClick={() => removeKeyword(tag)}
                    />
                  </Badge>
                ))}
              </div>
              <Input
                id="artKeywords"
                value={keywordInput}
                onChange={(e) => setKeywordInput(e.target.value)}
                onKeyDown={handleKeywordAdd}
                className="bg-blue-950/50 border-blue-900 focus:ring-blue-500 placeholder:text-slate-500"
                placeholder="Type keyword and press Enter"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="artCover">Cover Image (1200x630)</Label>
              {newArtCoverPreview && (
                <div className="relative w-full h-32 rounded-lg overflow-hidden mb-2 border border-blue-900">
                  <Image
                    src={newArtCoverPreview}
                    alt="Preview"
                    fill
                    className="object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setNewArtCover(null);
                      setNewArtCoverPreview(null);
                    }}
                    className="absolute top-2 right-2 bg-black/60 p-1 rounded-full text-white hover:bg-black/80"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
              <Input
                id="artCover"
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  setNewArtCover(file);
                  if (file) {
                    setNewArtCoverPreview(URL.createObjectURL(file));
                  } else {
                    setNewArtCoverPreview(null);
                  }
                }}
                className="bg-blue-950/50 border-blue-900 focus:ring-blue-500 text-xs file:text-slate-400"
              />
            </div>
            <DialogFooter>
              <Button
                type="submit"
                disabled={addLoading}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {addLoading ? "Adding..." : "Add to Roadmap"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
