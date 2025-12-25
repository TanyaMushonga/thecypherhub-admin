declare interface Article {
  id: string;
  coverImgUrl: string;
  title: string;
  description: string;
  category: string;
  content: string;
  readTime: string;
  keywords: string[];
  slug: string;
  authorId: string;
  createdAt: string;
  updateAt: string;
  comments: Comment[];
}

declare interface Comment {
  id: string;
  articleId: string;
  comment: string;
  createdAt: string;
}

declare interface Subscribers {
  id: string;
  email: string;
  status: 1 | 0;
  createdAt: string;
}

declare interface ArticleStore {
  blog: Article[];
  setBlog: (blog: Article[]) => void;
}

declare interface ArticleFormData {
  title: string;
  slug: string;
  description: string;
  category: string;
  content: string;
  keywords: string[];
  coverImgUrl?: string; // Optional for form data as it might be a File or url string handled separately
}
