export const useSearchFilters = (searchValue: string) => {
  const isNumeric = !isNaN(Number(searchValue)) && searchValue.trim() !== '';
  const numericValue = isNumeric ? Number(searchValue) : undefined;

  return {
    ...(numericValue && { 
      id: { equals: numericValue },
      age: { equals: numericValue }
    }),
    name: { contains: searchValue },
    email: { contains: searchValue },
    phone: { contains: searchValue },
  };
};
