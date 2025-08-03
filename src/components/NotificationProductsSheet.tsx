import React from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, Image } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import apiService from '../services/apiService';



interface Product {
  productId: number;
  product_description: string;
  sale_price: number;
  image_url: string;
}
/**
 * Fetches products by their IDs from the API.
 * @param productIds - Array of product IDs to fetch.
 * @returns Promise resolving to an array of products.
 */

const fetchProductsByIds = async (productIds: number[]): Promise<Product[]> => {
  if (productIds.length === 0) return [];
  const { data } = await apiService.get(`/products-by-ids?ids=${productIds.join(',')}`);
  return data;
};

interface NotificationProductsSheetProps {
  productIds: number[];
}

const NotificationProductsSheet: React.FC<NotificationProductsSheetProps> = ({ productIds }) => {
  const { data: products, isLoading, isError } = useQuery({
    queryKey: ['products', productIds],
    queryFn: () => fetchProductsByIds(productIds),
    enabled: productIds.length > 0, // Only run the query if there are IDs
  });

  if (isLoading) {
    return <ActivityIndicator size="large" style={{ marginVertical: 40 }} />;
  }

  if (isError) {
    return <Text style={styles.infoText}>Gabim gjatë ngarkimit të produkteve.</Text>;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Oferta Speciale për Ju</Text>
      <FlatList
        data={products}
        keyExtractor={(item) => item.productId.toString()}
        renderItem={({ item }) => (
          <View style={styles.productItem}>
            <Image source={{ uri: item.image_url }} style={styles.productImage} />
            <View style={styles.productDetails}>
              <Text style={styles.productDescription}>{item.product_description}</Text>
              <Text style={styles.productPrice}>Çmimi: {item.sale_price} LEK</Text>
            </View>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.infoText}>Nuk u gjetën produkte.</Text>}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    flex: 1,
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  infoText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#666',
  },
  productItem: {
    flexDirection: 'row',
    marginBottom: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    overflow: 'hidden',
    elevation: 2,
  },
  productImage: {
    width: 100,
    height: 100,
  },
  productDetails: {
    flex: 1,
    padding: 12,
    justifyContent: 'center',
  },
  productDescription: {
    fontSize: 16,
    fontWeight: '600',
  },
  productPrice: {
    fontSize: 14,
    color: 'green',
    marginTop: 4,
  },
});

export default NotificationProductsSheet;