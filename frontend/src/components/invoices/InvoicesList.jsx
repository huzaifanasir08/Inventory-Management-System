import React, { useState, useEffect } from 'react';
import { FileText, Calendar, User, DollarSign, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';

const InvoicesList = ({ invoices, type, loading = false }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 50;

  // 🛡️ Make sure invoices is always an array
  const safeInvoices = Array.isArray(invoices) ? invoices : [];
  const totalPages = Math.ceil(safeInvoices.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const currentInvoices = safeInvoices.slice(startIndex, startIndex + rowsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [type, invoices]);

  // 🌀 Loading state
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-500 dark:text-gray-300">
        <Loader2 className="w-10 h-10 animate-spin mb-4" />
        <p>Loading invoices...</p>
      </div>
    );
  }

  // 📭 Empty state
  if (!loading && safeInvoices.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="w-16 h-16 mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
          No {type === 'sale' ? 'Sales' : 'Purchases'} Yet
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Create your first {type === 'sale' ? 'sale' : 'purchase'} invoice to get started
        </p>
      </div>
    );
  }

  // 📄 Main table
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-100 dark:bg-gray-800">
          <tr>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Invoice #</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Type</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Date</th>
            {type === 'sale'?
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Customer</th>
            :
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Supplier</th>
            }
            <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700 dark:text-gray-300">Total</th>
            <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700 dark:text-gray-300">Items</th>
            <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700 dark:text-gray-300">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
          {currentInvoices.map((invoice) => (
            <tr
              key={invoice.id}
              className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
            >
              <td className="px-4 py-3 text-gray-800 dark:text-gray-100 font-medium">
                {invoice.id}
              </td>
              <td className="px-4 py-3 text-gray-600 dark:text-gray-300 capitalize">
                {type === 'sale' ? 'Sale' : 'Purchase'}
              </td>
              <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                {new Date(invoice.date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
              </td>
              <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
  {type === 'sale'
    ? invoice.customer_name || 'N/A'
    : invoice.supplier_name || invoice.vendor_name || 'N/A'}
</td>
              <td className="px-4 py-3 text-right text-gray-800 dark:text-gray-100 font-semibold">
                Rs. {Number(invoice.total_amount || 0).toFixed(2)}
              </td>
              <td className="px-4 py-3 text-right text-gray-600 dark:text-gray-300">
                {invoice.items?.length || 0}
              </td>
              <td className="px-4 py-3 text-center">
                <span
                  className={`px-2 py-1 text-xs rounded-full ${
                    type === 'sale'
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400'
                      : 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400'
                  }`}
                >
                  Completed
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* 🧭 Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="flex items-center gap-1 px-3 py-1 text-sm rounded-md bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 disabled:opacity-50"
          >
            <ChevronLeft className="w-4 h-4" /> Prev
          </button>

          <span className="text-sm text-gray-600 dark:text-gray-400">
            Page {currentPage} of {totalPages}
          </span>

          <button
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="flex items-center gap-1 px-3 py-1 text-sm rounded-md bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 disabled:opacity-50"
          >
            Next <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};

export default InvoicesList;
