"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Clock,
  CheckCircle2,
  Circle,
  Edit,
  Plus,
  Trash2,
  Image as ImageIcon,
  ExternalLink,
  ChevronRight,
  X,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
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

export default function CollectionDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [collection, setCollection] = useState<Collection | null>(null);
  const [loading, setLoading] = useState(true);

  // Edit Collection Form State
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editSlug, setEditSlug] = useState("");
  const [editCover, setEditCover] = useState<File | null>(null);
  const [updateLoading, setUpdateLoading] = useState(false);

  // Quick Add Article State
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [newArtTitle, setNewArtTitle] = useState("");
  const [newArtSlug, setNewArtSlug] = useState("");
  const [newArtDesc, setNewArtDesc] = useState("");
  const [newArtKeywords, setNewArtKeywords] = useState<string[]>([]);
  const [keywordInput, setKeywordInput] = useState("");
  const [newArtCover, setNewArtCover] = useState<File | null>(null);
  const [newArtCoverPreview, setNewArtCoverPreview] = useState<string | null>(
    null
  );
  const [newArtStatus, setNewArtStatus] = useState<"published" | "unpublished">(
    "unpublished"
  );
  const [newArtDate, setNewArtDate] = useState("");
  const [addLoading, setAddLoading] = useState(false);
  const [addSuccess, setAddSuccess] = useState(false);
  const [backendError, setBackendError] = useState<string | null>(null);

  const validateImage = (file: File): Promise<boolean> => {
    return new Promise((resolve) => {
      const img = new window.Image();
      img.onload = () => {
        // Enforcing 1200x630 as requested
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

  const fetchCollection = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/collections/${id}`);
      setCollection(response.data);
      // Pre-fill edit state
      setEditName(response.data.name);
      setEditDesc(response.data.description || "");
      setEditSlug(response.data.slug);
    } catch (err) {
      console.error("Error fetching collection:", err);
      toast.error("Failed to load collection details");
      router.push("/collections");
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    if (id) {
      fetchCollection();
    }
  }, [id, fetchCollection]);

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

      const response = await axios.patch(`/api/collections/${id}`, formData);
      setCollection(response.data);
      toast.success("Collection updated successfully");
      setIsEditDialogOpen(false);
    } catch (err) {
      console.error(err);
      toast.error("Failed to update collection");
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleDeleteCollection = async () => {
    try {
      await axios.delete(`/api/collections/${id}`);
      toast.success("Collection deleted");
      router.push("/collections");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete collection");
    }
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
      formData.append("status", newArtStatus);
      formData.append("collectionId", id as string);

      if (newArtDate) formData.append("publishedAt", newArtDate);
      if (newArtCover) formData.append("coverImgUrl", newArtCover);

      // Send minimal content
      formData.append("content", "");

      await axios.post("/api/add-blog", formData);
      toast.success("Shell article added to series");
      setAddSuccess(true);
      fetchCollection(); // Refresh list
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
    setNewArtStatus("unpublished");
    setAddSuccess(false);
    setBackendError(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!collection) return null;

  return (
    <div className="p-6 space-y-8 max-w-5xl mx-auto pb-20">
      <Link
        href="/collections"
        className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Collections</span>
      </Link>

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
              <Dialog
                open={isEditDialogOpen}
                onOpenChange={setIsEditDialogOpen}
              >
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
                    <AlertDialogTitle>
                      Are you absolutely sure?
                    </AlertDialogTitle>
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

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-3 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold text-white flex items-center gap-2">
              <CheckCircle2 className="w-6 h-6 text-blue-500" />
              Article Roadmap
            </h2>
            <div className="flex gap-2">
              <Dialog
                open={isQuickAddOpen}
                onOpenChange={(open) => {
                  setIsQuickAddOpen(open);
                  if (!open) resetQuickAdd();
                }}
              >
                <DialogTrigger asChild>
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Quick Add Shell
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-slate-900 border-slate-800 text-white sm:max-w-[500px] max-h-[90vh] overflow-y-auto dark">
                  <DialogHeader>
                    <DialogTitle>Quick Add Metadata</DialogTitle>
                    <DialogDescription className="text-slate-400">
                      Capture basic article info now, write content later.
                    </DialogDescription>
                  </DialogHeader>

                  {addSuccess ? (
                    <div className="py-8 space-y-6 text-center overflow-x-hidden px-1">
                      <div className="flex flex-col items-center gap-4">
                        <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center">
                          <CheckCircle2 className="w-10 h-10 text-green-500" />
                        </div>
                        <h3 className="text-xl font-bold">Article Added!</h3>
                        <p className="text-slate-400 text-sm max-w-[300px]">
                          The shell article &quot;{newArtTitle}&quot; has been
                          added to your roadmap.
                        </p>
                      </div>

                      <Card className="bg-blue-950/20 border-blue-900 text-left overflow-hidden mx-auto w-full max-w-sm">
                        {newArtCoverPreview && (
                          <div className="h-32 w-full relative">
                            <Image
                              src={newArtCoverPreview}
                              alt="Preview"
                              fill
                              className="object-cover"
                            />
                          </div>
                        )}
                        <CardContent className="p-4">
                          <h4 className="text-white font-medium truncate">
                            {newArtTitle}
                          </h4>
                          <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                            {newArtDesc || "No description provided"}
                          </p>
                        </CardContent>
                      </Card>

                      <div className="flex gap-3">
                        <Button
                          variant="outline"
                          onClick={() => setIsQuickAddOpen(false)}
                          className="flex-1 border-slate-700"
                        >
                          Close
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
                          className="flex-1 bg-blue-600 hover:bg-blue-700"
                        >
                          Go to Editor
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <form
                      onSubmit={handleQuickAddArticle}
                      className="space-y-4 py-4"
                    >
                      {backendError && (
                        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm">
                          {backendError}
                        </div>
                      )}
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-end">
                          <Label htmlFor="artTitle">Article Title</Label>
                          <span
                            className={`text-[10px] font-mono ${
                              newArtTitle.length < 50 || newArtTitle.length > 60
                                ? "text-red-400"
                                : "text-green-400"
                            }`}
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

                      <div className="grid grid-cols-1 gap-4">
                        <div className="space-y-1.5">
                          <Label htmlFor="artDate">Planned/Publish Date</Label>
                          <Input
                            id="artDate"
                            type="date"
                            value={newArtDate}
                            onChange={(e) => setNewArtDate(e.target.value)}
                            className="bg-blue-950/50 border-blue-900 focus:ring-blue-500 text-white [color-scheme:dark]"
                          />
                        </div>
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
              <Link href="/add-article">
                <Button
                  variant="outline"
                  className="border-blue-900 text-blue-400 hover:bg-blue-950"
                >
                  Full Editor
                </Button>
              </Link>
            </div>
          </div>

          <div className="space-y-3">
            {collection.articles && collection.articles.length > 0 ? (
              collection.articles.map((article) => (
                <Card
                  key={article.id}
                  className="bg-blue-950/20 border-blue-900/50 hover:border-blue-700 transition-all duration-300 overflow-hidden relative"
                >
                  <CardContent className="p-4 flex items-center gap-4">
                    <div
                      className={`w-1 h-12 absolute left-0 ${article.status === "published" ? "bg-green-500" : "bg-slate-600"}`}
                    />
                    <div className="flex-shrink-0 ml-2">
                      {article.status === "published" ? (
                        <CheckCircle2 className="w-6 h-6 text-green-500" />
                      ) : (
                        <Circle className="w-6 h-6 text-slate-600" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-white font-medium truncate">
                          {article.title}
                        </h3>
                        <Badge
                          className={`text-[10px] py-0 h-4 ${
                            article.status === "published"
                              ? "bg-green-600/20 text-green-400 border-green-900"
                              : "bg-slate-600/20 text-slate-400 border-slate-900"
                          }`}
                        >
                          {article.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 mt-1.5">
                        <span className="text-xs text-slate-500 bg-slate-900/50 px-2 py-0.5 rounded border border-slate-800">
                          {article.slug}
                        </span>
                        <div className="flex items-center gap-1 text-[10px] text-slate-500">
                          <Clock className="w-3 h-3" />
                          {article.publishedAt
                            ? new Date(article.publishedAt).toLocaleDateString()
                            : `Plan: ${new Date(article.createdAt).toLocaleDateString()}`}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link href={`/article/${article.slug}`}>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-slate-500 hover:text-white hover:bg-blue-900/50"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      </Link>
                      <Button
                        onClick={() =>
                          router.push(`/article/${article.slug}/edit`)
                        }
                        className="bg-blue-600/10 text-blue-400 border border-blue-900 hover:bg-blue-600 hover:text-white"
                      >
                        Finish Content
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center p-12 bg-blue-950/10 rounded-2xl border border-dashed border-blue-900/50">
                <ImageIcon className="w-12 h-12 text-blue-900/50 mx-auto mb-4" />
                <p className="text-slate-500 font-medium">
                  No articles planned yet.
                </p>
                <p className="text-slate-600 text-sm mt-1">
                  Start by adding metadata for your first article shell.
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <Card className="bg-slate-900 border-slate-800">
            <CardContent className="p-4 space-y-4">
              <h3 className="text-white font-semibold">Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500">Progress</span>
                  <span className="text-blue-400 font-mono">
                    {Math.round(
                      ((collection.articles?.filter(
                        (a) => a.status === "published"
                      ).length || 0) /
                        (collection.articles?.length || 1)) *
                        100
                    )}
                    %
                  </span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-1.5">
                  <div
                    className="bg-blue-600 h-1.5 rounded-full transition-all duration-500"
                    style={{
                      width: `${((collection.articles?.filter((a) => a.status === "published").length || 0) / (collection.articles?.length || 1)) * 100}%`,
                    }}
                  />
                </div>
                <div className="flex justify-between text-xs pt-1">
                  <span className="text-green-500">
                    {collection.articles?.filter(
                      (a) => a.status === "published"
                    ).length || 0}{" "}
                    Ready
                  </span>
                  <span className="text-slate-400">
                    {collection.articles?.filter(
                      (a) => a.status === "unpublished"
                    ).length || 0}{" "}
                    To Do
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
