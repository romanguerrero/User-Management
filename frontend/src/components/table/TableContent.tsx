import { memo } from "react";
import {
  createColumnHelper,
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
import { GenericCell } from "./cells/GenericCell";
import { PostCell } from "./cells/PostCell";


interface TableContentProps {
  searchValue: string;
}


const columnHelper = createColumnHelper<GetUsersQuery["users"][0]>();

const columns = [
  columnHelper.accessor("id", {
    header: "ID",
    cell: (info: any) => <GenericCell value={info.getValue()} />,
  }),
  columnHelper.accessor("name", {
    header: "Name",
    cell: (info: any) => <GenericCell value={info.getValue()} />,
  }),
  columnHelper.accessor("age", {
    header: "Age",
    cell: (info: any) => <GenericCell value={info.getValue()} />,
  }),
  columnHelper.accessor("email", {
    header: "Email",
    cell: (info: any) => <GenericCell value={info.getValue()} />,
  }),
  columnHelper.accessor("phone", {
    header: "Phone",
    cell: (info: any) => <GenericCell value={info.getValue()} />,
  }),
  columnHelper.accessor("posts", {
    header: "Post Count",
    cell: (info: any) => <PostCell posts={info.getValue()} />,
  }),
];


export const TableContent = memo(({ searchValue }: TableContentProps) => {
  const { data: usersData, loading, error } = useQuery(GetUsersDocument, {
    variables: {
      filters: {
         name: { contains: searchValue },
      },
    },
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
