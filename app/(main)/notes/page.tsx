"use client";
import React, { useEffect, useState, useCallback } from "react";
import NotesEditor from "@/components/othercomponents/NotesEditor";
import NotesSidebar from "@/components/othercomponents/NotesSidebar";
import { getNotes } from "../actions/Notes";

// Type matching the Prisma model and our Sidebar expectations
interface Note {
  id: string;
  subject: string;
  content: string;
  recipientsCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotes = useCallback(async () => {
    try {
        setLoading(true);
        const fetchedNotes = await getNotes();
        setNotes(fetchedNotes);
    } catch (error) {
        console.error("Error fetching notes:", error);
    } finally {
        setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-blue-950 bg-primary">
      {/* Main Content: Editor */}
      <div className="flex-1 overflow-y-auto no-scrollbar p-6">
         <div className="max-w-4xl space-y-6"> {/* Removed mx-auto, increased max-w */}
            <header className="space-y-2">
                <h1 className="text-2xl font-bold text-white">Broadcast Note</h1>
                <p className="text-slate-400">
                    Create and send email updates to all active subscribers.
                </p>
            </header>
            
            <div className="p-1">
                <NotesEditor onNoteSent={fetchNotes} />
            </div>
         </div>
      </div>

      {/* Sidebar: History */}
      <div className="hidden lg:block h-full border-l border-blue-900 w-[450px]"> {/* Increased width wrapper */}
        <NotesSidebar notes={notes} loading={loading} />
      </div>
    </div>
  );
}
