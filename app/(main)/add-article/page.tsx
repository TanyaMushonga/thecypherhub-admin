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
      let errorMessage = "Failed to create article";
      try {
        const errorData = await response.json();
        if (
          errorData.error &&
          errorData.error.code === "P2002" &&
          errorData.error.meta?.target?.includes("slug")
        ) {
          errorMessage = "An article with this slug already exists. Please choose a different slug.";
        } else if (errorData.message) {
            errorMessage = errorData.message;
        } else if (typeof errorData.error === 'string') {
             errorMessage = errorData.error;
        }
      } catch (e) {
         const textError = await response.text();
         if (textError) errorMessage = textError;
      }
      throw new Error(errorMessage);
    }
    
    // Success: Ask to send notifications
    toast.success("Blog created successfully!");
    
    if (window.confirm("Do you want to send an email notification to all subscribers?")) {
        try {
            toast.loading("Fetching subscribers...", { id: "sending" });
            const subResponse = await fetch("/api/subscribers");
            const subData = await subResponse.json();
            
            if (!subResponse.ok) throw new Error(subData.error || "Failed to fetch subscribers");
            
            const subscribersList = Array.isArray(subData) ? subData : [];
            const subscribers: string[] = subscribersList
                .filter((sub: any) => sub.status === 1)
                .map((sub: any) => sub.email);
            
            if (subscribers.length === 0) {
                 toast.error("No active subscribers found", { id: "sending" });
            } else {
                const total = subscribers.length;
                const batchSize = 5;
                let sentCount = 0;
                
                // Truncate content: Strip HTML tags and take 1/3
                // Simple regex to strip tags (for preview purposes)
                const strippedContent = data.content.replace(/<[^>]*>?/gm, '');
                const previewLength = Math.ceil(strippedContent.length / 3);
                const previewContent = strippedContent.substring(0, previewLength) + "...";

                const articleDetails = {
                    title: data.title,
                    description: previewContent, // Using truncated content as the main description in email
                    slug: data.slug,
                };

                for (let i = 0; i < total; i += batchSize) {
                    const batch = subscribers.slice(i, i + batchSize);
                    
                    toast.loading(`Sending batch ${Math.ceil((i + 1) / batchSize)} of ${Math.ceil(total / batchSize)}... (${sentCount}/${total})`, { id: "sending" });
                    
                    // Call send-batch with article details
                     await fetch("/api/send-batch", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            recipients: batch,
                            type: "article",
                            article: articleDetails
                        }),
                    });

                    sentCount += batch.length;
                }
                toast.success(`Notifications sent to ${total} subscribers!`, { id: "sending" });
            }
        } catch (emailError: any) {
            console.error(emailError);
            toast.error("Failed to send notifications: " + emailError.message, { id: "sending" });
        }
    }

     router.push("/articles");
  };

  return (
    <ScrollArea className="bg-primary pt-4 h-full">
      <BlogEditor onSubmit={handleSubmit} />
    </ScrollArea>
  );
}

export default AddArticlePage;
