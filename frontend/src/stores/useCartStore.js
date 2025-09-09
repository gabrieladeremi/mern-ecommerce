import { create } from 'zustand';
import { toast } from 'react-hot-toast';
import axiosInstance from '../lib/axios';

export const useCartStore = create((set, get) => ({
    cart: [],
    coupon: null,
    total: 0,
    subTotal: 0,
    isCouponApplied: false,

    clearCart: async () => {
        set({ cart: [], coupon: null, total: 0, subTotal: 0, isCouponApplied: false });
    },

    getCartItems: async () => {
        try {
            const res = await axiosInstance.get('/cart/products');
            set({ cart: res.data.data });
            get().calculateTotals();
        } catch (error) {
            set({ cart: [] })
            toast.error(error.response.data.message || "An error occured");

        }
    },

    addToCart: async (product) => {
        try {
            await axiosInstance.post('/cart', { productId: product._id });
            toast.success('Product added to cart');

            set((prevState) => {
                const existingItem = prevState.cart.find(item => item._id === product._id);

                const newCart = existingItem
                    ?
                    prevState.cart.map((item) => (item._id === product._id ? { ...item, quantity: item.quantity + 1 } : item))
                    : [...prevState.cart, { ...product, quantity: 1 }];

                return { cart: newCart };
            });
            get().calculateTotals();
        } catch (error) {
            toast.error(error.response.data.message || "An error occured");
        }
    },

    calculateTotals: async () => {
        const { cart, coupon } = get();

        const subTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

        let total = subTotal;

        if (coupon) {
            const discount = subTotal * (coupon.discountPercentage / 100);

            total = subTotal - discount;
        }

        set({ subTotal, total });
    },

    getCoupon: async () => {
        try {
            const res = await axiosInstance.get('/coupons');

            set({ coupon: res.data.data });
        } catch (error) {
            console.log("Error fetching coupon:", error);
            
        }
    },

    applyCoupon: async (code) => {
        try {
            const res = await axiosInstance.post('/coupons/validate', { code });
            set({ coupon: res.data.data, isCouponApplied: true });
            get().calculateTotals();
            toast.success('Coupon applied successfully');
        } catch (error) {
            toast.error(error.response?.data?.message || "An error occured");
        }
    },

    removeCoupon: async () => { 
        set({ coupon: null, isCouponApplied: false });
        get().calculateTotals();
        toast.success('Coupon removed successfully');
    },

    removeFromCart: async (productId) => {
        try {
            await axiosInstance.delete('/cart', { productId: { productId } });
            set((prevState) => ({
                cart: prevState.cart.filter((item) => item._id !== productId)
            }));
            get().calculateTotals();
            toast.success('Product removed from cart');

        } catch (error) {
            toast.error(error.response.data.message || "An error occured");
        }
    },

    updateCartQuantity: async (productId, quantity) => {
        try {
            if (quantity === 0) {
                get().removeFromCart(productId);
                return;
            }

            await axiosInstance.patch(`cart/${productId}`, { quantity });
            set((prevState) => ({
                cart: prevState.cart.map((item) => (item._id === productId ? { ...item, quantity } : item))
            }));
            get().calculateTotals();
        } catch (error) {
            toast.error(error.response.data.message || "An error occured");
        }
    },
}))