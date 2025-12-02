import { memo } from "react";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useQuery } from "@apollo/client/react";
import {
  GetUsersDocument,
  type GetUsersQuery,
} from "../../__generated__/graphql";
import { LoadingSpinner } from "../LoadingSpinner";
import { columns } from "./Columns";


interface TableContentProps {
  searchValue: string;
}


export const TableContent = memo(({ searchValue }: TableContentProps) => {
  const isNumeric = !isNaN(Number(searchValue)) && searchValue.trim() !== '';
  const numericValue = isNumeric ? Number(searchValue) : undefined;

  const filters = {
    ...(numericValue && { 
      id: { equals: numericValue },
      age: { equals: numericValue }
    }),
    name: { contains: searchValue },
    email: { contains: searchValue },
    phone: { contains: searchValue },
  };

  const { data: usersData, loading, error } = useQuery(GetUsersDocument, {
    variables: { filters }, 
  })

  const data: GetUsersQuery["users"] = usersData?.users ?? [];

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="p-4 text-red-500">Error: {error.message}</div>;

  return (
    <div className="overflow-x-auto rounded-lg bg-gray-900">
      <table className="min-w-full divide-y divide-gray-700 text-sm">
        <thead className="bg-gray-800">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody className="bg-transparent">
          {table.getRowModel().rows.map((row) => (
            <tr
              key={row.id}
              className="odd:bg-gray-800 even:bg-gray-900 hover:bg-gray-700"
            >
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="px-4 py-2 text-gray-100">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
        <tfoot className="bg-gray-800">
          {table.getFooterGroups().map((footerGroup) => (
            <tr key={footerGroup.id}>
              {footerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  className="px-4 py-2 text-left text-xs font-medium text-gray-300"
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.footer,
                        header.getContext()
                      )}
                </th>
              ))}
            </tr>
          ))}
        </tfoot>
      </table>
    </div>
  );
});
