"use client";

import React, { useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Button } from "../ui/button";
import toast from "react-hot-toast";
import { Loader2, Bold, Italic, List, ListOrdered, Quote, Send, Mail } from "lucide-react";

interface NotesEditorProps {
  onNoteSent: () => void;
}

const NotesEditor: React.FC<NotesEditorProps> = ({ onNoteSent }) => {
  const [subject, setSubject] = useState("");
  const [testEmail, setTestEmail] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [status, setStatus] = useState("");

  const editor = useEditor({
    extensions: [StarterKit],
    content: "",
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          "min-h-[300px] w-full bg-blue-900/20 px-4 py-2 text-slate-200 focus:outline-none",
      },
    },
  });

  const handleSend = async (isTest: boolean = false) => {
    if (!subject.trim()) {
        toast.error("Please add a subject");
        return;
    }
    if (!editor || editor.isEmpty) {
        toast.error("Please add some content");
        return;
    }
    if (isTest && !testEmail.trim()) {
        toast.error("Please enter a test email address");
        return;
    }

    try {
        if (isTest) setIsSendingTest(true);
        else setIsSending(true);

        const editorContent = editor.getHTML();
        
        if (isTest) {
             // Test mode: Send batch of 1 immediately, no noteId needed
            await sendBatch([testEmail], subject, editorContent, "", "note");
            toast.success("Test note sent!");
        } else {
             // Production mode: Fetch subscribers FIRST
            setStatus("Fetching subscribers...");
            const subResponse = await fetch("/api/subscribers");
            const subData = await subResponse.json();
            
            if (!subResponse.ok) throw new Error(subData.error || "Failed to fetch subscribers");
            
            // Fix: Handle the API response structure (Array of objects)
            const subscribersList = Array.isArray(subData) ? subData : [];
            const subscribers: string[] = subscribersList
                .filter((sub: any) => sub.status === 1) // Only active subscribers? Assuming 1 is active based on API code
                .map((sub: any) => sub.email);

            if (subscribers.length === 0) {
                toast.error("No active subscribers found");
                setIsSending(false);
                setStatus("");
                return;
            }

            const total = subscribers.length;
            const batchSize = 5;
            let sentCount = 0;

            // Send emails FIRST
            for (let i = 0; i < total; i += batchSize) {
                const batch = subscribers.slice(i, i + batchSize);
                
                setStatus(`Sending batch ${Math.ceil((i + 1) / batchSize)} of ${Math.ceil(total / batchSize)}... (${sentCount}/${total}) with 5 recipients`);
                
                // Pass empty noteId so we don't try to update a non-existent DB record checks
                await sendBatch(batch, subject, editorContent, "", "note");
                sentCount += batch.length;
            }

            // Create Note in DB AFTER successful sending
            setStatus("Saving note to database...");
            const noteResponse = await fetch("/api/send-note", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    subject, 
                    content: editorContent,
                    status: "Sent",
                    totalRecipients: total
                }),
            });

            if (!noteResponse.ok) {
                // If saving fails, we should still let the user know emails were sent
                 console.error("Emails sent but failed to save note record");
                 toast.error("Emails sent, but failed to save to history.");
            } else {
                 toast.success(`Sent to ${total} subscribers!`);
                 setSubject("");
                 editor.commands.clearContent();
                 onNoteSent();
            }
        }
    } catch (error: any) {
        console.error(error);
        toast.error(error.message || "Something went wrong");
    } finally {
        setIsSending(false);
        setIsSendingTest(false);
        setStatus("");
    }
  };

  const sendBatch = async (recipients: string[], subject: string, content: string, noteId: string, type: string) => {
    const response = await fetch("/api/send-batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            recipients,
            subject,
            content,
            noteId,
            type
        }),
    });
    
    if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to send batch");
    }
};

  if (!editor) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-300">Subject</label>
        <input
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Enter note subject..."
          className="w-full bg-blue-900/50 border border-blue-800 rounded-lg px-4 py-2 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-300">Message</label>
        <div className="border border-blue-800 rounded-lg overflow-hidden bg-blue-900/20">
            {/* Simple Toolbar */}
            <div className="flex items-center gap-1 p-2 border-b border-blue-800 bg-blue-900/40">
                <Button 
                    variant="ghost" size="sm" 
                    onClick={() => editor.chain().focus().toggleBold().run()} 
                    className={`h-8 w-8 p-0 ${editor.isActive('bold') ? 'bg-blue-800 text-white' : 'text-slate-400 hover:text-white'}`}
                >
                    <Bold className="h-4 w-4" />
                </Button>
                <Button 
                    variant="ghost" size="sm" 
                    onClick={() => editor.chain().focus().toggleItalic().run()} 
                    className={`h-8 w-8 p-0 ${editor.isActive('italic') ? 'bg-blue-800 text-white' : 'text-slate-400 hover:text-white'}`}
                >
                    <Italic className="h-4 w-4" />
                </Button>
                 <div className="w-px h-4 bg-blue-800 mx-1" />
                <Button 
                    variant="ghost" size="sm" 
                    onClick={() => editor.chain().focus().toggleBulletList().run()} 
                    className={`h-8 w-8 p-0 ${editor.isActive('bulletList') ? 'bg-blue-800 text-white' : 'text-slate-400 hover:text-white'}`}
                >
                    <List className="h-4 w-4" />
                </Button>
                <Button 
                    variant="ghost" size="sm" 
                    onClick={() => editor.chain().focus().toggleOrderedList().run()} 
                    className={`h-8 w-8 p-0 ${editor.isActive('orderedList') ? 'bg-blue-800 text-white' : 'text-slate-400 hover:text-white'}`}
                >
                    <ListOrdered className="h-4 w-4" />
                </Button>
            </div>
            <EditorContent editor={editor} />
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-between items-end pt-4 border-t border-blue-900/50">
        <div className="flex items-center gap-2 w-full sm:w-auto">
             <input
                type="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                placeholder="Test email address"
                className="bg-blue-900/30 border border-blue-800 rounded-lg px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500 w-full sm:w-64"
             />
             <Button 
                onClick={() => handleSend(true)} 
                disabled={isSendingTest || isSending}
                variant="outline"
                className="border-blue-700 text-blue-300 hover:bg-blue-900 hover:text-blue-200 whitespace-nowrap"
            >
                {isSendingTest ? <Loader2 className="h-4 w-4 animate-spin" /> : <span className="flex items-center gap-2"><Mail className="h-4 w-4" /> Send Test</span>}
            </Button>
        </div>

        <div className="flex flex-col items-end gap-2">
            {status && <span className="text-xs text-sky-300 animate-pulse font-mono">{status}</span>}
            <Button 
                onClick={() => handleSend(false)} 
                disabled={isSending || isSendingTest}
                className="bg-blue-600 hover:bg-blue-700 text-white min-w-[140px]"
            >
          {isSending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending...
            </>
          ) : (
            <span className="flex items-center gap-2"><Send className="h-4 w-4" /> Send Broadcast</span>
          )}
        </Button>
      </div>
    </div>
  </div>
  );
};

export default NotesEditor;
