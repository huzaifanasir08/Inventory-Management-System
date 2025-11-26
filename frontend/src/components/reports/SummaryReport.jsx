import React, { useState } from 'react';
import { BarChart, DollarSign, TrendingUp, Package } from 'lucide-react';
import api from '../../api';

const SummaryReport = () => {
  const [reportType, setReportType] = useState('month');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchReport = async () => {
    try {
      setLoading(true);
      const response = await api.reports.summary(reportType, date);
      const data = response.data;

      const normalized = {
        type: data.type,
        start: data.start,
        end: data.end,
        sales: data.sales_total,
        purchases: data.purchases_total,
        profit: data.gross_profit_approx,
        cogs: data.cogs_approx
      };

      setReport(normalized);
    } catch (error) {
      console.error('Error fetching summary report:', error);
      alert('Failed to fetch report');
    } finally {
      setLoading(false);
    }
  };

  const getReportTitle = () => {
    switch (reportType) {
      case 'day': return 'Daily Summary';
      case 'week': return 'Weekly Summary';
      case 'month': return 'Monthly Summary';
      case 'year': return 'Yearly Summary';
      default: return 'Summary Report';
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Report Type
          </label>
          <select
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-600 focus:border-transparent"
          >
            <option value="day">Daily</option>
            <option value="week">Weekly</option>
            <option value="month">Monthly</option>
            <option value="year">Yearly</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Reference Date
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-600 focus:border-transparent"
          />
        </div>
        <div className="flex items-end">
          <button
            onClick={fetchReport}
            disabled={loading}
            className="w-full px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Loading...' : 'Generate Report'}
          </button>
        </div>
      </div>

      {report && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
            <div className="flex items-center gap-3 mb-2">
              <BarChart className="w-6 h-6" />
              <h2 className="text-2xl font-bold">{getReportTitle()}</h2>
            </div>
            <p className="text-sm opacity-90">
              {new Date(date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-4">
                <div className="p-4 rounded-xl bg-green-100 dark:bg-green-900/30">
                  <DollarSign className="w-8 h-8 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h3 className="text-sm text-gray-600 dark:text-gray-400 mb-1">Sales Revenue</h3>
                  <p className="text-3xl font-bold text-gray-800 dark:text-white">
                    Rs. {report.sales?.toFixed(2) || '0.00'}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-4">
                <div className="p-4 rounded-xl bg-orange-100 dark:bg-orange-900/30">
                  <Package className="w-8 h-8 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <h3 className="text-sm text-gray-600 dark:text-gray-400 mb-1">Purchase Cost</h3>
                  <p className="text-3xl font-bold text-gray-800 dark:text-white">
                    Rs. {report.purchases?.toFixed(2) || '0.00'}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-4">
                <div className="p-4 rounded-xl bg-blue-100 dark:bg-blue-900/30">
                  <TrendingUp className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="text-sm text-gray-600 dark:text-gray-400 mb-1">Net Profit</h3>
                  <p className="text-3xl font-bold text-gray-800 dark:text-white">
                    Rs. {report.profit?.toFixed(2) || '0.00'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Performance Metrics</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Profit Margin</span>
                  <span className="text-sm font-semibold text-gray-800 dark:text-white">
                    {report.sales > 0 ? ((report.profit / report.sales) * 100).toFixed(2) : '0.00'}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                    style={{
                      width: `${report.sales > 0 ? Math.min((report.profit / report.sales) * 100, 100) : 0}%`
                    }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Cost vs Revenue</span>
                  <span className="text-sm font-semibold text-gray-800 dark:text-white">
                    {report.sales > 0 ? ((report.purchases / report.sales) * 100).toFixed(2) : '0.00'}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-orange-600 h-2 rounded-full transition-all duration-500"
                    style={{
                      width: `${report.sales > 0 ? Math.min((report.purchases / report.sales) * 100, 100) : 0}%`
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
              <h4 className="text-sm font-semibold text-green-800 dark:text-green-300 mb-2">Revenue Status</h4>
              <p className="text-xs text-green-700 dark:text-green-400">
                {report.profit > 0
                  ? `✓ Profitable period with ${((report.profit / report.sales) * 100).toFixed(1)}% margin`
                  : '⚠ Operating at a loss'}
              </p>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
              <h4 className="text-sm font-semibold text-blue-800 dark:text-blue-300 mb-2">Report Period</h4>
              <p className="text-xs text-blue-700 dark:text-blue-400">
                {reportType.charAt(0).toUpperCase() + reportType.slice(1)} analysis based on {new Date(date).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SummaryReport;