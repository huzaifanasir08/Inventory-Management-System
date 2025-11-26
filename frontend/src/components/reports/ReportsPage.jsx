import React, { useState } from 'react';
import { Calendar, TrendingUp, BarChart } from 'lucide-react';
import DayReport from './DayReport';
import PeriodReport from './PeriodReport';
import SummaryReport from './SummaryReport';

const ReportsPage = () => {
  const [activeTab, setActiveTab] = useState('day');

  const tabs = [
    { id: 'day', label: 'Day Report', icon: Calendar },
    { id: 'period', label: 'Period Report', icon: TrendingUp },
    { id: 'summary', label: 'Summary', icon: BarChart }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'day':
        return <DayReport />;
      case 'period':
        return <PeriodReport />;
      case 'summary':
        return <SummaryReport />;
      default:
        return <DayReport />;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">Reports</h1>
        <p className="text-gray-600 dark:text-gray-400">Analyze your business performance and trends</p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>

        <div className="p-6">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;