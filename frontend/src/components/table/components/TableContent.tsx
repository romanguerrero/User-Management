import { memo } from "react";
import { LoadingSpinner } from "../../LoadingSpinner";
import { useUsersTable } from "../../../hooks/useUsersTable";
import { TableHeader } from "./TableHeader";
import { TableBody } from "./TableBody";
import { TableFooter } from "./TableFooter";
import { useTheme } from "../../../contexts/ThemeContext";

interface TableContentProps {
  searchValue: string;
}

export const TableContent = memo(({ searchValue }: TableContentProps) => {
  const { table, loading, error } = useUsersTable(searchValue);
  const { theme } = useTheme();

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="p-4 text-red-500">Error: {error.message}</div>;

  return (
    <div className={theme === 'dark' ? 'overflow-hidden rounded-xl border border-gray-700/50 bg-gray-800/30 backdrop-blur-sm shadow-xl' : 'overflow-hidden rounded-xl border border-gray-300 bg-white backdrop-blur-sm shadow-xl'}>
      <div className="overflow-x-auto">
        <table className={theme === 'dark' ? 'min-w-full divide-y divide-gray-700/50 text-sm' : 'min-w-full divide-y divide-gray-300 text-sm'}>
          <TableHeader headerGroups={table.getHeaderGroups()} />
          <TableBody rows={table.getRowModel().rows} />
          <TableFooter footerGroups={table.getFooterGroups()} />
        </table>
      </div>
    </div>
  );
});
