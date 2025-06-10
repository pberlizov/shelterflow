import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

interface Order {
  id: string;
  shelter_id: string;
  item_id: string;
  order_quantity: number;
  current_inventory: number;
  forecasted_usage: number;
  days_until_stockout: number;
  status: 'pending' | 'approved' | 'cancelled';
  timestamp: string;
}

const OrderManagement: React.FC = () => {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'cancelled'>('all');

  const { data: orders, isLoading } = useQuery<Order[]>({
    queryKey: ['orders', filter],
    queryFn: async () => {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/orders`, {
        params: { status: filter !== 'all' ? filter : undefined }
      });
      return response.data;
    }
  });

  const approveMutation = useMutation({
    mutationFn: (orderId: string) =>
      axios.post(`${import.meta.env.VITE_API_URL}/api/orders/${orderId}/approve`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    }
  });

  const cancelMutation = useMutation({
    mutationFn: (orderId: string) =>
      axios.post(`${import.meta.env.VITE_API_URL}/api/orders/${orderId}/cancel`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    }
  });

  if (isLoading) return <div className="flex items-center justify-center h-64">Loading...</div>;

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-xl font-semibold">Order Management</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded ${
              filter === 'all' ? 'bg-blue-500 text-white' : 'bg-gray-100'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-3 py-1 rounded ${
              filter === 'pending' ? 'bg-blue-500 text-white' : 'bg-gray-100'
            }`}
          >
            Pending
          </button>
          <button
            onClick={() => setFilter('approved')}
            className={`px-3 py-1 rounded ${
              filter === 'approved' ? 'bg-blue-500 text-white' : 'bg-gray-100'
            }`}
          >
            Approved
          </button>
          <button
            onClick={() => setFilter('cancelled')}
            className={`px-3 py-1 rounded ${
              filter === 'cancelled' ? 'bg-blue-500 text-white' : 'bg-gray-100'
            }`}
          >
            Cancelled
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Shelter
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Item
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Quantity
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Current Inventory
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Days Until Stockout
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {orders?.map((order) => (
              <tr key={order.id}>
                <td className="px-6 py-4 whitespace-nowrap">{order.shelter_id}</td>
                <td className="px-6 py-4 whitespace-nowrap">{order.item_id}</td>
                <td className="px-6 py-4 whitespace-nowrap">{order.order_quantity}</td>
                <td className="px-6 py-4 whitespace-nowrap">{order.current_inventory}</td>
                <td className="px-6 py-4 whitespace-nowrap">{order.days_until_stockout}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      order.status === 'approved'
                        ? 'bg-green-100 text-green-800'
                        : order.status === 'cancelled'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {order.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  {order.status === 'pending' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => approveMutation.mutate(order.id)}
                        className="text-green-600 hover:text-green-900"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => cancelMutation.mutate(order.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OrderManagement; 