import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getEffectiveDate = (article: {
  publishedAt?: Date | string | null;
  updatedAt?: Date | string | null;
  createdAt: Date | string;
}) => {
  return article.publishedAt || article.updatedAt || article.createdAt;
};

export const formatDate = (date: Date | string) => {
  const currentDate = new Date();
  const targetDate = new Date(date);

  const timeDifferenceInSeconds = Math.floor(
    (currentDate.getTime() - targetDate.getTime()) / 1000,
  );
  const timeDifferenceInMinutes = Math.floor(timeDifferenceInSeconds / 60);
  const timeDifferenceInHours = Math.floor(timeDifferenceInMinutes / 60);
  const timeDifferenceInDays = Math.floor(timeDifferenceInHours / 24);

  if (timeDifferenceInDays > 1) {
    return targetDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  } else if (timeDifferenceInDays === 1) {
    return "1d ago";
  } else if (timeDifferenceInHours >= 1) {
    return `${timeDifferenceInHours}hrs ago`;
  } else if (timeDifferenceInMinutes >= 1) {
    return `${timeDifferenceInMinutes}min ago`;
  } else {
    return "Just now";
  }
};

export function calculateReadTime(content: string): string {
  const wordsPerMinute = 200; // Average reading speed
  // Strip HTML tags to get plain text for word counting
  const plainText = content.replace(/<[^>]*>/g, " ");
  const words = plainText.trim().split(/\s+/).length;
  const readTime = Math.ceil(words / wordsPerMinute);
  return `${readTime} min read`;
}

export function extractNameFromEmail(email: string): string {
  if (!email) return "Subscriber"; // Default fallback if email is empty

  // Extract the part before the '@'
  const namePart = email.split("@")[0];

  // Replace dots, underscores, or dashes with spaces and capitalize each word
  const formattedName = namePart
    .replace(/[\._-]/g, " ") // Replace dots, underscores, or dashes with spaces
    .split(" ") // Split into words
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1)) // Capitalize each word
    .join(" "); // Join the words back together

  return formattedName;
}
