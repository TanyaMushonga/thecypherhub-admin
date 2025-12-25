"use server";
import { prisma } from "@/lib/prisma";

export async function getNotes() {
    try {
        const notes = await prisma.notes.findMany({
            orderBy: {
                createdAt: "desc"
            }
        });
        
        return notes;
    } catch (error) {
        console.error("Failed to fetch notes", error);
        return [];
    }
}
