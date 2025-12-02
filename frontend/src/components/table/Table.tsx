import { useCallback, useState } from "react";
import { TableFilters } from "./components/TableFilters";
import { TableContent } from "./components/TableContent";

export const Table = () => {
  const [searchValue, setSearchValue] = useState("");
  
  const handleSearchChange = useCallback((value: string) => {
    setSearchValue(value);
  }, []);

  return (
    <div className="p-2">
      <TableFilters searchValue={searchValue} setSearchValue={handleSearchChange} />
      <TableContent searchValue={searchValue} />
    </div>
  );
};
