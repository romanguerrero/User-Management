import { memo } from "react";
import { LoadingSpinner } from "../../LoadingSpinner";
import { useUsersTable } from "../../../hooks/useUsersTable";
import { TableHeader } from "./TableHeader";
import { TableBody } from "./TableBody";
import { TableFooter } from "./TableFooter";

interface TableContentProps {
  searchValue: string;
}

export const TableContent = memo(({ searchValue }: TableContentProps) => {
  const { table, loading, error } = useUsersTable(searchValue);

  if (loading) return <LoadingSpinner />;
  if (error) return (
    <div className="rounded-lg bg-red-900/20 border border-red-800/50 p-4">
      <div className="flex items-center gap-2 text-red-400">
        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
        </svg>
        <span className="font-medium">Error: {error.message}</span>
      </div>
    </div>
  );

  return (
    <div className="overflow-hidden rounded-xl border border-gray-700/50 bg-gray-800/30 backdrop-blur-sm shadow-xl">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-700/50 text-sm">
          <TableHeader headerGroups={table.getHeaderGroups()} />
          <TableBody rows={table.getRowModel().rows} />
          <TableFooter footerGroups={table.getFooterGroups()} />
        </table>
      </div>
    </div>
  );
});
