"use client";
import React from "react";
import BlogEditor from "../../../components/othercomponents/BlogEditor";
import { ScrollArea } from "../../../components/ui/scroll-area";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

function AddArticlePage() {
  const router = useRouter();

  const handleSubmit = async (data: ArticleFormData, coverImage?: File) => {
    const formData = new FormData();
    formData.append("title", data.title);
    formData.append("description", data.description);
    formData.append("category", data.category);
    formData.append("content", data.content);
    formData.append("keywords", JSON.stringify(data.keywords));
    formData.append("slug", data.slug);
    
    if (coverImage) {
      formData.append("coverImgUrl", coverImage);
    }

    const response = await fetch("/api/add-blog", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error(await response.text());
    }

     toast.success("Blog created successfully");
     router.push("/articles");
  };

  return (
    <ScrollArea className="bg-primary pt-4 h-full">
      <BlogEditor onSubmit={handleSubmit} />
    </ScrollArea>
  );
}

export default AddArticlePage;
