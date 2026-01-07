"use client";

import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  CheckCircle2,
  Circle,
  Clock,
  ChevronRight,
  Loader2,
  Image as ImageIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { toggleArticlePublication } from "@/app/(main)/actions/Collections";
import toast from "react-hot-toast";

interface ArticleRoadmapProps {
  articles: Article[];
}

export function ArticleRoadmap({ articles }: ArticleRoadmapProps) {
  const router = useRouter();
  const [toggleLoading, setToggleLoading] = useState<string | null>(null);

  const handleToggle = async (slug: string, currentStatus: string) => {
    const newStatus =
      currentStatus === "published" ? "unpublished" : "published";
    setToggleLoading(slug);
    try {
      await toggleArticlePublication(
        slug,
        newStatus as "published" | "unpublished"
      );
      toast.success(`Article ${newStatus} successfully`);
      router.refresh();
    } catch (err) {
      console.error(err);
      toast.error("Failed to update status");
    } finally {
      setToggleLoading(null);
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

            <div className="flex items-center justify-between sm:justify-end gap-4 mt-2 sm:mt-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-blue-900/30">
              <div className="flex items-center gap-2">
                <Label
                  htmlFor={`pub-toggle-${article.id}`}
                  className="text-[10px] text-slate-500 uppercase tracking-wider"
                >
                  {article.status === "published" ? "Published" : "Draft"}
                </Label>
                {toggleLoading === article.slug ? (
                  <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                ) : (
                  <Switch
                    id={`pub-toggle-${article.id}`}
                    checked={article.status === "published"}
                    onCheckedChange={() =>
                      handleToggle(article.slug, article.status)
                    }
                    className="scale-75"
                  />
                )}
              </div>
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
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
