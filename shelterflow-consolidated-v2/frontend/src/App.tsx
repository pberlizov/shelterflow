import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ForecastOverview from './components/ForecastOverview';
import OrderManagement from './components/OrderManagement';

const queryClient = new QueryClient();

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'forecast' | 'orders'>('forecast');
  const [selectedShelter, setSelectedShelter] = useState<string>('shelter1');
  const [selectedItem, setSelectedItem] = useState<string>('blankets');

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-gray-100">
        <nav className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex">
                <div className="flex-shrink-0 flex items-center">
                  <h1 className="text-xl font-bold text-gray-900">ShelterFlow</h1>
                </div>
                <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                  <button
                    onClick={() => setActiveTab('forecast')}
                    className={`${
                      activeTab === 'forecast'
                        ? 'border-blue-500 text-gray-900'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                  >
                    Forecast Overview
                  </button>
                  <button
                    onClick={() => setActiveTab('orders')}
                    className={`${
                      activeTab === 'orders'
                        ? 'border-blue-500 text-gray-900'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                  >
                    Order Management
                  </button>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <select
                  value={selectedShelter}
                  onChange={(e) => setSelectedShelter(e.target.value)}
                  className="block w-40 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                >
                  <option value="shelter1">Shelter 1</option>
                  <option value="shelter2">Shelter 2</option>
                </select>
                <select
                  value={selectedItem}
                  onChange={(e) => setSelectedItem(e.target.value)}
                  className="block w-40 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                >
                  <option value="blankets">Blankets</option>
                  <option value="food">Food</option>
                  <option value="hygiene">Hygiene</option>
                </select>
              </div>
            </div>
          </div>
        </nav>

        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          {activeTab === 'forecast' ? (
            <ForecastOverview shelterId={selectedShelter} itemId={selectedItem} />
          ) : (
            <OrderManagement />
          )}
        </main>
      </div>
    </QueryClientProvider>
  );
};

export default App; 