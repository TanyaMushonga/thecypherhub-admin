import ArticleList from "../../../components/othercomponents/articleList";
import React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";

export default async function Page() {

  return (
    <main className="p-5 md:p-10 h-screen w-full bg-primary flex flex-col overflow-hidden">
      <div className="w-full flex-shrink-0 mb-6">
        <h1 className="text-white font-semibold text-2xl">
          Published Articles
        </h1>
      </div>
      
      <div className="flex-1 min-h-0 w-full md:max-w-4xl">
        <ScrollArea className="h-full w-full pr-4">
           <ArticleList />
        </ScrollArea>
      </div>
    </main>
  );
}
