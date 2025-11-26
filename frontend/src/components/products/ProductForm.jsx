import React from 'react';

const ProductForm = ({ formData, setFormData, onSubmit, onCancel, isEditing }) => {
  return (
    <div className="space-y-4">
      {/* Product Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Product Name *
        </label>
        <input
          type="text"
          required
          value={formData.name ?? ''}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-600 focus:border-transparent"
          placeholder="Enter product name"
        />
      </div>

      {/* Unit */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Unit *
        </label>
        <select
          value={formData.unit ?? 'pcs'}
          onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-600 focus:border-transparent"
        >
          <option value="pcs">Pieces</option>
          <option value="kg">Kilograms</option>
          <option value="ltr">Liters</option>
          <option value="box">Box</option>
        </select>
      </div>

      {/* Min Stock */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Minimum Stock *
        </label>
        <input
          type="number"
          min="0"
          required
          value={formData.min_stock ?? ''}
          onChange={(e) => setFormData({ ...formData, min_stock: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-600 focus:border-transparent"
          placeholder="0"
        />
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={onSubmit}
          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          {isEditing ? 'Update Product' : 'Add Product'}
        </button>
        <button
          onClick={onCancel}
          className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default ProductForm;
