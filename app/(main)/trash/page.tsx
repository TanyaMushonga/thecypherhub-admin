"use client";

import React, { useState, useEffect } from "react";
import { Trash2, RotateCcw, Box, BookOpen, Search } from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatDate } from "@/lib/utils";

interface TrashItem {
  id: string;
  title?: string;
  name?: string;
  updatedAt: string;
  type: "article" | "collection";
}

export default function TrashPage() {
  const [items, setItems] = useState<TrashItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchTrash = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/trash");
      const articles = res.data.articles as Article[];
      const collections = res.data.collections as Collection[];

      const combinedItems: TrashItem[] = [
        ...articles.map((a) => ({ ...a, type: "article" as const })),
        ...collections.map((c) => ({ ...c, type: "collection" as const })),
      ].sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );

      setItems(combinedItems);
    } catch (error) {
      console.error("Fetch trash error:", error);
      toast.error("Failed to fetch trash items");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrash();
  }, []);

  const handleRestore = async (id: string, type: "article" | "collection") => {
    try {
      await axios.post("/api/trash/restore", { id, type });
      setItems((prev) => prev.filter((item) => item.id !== id));
      toast.success("Item restored successfully");
    } catch (error) {
      console.error("Restore error:", error);
      toast.error("Failed to restore item");
    }
  };

  const filteredItems = items.filter((item) => {
    const searchString = (item.title || item.name || "").toLowerCase();
    return searchString.includes(searchTerm.toLowerCase());
  });

  return (
    <main className="p-5 md:p-10 h-screen w-full bg-primary flex flex-col overflow-hidden">
      <div className="w-full flex-shrink-0 mb-6 flex justify-between items-center">
        <h1 className="text-white font-semibold text-2xl">Trash</h1>
        <div className="relative w-full md:w-1/3">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search trash..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8 bg-blue-950 border-blue-900 text-white placeholder:text-slate-500 focus-visible:ring-blue-500"
          />
        </div>
      </div>

      <div className="flex-1 min-h-0 w-full md:max-w-4xl">
        <ScrollArea className="h-full w-full pr-4">
          {loading ? (
            <div className="flex justify-center p-10">
              <span className="animate-pulse text-slate-500">
                Loading trash...
              </span>
            </div>
          ) : filteredItems.length > 0 ? (
            <div className="space-y-4">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  className="group flex flex-col md:flex-row md:items-center p-4 bg-blue-950 rounded-lg border border-blue-900 hover:bg-blue-900 transition-all duration-200"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="h-10 w-10 flex items-center justify-center rounded-md bg-blue-900 text-blue-300">
                      {item.type === "article" ? (
                        <Box size={20} />
                      ) : (
                        <BookOpen size={20} />
                      )}
                    </div>
                    <div className="flex flex-col">
                      <p className="text-white font-medium">
                        {item.title || item.name}
                      </p>
                      <p className="text-xs text-slate-400">
                        {item.type.charAt(0).toUpperCase() + item.type.slice(1)}{" "}
                        • Deleted on {formatDate(new Date(item.updatedAt))}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 md:mt-0 flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRestore(item.id, item.type)}
                      className="text-blue-400 hover:text-white hover:bg-blue-800"
                    >
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Restore
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center border border-dashed border-blue-900 rounded-lg">
              <Trash2 className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400">Trash is empty</p>
            </div>
          )}
        </ScrollArea>
      </div>
    </main>
  );
}
