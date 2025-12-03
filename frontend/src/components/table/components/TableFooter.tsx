import { memo } from "react";
import { flexRender, type HeaderGroup } from "@tanstack/react-table";
import type { User } from "../../../__generated__/graphql";
import { useTheme } from "../../../contexts/ThemeContext";

interface TableFooterProps {
  footerGroups: HeaderGroup<User>[];
}

export const TableFooter = memo(({ footerGroups }: TableFooterProps) => {
  const { theme } = useTheme();

  return (
    <tfoot className={theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'}>
      {footerGroups.map((footerGroup) => (
        <tr key={footerGroup.id}>
          {footerGroup.headers.map((header) => (
            <th
              key={header.id}
              className={theme === 'dark' ? 'px-4 py-2 text-left text-xs font-medium text-gray-300' : 'px-4 py-2 text-left text-xs font-medium text-gray-700'}
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
  );
});
