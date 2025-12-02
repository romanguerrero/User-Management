import { memo } from "react";

type TableFiltersProps = {
    searchValue: string
    setSearchValue: (value: string) => void
}

export const TableFilters = memo(({ searchValue, setSearchValue }: TableFiltersProps) => {
    return (
        <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-md">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input 
                    type="text" 
                    placeholder="Search users..." 
                    value={searchValue} 
                    onChange={(e) => setSearchValue(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
                />
            </div>
        </div>
    )
});