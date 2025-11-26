import React, { useState, useEffect } from 'react';
import { Plus, Search } from 'lucide-react';
import Modal from '../common/Modal';
import ProductsTable from './ProductsTable';
import ProductForm from './ProductForm';
import api from '../../api';

const initialFormData = {
  name: '',
  unit: 'pcs',
  min_stock: '',
  buying_price: 0,
  selling_price: 0,
  stock: 0
};

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState(initialFormData);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await api.products.list();
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
      alert('Failed to fetch products. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
  if (!formData.name) {
    alert('Please fill in the Product Name');
    return;
  }

  const payload = {
    name: formData.name,
    unit: formData.unit,
    min_stock: formData.min_stock === '' ? 0 : Number(formData.min_stock),
    buying_price: 0,
    selling_price: 0,
    stock: 0
  };

  try {
    if (editingProduct) {
      await api.products.update(editingProduct.id, payload);
    } else {
      await api.products.create(payload);
    }

    setIsModalOpen(false);
    setEditingProduct(null);
    setFormData(initialFormData);
    fetchProducts();
  } catch (error) {
    console.error('Error saving product:', error);
    alert('Failed to save product. Please try again.');
  }
};


  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name ?? '',
      unit: product.unit ?? 'pcs',
      min_stock: product.min_stock ?? '',
      buying_price: product.buying_price ?? 0,
      selling_price: product.selling_price ?? 0,
      stock: product.stock ?? 0
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await api.products.delete(id);
        fetchProducts();
      } catch (error) {
        console.error('Error deleting product:', error);
        alert('Failed to delete product. Please try again.');
      }
    }
  };

  const filteredProducts = products.filter((p) => {
    const name = p.name?.toLowerCase() || '';
    return name.includes(searchTerm.toLowerCase());
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">Products</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your inventory and product catalog
          </p>
        </div>
        <button
          onClick={() => {
            setEditingProduct(null);
            setFormData(initialFormData);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Product
        </button>
      </div>

      {/* Search + Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-600 focus:border-transparent"
            />
          </div>
        </div>

        <ProductsTable
          products={filteredProducts}
          loading={loading}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>

      {/* Modal Form */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingProduct(null);
        }}
        title={editingProduct ? 'Edit Product' : 'Add New Product'}
      >
        <ProductForm
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleSubmit}
          onCancel={() => {
            setIsModalOpen(false);
            setEditingProduct(null);
          }}
          isEditing={!!editingProduct}
        />
      </Modal>
    </div>
  );
};

export default ProductsPage;
