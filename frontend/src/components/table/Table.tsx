import { useState } from "react";
import { TableFilters } from "./TableFilters";
import { TableContent } from "./TableContent";

export const Table = () => {
  const [searchValue, setSearchValue] = useState("");

  return (
    <div className="p-2">
      <TableFilters searchValue={searchValue} setSearchValue={setSearchValue} />
      <TableContent />
    </div>
  );
};
