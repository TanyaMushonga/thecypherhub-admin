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
import { Plus, Loader2 } from "lucide-react";
import Image from "next/image";
import toast from "react-hot-toast";
import axios from "axios";
import { useRouter } from "next/navigation";

export function NewCollectionDialog() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    slug: "",
  });
  const [coverFile, setCoverFile] = useState<File | null>(null);

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

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (coverFile) {
      const isValid = await validateImage(coverFile);
      if (!isValid) return;
    }

    try {
      setLoading(true);
      const data = new FormData();
      data.append("name", formData.name);
      data.append("description", formData.description);
      data.append("slug", formData.slug);
      if (coverFile) {
        data.append("coverImgUrl", coverFile);
      }

      await axios.post("/api/collections", data);
      toast.success("Collection created successfully");
      setIsOpen(false);
      setFormData({ name: "", description: "", slug: "" });
      setCoverFile(null);
      router.refresh();
    } catch (err) {
      console.error(err);
      toast.error("Failed to create collection");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          New Collection
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-slate-900 border-slate-800 text-white dark">
        <DialogHeader>
          <DialogTitle>Create Collection</DialogTitle>
          <DialogDescription className="text-slate-400">
            Create a new collection to group your articles.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => {
                const name = e.target.value;
                const slug = name
                  .toLowerCase()
                  .replace(/ /g, "-")
                  .replace(/[^\w-]+/g, "");
                setFormData({ ...formData, name, slug });
              }}
              className="bg-blue-950/50 border-blue-900 focus:ring-blue-500 placeholder:text-slate-500"
              placeholder="e.g. Learning Backend Series"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="slug">Slug</Label>
            <Input
              id="slug"
              value={formData.slug}
              onChange={(e) =>
                setFormData({ ...formData, slug: e.target.value })
              }
              className="bg-blue-950/50 border-blue-900 focus:ring-blue-500 placeholder:text-slate-500"
              placeholder="learning-backend-series"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  description: e.target.value,
                })
              }
              className="bg-blue-950/50 border-blue-900 focus:ring-blue-500 placeholder:text-slate-500 h-24"
              placeholder="What is this collection about?"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cover">Cover Image (Optional)</Label>
            {coverFile && (
              <div className="relative w-full h-32 rounded-lg overflow-hidden border border-blue-900">
                <Image
                  src={URL.createObjectURL(coverFile)}
                  alt="Preview"
                  fill
                  className="object-cover"
                />
              </div>
            )}
            <Input
              id="cover"
              type="file"
              accept="image/*"
              onChange={(e) => setCoverFile(e.target.files?.[0] || null)}
              className="bg-blue-950/50 border-blue-900 focus:ring-blue-500 file:text-slate-400"
            />
          </div>
          <DialogFooter>
            <Button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto flex items-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? "Creating..." : "Create Collection"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
