import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'
import { DollarSign, Package, ShoppingCart, Users } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

import AnalyticsCard from './AnalyticsCard'
import axiosInstance from '../lib/axios'
import LoadingSpinner from './LoadingSpinner'

const AnalyticsTab = () => {
  const [analyticsData, setAnalyticsData] = useState({
    users: 0,
    products: 0,
    totalSales: 0,
    totalRevenue: 0
  });

  const [dailySalesData, setDailySalesData] = useState([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        const response = await axiosInstance.get('/analytics');
        setAnalyticsData(response.data.data.analyticsData);
        setDailySalesData(response.data.data.dailySalesData);
      } catch (error) {
        toast.error(error.response.data.message || 'An error occurred. Please try again.');
        setLoading(false);
      } finally {
        setLoading(false)
      }
    };

    fetchAnalyticsData();
  }, []);

  if (loading) return <LoadingSpinner />

  return (
    <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
        <AnalyticsCard
          title="Total Users"
          value={analyticsData.users.toLocaleString()}
          Icon={Users}
          color="from-emerald-500 to-teal-700"
        />
        <AnalyticsCard
          title="Products"
          value={analyticsData.products.toLocaleString()}
          Icon={null}
          color="from-emerald-500 to-green-700"
        />
        <AnalyticsCard
          title="Total Sales"
          value={analyticsData.totalSales.toLocaleString()}
          Icon={null}
          color="from-emerald-500 to-cyan-700"
        />
        <AnalyticsCard
          title="Total Revenue"
          value={`$${analyticsData.totalRevenue.toLocaleString()}`}
          Icon={null}
          color="from-emerald-500 to-lime-700"
        />
      </div>

      <motion.div
        className='bg-gray-800/60 rounded-lg p-6 shadow-lg'
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.25 }}
      >
        <ResponsiveContainer width='100%' height={400}>
          <LineChart data={dailySalesData}>
            <CartesianGrid strokeDasharray='3 3' />
            <XAxis dataKey='name' stroke='#D1D5DB' />
            <YAxis yAxisId='left' stroke='#D1D5DB' />
            <YAxis yAxisId='right' orientation='right' stroke='#D1D5DB' />
            <Tooltip />
            <Legend />
            <Line
              yAxisId='left'
              type='monotone'
              dataKey='sales'
              stroke='#10B981'
              activeDot={{ r: 8 }}
              name='Sales'
            />
            <Line
              yAxisId='right'
              type='monotone'
              dataKey='revenue'
              stroke='#3B82F6'
              activeDot={{ r: 8 }}
              name='Revenue'
            />
          </LineChart>
        </ResponsiveContainer>
      </motion.div>
    </div>
  );
}

export default AnalyticsTab