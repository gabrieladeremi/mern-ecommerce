import { create } from 'zustand';
import axiosInstance from '../lib/axios';
import { toast } from 'react-hot-toast';

export const useUserStore = create((set, get) => ({
    user: null,
    loading: false,
    checkingAuth: true,

    login: async ({ email, password }) => {
        set({ loading: true });

        try {
            const response = await axiosInstance.post('/auth/login', { email, password });

            set({ user: response.data.user, loading: false });

            toast.success('Login successful');

        } catch (error) {
            set({ loading: false });
            toast.error(error.response.data.message || 'An error occurred. Please try again.');
        }
    },

    logout: async () => {
        try {
            await axiosInstance.post('/auth/logout');
            set({ user: null });
        } catch (error) {
            toast.error(error.response?.data?.message || 'An error occurred. Please try again.');
        }
    },

    signup: async ({ name, email, password, confirmPassword }) => {
        set({ loading: true });

        if (password !== confirmPassword) {
            set({ loading: false });
            return toast.error('Passwords do not match');
        }

        try {
            const response = await axiosInstance.post('/auth/signup', { name, email, password });

            set({ user: response.data.user, loading: false });

            toast.success('Account created successfully');

        } catch (error) {
            set({ loading: false });
            toast.error(error.response.data.error || 'An error occurred. Please try again.');
        }
    },

    checkAuth: async () => {
        set({ checkingAuth: true });

        try {
            const response = await axiosInstance.get('/auth/profile');

            set({ user: response.data.data, checkingAuth: false });

        } catch (error) {
            set({ checkingAuth: false, user: null });
            console.log(error.message);
        }
    },

    refreshToken: async () => {
        if (get().checkingAuth) return;

        set({ checkingAuth: true });

        try {
            const response = await axiosInstance.get('/auth/refresh-token');
            set({ checkingAuth: false });
            return response.data
        } catch (error) {
            set({ user: null, checkingAuth: false });
            throw error;
        }
    },
}));

let refreshPromise = null;

axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                if (refreshPromise) {
                    await refreshPromise;
                    return axiosInstance(originalRequest);
                } else {
                    refreshPromise = useUserStore.getState().refreshToken();
                    await refreshPromise;
                    refreshPromise = null;

                    return axiosInstance(originalRequest);
                }
            } catch (error) {
                useUserStore.getState().logout();
                return Promise.reject(error);
            }
        }

        return Promise.reject(error);
    }
);