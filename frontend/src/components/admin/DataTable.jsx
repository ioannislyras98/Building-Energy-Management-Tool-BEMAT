import React from "react";
import { useLanguage } from "../../context/LanguageContext";
import english_text from "../../languages/english.json";
import greek_text from "../../languages/greek.json";

const DataTable = ({
  data,
  columns,
  loading,
  pagination,
  onPageChange,
  onSort,
  currentSort,
  emptyMessage = "No data found",
}) => {
  const { language } = useLanguage();
  const translations =
    language === "en" ? english_text.DataTable : greek_text.DataTable;

  const handleSort = (columnKey) => {
    if (!columnKey) return;

    const isCurrentAsc = currentSort === columnKey;
    const isCurrentDesc = currentSort === `-${columnKey}`;

    let newSort;
    if (isCurrentAsc) {
      newSort = `-${columnKey}`; 
    } else if (isCurrentDesc) {
      newSort = columnKey; 
    } else {
      newSort = columnKey; 
    }

    onSort(newSort);
  };

  const getSortIcon = (columnKey) => {
    if (currentSort === columnKey) return " ▲";
    if (currentSort === `-${columnKey}`) return " ▼";
    return "";
  };

  const renderPagination = () => {
    if (!pagination || pagination.total_pages <= 1) return null;

    const { current_page, total_pages, has_prev, has_next } = pagination;

    const maxPages = 7;
    let startPage = Math.max(1, current_page - Math.floor(maxPages / 2));
    let endPage = Math.min(total_pages, startPage + maxPages - 1);

    if (endPage - startPage + 1 < maxPages) {
      startPage = Math.max(1, endPage - maxPages + 1);
    }

    const pages = [];
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return (
      <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
        <div className="flex-1 flex justify-between sm:hidden">
          <button
            onClick={() => onPageChange(current_page - 1)}
            disabled={!has_prev}
            className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
              has_prev
                ? "text-gray-700 bg-white hover:bg-gray-50"
                : "text-gray-400 bg-gray-100 cursor-not-allowed"
            }`}>
            {translations?.previous || "Previous"}
          </button>
          <button
            onClick={() => onPageChange(current_page + 1)}
            disabled={!has_next}
            className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
              has_next
                ? "text-gray-700 bg-white hover:bg-gray-50"
                : "text-gray-400 bg-gray-100 cursor-not-allowed"
            }`}>
            {translations?.next || "Next"}
          </button>
        </div>

        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-700">
              {translations?.showing || "Showing"}{" "}
              <span className="font-medium">{pagination.start_index}</span>{" "}
              {translations?.to || "to"}{" "}
              <span className="font-medium">{pagination.end_index}</span>{" "}
              {translations?.of || "of"}{" "}
              <span className="font-medium">{pagination.total_count}</span>{" "}
              {translations?.results || "results"}
            </p>
          </div>

          <div>
            <nav
              className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
              aria-label="Pagination">
              {/* Previous button */}
              <button
                onClick={() => onPageChange(current_page - 1)}
                disabled={!has_prev}
                className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 text-sm font-medium ${
                  has_prev
                    ? "text-gray-500 bg-white hover:bg-gray-50"
                    : "text-gray-300 bg-gray-100 cursor-not-allowed"
                }`}>
                <span className="sr-only">
                  {translations?.previous || "Previous"}
                </span>
                ←
              </button>

              {/* First page */}
              {startPage > 1 && (
                <>
                  <button
                    onClick={() => onPageChange(1)}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
                    1
                  </button>
                  {startPage > 2 && (
                    <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                      ...
                    </span>
                  )}
                </>
              )}

              {/* Page numbers */}
              {pages.map((page) => (
                <button
                  key={page}
                  onClick={() => onPageChange(page)}
                  className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                    page === current_page
                      ? "z-10 bg-primary-light border-primary text-primary-bold"
                      : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                  }`}>
                  {page}
                </button>
              ))}

              {/* Last page */}
              {endPage < total_pages && (
                <>
                  {endPage < total_pages - 1 && (
                    <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                      ...
                    </span>
                  )}
                  <button
                    onClick={() => onPageChange(total_pages)}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
                    {total_pages}
                  </button>
                </>
              )}

              {/* Next button */}
              <button
                onClick={() => onPageChange(current_page + 1)}
                disabled={!has_next}
                className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 text-sm font-medium ${
                  has_next
                    ? "text-gray-500 bg-white hover:bg-gray-50"
                    : "text-gray-300 bg-gray-100 cursor-not-allowed"
                }`}>
                <span className="sr-only">{translations?.next || "Next"}</span>→
              </button>
            </nav>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <div className="px-4 py-8 text-center">
          <div className="text-lg text-gray-600">
            ⏳ {translations?.loading || "Loading..."}
          </div>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <div className="px-4 py-8 text-center">
          <div className="text-lg text-gray-500">📭 {emptyMessage}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-md">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  scope="col"
                  className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                    column.sortable ? "cursor-pointer hover:bg-gray-100" : ""
                  }`}
                  style={{ width: column.width }}
                  onClick={() => column.sortable && handleSort(column.key)}>
                  <div className="flex items-center">
                    {column.title}
                    {column.sortable && (
                      <span className="ml-1 text-gray-400">
                        {getSortIcon(column.key) || "↕"}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((item, index) => (
              <tr key={item.id || index} className="table-row-hover">
                {columns.map((column) => (
                  <td
                    key={`${item.id || index}-${column.key}`}
                    className="px-6 py-4 whitespace-nowrap text-sm">
                    {column.render ? column.render(item) : item[column.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {renderPagination()}
    </div>
  );
};

export default DataTable;
