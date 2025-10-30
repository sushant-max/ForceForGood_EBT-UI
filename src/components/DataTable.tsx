import React, { useMemo, useState } from 'react';
import { Search, ChevronDown, ChevronUp, Edit, Trash2, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
interface Column<T> {
  header: string;
  accessor: keyof T | ((row: T) => React.ReactNode);
  sortable?: boolean;
  // Optional sort accessor used when accessor is a function
  sortAccessor?: (row: T) => string | number;
}
interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyField: keyof T;
  isLoading?: boolean;
  error?: string;
  onRetry?: () => void;
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
  onView?: (item: T) => void;
  viewPath?: string;
  renderActions?: (item: T) => React.ReactNode;
  searchable?: boolean;
  pagination?: boolean;
}
export function DataTable<T>({
  columns,
  data,
  keyField,
  isLoading = false,
  error,
  onRetry,
  onEdit,
  onDelete,
  onView,
  viewPath,
  renderActions,
  searchable = true,
  pagination = true
}: DataTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<keyof T | null>(null);
  const [sortColumnIndex, setSortColumnIndex] = useState<number | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const handleSortByField = (field: keyof T) => {
    setSortColumnIndex(null);
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };
  const handleSortByIndex = (index: number) => {
    setSortField(null);
    if (sortColumnIndex === index) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumnIndex(index);
      setSortDirection('asc');
    }
  };
  const filteredData = useMemo(() => {
    if (!searchTerm) return data;
    const lower = searchTerm.toLowerCase();
    return data.filter(item => {
      // Check raw item values
      const rawMatch = Object.values(item as Record<string, unknown>).some(value => {
        if (typeof value === 'string') return value.toLowerCase().includes(lower);
        if (typeof value === 'number') return value.toString().includes(searchTerm);
        return false;
      });
      if (rawMatch) return true;
      // Check column accessors that return primitive strings/numbers
      return columns.some(col => {
        if (typeof col.accessor === 'function') {
          try {
            const v = col.accessor(item);
            if (typeof v === 'string') return v.toLowerCase().includes(lower);
            if (typeof v === 'number') return v.toString().includes(searchTerm);
          } catch (_) {
            // ignore accessor errors for search
          }
        } else {
          const v = (item as Record<string, unknown>)[col.accessor as string];
          if (typeof v === 'string') return v.toLowerCase().includes(lower);
          if (typeof v === 'number') return v.toString().includes(searchTerm);
        }
        // Fallback to sortAccessor for searchable value when accessor renders JSX
        if (typeof col.sortAccessor === 'function') {
          try {
            const sv = col.sortAccessor(item);
            if (typeof sv === 'string') return sv.toLowerCase().includes(lower);
            if (typeof sv === 'number') return sv.toString().includes(searchTerm);
          } catch (_) {
            // ignore sortAccessor errors for search
          }
        }
        return false;
      });
    });
  }, [data, searchTerm]);
  const sortedData = useMemo(() => {
    // Sort by direct field
    if (sortField) {
      return [...filteredData].sort((a, b) => {
        const aValue = (a as Record<string, unknown>)[sortField as string];
        const bValue = (b as Record<string, unknown>)[sortField as string];
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return sortDirection === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
        }
        if (typeof aValue === 'number' && typeof bValue === 'number') {
          return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
        }
        return 0;
      });
    }
    // Sort by column index using sortAccessor
    if (sortColumnIndex !== null) {
      const col = columns[sortColumnIndex];
      if (col && typeof col.sortAccessor === 'function') {
        return [...filteredData].sort((a, b) => {
          const aValue = col.sortAccessor!(a);
          const bValue = col.sortAccessor!(b);
          if (typeof aValue === 'string' && typeof bValue === 'string') {
            return sortDirection === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
          }
          if (typeof aValue === 'number' && typeof bValue === 'number') {
            return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
          }
          return 0;
        });
      }
    }
    return filteredData;
  }, [filteredData, sortField, sortColumnIndex, sortDirection, columns]);
  const paginatedData = useMemo(() => {
    if (!pagination) return sortedData;
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedData.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedData, currentPage, pagination]);
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  if (isLoading) {
    return <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <div className="h-8 bg-gray-200 rounded animate-pulse w-1/4"></div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {columns.map((column, index) => <th key={index} scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  </th>)}
                {(onEdit || onDelete || onView || viewPath || renderActions) && <th scope="col" className="relative px-6 py-3">
                    <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  </th>}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {Array.from({
              length: 5
            }).map((_, rowIndex) => <tr key={rowIndex}>
                  {columns.map((_, colIndex) => <td key={colIndex} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                    </td>)}
                  {(onEdit || onDelete || onView || viewPath || renderActions) && <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                    </td>}
                </tr>)}
            </tbody>
          </table>
        </div>
      </div>;
  }
  if (error) {
    return <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6 text-center">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md inline-block">
            <p>{error}</p>
            {onRetry && <button onClick={onRetry} className="mt-2 text-sm font-medium text-red-700 hover:text-red-800">
                Retry
              </button>}
          </div>
        </div>
      </div>;
  }
  if (data.length === 0) {
    return <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-8 text-center">
          <div className="mx-auto h-12 w-12 text-gray-400">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No data</h3>
          <p className="mt-1 text-sm text-gray-500">
            No records found matching your criteria.
          </p>
        </div>
      </div>;
  }
  // Check if search returned no results
  if (searchTerm && filteredData.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {searchable && (
          <div className="p-4 border-b border-gray-200">
            <div className="relative rounded-md shadow-sm max-w-xs">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 sm:text-sm border-gray-300 rounded-md outline-none transition-all duration-200 focus:border-[#A0C4FF] focus:shadow-[0_0_3px_#A0C4FF]"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        )}
        <div className="p-12 text-center">
          <Search className="mx-auto h-12 w-12 text-gray-300" />
          <h3 className="mt-4 text-base font-medium text-gray-900">
            No results found
          </h3>
          <p className="mt-2 text-sm text-gray-500">
            No matches found for "{searchTerm}". Try a different search term.
          </p>
        </div>
      </div>
    )
  }  
  return <div className="bg-white rounded-lg shadow overflow-hidden">
      {searchable && <div className="p-4 border-b border-gray-200">
          <div className="relative rounded-md shadow-sm max-w-xs">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input type="text" 
            // className="focus:ring-[#466EE5] focus:border-[#466EE5] block w-full pl-10 sm:text-sm border-gray-300 rounded-md" 
            //Updated the Search Border Color Issue.
            className="block w-full pl-10 sm:text-sm border-gray-300 rounded-md outline-none transition-all duration-200 focus:border-[#A0C4FF] focus:shadow-[0_0_3px_#A0C4FF]"
            placeholder="Search..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          </div>
        </div>}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column, index) => <th key={index} scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {column.sortable ? <button className="group flex items-center space-x-1 focus:outline-none" onClick={() => typeof column.accessor === 'string' ? handleSortByField(column.accessor as keyof T) : column.sortAccessor ? handleSortByIndex(index) : undefined}>
                      <span>{column.header}</span>
                      <span className="flex-shrink-0">
                        {typeof column.accessor === 'string' && sortField === column.accessor ? (sortDirection === 'asc' ? <ChevronUp className="h-4 w-4 text-gray-500" /> : <ChevronDown className="h-4 w-4 text-gray-500" />) : sortColumnIndex === index ? (sortDirection === 'asc' ? <ChevronUp className="h-4 w-4 text-gray-500" /> : <ChevronDown className="h-4 w-4 text-gray-500" />) : <ChevronDown className="h-4 w-4 text-gray-300 group-hover:text-gray-500" />}
                      </span>
                    </button> : column.header}
                </th>)}
              {(onEdit || onDelete || onView || viewPath || renderActions) && <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedData.map(item => <tr key={String(item[keyField])} className="hover:bg-gray-50">
                {columns.map((column, colIndex) => <td key={colIndex} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {typeof column.accessor === 'function' ? column.accessor(item) : String(item[column.accessor] || '')}
                  </td>)}
                {(onEdit || onDelete || onView || viewPath || renderActions) && <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {renderActions ? renderActions(item) : <div className="flex justify-end space-x-2">
                        {viewPath && <Link to={`${viewPath}/${item[keyField]}`} className="text-[#466EE5] hover:text-[#3355cc]">
                            <Eye className="h-5 w-5" />
                            <span className="sr-only">View</span>
                          </Link>}
                        {onView && <button onClick={() => onView(item)} className="text-[#466EE5] hover:text-[#3355cc]">
                            <Eye className="h-5 w-5" />
                            <span className="sr-only">View</span>
                          </button>}
                        {onEdit && <button onClick={() => onEdit(item)} className="text-amber-600 hover:text-amber-700">
                            <Edit className="h-5 w-5" />
                            <span className="sr-only">Edit</span>
                          </button>}
                        {onDelete && <button onClick={() => onDelete(item)} className="text-red-600 hover:text-red-700">
                            <Trash2 className="h-5 w-5" />
                            <span className="sr-only">Delete</span>
                          </button>}
                      </div>}
                  </td>}
              </tr>)}
          </tbody>
        </table>
      </div>
      {pagination && totalPages > 1 && <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div className="flex-1 flex justify-between sm:hidden">
            <button onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1} className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
              Previous
            </button>
            <button onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages} className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing{' '}
                <span className="font-medium">
                  {(currentPage - 1) * itemsPerPage + 1}
                </span>{' '}
                to{' '}
                <span className="font-medium">
                  {Math.min(currentPage * itemsPerPage, sortedData.length)}
                </span>{' '}
                of <span className="font-medium">{sortedData.length}</span>{' '}
                results
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1} className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
                  <span className="sr-only">Previous</span>
                  <ChevronDown className="h-5 w-5 rotate-90" />
                </button>
                {Array.from({
              length: totalPages
            }).map((_, index) => <button key={index} onClick={() => setCurrentPage(index + 1)} className={`relative inline-flex items-center px-4 py-2 border ${currentPage === index + 1 ? 'bg-[#466EE5] text-white border-[#466EE5]' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'} text-sm font-medium`}>
                    {index + 1}
                  </button>)}
                <button onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages} className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
                  <span className="sr-only">Next</span>
                  <ChevronDown className="h-5 w-5 -rotate-90" />
                </button>
              </nav>
            </div>
          </div>
        </div>}
    </div>;
}