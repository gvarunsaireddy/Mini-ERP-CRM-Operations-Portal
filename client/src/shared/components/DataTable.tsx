import React from 'react';
import { FileX } from 'lucide-react';

interface Column<T> {
  header: string;
  accessor: keyof T | string;
  render?: (item: T) => React.ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  emptyMessage?: string;
  onRowClick?: (item: T) => void;
}

export function DataTable<T>({ columns, data, loading, emptyMessage = 'No data found', onRowClick }: DataTableProps<T>) {
  if (loading) {
    return (
      <div className="table-container">
        <table>
          <thead>
            <tr>
              {columns.map((col, i) => <th key={i}>{col.header}</th>)}
            </tr>
          </thead>
          <tbody>
            {[1, 2, 3, 4, 5].map((_, rowIdx) => (
              <tr key={rowIdx}>
                {columns.map((_, colIdx) => (
                  <td key={colIdx}>
                    <div className="skeleton h-4 w-full"></div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="table-container">
        <table>
          <thead>
            <tr>
              {columns.map((col, i) => <th key={i}>{col.header}</th>)}
            </tr>
          </thead>
        </table>
        <div className="empty-state">
          <FileX size={48} className="text-muted mb-4" />
          <p>{emptyMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="table-container">
      <table>
        <thead>
          <tr>
            {columns.map((col, i) => <th key={i}>{col.header}</th>)}
          </tr>
        </thead>
        <tbody>
          {data.map((item, rowIdx) => (
            <tr 
              key={rowIdx} 
              onClick={() => onRowClick && onRowClick(item)}
              style={{ cursor: onRowClick ? 'pointer' : 'default' }}
            >
              {columns.map((col, colIdx) => (
                <td key={colIdx}>
                  {col.render ? col.render(item) : (item[col.accessor as keyof T] as any)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
