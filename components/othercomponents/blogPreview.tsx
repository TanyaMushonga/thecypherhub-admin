import React from "react";

interface BlogPreviewProps {
  content: string;
}

function BlogPreview({ content }: BlogPreviewProps) {
  return (
    <div
      className="prose prose-blue dark:prose-invert max-w-none text-white"
      dangerouslySetInnerHTML={{
        __html: content,
      }}
    />
  );
}

export default BlogPreview;
