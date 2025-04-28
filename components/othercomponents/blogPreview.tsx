import React from "react";

interface BlogPreviewProps {
  content: string;
}

function BlogPreview({ content }: BlogPreviewProps) {
  return (
    <div
      className="prose max-h-[80vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent"
      dangerouslySetInnerHTML={{
        __html: content,
      }}
    />
  );
}

export default BlogPreview;