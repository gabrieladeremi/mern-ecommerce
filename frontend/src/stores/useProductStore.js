import { create } from 'zustand';
import axiosInstance from '../lib/axios';
import { toast } from 'react-hot-toast';

export const useProductStore = create((set) => ({
    loading: false,
    products: [],
    setProducts: (products) => set({ products }),

    createProduct: async (productData) => {
        set({ loading: true });

        try {
            const res = await axiosInstance.post('/products', productData);

            set((prevState) => ({
                products: [...prevState.products, res.data.data],
                loading: false
            }));

            toast.success('Product created successfully');
        } catch (error) {
            toast.error(error.response.data.message || 'An error occurred. Please try again.');
            set({ loading: false });
        }
    },

    fetchAllProducts: async () => {
        set({ loading: true });
        try {
            const res = await axiosInstance.get('/products');
            set({ products: res.data.data, loading: false });
        } catch (error) {
            toast.error(error.response.data.message || 'An error occurred. Please try again.');
            set({ loading: false });
        }
    },

    fetchProductsByCategory: async (category) => {
        set({ loading: true });
        try {
            const res = await axiosInstance.get(`/products/category/${category}`);
            set({ products: res.data.data, loading: false });
        } catch (error) {
            toast.error(error.response.data.message || 'An error occurred. Please try again.');
            set({ loading: false });
        }
    },

    deleteProduct: async (productId) => {
        set({ loading: true });
        try {
            await axiosInstance.delete(`/products/${productId}`);
            set((prevProducts) => ({
                products: prevProducts.products.filter((product) => product._id !== productId),
                loading: false
            }));
            toast.success('Product deleted successfully');
        } catch (error) {
            toast.error(error.response.data.message || 'An error occurred. Please try again.');
            set({ loading: false });
        }
    },

    toggleFeaturedProduct: async (productId) => {
        set({ loading: true });
        try {
            const res = await axiosInstance.patch(`/products/${productId}`);
            set((prevProducts) => ({
                products: prevProducts.products.map((product) => {
                    if (product._id === productId) {
                        return { ...product, isFeatured: res.data.data.isFeatured };
                    }
                    return product;
                }),
                loading: false
            }))
        } catch (error) {
            toast.error(error.response.data.message || 'An error occurred. Please try again.');
            set({ loading: false });
        }
    },

    fetchFeaturedProduct: async () => {
        set({ loading: true });
        try {
            const res = await axiosInstance.get('/products/featured');
            set({ products: res.data.data, loading: false });
        } catch (error) {
            set({ loading: false });
            console.log("error fetching featured products:", error);
        }
    }
}));