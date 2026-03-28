import { validateRequest } from "@/auth";
import prisma from "../../../../lib/prisma";
import { put, del } from "@vercel/blob";
import { revalidatePath } from "next/cache";
import { calculateReadTime } from "@/lib/utils";

export async function GET(req: Request) {
  try {
    const { user: loggedInUser } = await validateRequest();
    const url = new URL(req.url);
    const slug = url.pathname.split("/").pop();

    if (!slug) {
      return new Response(JSON.stringify({ message: "ID is required" }), {
        status: 400,
      });
    }

    const where: { slug: string; status?: string } = {
      slug: slug,
    };

    // If not logged in, only show published articles
    if (!loggedInUser) {
      where.status = "published";
    }

    const blog = await prisma.articles.findFirst({
      where,
      include: {
        comments: {
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    if (!blog) {
      return new Response(JSON.stringify({ message: "Blog not found" }), {
        status: 404,
      });
    }

    return new Response(JSON.stringify(blog), {
      status: 200,
    });
  } catch (error) {
    console.error("Error fetching blog:", error);
    return new Response(
      JSON.stringify({ message: "error", error: (error as Error).message }),
      {
        status: 500,
      }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const { user: loggedInUser } = await validateRequest();

    if (!loggedInUser) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
      });
    }

    const url = new URL(req.url);
    const slug = url.pathname.split("/").pop();

    if (!slug) {
      return new Response(JSON.stringify({ message: "ID is required" }), {
        status: 400,
      });
    }

    const blog = await prisma.articles.findUnique({
      where: { slug: slug, authorId: loggedInUser.id },
    });

    if (!blog) {
      return new Response(JSON.stringify({ message: "Blog not found" }), {
        status: 404,
      });
    }

    const formData = await req.formData();
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const collectionId = formData.get("collectionId") as string | null;
    const category =
      (formData.get("category") as string) ||
      (collectionId ? blog.category : "General");
    const content = formData.get("content") as string;
    const keywords = JSON.parse(formData.get("keywords") as string);
    const SLUG = formData.get("slug") as string;
    const status = formData.get("status") as string;
    const publishedAtStr = formData.get("publishedAt") as string | null;

    const readTime = calculateReadTime(content);

    if (!Array.isArray(keywords)) {
      return new Response(
        JSON.stringify({ error: "Keywords must be an array" }),
        {
          status: 400,
        }
      );
    }


    let publishedAt = blog.publishedAt;
    if (status === "published" && !blog.publishedAt) {
      publishedAt = publishedAtStr ? new Date(publishedAtStr) : new Date();
    } else if (publishedAtStr) {
      publishedAt = new Date(publishedAtStr);
    } else if (status === "unpublished" && !publishedAtStr) {
      // Keep existing publishedAt if it was previously published,
      // or keep it null if it's still unpublished.
    }

    const updatedBlog = await prisma.articles.update({
      where: { slug: slug, authorId: loggedInUser.id },
      data: {
        title,
        description,
        category: category as string | null,
        content,
        readTime,
        keywords,
        slug: SLUG,
        collection: collectionId
          ? { connect: { id: collectionId } }
          : { disconnect: true },
        status: status,
        publishedAt,
      },
      include: { collection: true },
    });

    let publicationMetadata = null;
    if (blog.status === "unpublished" && status === "published") {
      // Transitioned to published, fetch metadata for notifications
      const collection = updatedBlog.collection;

      const nextArticle = updatedBlog.collectionId
        ? await prisma.articles.findFirst({
            where: {
              collectionId: updatedBlog.collectionId,
              status: "unpublished",
              createdAt: { gt: blog.createdAt },
            },
            orderBy: { createdAt: "asc" },
          })
        : null;

      publicationMetadata = {
        collectionName: collection?.name,
        collectionDescription: collection?.description,
        nextArticleTitle: nextArticle?.title,
        nextArticleDate: nextArticle?.publishedAt || nextArticle?.createdAt, // Use planned date if available, otherwise creation date
      };
    }

    revalidatePath("/blog");
    revalidatePath(`/blog/${slug}`);
    revalidatePath(`/blog/${SLUG}`);
    if (updatedBlog.collection) {
      revalidatePath(`/series/${updatedBlog.collection.slug}`);
      revalidatePath(`/series/${updatedBlog.collection.slug}/${slug}`);
      revalidatePath(`/series/${updatedBlog.collection.slug}/${SLUG}`);
    }
    revalidatePath("/api/blogs");
    revalidatePath(`/api/blog/${slug}`);
    revalidatePath(`/api/blog/${SLUG}`);

    // Revalidate the public blog
    try {
      const pathsToRevalidate = ["/blog", `/blog/${slug}`, "/api/blogs", "/"];
      if (slug !== SLUG) {
        pathsToRevalidate.push(`/blog/${SLUG}`);
      }
      if (updatedBlog.collection?.slug) {
        pathsToRevalidate.push(`/series/${updatedBlog.collection.slug}`);
        pathsToRevalidate.push(`/series/${updatedBlog.collection.slug}/${slug}`);
        if (slug !== SLUG) {
          pathsToRevalidate.push(
            `/series/${updatedBlog.collection.slug}/${SLUG}`
          );
        }
      }

      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/revalidate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          paths: pathsToRevalidate,
        }),
      });
    } catch (revalidateError) {
      console.error("Failed to revalidate public blog:", revalidateError);
    }

    return new Response(
      JSON.stringify({ ...updatedBlog, publicationMetadata }),
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error updating blog:", error);
    return new Response(
      JSON.stringify({ message: "error", error: (error as Error).message }),
      {
        status: 500,
      }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const { user: loggedInUser } = await validateRequest();

    if (!loggedInUser) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
      });
    }

    const url = new URL(req.url);
    const slug = url.pathname.split("/").pop();

    if (!slug) {
      return new Response(JSON.stringify({ message: "slug is required" }), {
        status: 400,
      });
    }

    const blog = await prisma.articles.findUnique({
      where: { slug: slug, authorId: loggedInUser.id },
    });

    if (!blog) {
      return new Response(JSON.stringify({ message: "Blog not found" }), {
        status: 404,
      });
    }
    await prisma.articles.delete({
      where: { slug: slug, authorId: loggedInUser.id },
    });

    revalidatePath("/blog");
    revalidatePath(`/blog/${slug}`);
    revalidatePath("/api/blogs");

    // Revalidate the public blog
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/revalidate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          paths: ["/blog", `/blog/${slug}`, "/api/blogs", "/"],
        }),
      });
    } catch (revalidateError) {
      console.error("Failed to revalidate public blog:", revalidateError);
    }

    return new Response(
      JSON.stringify({ message: "Blog deleted successfully" }),
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error deleting blog:", error);
    return new Response(
      JSON.stringify({ message: "error", error: (error as Error).message }),
      {
        status: 500,
      }
    );
  }
}
