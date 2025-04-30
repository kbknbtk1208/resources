import { Post } from "@/models/post";
import Link from "next/link";
import Image from "next/image"; // Assuming Image component is needed for the placeholder image

interface SearchResultItemProps {
  post: Post;
}

export default function SearchResultItem({ post }: SearchResultItemProps) {
  return (
    <div className="border border-gray-200 p-4 mb-4 rounded-md shadow-sm bg-white">
      <Link href={`/posts/${post.id}`} passHref>
        <div className="flex items-center cursor-pointer">
          {/* Placeholder image based on Figma */}
          <div className="flex-shrink-0 mr-4">
            <Image
              src={post.image} // Using a generic placeholder image from public
              alt="Article thumbnail"
              width={100} // Adjust size based on Figma if needed, using a placeholder size for now
              height={60} // Adjust size based on Figma if needed, using a placeholder size for now
              className="rounded-md"
            />
          </div>
          <div>
            {/* Tags based on Figma */}
            <div className="flex space-x-2 mb-1">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="bg-pink-100 text-pink-800 text-xs font-medium px-2.5 py-0.5 rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
            <h3 className="text-xl font-semibold text-gray-900 hover:underline">
              {post.title}
            </h3>
            <p className="text-gray-700 mt-2">
              {post.content.substring(0, 150)}...
            </p>{" "}
            {/* Display a snippet */}
            <div className="flex items-center text-sm text-gray-500 mt-2">
              {/* Author image placeholder based on Figma */}
              <Image
                src={post.author.avatar} // Using a generic user placeholder image from public
                alt="Author avatar"
                width={20} // Adjust size based on Figma if needed
                height={20} // Adjust size based on Figma if needed
                className="rounded-full mr-2"
              />
              <span>{post.author.name}</span>
              <span className="mx-1">•</span>
              <span>{new Date(post.date).toLocaleDateString()}</span>
              <span className="mx-1">•</span>
              {/* Reading time placeholder - not in Figma node but common */}
              <span>5 min read</span> {/* Placeholder value */}
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}
