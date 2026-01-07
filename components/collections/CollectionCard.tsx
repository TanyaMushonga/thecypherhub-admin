"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BookOpen, Clock, ImageIcon } from "lucide-react";

interface CollectionCardProps {
  collection: Collection;
}

export function CollectionCard({ collection }: CollectionCardProps) {
  return (
    <Link href={`/collections/${collection.id}`}>
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
              <span>{new Date(collection.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
