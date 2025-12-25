"use server";
import { prisma } from "@/lib/prisma";

export async function getNotes() {
    try {
        const notes = await prisma.notes.findMany({
            orderBy: {
                createdAt: "desc"
            }
        });
        // Date objects are fine here if used in Server Component or handled properly
        // But for client, we often need plain objects. 
        // Prisma returns Date objects. Next.js server actions serialize them fine usually,
        // but verifying if it's strictly JSON compatible is safer.
        return notes;
    } catch (error) {
        console.error("Failed to fetch notes", error);
        return [];
    }
}
