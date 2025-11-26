import React, { useState, useEffect } from 'react';
import { Plus, ShoppingCart, Package } from 'lucide-react';
import Modal from '../common/Modal';
import InvoicesList from './InvoicesList';
import InvoiceForm from './InvoiceForm';
import api from '../../api';

const InvoicesPage = () => {
  const [activeTab, setActiveTab] = useState('sales');
  const [salesInvoices, setSalesInvoices] = useState([]);
  const [purchasesInvoices, setPurchasesInvoices] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const [salesRes, purchasesRes] = await Promise.all([
        api.invoices.sales.list(),
        api.invoices.purchases.list()
      ]);
      setSalesInvoices(salesRes.data);
      setPurchasesInvoices(purchasesRes.data);
    } catch (error) {
      console.error('Error fetching invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateInvoice = async (invoiceData) => {
    try {
      if (activeTab === 'sales') {
        await api.invoices.sales.create(invoiceData);
      } else {
        await api.invoices.purchases.create(invoiceData);
      }
      setIsModalOpen(false);
      fetchInvoices();
      alert('Invoice created successfully!');
    } catch (error) {
      console.error('Error creating invoice:', error);
      alert('Failed to create invoice. Please try again.');
    }
  };

  const currentInvoices = activeTab === 'sales' ? salesInvoices : purchasesInvoices;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">Invoices</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage your sales and purchase invoices</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Create Invoice
        </button>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab('sales')}
            className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 font-medium transition-colors ${
              activeTab === 'sales'
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
            }`}
          >
            <ShoppingCart className="w-5 h-5" />
            Sales ({salesInvoices.length})
          </button>
          <button
            onClick={() => setActiveTab('purchases')}
            className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 font-medium transition-colors ${
              activeTab === 'purchases'
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
            }`}
          >
            <Package className="w-5 h-5" />
            Purchases ({purchasesInvoices.length})
          </button>
        </div>

        <div className="p-6">
          <InvoicesList
            invoices={currentInvoices}
            type={activeTab === 'sales' ? 'sale' : 'purchase'}
            loading={loading}  // 👈 pass loading state here
          />
        </div>
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`Create ${activeTab === 'sales' ? 'Sale' : 'Purchase'} Invoice`}
      >
        <InvoiceForm
          type={activeTab === 'sales' ? 'sale' : 'purchase'}
          onSubmit={handleCreateInvoice}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>
    </div>
  );
};

export default InvoicesPage;
