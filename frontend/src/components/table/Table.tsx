import { useCallback, useState } from "react";
import { TableFilters } from "./components/TableFilters";
import { TableContent } from "./components/TableContent";

export const Table = () => {
  const [searchValue, setSearchValue] = useState("");
  
  const handleSearchChange = useCallback((value: string) => {
    setSearchValue(value);
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="space-y-6">
        <TableFilters searchValue={searchValue} setSearchValue={handleSearchChange} />
        <TableContent searchValue={searchValue} />
      </div>
    </div>
  );
};
