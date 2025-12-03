import { memo } from "react";
import { flexRender, type Row } from "@tanstack/react-table";
import type { User } from "../../../__generated__/graphql";

interface TableBodyProps {
  rows: Row<User>[];
}

export const TableBody = memo(({ rows }: TableBodyProps) => {
  return (
    <tbody className="bg-surface divide-y divide-border">
      {rows.map((row) => (
        <tr
          key={row.id}
          className="hover:bg-surface-hover transition-colors"
        >
          {row.getVisibleCells().map((cell) => (
            <td key={cell.id} className="px-6 py-4 text-foreground whitespace-nowrap">
              {flexRender(cell.column.columnDef.cell, cell.getContext())}
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  );
});
