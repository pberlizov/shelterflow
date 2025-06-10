import React, { useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

interface ForecastData {
  timestamp: string;
  predicted: number;
  actual: number;
}

interface ForecastOverviewProps {
  shelterId: string;
  itemId: string;
}

const ForecastOverview: React.FC<ForecastOverviewProps> = ({ shelterId, itemId }) => {
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });

  const { data: forecastData, isLoading, error } = useQuery<ForecastData[]>({
    queryKey: ['forecast', shelterId, itemId, dateRange],
    queryFn: async () => {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/forecast`, {
        params: {
          shelter_id: shelterId,
          item_id: itemId,
          start_date: dateRange.start,
          end_date: dateRange.end
        }
      });
      return response.data;
    }
  });

  if (isLoading) return <div className="flex items-center justify-center h-64">Loading...</div>;
  if (error) return <div className="text-red-500">Error loading forecast data</div>;

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <div className="mb-4">
        <h2 className="text-xl font-semibold mb-2">Forecast Overview</h2>
        <div className="flex gap-4">
          <input
            type="date"
            value={dateRange.start}
            onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
            className="border rounded px-2 py-1"
          />
          <input
            type="date"
            value={dateRange.end}
            onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
            className="border rounded px-2 py-1"
          />
        </div>
      </div>

      <div className="h-96">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={forecastData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="timestamp"
              tickFormatter={(value) => new Date(value).toLocaleDateString()}
            />
            <YAxis />
            <Tooltip
              labelFormatter={(value) => new Date(value).toLocaleDateString()}
              formatter={(value: number) => [value.toFixed(2), '']}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="predicted"
              stroke="#8884d8"
              name="Predicted"
              strokeWidth={2}
            />
            <Line
              type="monotone"
              dataKey="actual"
              stroke="#82ca9d"
              name="Actual"
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4">
        <div className="p-4 bg-gray-50 rounded">
          <h3 className="font-medium mb-2">Forecast Accuracy</h3>
          <div className="text-2xl font-bold text-blue-600">
            {calculateAccuracy(forecastData)}%
          </div>
        </div>
        <div className="p-4 bg-gray-50 rounded">
          <h3 className="font-medium mb-2">Average Daily Usage</h3>
          <div className="text-2xl font-bold text-green-600">
            {calculateAverageUsage(forecastData)}
          </div>
        </div>
      </div>
    </div>
  );
};

const calculateAccuracy = (data: ForecastData[] | undefined): number => {
  if (!data) return 0;
  
  const errors = data.map(point => 
    Math.abs(point.predicted - point.actual) / point.actual
  );
  
  const mape = errors.reduce((sum, error) => sum + error, 0) / errors.length;
  return Math.round((1 - mape) * 100);
};

const calculateAverageUsage = (data: ForecastData[] | undefined): string => {
  if (!data) return '0';
  
  const avg = data.reduce((sum, point) => sum + point.actual, 0) / data.length;
  return avg.toFixed(1);
};

export default ForecastOverview; 