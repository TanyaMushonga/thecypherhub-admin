"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetDescription,
} from "@/components/ui/sheet";
import { MessageSquare } from "lucide-react";

import { useFetchArticles } from "../../hooks/useFetchArticles";
import Image from "next/image";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { Trash2, FilePenLine, Search } from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";
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
} from "../ui/alert-dialog";
import { formatDate } from "../../lib/utils";
import axios from "axios";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";

function ArticleList() {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const observerTarget = useRef(null);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const { loading, articles, setArticles, setPage, totalCount, hasMore } = useFetchArticles("all", debouncedSearch);

  const handleDelete = async (slug: string) => {
    try {
      await axios.delete(`/api/blog/${slug}`);
      setArticles((prev) => prev.filter((article) => article.slug !== slug));
      toast.success("Article deleted successfully");
    } catch (error) {
      console.log("error deleting article", error);
      toast.error("Failed to delete article");
    }
  };

  // Infinite Scroll Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          setPage((prev) => prev + 1);
        }
      },
      { threshold: 1.0 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => {
      if (observerTarget.current) {
        observer.unobserve(observerTarget.current);
      }
    };
  }, [hasMore, loading, setPage]);


  return (
    <div className="space-y-6 w-full max-w-4xl">
      {/* Stats and Search Header */}
      <div className="flex flex-col md:flex-row gap-4 justify-between md:items-center bg-blue-950 p-4 rounded-lg border border-blue-900">
        <div>
           <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-white">{totalCount}</span>
              <span className="text-sm text-slate-400">Total Articles</span>
           </div>
        </div>
        <div className="relative w-full md:w-1/3">
           <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-400" />
           {loading && <div className="absolute right-2 top-2.5 h-4 w-4 rounded-full border-2 border-slate-400 border-t-transparent animate-spin"></div>}
           <Input 
             placeholder="Search articles..." 
             value={searchTerm}
             onChange={(e) => setSearchTerm(e.target.value)}
             className="pl-8 bg-primary border-blue-900 text-white placeholder:text-slate-500 focus-visible:ring-blue-500"
           />
        </div>
      </div>

      <div className="space-y-4">
      {articles?.length > 0 ? (
        articles.map((article) => (
          <div
            key={article.slug}
            className="group flex flex-col md:flex-row md:items-start p-4 bg-blue-950 rounded-lg border border-blue-900 hover:bg-blue-900 transition-all duration-200"
          >
            <Link
              href={`/article/${article.slug}`}
              className="flex items-start gap-4 flex-1 overflow-hidden"
            >
              <div className="relative h-16 w-16 md:h-24 md:w-24 flex-shrink-0 overflow-hidden rounded-md border border-blue-900 mt-1">
                <Image
                  src={article?.coverImgUrl}
                  alt={article.title}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex flex-col gap-1 min-w-0 pr-4">
                <p className="text-white font-semibold text-lg line-clamp-2 perform-layout-shift group-hover:text-blue-300 transition-colors">
                  {article.title}
                </p>
                <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
                  <span>{formatDate(new Date(article?.createdAt))}</span>
                  <span>•</span>
                  <span>{article.category}</span>
                </div>
                <p className="text-slate-400 text-sm line-clamp-2">
                  {article.description}
                </p>
              </div>
            </Link>

            <div className="flex items-center justify-between mt-4 md:mt-0 md:gap-4 md:flex-col md:items-end border-t md:border-t-0 border-blue-900 pt-3 md:pt-0 pl-0 md:pl-4">
              
              <div className="flex items-center gap-1">
                 <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 gap-2 text-slate-400 hover:text-white hover:bg-blue-800">
                      <MessageSquare className="w-4 h-4" />
                      <span className="text-xs">{article.comments?.length || 0}</span>
                    </Button>
                  </SheetTrigger>
                  <SheetContent className="bg-blue-950 border-l border-blue-900 text-white sm:max-w-md w-full">
                    <SheetHeader className="mb-6">
                      <SheetTitle className="text-white">Comments ({article.comments?.length || 0})</SheetTitle>
                      <SheetDescription className="text-slate-400">
                        Comments for "{article.title}"
                      </SheetDescription>
                    </SheetHeader>
                    <div className="space-y-4 max-h-[80vh] overflow-y-auto pr-2 custom-scrollbar">
                      {article.comments?.length > 0 ? (
                        article.comments.map((comment) => (
                          <div key={comment.id} className="p-3 bg-blue-900/30 rounded border border-blue-900/50">
                            <p className="text-sm text-slate-200">{comment.comment}</p>
                            <p className="text-xs text-slate-500 mt-2 text-right">{formatDate(new Date(comment.createdAt))}</p>
                          </div>
                        ))
                      ) : (
                        <p className="text-slate-500 text-sm text-center italic">No comments yet.</p>
                      )}
                    </div>
                  </SheetContent>
                </Sheet>

                 <Link href="/article/[slug]" as={`/article/${article.slug}`}>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-white hover:bg-blue-800">
                      <FilePenLine className="w-4 h-4" />
                    </Button>
                  </Link>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-red-400 hover:bg-red-500/10">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="bg-blue-950 border-blue-800 text-white">
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Article?</AlertDialogTitle>
                        <AlertDialogDescription className="text-slate-400">
                           This action cannot be undone. This will permanently delete "{article.title}".
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="bg-transparent border-slate-700 hover:bg-slate-800 text-white">Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          className="bg-red-600 hover:bg-red-700 text-white border-none"
                          onClick={() => handleDelete(article.slug)}
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
              </div>
            </div>
          </div>
        ))
      ) : (
         <div className="p-12 text-center border border-dashed border-blue-900 rounded-lg">
           <p className="text-slate-400">No articles found matching your search.</p>
         </div>
      )}
      
      {/* Infinite Scroll Target */}
      <div ref={observerTarget} className="h-4 w-full flex justify-center p-4">
         {loading && hasMore && <span className="animate-pulse text-slate-500 text-xs">Loading more...</span>}
      </div>
      </div>
    </div>
  );
}

export default ArticleList;
