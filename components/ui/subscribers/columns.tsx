"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "../../../components/ui/button";
import { ArrowUpDown } from "lucide-react";
import { formatDate } from "../../../lib/utils";


export const columns: ColumnDef<Subscribers>[] = [
  {
    accessorKey: "email",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          className="text-slate-300 hover:text-white hover:bg-blue-900 pl-0"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Email
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: "status",
    header: () => <div className="text-right">Status</div>,
    cell: ({ row }) => {
      const status = parseFloat(row.getValue("status"));
      const formatted = status === 1 ? "Subscribed" : "Unsubscribed";
      return <div className="text-right font-medium">{formatted}</div>;
    },
  },
  {
    accessorKey: "createdAt",
    header: () => <div className="text-right">Joined</div>,
    cell: ({ row }) => {
      const createdAt = row.getValue("createdAt") as string | number | Date;
      const formatted = formatDate(new Date(createdAt));
      return <div className="text-right font-medium">{formatted}</div>;
    },
  },
];
