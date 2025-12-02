import { memo } from "react";
import { flexRender, type HeaderGroup } from "@tanstack/react-table";
import type { User } from "../../../__generated__/graphql";

interface TableHeaderProps {
  headerGroups: HeaderGroup<User>[];
}

export const TableHeader = memo(({ headerGroups }: TableHeaderProps) => {
  return (
    <thead className="bg-gray-800">
      {headerGroups.map((headerGroup) => (
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
  );
});
