import React, { useState, useEffect } from 'react';
import { Package, Edit2, Trash2, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';

const ProductsTable = ({ products, onEdit, onDelete, loading }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 50;

  const totalPages = Math.ceil(products.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const currentProducts = products.slice(startIndex, startIndex + rowsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [products]);

  // 🌀 Show loading spinner if still fetching
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-500 dark:text-gray-300">
        <Loader2 className="w-10 h-10 animate-spin mb-4" />
        <p>Loading products...</p>
      </div>
    );
  }

  // 📦 Empty state when no products found
  if (!loading && products.length === 0) {
    return (
      <div className="text-center py-12">
        <Package className="w-16 h-16 mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
          No Products Found
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Add your first product to get started.
        </p>
      </div>
    );
  }

  const getStockLevelClass = (stock, minStock) => {
    if (!minStock || minStock === 0) return "text-gray-400"; // fallback

    const percentage = (stock / minStock) * 100;

    if (percentage >= 70) return "text-green-500 dark:text-green-400 font-semibold"; // 🟢 over min
    else if (percentage >= 50) return "text-yellow-500 dark:text-yellow-400 font-semibold"; // 🟡 near min
    else if (percentage > 20) return "text-orange-500 dark:text-orange-400 font-semibold"; // 🟠 low
    else return "text-red-500 dark:text-red-400 font-semibold"; // 🔴 critical
  };

  const getStockStatusLabel = (stock, minStock) => {
    if (!minStock || minStock === 0) return "No Min Set";

    const percentage = (stock / minStock) * 100;

    if (percentage >= 70) return "Healthy";
    if (percentage >= 50) return "Near Min";
    if (percentage > 20) return "Low";
    return "Critical";
  };


  // 🧾 Main table
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-100 dark:bg-gray-800">
          <tr>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
              Product
            </th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
              Unit
            </th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
              Buy Price
            </th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
              Sell Price
            </th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
              Stock
            </th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
              Stock Level
            </th>
            <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700 dark:text-gray-300">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
          {currentProducts.map((product) => (
            <tr
              key={product.id}
              className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
            >
              <td className="px-4 py-3 text-gray-800 dark:text-gray-100 font-medium">
                {product.name}
              </td>
              <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                {product.unit}
              </td>
              <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                Rs. {Number(product.buying_price).toFixed(2)}
              </td>
              <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                Rs. {Number(product.selling_price).toFixed(2)}
              </td>
              <td className="px-4 py-3 text-gray-800 dark:text-gray-100 font-semibold">
                <span className="text-white dark:text-white font-semibold">
                  {product.stock}
                </span>

              </td>
              <td className="px-4 py-3 text-gray-800 dark:text-gray-100">
                <span className={getStockLevelClass(product.stock, product.min_stock)}>
                  {getStockStatusLabel(product.stock, product.min_stock)}{" "}
                  <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">
                    ({Math.round((product.stock / product.min_stock) * 100)}%)
                  </span>
                </span>
              </td>

              <td className="px-4 py-3 text-right">
                <button
                  onClick={() => onEdit(product)}
                  className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                  title="Edit product"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onDelete(product.id)}
                  className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors ml-2"
                  title="Delete product"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 mb-4">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="pagination-btn flex items-center gap-1 px-3 py-1 text-sm rounded-md bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 disabled:opacity-50"
          >
            <ChevronLeft className="w-4 h-4" /> Prev
          </button>

          <span className="text-sm text-gray-600 dark:text-gray-400">
            Page {currentPage} of {totalPages}
          </span>

          <button
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="pagination-btn flex items-center gap-1 px-3 py-1 text-sm rounded-md bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 disabled:opacity-50"
          >
            Next <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};

export default ProductsTable;
