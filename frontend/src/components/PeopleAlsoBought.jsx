import React, { useState, useEffect } from 'react'

import ProductCard from './ProductCard'
import LoadingSpinner from './LoadingSpinner'
import axiosInstance from '../lib/axios'
import toast from 'react-hot-toast'

const PeopleAlsoBought = () => {
  const [ recommendedProducts, setRecommendedProducts ] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => { 
    const getRecommendedProducts = async () => {
      setLoading(true);

      try {
        const res = await axiosInstance.get('/products/recommendation');
        setRecommendedProducts(res.data.data);
        setLoading(false);
      } catch (error) {
        toast.error(error.response.data.message || 'An error occurred. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    getRecommendedProducts();
  }, []);
  
  if(loading) return <LoadingSpinner />


  return (
    <div className='mt-8'>
      <h3 className="text-2xl font-semibold text-emerald-400">
        People also bought
      </h3>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {recommendedProducts?.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>

    </div>
  )
}

export default PeopleAlsoBought