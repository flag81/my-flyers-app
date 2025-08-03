import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Dimensions,
  StyleSheet,
  ActivityIndicator
} from 'react-native';
import ImageViewing from 'react-native-image-viewing';

type Props = {
  item: any;
  openModal: (imageUrl: string, product: any) => void;
  handleToggleFavorite: (productId: number, productIsCurrentlyFavorite: boolean) => void;
};

// Map store logo filenames from the database to local assets
const storeLogos: { [key: string]: any } = {
  'spar.png': require('../../assets/spar.png'),
  'vivafresh.jpeg': require('../../assets/vivafresh.jpeg'),
  'interex.png': require('../../assets/interex.png'),
  // Add other store logos here as needed
};


const ProductCard: React.FC<Props> = ({ item, openModal, handleToggleFavorite }) => {

  //console.log('ProductCard item:', item);

  const [imageHeight, setImageHeight] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [zoomVisible, setZoomVisible] = useState(false);



  


 const cardWidth = Dimensions.get('window').width - 32;

  const imageUrl = item.image_url.startsWith('http')
    ? item.image_url
    : `${process.env.EXPO_PUBLIC_API_URL}/uploads/${item.image_url}`;

  useEffect(() => {
    let isMounted = true;

    Image.getSize(
      imageUrl,
      (width, height) => {
        if (!isMounted) return;
        const cardWidth = Dimensions.get('window').width - 32;
        const calculatedHeight = cardWidth * (height / width);
        setImageHeight(calculatedHeight);
        setLoading(false);
      },
      () => {
        if (isMounted) {
          setImageHeight(200);
          setLoading(false);
        }
      }
    );

    return () => {
      isMounted = false;
    };
  }, [item.image_url]);

  return (
    <View style={
      styles.productCard}>



    {loading ? (
      <View style={[styles.imageSkeleton, { height: cardWidth }]}>
        <ActivityIndicator size="large" color="#999" />
      </View>
    ) : (
      <TouchableOpacity
        style={{ width: '100%', height: imageHeight! }}
        onPress={() => setZoomVisible(true)}
      >
        <Image
          source={{ uri: imageUrl }}
          style={{ width: '100%', height: '100%' }}
          resizeMode="contain"
        />
      </TouchableOpacity>
    )}

      <View style={styles.infoContainer}>
        <Text style={styles.productDescription}>{item.product_description}</Text>
        <Text style={styles.productPrice}>
          {item.old_price > 0 ? `${item.old_price}€ → ` : ''}
          <Text style={{ color: 'green' }}>{item.new_price > 0 ? `${item.new_price}€ ` : ''}</Text>
        </Text>


        <Text style={{ fontSize: 12, color: '#666' }}>
          Dyqani: {item.storeName || 'U'}
        </Text>

        {item.sale_end_date && (
          <Text style={{ fontSize: 12, color: '#666' }}>
            {/* Sale End Date in format DD/MM/YYYY */}
            Oferta deri: {new Date(item.sale_end_date).toLocaleDateString('en-GB', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric'
            })}

          </Text>
        )}

        {/* ⭐ Favorite Button */}


        <TouchableOpacity
          onPress={() => handleToggleFavorite(item.productId, item.isFavorite)}
          style={styles.favoriteButton}
        >
          <Text style={{ color: item.isFavorite ? 'gold' : 'gray' }}>
            {item.isFavorite ? '★ Largo nga Favoritet' : '☆ Shto Favorit'}
          </Text>
        </TouchableOpacity>
      </View>



      {/* 🔍 Fullscreen Zoom Viewer */}
      <ImageViewing
        images={[{ uri: imageUrl }]}
        imageIndex={0}
        visible={zoomVisible}
        onRequestClose={() => setZoomVisible(false)}
        backgroundColor="black"
        FooterComponent={() => (
          <View style={footerStyles.container}>
            {/* Product Description */}
            <Text style={footerStyles.description}>{item.product_description}</Text>

            {/* Price */}
            <Text style={footerStyles.price}>
              {item.old_price > 0 ? `${item.old_price}€ → ` : ''}
              <Text style={footerStyles.salePrice}>{item.new_price > 0 ? `${item.new_price}€ ` : ''}</Text>
            </Text>




            {/* Store and Sale Date */}
            <Text style={footerStyles.details}>
              Dyqani: {item.storeName || 'N/A'}
            </Text>
            {item.sale_end_date && (
              <Text style={footerStyles.details}>
                Oferta deri: {new Date(item.sale_end_date).toLocaleDateString('en-GB', {
                  day: '2-digit', month: '2-digit', year: 'numeric'
                })}
              </Text>
            )}

            {/* Favorite Button */}
            <TouchableOpacity
              onPress={() => handleToggleFavorite(item.productId, item.isFavorite)}
              style={footerStyles.favoriteButton}
            >
              <Text style={[footerStyles.favoriteText, { color: item.isFavorite ? 'gold' : '#ccc' }]}>
                {item.isFavorite ? '★ Largo nga Favoritet' : '☆ Shto Favorit'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      />


    </View>
  );
};

// Styles for the main card
const styles = StyleSheet.create({
  productCard: {
    width: '100%',
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 16,
    backgroundColor: '#fff'
  },
  imageSkeleton: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f2f2f2'
  },
  infoContainer: {
    padding: 8
  },
  productDescription: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4
  },
  productPrice: {
    fontSize: 14,
    marginBottom: 6
  },
  favoriteButton: {
    marginTop: 4
  }
});

// Styles for the ImageViewing Footer
const footerStyles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 40, // Extra padding for home bar on iOS/Android
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  description: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  price: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 12,
  },
  salePrice: {
    color: '#4CAF50', // A light green
    fontWeight: 'bold',
  },
  details: {
    color: '#D0D0D0', // A light gray
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 4,
  },
  favoriteButton: {
    marginTop: 12,
    alignSelf: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  favoriteText: {
    fontSize: 14,
  }
});


export default React.memo(ProductCard);
