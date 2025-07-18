import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, Button, TouchableOpacity, FlatList, Image, StyleSheet, ActivityIndicator, SafeAreaView } from 'react-native';
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getProducts, getStores } from '../services/api';
import ProductModal from '../components/ProductModal';
import FlyerSlider from '../components/FlyerSlider';
import RegistrationModal from '../components/RegistrationModal';
import ProductCard from '../components/ProductCard';
import { useAuth } from '../hooks/useAuth';



const HomeScreen = () => {
  // Auth hook
  const {
    userId,
    isLoggedIn,
    email,
    setUserId,
    setIsLoggedIn,
    setEmail,
    checkUserSession
  } = useAuth();

  // State
  const [stores, setStores] = useState<any[]>([]);
  const [selectedStore, setSelectedStore] = useState<number | null>(null);
  const [selectedStoreName, setSelectedStoreName] = useState<string>('');
  const [isFavorite, setIsFavorite] = useState(false);
  const [onSale, setOnSale] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalImageUrl, setModalImageUrl] = useState('');
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [modalProduct, setModalProduct] = useState<any>({});
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);




  const queryClient = useQueryClient();
  const productsQueryKey = [
    'products',
    userId,
    selectedStore,
    isFavorite,
    onSale,
    searchKeyword?.length > 2 ? searchKeyword : ''
  ];

  // Infinite query
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    isLoading
  } = useInfiniteQuery({
    queryKey: productsQueryKey,
    queryFn: getProducts,
    getNextPageParam: (lastPage) => lastPage.nextPage,
    initialPageParam: 1,
    enabled: true
  });

  // Fetch stores
  useEffect(() => {
    const fetchStores = async () => {
      const storeData = await getStores();
      setStores(storeData);
    };
    fetchStores();
  }, []);

  // Active filters effect
  useEffect(() => {
    const filters: string[] = [];
    if (isFavorite) filters.push('Favorites');
    if (onSale) filters.push('On Sale');
    if (selectedStore && selectedStoreName) filters.push(`Store: ${selectedStoreName}`);
    if (searchKeyword.length > 2) filters.push(`Keyword: "${searchKeyword}"`);
    setActiveFilters(filters);
  }, [isFavorite, onSale, selectedStore, selectedStoreName, searchKeyword]);

  // Toggle favorite mutation
  const toggleFavMutation = useMutation({
    mutationFn: async ({ productId, productIsCurrentlyFavorite }: { productId: number; productIsCurrentlyFavorite: boolean }) => {
      const url = productIsCurrentlyFavorite ? '/removeFavorite' : '/addFavorite';
      const method = productIsCurrentlyFavorite ? 'DELETE' : 'POST';

      const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}${url}`, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ userId, productId })
      });

      if (!res.ok) throw new Error('Network error');
      return res.json();
    },
    onMutate: async ({ productId, productIsCurrentlyFavorite }) => {
      await queryClient.cancelQueries({ queryKey: productsQueryKey });
      const previous = queryClient.getQueryData(productsQueryKey);
      queryClient.setQueryData(productsQueryKey, (old: any) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((page: any) => ({
            ...page,
            products: page.products.map((p: any) =>
              p.productId === productId ? { ...p, isFavorite: !productIsCurrentlyFavorite } : p
            )
          }))
        };
      });
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(productsQueryKey, context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: productsQueryKey });
    }
  });

  const handleToggleFavorite = async (productId: number, productIsCurrentlyFavorite: boolean) => {
    if (!userId) {
      await checkUserSession();
      return;
    }
    toggleFavMutation.mutate({ productId, productIsCurrentlyFavorite });
  };

  const openModal = (imageUrl: string, product: any) => {
    setModalImageUrl(imageUrl);
    setIsImageLoaded(false);
    setModalProduct(product);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalImageUrl('');
  };

  // Products
  const allProducts = data?.pages.flatMap((p) => p.products) ?? [];
  const onSaleProducts = allProducts.filter((p) => p.productOnSale);
  const notOnSaleProducts = allProducts.filter((p) => !p.productOnSale);


    const combinedProducts = [
  ...onSaleProducts.map((p) => ({ ...p, section: 'On Sale' })),
  ...notOnSaleProducts.map((p) => ({ ...p, section: 'Expired' }))
];



  return (

    <SafeAreaView style={styles.container}>
   


      {/* Search */}
      <View style={styles.row}>
        <TextInput
          placeholder="Kerko produkte..."
          style={styles.input}
          value={searchKeyword}
          onChangeText={setSearchKeyword}
          onSubmitEditing={() => queryClient.invalidateQueries({ queryKey: productsQueryKey })}
        />

        <TouchableOpacity  style={styles.storeButton}
        
        onPress={() => queryClient.invalidateQueries({ queryKey: productsQueryKey })}>
          <Text style={{ color: 'black' }}>Kerko</Text>
        </TouchableOpacity>
      </View>



      {/* Store filter */}
      <FlatList
        data={stores}
        horizontal
        keyExtractor={(item) => item.storeId.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.storeButton,
              selectedStore === item.storeId && styles.storeButtonSelected
            ]}
            onPress={() => {
              if (selectedStore === item.storeId) {
                // If the same store is clicked again, reset the filter
                setSelectedStore(null);
                setSelectedStoreName('');
              } else {
                // Otherwise, set the new store filter
                setSelectedStore(item.storeId);
                setSelectedStoreName(item.storeName);
              }
            }}
            >
              
          
            <Text>{item.storeName}</Text>
          </TouchableOpacity>
        )}
        style={styles.storeList}
      />

      {/* Active filters */}
      <View style={styles.filtersRow}>
        {activeFilters.map((filter, index) => (
          <View key={index} style={styles.filterTag}>
            <Text>{filter}</Text>
          </View>
        ))}
      </View>

<FlatList
  data={combinedProducts}
  keyExtractor={(item) => item.productId.toString()}
  renderItem={({ item, index }) => {
    const showSectionTitle =
      index === 0 || item.section !== combinedProducts[index - 1].section;

    return (
      <View>
        {showSectionTitle && (
          <Text style={styles.sectionTitle}>
            {item.section === 'On Sale' ? '🔥 On Sale' : 'Expired ❌'}
          </Text>
        )}
        <ProductCard
          item={item}
          openModal={openModal}
          handleToggleFavorite={handleToggleFavorite}
        />
      </View>
    );
  }}
  onEndReached={() => {
    if (hasNextPage) fetchNextPage();
  }}
  onEndReachedThreshold={0.8}
  initialNumToRender={10}
  maxToRenderPerBatch={10}
  windowSize={5}
/>

      {/* Product Modal */}
      <ProductModal
        isVisible={isModalOpen}
        onClose={closeModal}
        modalImageUrl={modalImageUrl}
        isImageLoaded={isImageLoaded}
        setIsImageLoaded={setIsImageLoaded}
        modalProduct={modalProduct}
        handleToggleFavorite={handleToggleFavorite}
      />

      {/* Registration Modal */}
      <RegistrationModal
        show={showRegisterModal}
        setShowRegisterModal={setShowRegisterModal}
        setUserId={setUserId}
        setIsLoggedIn={setIsLoggedIn}
        setEmail={setEmail}
      />
 

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    paddingTop: 34, // Add top padding for safe area
    paddingLeft: 16, // Add left padding if needed
    backgroundColor: '#fff'
  },
  title: {
    fontSize: 24, fontWeight: 'bold', marginBottom: 16
  },
  row: {
    flexDirection: 'row', alignItems: 'center', marginBottom: 8
  },
  input: {
    flex: 1, borderWidth: 1, borderColor: '#ccc', padding: 8, marginRight: 8, borderRadius: 4
  },
  storeList: {
    marginVertical: 8,
    height: 48,
    maxHeight: 48,
    minHeight: 48,
  },
  storeButton: {
     paddingHorizontal: 12,
  paddingVertical: 8, // ✅ ensures vertical space for text
  backgroundColor: '#eee',
  marginHorizontal: 4,
  borderRadius: 4,
  justifyContent: 'center', // ✅ vertically center text
  alignItems: 'center',
    minHeight: 40 ,
    maxHeight: 40,
  },
  storeButtonSelected: {
    backgroundColor: '#cceeff'
  },
  filtersRow: {
    flexDirection: 'row', flexWrap: 'wrap', marginBottom: 12, width: '100%'
  },
  filterTag: {
    padding: 6, backgroundColor: '#f0f0f0', borderRadius: 12, marginRight: 8, marginBottom: 8
  },
  sectionTitle: {
    fontSize: 18, fontWeight: 'bold', marginVertical: 8
  },
  productCard: {
    
    height: 600,
    padding: 8, 
    borderWidth: 1, 
    borderColor: '#ccc', 
    borderRadius: 8, 
    marginBottom: 8,
    overflow: 'hidden' ,
  },
  productImage: {
    width: '100%', height:"100%", marginBottom: 8
  },
  productDescription: {
    fontSize: 14, fontWeight: 'bold', marginBottom: 4
  },
  productPrice: {
    fontSize: 14
  }
});

export default HomeScreen;
