import React from "react";
import { getCollections } from "../actions/Collections";
import { CollectionCard } from "@/components/collections/CollectionCard";
import { NewCollectionDialog } from "@/components/collections/NewCollectionDialog";

export default async function CollectionsPage() {
  const collections = await getCollections();

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Collections</h1>
          <p className="text-slate-400">
            Group your articles into series and tracks
          </p>
        </div>
        <NewCollectionDialog />
      </div>

      {collections.length === 0 ? (
        <div className="text-center p-12 bg-blue-950/30 rounded-lg border border-dashed border-blue-900">
          <p className="text-slate-400">
            No collections found. Create one to get started!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {collections.map((collection) => (
            <CollectionCard key={collection.id} collection={collection} />
          ))}
        </div>
      )}
    </div>
  );
}
