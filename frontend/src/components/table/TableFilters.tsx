type TableFiltersProps = {
    searchValue: string
    setSearchValue: (value: string) => void
}

export const TableFilters = ({ searchValue, setSearchValue }: TableFiltersProps) => {
    return (
        <div>
            <input type="text" placeholder="Search" value={searchValue} onChange={(e) => setSearchValue(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
        </div>
    )
}