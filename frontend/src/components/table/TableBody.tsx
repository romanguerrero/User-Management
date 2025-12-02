import { flexRender, type Row } from "@tanstack/react-table";
import type { User } from "../../__generated__/graphql";

interface TableBodyProps {
  rows: Row<User>[];
}

export const TableBody = ({ rows }: TableBodyProps) => {
  return (
    <tbody className="bg-transparent">
      {rows.map((row) => (
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
  );
};
