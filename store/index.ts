import { create } from "zustand";

export const useArticle = create<ArticleStore>((set) => ({
  blog: [
    {
      id: "",
      coverImgUrl: "",
      title: "",
      description: "",
      category: "",
      content: "",
      readTime: "",
      keywords: [],
      slug: "",
      authorId: "",
      createdAt: "",
      updateAt: "",
      comments: [],
    },
  ],
  setBlog: (blog: Article[]) => set({ blog }),
}));
