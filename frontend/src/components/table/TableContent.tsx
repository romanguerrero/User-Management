import { memo } from "react";
import { LoadingSpinner } from "../LoadingSpinner";
import { useUsersTable } from "../../hooks/useUsersTable";
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
    <div className="overflow-x-auto rounded-lg bg-gray-900">
      <table className="min-w-full divide-y divide-gray-700 text-sm">
        <TableHeader headerGroups={table.getHeaderGroups()} />
        <TableBody rows={table.getRowModel().rows} />
        <TableFooter footerGroups={table.getFooterGroups()} />
      </table>
    </div>
  );
});
