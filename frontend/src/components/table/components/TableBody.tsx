import { memo } from "react";
import { flexRender, type Row } from "@tanstack/react-table";
import type { User } from "../../../__generated__/graphql";

interface TableBodyProps {
  rows: Row<User>[];
}

export const TableBody = memo(({ rows }: TableBodyProps) => {
  return (
    <tbody className="bg-transparent divide-y divide-gray-700/30">
      {rows.map((row) => (
        <tr
          key={row.id}
          className="hover:bg-gray-700/30 transition-colors"
        >
          {row.getVisibleCells().map((cell) => (
            <td key={cell.id} className="px-6 py-4 text-gray-100 whitespace-nowrap">
              {flexRender(cell.column.columnDef.cell, cell.getContext())}
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  );
});
