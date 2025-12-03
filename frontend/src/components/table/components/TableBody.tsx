import { memo } from "react";
import { flexRender, type Row } from "@tanstack/react-table";
import type { User } from "../../../__generated__/graphql";
import { useTheme } from "../../../contexts/ThemeContext";

interface TableBodyProps {
  rows: Row<User>[];
}

export const TableBody = memo(({ rows }: TableBodyProps) => {
  const { theme } = useTheme();

  return (
    <tbody className={theme === 'dark' ? 'bg-transparent divide-y divide-gray-700/30' : 'bg-transparent divide-y divide-gray-300'}>
      {rows.map((row) => (
        <tr
          key={row.id}
          className={theme === 'dark' ? 'hover:bg-gray-700/30 transition-colors' : 'hover:bg-gray-100 transition-colors'}
        >
          {row.getVisibleCells().map((cell) => (
            <td key={cell.id} className={theme === 'dark' ? 'px-6 py-4 text-gray-100 whitespace-nowrap' : 'px-6 py-4 text-gray-900 whitespace-nowrap'}>
              {flexRender(cell.column.columnDef.cell, cell.getContext())}
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  );
});
