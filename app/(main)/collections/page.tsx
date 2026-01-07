"use client";

import React, { useState } from "react";
import { useCollections } from "@/hooks/useCollections";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Plus,
  BookOpen,
  Clock,
  Loader2,
  Image as ImageIcon,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import toast from "react-hot-toast";

export default function CollectionsPage() {
  const { collections, loading, createCollection } = useCollections();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
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
        // Enforcing 16:9 or similar high-quality minimums
        if (img.width < 1200 || img.height < 630) {
          toast.error(
            "Image too small. Minimum 1200x630 required for high quality."
          );
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
      const data = new FormData();
      data.append("name", formData.name);
      data.append("description", formData.description);
      data.append("slug", formData.slug);
      if (coverFile) {
        data.append("coverImgUrl", coverFile);
      }

      await createCollection(data);
      toast.success("Collection created successfully");
      setIsDialogOpen(false);
      setFormData({ name: "", description: "", slug: "" });
      setCoverFile(null);
    } catch {
      toast.error("Failed to create collection");
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Collections</h1>
          <p className="text-slate-400">
            Group your articles into series and tracks
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
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
      </div>

      {loading && collections.length === 0 ? (
        <div className="flex justify-center p-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      ) : collections.length === 0 ? (
        <div className="text-center p-12 bg-blue-950/30 rounded-lg border border-dashed border-blue-900">
          <p className="text-slate-400">
            No collections found. Create one to get started!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {collections.map((collection) => (
            <Link key={collection.id} href={`/collections/${collection.id}`}>
              <Card className="bg-slate-900 border-slate-800 hover:border-blue-600/50 transition-all cursor-pointer group overflow-hidden flex flex-col h-full shadow-lg hover:shadow-blue-900/10">
                <div className="h-40 w-full relative bg-slate-800 shrink-0">
                  {collection.coverImgUrl ? (
                    <Image
                      src={collection.coverImgUrl}
                      alt={collection.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-slate-700 bg-slate-900/50">
                      <ImageIcon className="w-10 h-10 opacity-20" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent opacity-80" />
                </div>
                <CardHeader className="pt-4 pb-2 space-y-1">
                  <CardTitle className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors line-clamp-1">
                    {collection.name}
                  </CardTitle>
                  <CardDescription className="text-slate-400 line-clamp-2 text-sm leading-relaxed">
                    {collection.description || "No description provided"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="mt-auto pt-4">
                  <div className="flex items-center justify-between text-[11px] font-medium uppercase tracking-wider text-slate-500">
                    <div className="flex items-center gap-2 px-2 py-1 bg-blue-500/10 text-blue-400 rounded-full">
                      <BookOpen className="w-3 h-3" />
                      <span>{collection.articles?.length || 0} Articles</span>
                    </div>
                    <div className="flex items-center gap-1.5 opacity-60">
                      <Clock className="w-3 h-3" />
                      <span>
                        {new Date(collection.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
