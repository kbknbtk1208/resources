"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Post } from "@/models/post";
import { apiClient, isSuccess, isFail } from "@/clientUtils/apiClient"; // Import isSuccess and isFail
import SearchResultItem from "@/components/blog/search-result-item/SearchResultItem";

// Placeholder for Pagination Component (別タスクで実装)
function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  // Basic pagination UI placeholder
  return (
    <div className="flex justify-center mt-4">
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
        <button
          key={page}
          className={`mx-1 px-3 py-1 border ${
            currentPage === page
              ? "bg-blue-500 text-white"
              : "bg-white text-blue-500"
          }`}
          onClick={() => onPageChange(page)}
          disabled={currentPage === page}
        >
          {page}
        </button>
      ))}
    </div>
  );
}

// Define the expected structure of the API response data
interface SearchApiResponse {
  results: Post[];
  total: number;
  totalPages: number;
  currentPage: number;
}

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";

  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalResults, setTotalResults] = useState(0);

  useEffect(() => {
    if (!query) {
      setPosts([]);
      setIsLoading(false);
      setTotalResults(0);
      setTotalPages(0);
      return;
    }

    const fetchPosts = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const apiUrl = `/api/search?q=${encodeURIComponent(
          query
        )}&page=${currentPage}`;
        // Use apiClient and handle the ApiResult
        const result = await apiClient<SearchApiResponse>(apiUrl);

        if (isSuccess(result)) {
          setPosts(result.response.results);
          setTotalResults(result.response.total);
          setTotalPages(result.response.totalPages);
        } else {
          // Handle API failure
          setError(result.error.message);
          setPosts([]);
          setTotalResults(0);
          setTotalPages(0);
        }
      } catch (err: any) {
        // Handle unexpected errors during the fetch process
        setError(err.message);
        setPosts([]);
        setTotalResults(0);
        setTotalPages(0);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPosts();
  }, [query, currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Search Results</h1>
      {query && (
        <p className="mb-4">
          Found {totalResults} results for "{query}"
        </p>
      )}

      {isLoading && (
        // Skeleton UI Placeholder (別タスクで実装)
        <div>Loading...</div>
      )}

      {error && <div className="text-red-500">検索に失敗しました: {error}</div>}

      {!isLoading && !error && posts.length === 0 && query && (
        <div>該当する記事はありません</div>
      )}

      {!isLoading && !error && posts.length > 0 && (
        <>
          <div>
            {posts.map((post) => (
              <SearchResultItem key={post.id} post={post} />
            ))}
          </div>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </>
      )}
    </div>
  );
}
