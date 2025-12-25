import axios from "axios";
import { useEffect, useState, useCallback } from "react";
import { useArticle } from "../store";

const articleCache: { [key: string]: Article[] } = {};

export const useFetchArticles = (value: string, search: string = "") => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [totalCount, setTotalCount] = useState(0);

  const setBlogs = useArticle((state) => state.setBlog);

  const fetchArticles = useCallback(async () => {
    const cacheKey = `${page}-${pageSize}-${value}-${search}`;
    // Skip cache for search to ensure fresh results or handle cache invalidation better
    if (!search && articleCache[cacheKey]) {
        if (page === 1) {
            setArticles(articleCache[cacheKey]);
        } else {
             setArticles(prev => [...prev, ...articleCache[cacheKey]]);
        }
      setBlogs(articleCache[cacheKey]);
      return;
    }

    try {
      setLoading(true);
      const response = await axios.get(
        `/api/blog?page=${page}&page_size=${pageSize}&search=${search}`,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = response.data.blogs.filter((article: Article) => {
        if (value === "all") {
          return article;
        }
        return article.category === value;
      });
      
      setTotalCount(response.data.pagination.totalCount);
      
      if (page === 1) {
          setArticles(data);
      } else {
          setArticles((prev) => {
              // Avoid duplicates
              const newArticles = data.filter((newArt: Article) => !prev.some((prevArt) => prevArt.id === newArt.id));
              return [...prev, ...newArticles];
          });
      }
      
      setBlogs(data);
      if (!search) {
          articleCache[cacheKey] = data;
      }
      setLoading(false);
    } catch (error) {
      console.log(error);
      setLoading(false);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, setBlogs, value, search]);

  useEffect(() => {
    // Reset page and articles when filters change
    setPage(1);
    setArticles([]); 
  }, [value, search]);

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  return {
    articles,
    loading,
    refetch: fetchArticles,
    setArticles,
    setPage,
    setPageSize,
    totalCount,
    hasMore: articles.length < totalCount
  };
};