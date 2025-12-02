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
  if (error) return <div className="p-4 text-red-500">Error: {error.message}</div>;

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
