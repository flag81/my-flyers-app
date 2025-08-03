// filepath: src/services/api.ts
import apiService from './apiService'; // Import the new service

// TODO: Implement API calls
// src/services/api.ts
const API_URL = process.env.EXPO_PUBLIC_API_URL;

export const getProducts = async ({ pageParam = 1, queryKey }: any) => {
  const [, userId, storeId, isFavorite, onSale, keyword] = queryKey;

  const params = new URLSearchParams({ page: pageParam });
  if (userId) params.append('userId', userId.toString());
  if (storeId) params.append('storeId', storeId.toString());
  if (isFavorite) params.append('isFavorite', 'true');
  if (onSale) params.append('onSale', 'true');
  if (keyword) params.append('keyword', keyword);

  // Use the pre-configured axios instance
  const res = await apiService.get('/getProducts', { params });

  const json = res.data;
  return {
    products: json.data ?? [],
    nextPage: json.nextPage
  };
};

export const getProductsByIds = async (productIds: number[]) => {
  if (!productIds || productIds.length === 0) {
    return [];
  }
  const res = await apiService.get(`/products-by-ids?ids=${productIds.join(',')}`);
  return res.data;
};

export const getStores = async () => {
  const res = await apiService.get('/getStores');
  return res.data;
};