import React, { useState, useEffect } from 'react';
import { Package, TrendingUp, DollarSign, ShoppingCart, Plus } from 'lucide-react';
import StatsCard from '../components/common/StatsCard';
import Modal from '../components/common/Modal';
import InvoiceForm from '../components/invoices/InvoiceForm';
import ProductForm from '../components/products/ProductForm';
import api from '../api';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalStock: 0,
    todaySales: 0,
    todayPurchases: 0,
    trends: {}
  });
  const [loading, setLoading] = useState(true);

  // 🆕 Modal controls
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [invoiceType, setInvoiceType] = useState(null);

  const [isProductModalOpen, setIsProductModalOpen] = useState(false);

  const [criticalProducts, setCriticalProducts] = useState([]);

  const initialProductForm = {
    name: '',
    unit: 'pcs',
    min_stock: '',
    buying_price: 0,
    selling_price: 0,
    stock: 0
  };

  const [productFormData, setProductFormData] = useState(initialProductForm);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);

      const productsResponse = await api.products.list();
      const products = productsResponse.data;

      const criticalList = products.filter(p => isCriticalStock(p.stock, p.min_stock));
      setCriticalProducts(criticalList);

      const today = new Date().toISOString().split('T')[0];
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

      const [todayReport, yesterdayReport] = await Promise.all([
        api.reports.day(today),
        api.reports.day(yesterday)
      ]);

      const calcTrend = (todayVal, yesterdayVal) =>
        yesterdayVal ? (((todayVal - yesterdayVal) / yesterdayVal) * 100).toFixed(1) : 0;

      const totalProducts = products.length;
      const totalStock = products.reduce((sum, p) => sum + p.stock, 0);
      const todaySales = todayReport.data.sales_total ?? 0;
      const todayPurchases = todayReport.data.purchases_total ?? 0;
      const yesterdaySales = yesterdayReport.data.sales_total ?? 0;
      const yesterdayPurchases = yesterdayReport.data.purchases_total ?? 0;

      setStats({
        totalProducts,
        totalStock,
        todaySales,
        todayPurchases,
        trends: {
          totalProducts: calcTrend(totalProducts, totalProducts),
          totalStock: calcTrend(totalStock, totalStock),
          todaySales: calcTrend(todaySales, yesterdaySales),
          todayPurchases: calcTrend(todayPurchases, yesterdayPurchases)
        }
      });

    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const isCriticalStock = (stock, minStock) => {
    if (!minStock || minStock === 0) return false;
    const percentage = (stock / minStock) * 100;
    return percentage <= 10; // 🔴 critical threshold
  };

  // 🧾 Create Invoice
  const handleCreateInvoice = async (invoiceData) => {
    try {
      if (invoiceType === 'sale') {
        await api.invoices.sales.create(invoiceData);
      } else {
        await api.invoices.purchases.create(invoiceData);
      }
      alert('Invoice created successfully!');
      setIsInvoiceModalOpen(false);
      fetchStats();
    } catch (error) {
      console.error('Error creating invoice:', error);
      alert('Failed to create invoice. Please try again.');
    }
  };

  // 📦 Add Product
  const handleAddProduct = async () => {
    try {
      if (!productFormData.name) {
        alert('Please fill in the Product Name');
        return;
      }

      const payload = {
        name: productFormData.name,
        unit: productFormData.unit,
        min_stock: productFormData.min_stock === '' ? 0 : Number(productFormData.min_stock),
        buying_price: 0,
        selling_price: 0,
        stock: 0
      };

      await api.products.create(payload);
      alert('Product added successfully!');
      setIsProductModalOpen(false);
      setProductFormData(initialProductForm);
      fetchStats(); // refresh stats after adding
    } catch (error) {
      console.error('Error adding product:', error);
      alert('Failed to add product. Please try again.');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400">Welcome back! Here's your business overview.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard title="Total Products" value={stats.totalProducts} icon={Package} color="bg-blue-600" trend={stats.trends.totalProducts} />
        <StatsCard title="Total Stock" value={stats.totalStock} icon={TrendingUp} color="bg-green-600" trend={stats.trends.totalStock} />
        <StatsCard title="Today's Sales" value={`Rs. ${(stats.todaySales ?? 0).toLocaleString()}`} icon={DollarSign} color="bg-purple-600" trend={stats.trends.todaySales} />
        <StatsCard title="Today's Purchases" value={`Rs. ${(stats.todayPurchases ?? 0).toLocaleString()}`} icon={ShoppingCart} color="bg-orange-600" trend={stats.trends.todayPurchases} />
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* 🆕 Add Product */}
          <button
            onClick={() => setIsProductModalOpen(true)}
            className="flex items-center gap-3 p-4 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
          >
            <Plus className="w-5 h-5 text-blue-600" />
            <span className="font-medium text-gray-700 dark:text-gray-300">Add Product</span>
          </button>

          {/* 🆕 New Sale Invoice */}
          <button
            onClick={() => { setInvoiceType('sale'); setIsInvoiceModalOpen(true); }}
            className="flex items-center gap-3 p-4 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
          >
            <Plus className="w-5 h-5 text-green-600" />
            <span className="font-medium text-gray-700 dark:text-gray-300">New Sale</span>
          </button>

          {/* 🆕 New Purchase Invoice */}
          <button
            onClick={() => { setInvoiceType('purchase'); setIsInvoiceModalOpen(true); }}
            className="flex items-center gap-3 p-4 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors"
          >
            <Plus className="w-5 h-5 text-purple-600" />
            <span className="font-medium text-gray-700 dark:text-gray-300">New Purchase</span>
          </button>
        </div>
      </div>

      {/* 🧾 Invoice Modal */}
      <Modal
        isOpen={isInvoiceModalOpen}
        onClose={() => setIsInvoiceModalOpen(false)}
        title={`Create ${invoiceType === 'sale' ? 'Sale' : 'Purchase'} Invoice`}
      >
        {invoiceType && (
          <InvoiceForm
            type={invoiceType}
            onSubmit={handleCreateInvoice}
            onCancel={() => setIsInvoiceModalOpen(false)}
          />
        )}
      </Modal>

      {/* 📦 Product Modal */}
      <Modal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        title="Add New Product"
      >
        <ProductForm
          formData={productFormData}
          setFormData={setProductFormData}
          onSubmit={handleAddProduct}
          onCancel={() => setIsProductModalOpen(false)}
          isEditing={false}
        />
      </Modal>

      {/* 🚨 Critical Stock Alert Section */}
      {criticalProducts.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-red-600 dark:text-red-400 mb-4 flex items-center gap-2">
            <Package className="w-5 h-5" />
            Critical Stock Alert ({criticalProducts.length} items)
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-100 dark:bg-gray-800">
                <tr>
                  <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Product</th>
                  <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Stock</th>
                  <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Min Stock</th>
                  <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">%</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {criticalProducts.map(product => {
                  const percentage = ((product.stock / product.min_stock) * 100).toFixed(0);
                  return (
                    <tr key={product.id} className="hover:bg-red-50 dark:hover:bg-red-900/10">
                      <td className="px-4 py-2 text-gray-800 dark:text-gray-100 font-medium">{product.name}</td>
                      <td className="px-4 py-2 text-white dark:text-white font-semibold">{product.stock}</td>
                      <td className="px-4 py-2 text-gray-800 dark:text-gray-100">{product.min_stock}</td>
                      <td className="px-4 py-2 text-red-600 dark:text-red-400 font-semibold">{percentage}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
