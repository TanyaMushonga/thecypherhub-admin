"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";

interface CollectionStatsProps {
  articles: Article[];
}

export function CollectionStats({ articles }: CollectionStatsProps) {
  const publishedCount = articles.filter(
    (a) => a.status === "published"
  ).length;
  const totalCount = articles.length || 1;
  const progress = Math.round((publishedCount / totalCount) * 100);

  return (
    <Card className="bg-slate-900 border-slate-800">
      <CardContent className="p-4 space-y-4">
        <h3 className="text-white font-semibold">Stats</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-500">Progress</span>
            <span className="text-blue-400 font-mono">{progress}%</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-1.5">
            <div
              className="bg-blue-600 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between text-xs pt-1">
            <span className="text-green-500">{publishedCount} Ready</span>
            <span className="text-slate-400">
              {articles.length - publishedCount} To Do
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
