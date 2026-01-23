import prisma from "../../../lib/prisma";
import NodeCache from "node-cache";

const cache = new NodeCache({ stdTTL: 518400 });

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get("page") || "1", 10);
    const pageSize = parseInt(url.searchParams.get("page_size") || "10", 10);
    const search = url.searchParams.get("search") || "";

    const cacheKey = `blogs-${page}-${pageSize}-${search}`;
    const cachedResponse = cache.get(cacheKey);

    if (cachedResponse) {
      return new Response(JSON.stringify(cachedResponse), {
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "s-maxage=518400, stale-while-revalidate",
        },
      });
    }

    const skip = (page - 1) * pageSize;
    const take = pageSize;

    const where = {
      status: "published",
      ...(search
        ? {
            OR: [
              { title: { contains: search, mode: "insensitive" as const } },
              {
                description: { contains: search, mode: "insensitive" as const },
              },
            ],
          }
        : {}),
    };

    const blogs = await prisma.articles.findMany({
      where,
      orderBy: [{ updatedAt: "desc" }],
      include: {
        comments: {
          orderBy: {
            createdAt: "desc",
          },
        },
      },
      skip: skip,
      take: take,
    });

    const totalCount = await prisma.articles.count({ where });

    const responsePayload = {
      blogs,
      pagination: {
        page,
        pageSize,
        totalCount,
        totalPages: Math.ceil(totalCount / pageSize),
      },
    };

    cache.set(cacheKey, responsePayload);

    return new Response(JSON.stringify(responsePayload), {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "s-maxage=518400, stale-while-revalidate", // Cache for 6 days
      },
    });
  } catch (error) {
    console.error("Error fetching blog:", error);
    return new Response(
      JSON.stringify({ message: "error", error: (error as Error).message }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  }
}
