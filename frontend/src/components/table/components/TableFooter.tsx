import { memo } from "react";
import { flexRender, type HeaderGroup } from "@tanstack/react-table";
import type { User } from "../../../__generated__/graphql";

interface TableFooterProps {
  footerGroups: HeaderGroup<User>[];
}

export const TableFooter = memo(({ footerGroups }: TableFooterProps) => {
  return (
    <tfoot className="bg-gray-100 dark:bg-gray-800">
      {footerGroups.map((footerGroup) => (
        <tr key={footerGroup.id}>
          {footerGroup.headers.map((header) => (
            <th
              key={header.id}
              className="px-4 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300"
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
