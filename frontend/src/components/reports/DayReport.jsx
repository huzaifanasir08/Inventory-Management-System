import React, { useState } from 'react';
import { Calendar, DollarSign, TrendingUp, TrendingDown } from 'lucide-react';
import api from '../../api';

const DayReport = () => {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchReport = async () => {
    try {
      setLoading(true);
      const response = await api.reports.day(date);
      const normalized = {
      total_sales: response.data.sales_total,
      total_purchases: response.data.purchases_total,
      gross_profit: response.data.gross_profit_approx,
      cogs: response.data.cogs_approx,
      date: response.data.date
    };
      setReport(normalized);
    } catch (error) {
      console.error('Error fetching day report:', error);
      alert('Failed to fetch report');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-4 items-end">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Select Date
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-600 focus:border-transparent"
          />
        </div>
        <button
          onClick={fetchReport}
          disabled={loading}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Loading...' : 'Generate Report'}
        </button>
      </div>

      {report && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <TrendingUp className="w-8 h-8 opacity-80" />
              <DollarSign className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-medium opacity-90 mb-1">Total Sales</h3>
            <p className="text-3xl font-bold">Rs. {report.total_sales?.toFixed(2) || '0.00'}</p>
          </div>

          <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <TrendingDown className="w-8 h-8 opacity-80" />
              <DollarSign className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-medium opacity-90 mb-1">Total Purchases</h3>
            <p className="text-3xl font-bold">Rs. {report.total_purchases?.toFixed(2) || '0.00'}</p>
          </div>

          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <DollarSign className="w-8 h-8 opacity-80" />
              <TrendingUp className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-medium opacity-90 mb-1">Gross Profit</h3>
            <p className="text-3xl font-bold">Rs. {report.gross_profit?.toFixed(2) || '0.00'}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default DayReport;