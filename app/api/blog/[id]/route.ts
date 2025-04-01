import { validateRequest } from "@/auth";
import prisma from "../../../../lib/prisma";
import { put, del } from "@vercel/blob";
import { revalidatePath } from "next/cache";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const slug = url.pathname.split("/").pop();

    if (!slug) {
      return new Response(JSON.stringify({ message: "ID is required" }), {
        status: 400,
      });
    }

    const blog = await prisma.articles.findUnique({
      where: { slug: slug },
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
    const category = formData.get("category") as string;
    const content = formData.get("content") as string;
    const keywords = JSON.parse(formData.get("keywords") as string);
    const SLUG = formData.get("slug") as string;
    const coverImgFile = formData.get("coverImgUrl") as File;

    if (!Array.isArray(keywords)) {
      return new Response(
        JSON.stringify({ error: "Keywords must be an array" }),
        {
          status: 400,
        }
      );
    }

    let coverImgUrl = blog.coverImgUrl!;
    if (coverImgFile) {
      await del(coverImgUrl);

      // Upload the new image to Vercel Blob
      const coverImgName = `${slug}`;
      const blob = await put(coverImgName, coverImgFile, {
        access: "public",
      });

      coverImgUrl = blob.url;
    }

    const updatedData = {
      title,
      description,
      category,
      coverImgUrl,
      content,
      keywords,
      slug: SLUG,
    };

    const updatedBlog = await prisma.articles.update({
      where: { slug: slug, authorId: loggedInUser.id },
      data: updatedData,
    });

    revalidatePath("/blog");
    revalidatePath(`/blog/${slug}`);
    revalidatePath("/api/blogs");
    revalidatePath(`/api/blog/${slug}`);

    return new Response(JSON.stringify(updatedBlog), {
      status: 200,
    });
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
    if (blog.coverImgUrl) {
      await del(blog.coverImgUrl);
    }

    await prisma.articles.delete({
      where: { slug: slug, authorId: loggedInUser.id },
    });

    revalidatePath("/blog");
    revalidatePath(`/blog/${slug}`);
    revalidatePath("/api/blogs");

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
