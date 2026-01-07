"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Image as ImageIcon } from "lucide-react";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import toast from "react-hot-toast";
import axios from "axios";
import { useRouter } from "next/navigation";

interface CollectionHeaderProps {
  collection: Collection;
}

export function CollectionHeader({ collection }: CollectionHeaderProps) {
  const router = useRouter();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [editName, setEditName] = useState(collection.name);
  const [editDesc, setEditDesc] = useState(collection.description || "");
  const [editSlug, setEditSlug] = useState(collection.slug);
  const [editCover, setEditCover] = useState<File | null>(null);

  const handleUpdateCollection = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdateLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", editName);
      formData.append("description", editDesc);
      formData.append("slug", editSlug);
      if (editCover) {
        formData.append("coverImgUrl", editCover);
      }

      await axios.patch(`/api/collections/${collection.id}`, formData);
      toast.success("Collection updated successfully");
      setIsEditDialogOpen(false);
      router.refresh();
    } catch (err) {
      console.error(err);
      toast.error("Failed to update collection");
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleDeleteCollection = async () => {
    try {
      await axios.delete(`/api/collections/${collection.id}`);
      toast.success("Collection deleted");
      router.push("/collections");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete collection");
    }
  };

  return (
    <div className="relative group">
      <div className="h-48 w-full rounded-2xl bg-blue-950 overflow-hidden relative">
        {collection.coverImgUrl ? (
          <Image
            src={collection.coverImgUrl}
            alt={collection.name}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-blue-900 border-2 border-dashed border-blue-900 rounded-2xl">
            <ImageIcon className="w-12 h-12" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              {collection.name}
            </h1>
            <p className="text-slate-300 max-w-2xl text-lg line-clamp-1">
              {collection.description || "No description provided."}
            </p>
          </div>
          <div className="flex gap-2">
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="secondary"
                  className="bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm border-0"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Series
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-slate-900 border-slate-800 text-white sm:max-w-[425px] dark">
                <DialogHeader>
                  <DialogTitle>Edit Collection</DialogTitle>
                  <DialogDescription className="text-slate-400">
                    Update the series metadata and cover image.
                  </DialogDescription>
                </DialogHeader>
                <form
                  onSubmit={handleUpdateCollection}
                  className="space-y-4 py-4"
                >
                  <div className="grid w-full items-center gap-1.5">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="bg-blue-950/50 border-blue-900 focus:ring-blue-500 placeholder:text-slate-500"
                      placeholder="Series Title"
                      required
                    />
                  </div>
                  <div className="grid w-full items-center gap-1.5">
                    <Label htmlFor="slug">Slug</Label>
                    <Input
                      id="slug"
                      value={editSlug}
                      onChange={(e) => setEditSlug(e.target.value)}
                      className="bg-blue-950/50 border-blue-900 focus:ring-blue-500 placeholder:text-slate-500"
                      placeholder="series-url-slug"
                      required
                    />
                  </div>
                  <div className="grid w-full items-center gap-1.5">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={editDesc}
                      onChange={(e) => setEditDesc(e.target.value)}
                      className="bg-blue-950/50 border-blue-900 focus:ring-blue-500 placeholder:text-slate-500 h-24"
                      placeholder="What's this series about?"
                    />
                  </div>
                  <div className="grid w-full items-center gap-1.5">
                    <Label htmlFor="cover">New Cover Image</Label>
                    {editCover && (
                      <div className="relative w-full h-32 rounded-lg overflow-hidden border border-blue-900">
                        <Image
                          src={URL.createObjectURL(editCover)}
                          alt="Preview"
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                    <Input
                      id="cover"
                      type="file"
                      onChange={(e) =>
                        setEditCover(e.target.files?.[0] || null)
                      }
                      className="bg-blue-950/50 border-blue-900 focus:ring-blue-500 file:text-slate-400"
                      accept="image/*"
                    />
                  </div>
                  <DialogFooter>
                    <Button
                      type="submit"
                      disabled={updateLoading}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      {updateLoading ? "Saving..." : "Save Changes"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="destructive"
                  className="bg-red-600/20 hover:bg-red-600 text-red-500 hover:text-white backdrop-blur-sm border-red-900/50"
                >
                  <Trash2 className="w-4 h-4 text-red-500 hover:text-white" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-slate-900 border-slate-800 text-white">
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription className="text-slate-400">
                    This action cannot be undone. This will permanently delete
                    this collection and remove all associations with your
                    articles.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="bg-slate-800 text-white border-slate-700 hover:bg-slate-700">
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteCollection}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    Delete Collection
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </div>
    </div>
  );
}
