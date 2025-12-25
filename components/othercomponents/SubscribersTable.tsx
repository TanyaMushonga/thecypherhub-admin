"use client";
import { columns } from "../../components/ui/subscribers/columns";
import { DataTable } from "../../components/ui/subscribers/data-table";
import { useFetchSubscribers } from "../../hooks/useFetchSubscribers";
import React from "react";

function SubscribersTable() {
  const { subscribers } = useFetchSubscribers();

  return (
    <div className="p-5 md:p-10 w-full bg-primary min-h-screen">
      <h2 className="text-2xl font-bold text-white mb-6">Subscribers</h2>
      <DataTable columns={columns} data={subscribers} />
    </div>
  );
}

export default SubscribersTable;
