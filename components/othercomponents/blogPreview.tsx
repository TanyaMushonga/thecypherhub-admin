import React from "react";

interface BlogPreviewProps {
  content: string;
}

function BlogPreview({ content }: BlogPreviewProps) {
  return (
    <div
      className="prose prose-invert max-h-[100vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent text-white"
      dangerouslySetInnerHTML={{
        __html: content,
      }}
    />
  );
}

export default BlogPreview;