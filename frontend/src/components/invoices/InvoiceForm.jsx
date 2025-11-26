import React, { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import api from '../../api';

const InvoiceForm = ({ type, onSubmit, onCancel }) => {
  const [products, setProducts] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [invoiceData, setInvoiceData] = useState({
    date: new Date().toISOString().split('T')[0],
    account: '',
    items: [{ product: '', quantity: 1, price: 0, selling_price: 0 }],
    discount: 0
  });

  useEffect(() => {
    fetchProducts();
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      const response =
        type === 'sale'
          ? await api.accounts.customers.list()
          : await api.accounts.suppliers.list();
      setAccounts(response.data);
    } catch (error) {
      console.error('❌ Error fetching accounts:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await api.products.list();
      setProducts(response.data);
    } catch (error) {
      console.error('❌ Error fetching products:', error);
    }
  };

  const handleAddItem = () => {
    setInvoiceData({
      ...invoiceData,
      items: [...invoiceData.items, { product: '', quantity: 1, price: 0, selling_price: 0 }]
    });
  };

  const handleRemoveItem = (index) => {
    const newItems = invoiceData.items.filter((_, i) => i !== index);
    setInvoiceData({ ...invoiceData, items: newItems });
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...invoiceData.items];
    newItems[index][field] = value;

    // Auto-fill price/selling price when product selected
    if (field === 'product' && value) {
      const selectedProduct = products.find(p => p.id === parseInt(value));
      if (selectedProduct) {
        newItems[index].price = type === 'sale'
          ? selectedProduct.selling_price
          : selectedProduct.buying_price;
        newItems[index].selling_price = selectedProduct.selling_price || 0;
      }
    }

    // Validate stock for sales
    if ((field === 'quantity' || field === 'product') && newItems[index].product) {
      const productId = parseInt(newItems[index].product);
      const selectedProduct = products.find(p => p.id === productId);

      if (type === 'sale' && selectedProduct) {
        const totalQtyForProduct = newItems
          .filter(i => parseInt(i.product) === productId)
          .reduce((sum, i) => sum + Number(i.quantity || 0), 0);

        if (totalQtyForProduct > selectedProduct.stock) {
          alert(
            `❌ Stock not available for "${selectedProduct.name}".\n` +
            `You tried ${totalQtyForProduct}, but only ${selectedProduct.stock} left.`
          );

          // Revert change
          if (field === 'quantity') {
            newItems[index].quantity = 0;
          } else if (field === 'product') {
            newItems[index].product = '';
            newItems[index].price = 0;
            newItems[index].selling_price = 0;
          }
        }
      }
    }

    setInvoiceData({ ...invoiceData, items: newItems });
  };

  const calculateTotal = () => {
    const subtotal = invoiceData.items.reduce((sum, item) => {
      return sum + (parseFloat(item.quantity) * parseFloat(item.price || 0));
    }, 0);
    const discount = parseFloat(invoiceData.discount || 0);
    return subtotal - discount;
  };

  const handleSubmit = async () => {
    try {
      // ✅ Validation
      if (!invoiceData.account) {
        alert('⚠️ Please select a customer or supplier.');
        return;
      }

      if (invoiceData.items.length === 0) {
        alert('⚠️ Please add at least one item.');
        return;
      }

      const selectedAccount = accounts.find(acc => acc.id === parseInt(invoiceData.account));
      const payload = {
        [type === "sale" ? "customer_name" : "supplier_name"]: selectedAccount ? selectedAccount.name : "",
        discount: Number(invoiceData.discount) || 0,
        items: invoiceData.items.map(item => ({
          product: parseInt(item.product),
          quantity: Number(item.quantity),
          price: Number(item.price || item.selling_price)
        })),
        total_amount: calculateTotal() // ⬅️ ADD THIS
      };


      if (type !== 'sale' && invoiceData.date) {
        payload.date = invoiceData.date;
      }

      console.log('📤 Final Payload:', payload);

      // ✅ Use your api.js wrapper
      if (onSubmit) onSubmit(payload);

    } catch (error) {
      console.error('❌ Error saving invoice:', error.response?.data || error.message);
      alert('❌ Error saving invoice. Check console for details.');
    }
  };

  return (
    <div className="space-y-6">
      {/* ================= Date & Account ================= */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Date *
          </label>
          <input
            type="date"
            value={invoiceData.date}
            onChange={(e) => setInvoiceData({ ...invoiceData, date: e.target.value })}
            disabled={type === 'sale'}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-600 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {type === 'sale' ? 'Customer *' : 'Supplier *'}
          </label>
          <select
            value={invoiceData.account}
            onChange={(e) => setInvoiceData({ ...invoiceData, account: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-600 focus:border-transparent"
          >
            <option value="">
              Select {type === 'sale' ? 'Customer' : 'Supplier'}
            </option>
            {accounts.map((acc) => (
              <option key={acc.id} value={acc.id}>
                {acc.name}
                {type === 'purchase' && acc.company_name ? ` (${acc.company_name})` : ''}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ================= Items ================= */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Items</h3>
          <button
            onClick={handleAddItem}
            className="flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Item
          </button>
        </div>

        <div className="space-y-3">
          {invoiceData.items.map((item, index) => (
            <div
              key={index}
              className="flex gap-3 items-start p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
            >
              <div className={`flex-1 grid ${type === 'sale' ? 'grid-cols-3' : 'grid-cols-4'} gap-3`}>
                {/* Product */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Product *
                  </label>
                  <select
                    value={item.product}
                    onChange={(e) => handleItemChange(index, 'product', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  >
                    <option value="">Select product</option>
                    {products
                      .filter(p => type === 'sale' ? p.stock > 0 : true)
                      .map(p => (
                        <option key={p.id} value={p.id}>
                          {p.name} (Stock: {p.stock})
                        </option>
                      ))}
                  </select>
                </div>

                {/* Quantity */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Quantity *
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  />
                </div>

                {/* Price (purchase only) */}
                {type === 'purchase' && (
                  <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                      Price (Rs.)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={item.price}
                      onChange={(e) => handleItemChange(index, 'price', e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                    />
                  </div>
                )}

                {/* Selling Price */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Selling Price (Rs.)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={item.selling_price || 0}
                    readOnly={type === 'sale'}
                    onChange={(e) => handleItemChange(index, 'selling_price', e.target.value)}
                    className={`w-full px-3 py-2 text-sm border rounded-lg ${type === 'sale'
                      ? 'bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-500 cursor-not-allowed'
                      : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-600 focus:border-transparent'
                      }`}
                  />
                </div>
              </div>

              {/* Total + Remove */}
              <div className="flex flex-col items-end gap-2 pt-6">
                <div className="text-sm font-semibold text-gray-800 dark:text-white">
                  Rs. {(item.quantity * (item.price || item.selling_price || 0)).toFixed(2)}
                </div>
                {invoiceData.items.length > 1 && (
                  <button
                    onClick={() => handleRemoveItem(index)}
                    className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ================= Discount + Total ================= */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Discount (Rs.)</span>
          <input
            type="number"
            step="0.01"
            min="0"
            value={invoiceData.discount || 0}
            onChange={(e) => setInvoiceData({ ...invoiceData, discount: e.target.value })}
            className="w-32 px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-600 focus:border-transparent"
          />
        </div>

        <div className="flex items-center justify-between">
          <span className="text-lg font-semibold text-gray-800 dark:text-white">Total Amount:</span>
          <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            Rs. {calculateTotal().toFixed(2)}
          </span>
        </div>
      </div>

      {/* ================= Actions ================= */}
      <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={handleSubmit}
          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          Create {type === 'sale' ? 'Sale' : 'Purchase'} Invoice
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

export default InvoiceForm;
