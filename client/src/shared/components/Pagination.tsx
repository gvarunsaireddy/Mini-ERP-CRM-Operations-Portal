import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between mt-4 py-3 border-t border-primary">
      <div className="text-sm text-secondary">
        Page {currentPage} of {totalPages}
      </div>
      <div className="flex gap-2">
        <button 
          className="btn btn-secondary"
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
        >
          <ChevronLeft size={16} /> Prev
        </button>
        <button 
          className="btn btn-secondary"
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
        >
          Next <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
