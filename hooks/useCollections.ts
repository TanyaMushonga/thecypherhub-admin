import axios from "axios";
import { useEffect, useState, useCallback } from "react";

export const useCollections = () => {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCollections = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/collections");
      setCollections(response.data);
      setError(null);
    } catch (err) {
      console.error("Error fetching collections:", err);
      setError("Failed to load collections");
    } finally {
      setLoading(false);
    }
  }, []);

  const createCollection = async (data: FormData) => {
    try {
      setLoading(true);
      const response = await axios.post("/api/collections", data, {
        headers: { "Content-Type": "multipart-form-data" },
      });
      setCollections((prev) => [response.data, ...prev]);
      return response.data;
    } catch (err) {
      console.error("Error creating collection:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateCollection = async (id: string, data: FormData) => {
    try {
      setLoading(true);
      const response = await axios.patch(`/api/collections/${id}`, data, {
        headers: { "Content-Type": "multipart-form-data" },
      });
      setCollections((prev) =>
        prev.map((c) => (c.id === id ? response.data : c))
      );
      return response.data;
    } catch (err) {
      console.error("Error updating collection:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCollections();
  }, [fetchCollections]);

  return {
    collections,
    loading,
    error,
    refetch: fetchCollections,
    createCollection,
    updateCollection,
  };
};
