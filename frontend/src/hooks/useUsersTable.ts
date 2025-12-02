import { useMemo } from "react";
import { useQuery } from "@apollo/client/react";
import { getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { GetUsersDocument, type GetUsersQuery } from "../__generated__/graphql";
import { columns } from "../components/table/Columns";
import { useDebouncedValue } from "./useDebouncedValue";
import { useSearchFilters } from "./useSearchFilters";

const SEARCH_DEBOUNCE_MS = 300;

export const useUsersTable = (searchValue: string) => {
  const debouncedSearch = useDebouncedValue(searchValue, SEARCH_DEBOUNCE_MS);

  const { data: usersData, loading, error } = useQuery(GetUsersDocument, {
    variables: { filters: useSearchFilters(debouncedSearch) },
  });

  const data: GetUsersQuery["users"] = usersData?.users ?? [];

  const memoizedColumns = useMemo(() => columns, []);

  const table = useReactTable({
    data,
    columns: memoizedColumns,
    getCoreRowModel: getCoreRowModel(),
  });

  return { table, loading, error };
};
