import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, Button, TouchableOpacity, FlatList, Image, StyleSheet, ActivityIndicator, SafeAreaView } from 'react-native';
import { useInfiniteQuery, useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { getProducts, getStores, getProductsByIds } from '../services/api';
import ProductModal from '../components/ProductModal';
import FlyerSlider from '../components/FlyerSlider';
import RegistrationModal from '../components/RegistrationModal';
import ProductCard from '../components/ProductCard';
import { useAuth } from '../hooks/useAuth';
import apiService from '../services/apiService';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';



// Define the type for the navigator's screen list
type RootTabParamList = {
  Home: {  isFavorites?: boolean; onSale?: boolean; notificationProductIds?: number[] };
  Favorites: { isFavorites?: boolean };
  OnSale: { isFavorites?: boolean };
};

// Use BottomTabScreenProps for type safety
type Props = BottomTabScreenProps<RootTabParamList, 'Home' | 'Favorites' | 'OnSale'>;


const HomeScreen: React.FC<Props> = ({ route }: Props) => {

    const { isFavorites: routeIsFavorites, onSale: routeOnSale, notificationProductIds: routeProductIds } = route.params || {};
  // 
  // Auth hook
  const {
    userId,
    checkUserSession,
        setUserId,
    setIsLoggedIn,
    setEmail
  } = useAuth();

  // State
  const [stores, setStores] = useState<any[]>([]);
  const [selectedStore, setSelectedStore] = useState<number | null>(null);
  const [selectedStoreName, setSelectedStoreName] = useState<string>('');
  const [isFavorite, setIsFavorite] = useState(routeIsFavorites || false);
  const [onSale, setOnSale] = useState(routeOnSale || false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [notificationProducts, setNotificationProducts] = useState<any[]>([]);

  // --- NEW: Query for fetching products from a notification ---
  const { data: fetchedNotificationProducts, isLoading: isLoadingNotificationProducts } = useQuery({
    queryKey: ['notificationProducts', routeProductIds],
    queryFn: () => getProductsByIds(routeProductIds!),
    enabled: !!routeProductIds && routeProductIds.length > 0, // Only run if IDs are present
  });

  // State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalImageUrl, setModalImageUrl] = useState('');
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [modalProduct, setModalProduct] = useState<any>({});
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  // Add this useEffect to sync state with route params
  useEffect(() => {
    setIsFavorite(route.params?.isFavorites || false);
    setOnSale(route.params?.onSale || false);
    // Set notification products when they are fetched
    if (fetchedNotificationProducts) {
      setNotificationProducts(fetchedNotificationProducts);
    }
  }, [route.params, fetchedNotificationProducts]);


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
    if (selectedStore && selectedStoreName) filters.push(`Dyqani: ${selectedStoreName}`);
    if (searchKeyword.length > 2) filters.push(`Fjalë kyçe: "${searchKeyword}"`);
    setActiveFilters(filters);
  }, [isFavorite, onSale, selectedStore, selectedStoreName, searchKeyword]);

  // Toggle favorite mutation
  const toggleFavMutation = useMutation({
    mutationFn: async ({ productId, productIsCurrentlyFavorite }: { productId: number; productIsCurrentlyFavorite: boolean }) => {
      console.log('Toggling favorite for product:', productId, 'Current state:', productIsCurrentlyFavorite);

      if (productIsCurrentlyFavorite) {
        // Use the pre-configured axios instance which includes the token
        const res = await apiService.delete('/removeFavorite', {
          data: { productId } // Pass productId in the request body for DELETE
        });
        return res.data;
      } else {
        // Use the pre-configured axios instance which includes the token
        const res = await apiService.post('/addFavorite', {
          productId // Pass productId in the request body for POST
        });
        return res.data;
      }
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

  // Create a set of IDs from the notification products for efficient lookup.
  const notificationProductIdsSet = new Set(notificationProducts.map(p => p.productId));

  // Filter the main product list to exclude any products that are already shown in the notification section.
  const filteredAllProducts = allProducts.filter(p => !notificationProductIdsSet.has(p.productId));

  // Now, create the on-sale and not-on-sale lists from the filtered products.
  const onSaleProducts = filteredAllProducts.filter((p) => p.productOnSale);
  const notOnSaleProducts = filteredAllProducts.filter((p) => !p.productOnSale);


    const combinedProducts = [
      // Prepend notification products if they exist
      ...notificationProducts.map((p) => ({ ...p, section: 'Nga Njoftimi' })),
      ...onSaleProducts.map((p) => ({ ...p, section: 'Në Ofertë' })),
      ...notOnSaleProducts.map((p) => ({ ...p, section: 'Skaduar' }))
    ];



  return (

    <SafeAreaView style={styles.container}>
   


      {/* Search */}
      <View style={styles.row}>
        <View style={styles.searchContainer}>
          <TextInput
            placeholder="Kerko produkte..."
            style={styles.input}
            value={searchKeyword}
            onChangeText={setSearchKeyword}
            onSubmitEditing={() => queryClient.invalidateQueries({ queryKey: productsQueryKey })}
          />
          
            <TouchableOpacity onPress={() => setSearchKeyword('')} style={styles.clearButton}>
              <Ionicons name="close-circle" size={22} color="#888" />
            </TouchableOpacity>
          
        </View>

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
            {item.section}
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
    searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    marginRight: 8,
  },
    clearButton: {
    paddingRight: 8,
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

  marginHorizontal: 4,
  borderRadius: 5,
  justifyContent: 'center', // ✅ vertically center text
  alignItems: 'center',
    minHeight: 40 ,
    maxHeight: 40,
  // add border color 
  borderWidth: 1,
  borderColor: '#ccc',

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
    fontSize: 18, fontWeight: 'bold', marginVertical: 8, paddingHorizontal: 8, backgroundColor: '#f0f0f0', color: '#333'
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
