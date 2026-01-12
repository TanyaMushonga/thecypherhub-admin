import React from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { getCollectionById } from "../../actions/Collections";
import { CollectionHeader } from "@/components/collections/CollectionHeader";
import { QuickAddArticleDialog } from "@/components/collections/QuickAddArticleDialog";
import { ArticleRoadmap } from "@/components/collections/ArticleRoadmap";
import { CollectionStats } from "@/components/collections/CollectionStats";

interface PageProps {
  params: {
    id: string;
  };
}

export default async function CollectionDetailPage({ params }: PageProps) {
  const collection = await getCollectionById(params.id);

  if (!collection) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <h2 className="text-2xl font-bold text-white">Collection not found</h2>
        <Link
          href="/collections"
          className="text-blue-500 hover:underline flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Collections
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8 max-w-5xl mx-auto pb-20">
      <Link
        href="/collections"
        className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Collections</span>
      </Link>

      <CollectionHeader collection={collection} />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-3 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold text-white flex items-center gap-2">
              <CheckCircle2 className="w-6 h-6 text-blue-500" />
              Article Roadmap
            </h2>
            <QuickAddArticleDialog
              collectionId={collection.id}
              collectionCategory={collection.category}
            />
          </div>
          <ArticleRoadmap articles={collection.articles} />
        </div>

        <div className="space-y-6">
          <CollectionStats articles={collection.articles} />
        </div>
      </div>
    </div>
  );
}
