import React from "react";
import { formatDate } from "@/lib/utils";
import { Mail, Users, Clock } from "lucide-react";

interface Note {
  id: string;
  subject: string;
  totalRecipients: number;
  createdAt: Date;
}

interface NotesSidebarProps {
  notes: Note[];
  loading: boolean;
}

const NotesSidebar: React.FC<NotesSidebarProps> = ({ notes, loading }) => {
  return (
    <div className="border-l border-blue-900 h-full flex flex-col w-full">
      <div className="p-4 border-b border-blue-900 bg-blue-900/20">
        <h3 className="font-semibold text-white flex items-center gap-2">
          <Mail className="w-4 h-4 text-blue-400" />
          Sent History
        </h3>
      </div>
      
      <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-3">
        {loading ? (
           <div className="flex justify-center p-4">
               <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
           </div>
        ) : notes.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-sm border-2 border-dashed border-blue-900/50 rounded-lg">
            No notes sent yet
          </div>
        ) : (
          notes.map((note) => (
            <div 
              key={note.id}
              className="bg-blue-900/40 border border-blue-800 rounded-lg p-3 hover:bg-blue-900/60 transition-colors group"
            >
              <h4 className="text-slate-200 font-medium text-sm mb-2 line-clamp-2 leading-snug">
                {note.subject}
              </h4>
              
              <div className="flex items-center justify-between text-xs text-slate-400">
                <div className="flex items-center gap-1" title="Recipients">
                  <Users className="w-3 h-3" />
                  <span>{note.totalRecipients}</span>
                </div>
                <div className="flex items-center gap-1" title={new Date(note.createdAt).toLocaleString()}>
                  <Clock className="w-3 h-3" />
                  <span>{formatDate(new Date(note.createdAt))}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotesSidebar;
