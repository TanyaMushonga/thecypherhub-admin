"use client";
import Image from "next/image";
import React from "react";
import { Trash2, FilePenLine } from "lucide-react";
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
import toast from "react-hot-toast";
import { useFetchArticles } from "../../hooks/useFetchArticles";
import { formatDate } from "../../lib/utils"; 
import axios from "axios";

function NewArticles() {
  const { articles, loading, setArticles } = useFetchArticles("all");

  const handleDelete = async (slug: string) => {
    try {
      await axios.delete(`/api/blog/${slug}`);
      setArticles(articles?.filter((article) => article?.slug !== slug));
      toast.success("Article deleted successfully");
    } catch (error) {
      console.log("error deleting article", error);
    }
  };

  return (
    <>
    <>
      {loading ? (
        <p className="text-slate-400 text-sm mt-5 animate-pulse">Loading articles...</p>
      ) : articles?.length > 0 ? (
        <div className="space-y-4 mt-5">
          {articles.slice(0, 5).map((article: Article) => (
            <div
              key={article.slug}
              className="group flex items-center p-4 bg-blue-950/50 hover:bg-blue-900/50 rounded-lg border border-blue-900/30 transition-all duration-200"
            >
              <Link
                href={`/article/${article.slug}`}
                className="flex items-center gap-4 flex-1 overflow-hidden"
              >
                <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-md border border-blue-800">
                  <Image
                    src={article?.coverImgUrl}
                    alt={article.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex flex-col min-w-0">
                  <p className="text-white font-medium text-base truncate group-hover:text-blue-200 transition-colors">
                    {article.title}
                  </p>
                  <p className="text-slate-400 text-xs mt-0.5">
                    {formatDate(new Date(article?.createdAt))}
                  </p>
                </div>
              </Link>
              
              <div className="flex items-center gap-2 ml-4">
                 <Link href="/article/[slug]" as={`/article/${article.slug}`}>
                    <button className="p-2 text-slate-400 hover:text-white hover:bg-blue-800/50 rounded-full transition-colors">
                      <FilePenLine className="w-4 h-4" />
                    </button>
                  </Link>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <button className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-full transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
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
          ))}
        </div>
      ) : (
        <div className="mt-5 p-8 text-center bg-blue-950/30 rounded-lg border border-dashed border-blue-900">
            <p className="text-slate-400 text-sm">No articles published yet</p>
        </div>
      )}
    </>
    </>
  );
}

export default NewArticles;
