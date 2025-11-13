import React, { useState } from 'react';
import PropTypes from 'prop-types';

/**
 * Table Component - Design System
 * Feature-rich data table with sorting, pagination, and loading states
 */
const Table = ({
  columns,
  data,
  onSort,
  pagination,
  loading = false,
  emptyMessage = 'No data available',
  className = '',
}) => {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  const handleSort = (columnKey) => {
    if (!onSort) return;

    const direction =
      sortConfig.key === columnKey && sortConfig.direction === 'asc'
        ? 'desc'
        : 'asc';

    setSortConfig({ key: columnKey, direction });
    onSort(columnKey, direction);
  };

  const SortIcon = ({ columnKey }) => {
    if (sortConfig.key !== columnKey) {
      return (
        <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      );
    }

    return sortConfig.direction === 'asc' ? (
      <svg className="w-4 h-4 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
      </svg>
    ) : (
      <svg className="w-4 h-4 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    );
  };

  // Loading Skeleton
  if (loading) {
    return (
      <div className={`overflow-x-auto ${className}`}>
        <table className="w-full">
          <thead className="bg-gray-800 border-b border-gray-700">
            <tr>
              {columns.map((column, index) => (
                <th key={index} className="px-6 py-4 text-left text-sm font-semibold text-gray-300">
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {[...Array(5)].map((_, index) => (
              <tr key={index} className="animate-pulse">
                {columns.map((_, colIndex) => (
                  <td key={colIndex} className="px-6 py-4">
                    <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  // Empty State
  if (!data || data.length === 0) {
    return (
      <div className={`overflow-x-auto ${className}`}>
        <table className="w-full">
          <thead className="bg-gray-800 border-b border-gray-700">
            <tr>
              {columns.map((column, index) => (
                <th key={index} className="px-6 py-4 text-left text-sm font-semibold text-gray-300">
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
        </table>
        <div className="flex flex-col items-center justify-center py-12">
          <svg className="w-16 h-16 text-gray-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
          <p className="text-gray-400 text-sm">{emptyMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="overflow-x-auto rounded-lg border border-gray-700">
        <table className="w-full">
          {/* Table Header */}
          <thead className="bg-gray-800 border-b border-gray-700">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`
                    px-6 py-4 text-left text-sm font-semibold text-gray-300
                    ${column.sortable ? 'cursor-pointer hover:bg-gray-750 select-none' : ''}
                  `}
                  onClick={() => column.sortable && handleSort(column.key)}
                >
                  <div className="flex items-center gap-2">
                    {column.header}
                    {column.sortable && <SortIcon columnKey={column.key} />}
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="bg-gray-900 divide-y divide-gray-700">
            {data.map((row, rowIndex) => (
              <tr
                key={row.id || rowIndex}
                className="hover:bg-gray-800 transition-colors"
              >
                {columns.map((column) => (
                  <td key={column.key} className="px-6 py-4 text-sm text-gray-300">
                    {column.render
                      ? column.render(row[column.key], row, rowIndex)
                      : row[column.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && (
        <div className="flex items-center justify-between mt-4 px-2">
          <div className="text-sm text-gray-400">
            Showing {pagination.from} to {pagination.to} of {pagination.total} results
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={pagination.onPrevious}
              disabled={!pagination.hasPrevious}
              className={`
                px-3 py-2 rounded-lg text-sm font-medium
                ${pagination.hasPrevious
                  ? 'bg-gray-800 text-white hover:bg-gray-700'
                  : 'bg-gray-800 text-gray-600 cursor-not-allowed'
                }
                transition-colors
              `}
            >
              Previous
            </button>
            <span className="text-sm text-gray-400">
              Page {pagination.currentPage} of {pagination.totalPages}
            </span>
            <button
              onClick={pagination.onNext}
              disabled={!pagination.hasNext}
              className={`
                px-3 py-2 rounded-lg text-sm font-medium
                ${pagination.hasNext
                  ? 'bg-gray-800 text-white hover:bg-gray-700'
                  : 'bg-gray-800 text-gray-600 cursor-not-allowed'
                }
                transition-colors
              `}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

Table.propTypes = {
  columns: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired,
      header: PropTypes.string.isRequired,
      sortable: PropTypes.bool,
      render: PropTypes.func,
    })
  ).isRequired,
  data: PropTypes.arrayOf(PropTypes.object),
  onSort: PropTypes.func,
  pagination: PropTypes.shape({
    currentPage: PropTypes.number.isRequired,
    totalPages: PropTypes.number.isRequired,
    from: PropTypes.number.isRequired,
    to: PropTypes.number.isRequired,
    total: PropTypes.number.isRequired,
    hasPrevious: PropTypes.bool.isRequired,
    hasNext: PropTypes.bool.isRequired,
    onPrevious: PropTypes.func.isRequired,
    onNext: PropTypes.func.isRequired,
  }),
  loading: PropTypes.bool,
  emptyMessage: PropTypes.string,
  className: PropTypes.string,
};

export default Table;
