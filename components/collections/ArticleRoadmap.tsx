"use client";

import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  Circle,
  Clock,
  ChevronRight,
  Loader2,
  Image as ImageIcon,
  Trash2,
} from "lucide-react";
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
import { useRouter } from "next/navigation";
import axios from "axios";
import toast from "react-hot-toast";

interface ArticleRoadmapProps {
  articles: Article[];
}

export function ArticleRoadmap({ articles }: ArticleRoadmapProps) {
  const router = useRouter();
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);

  const handleDelete = async (slug: string) => {
    setDeleteLoading(slug);
    try {
      await axios.delete(`/api/blog/${slug}`);
      toast.success("Article deleted");
      router.refresh();
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete article");
    } finally {
      setDeleteLoading(null);
    }
  };

  if (!articles || articles.length === 0) {
    return (
      <div className="text-center p-12 bg-blue-950/10 rounded-2xl border border-dashed border-blue-900/50">
        <ImageIcon className="w-12 h-12 text-blue-900/50 mx-auto mb-4" />
        <p className="text-slate-500 font-medium">No articles planned yet.</p>
        <p className="text-slate-600 text-sm mt-1">
          Start by adding metadata for your first article shell.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {articles.map((article) => (
        <Card
          key={article.id}
          className="bg-blue-950/20 border-blue-900/50 hover:border-blue-700 transition-all duration-300 overflow-hidden relative"
        >
          <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center gap-4">
            <div
              className={`w-1 h-full sm:h-12 absolute left-0 ${article.status === "published" ? "bg-green-500" : "bg-slate-600"}`}
            />
            <div className="flex items-center gap-4 flex-1 min-w-0 ml-2">
              <div className="flex-shrink-0">
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
                    className={`text-[10px] py-0 h-4 ${article.status === "published" ? "bg-green-600/20 text-green-400 border-green-900" : "bg-slate-600/20 text-slate-400 border-slate-900"}`}
                  >
                    {article.status}
                  </Badge>
                </div>
                <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-500">
                  <span className="bg-slate-900/50 px-2 py-0.5 rounded border border-slate-800">
                    {article.slug}
                  </span>
                  <div className="flex items-center gap-1 text-[10px]">
                    <Clock className="w-3 h-3" />
                    {article.publishedAt
                      ? new Date(article.publishedAt).toLocaleDateString()
                      : `Plan: ${new Date(article.createdAt).toLocaleDateString()}`}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 mt-2 sm:mt-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-blue-900/30">
              <Button
                onClick={() => router.push(`/article/${article.slug}/edit`)}
                size="sm"
                className="bg-blue-600/10 text-blue-400 border border-blue-900 hover:bg-blue-600 hover:text-white h-8 px-3"
              >
                {article.status === "published"
                  ? "Update Content"
                  : "Finish Content"}
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    size="sm"
                    variant="ghost"
                    disabled={deleteLoading === article.slug}
                    className="h-8 px-3 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                  >
                    {deleteLoading === article.slug ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="bg-slate-900 border-slate-800 text-white">
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Article?</AlertDialogTitle>
                    <AlertDialogDescription className="text-slate-400">
                      This will permanently delete &quot;{article.title}&quot;.
                      This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="bg-slate-800 text-white border-slate-700 hover:bg-slate-700">
                      Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => handleDelete(article.slug)}
                      className="bg-red-600 hover:bg-red-700 text-white"
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
