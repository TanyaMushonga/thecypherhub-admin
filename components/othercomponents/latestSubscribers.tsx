"use client";
import { useFetchSubscribers } from "../../hooks/useFetchSubscribers";
import { formatDate } from "../../lib/utils";
import React from "react";

function LatestSubscribers() {
  const { loading, subscribers } = useFetchSubscribers();
  return (
    <>
    <>
      {loading ? (
        <p className="text-slate-400 text-sm mt-5 animate-pulse">Loading...</p>
      ) : subscribers?.length > 0 ? (
        <div className="space-y-4 mt-5">
          {subscribers.slice(0, 5).map((subscriber) => (
            <div
              key={subscriber.id}
              className="flex items-center justify-between p-4 bg-blue-950/50 rounded-lg border border-blue-900/30 hover:bg-blue-900/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                 <div className="relative">
                    <div className="h-8 w-8 rounded-full bg-blue-800 flex items-center justify-center text-xs font-bold text-blue-200 uppercase">
                      {subscriber.email.substring(0, 2)}
                    </div>
                    <span 
                      className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border border-blue-950 ${
                        subscriber.status === 1 ? "bg-green-500" : "bg-slate-500"
                      }`} 
                      title={subscriber.status === 1 ? "Active" : "Inactive"}
                    />
                 </div>
                <div className="flex flex-col">
                  <p className="text-white text-sm font-medium truncate max-w-[150px] md:max-w-[200px]">
                    {subscriber.email}
                  </p>
                  <span className="text-[10px] text-slate-400 md:hidden">
                     {subscriber.status === 1 ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
              <p className="text-slate-400 text-xs whitespace-nowrap">
                {formatDate(new Date(subscriber.createdAt))}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-5 p-8 text-center bg-blue-950/30 rounded-lg border border-dashed border-blue-900">
           <p className="text-slate-400 text-sm">No subscribers yet</p>
        </div>
      )}
    </>
    </>
  );
}

export default LatestSubscribers;
