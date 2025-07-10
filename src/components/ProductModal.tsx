// TODO: Implement ProductModal.tsximport React from 'react';
import { Modal, View, Text, Image, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';

type Props = {
  isVisible: boolean;
  onClose: () => void;
  modalImageUrl: string;
  isImageLoaded: boolean;
  setIsImageLoaded: (val: boolean) => void;
  modalProduct: any;
  handleToggleFavorite: (productId: number, isFavorite: boolean) => void;
  handleFlyerModal?: (flyerBookId: number) => void;
};

const ProductModal: React.FC<Props> = ({
  isVisible,
  onClose,
  modalImageUrl,
  isImageLoaded,
  setIsImageLoaded,
  modalProduct,
  handleToggleFavorite,
  handleFlyerModal
}) => {
  if (!isVisible) return null;

  return (
    <Modal animationType="fade" transparent visible={isVisible} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          {!isImageLoaded && <ActivityIndicator size="large" color="#0000ff" />}
          <Image
            source={{ uri: modalImageUrl }}
            style={[styles.image, { display: isImageLoaded ? 'flex' : 'none' }]}
            onLoad={() => setIsImageLoaded(true)}
          />
          <Text style={styles.title}>{modalProduct?.product_description}</Text>

          {/* Prices */}
          <Text style={styles.price}>
            {modalProduct?.old_price > 0 ? (
              <Text style={{ color: 'red' }}>{modalProduct.old_price}€ - </Text>
            ) : null}
            <Text style={{ color: 'green' }}>{modalProduct?.new_price}€</Text>
            {modalProduct?.old_price > 0 && modalProduct?.new_price ? (
              <Text style={{ color: 'green' }}>
                {' '}
                (-
                {Math.round(
                  ((modalProduct.old_price - modalProduct.new_price) / modalProduct.old_price) * 100
                )}
                %)
              </Text>
            ) : null}
          </Text>

          {/* Store + Sale End Date */}
          <Text style={styles.infoText}>
            {modalProduct?.storeName}
          </Text>
          <Text style={styles.infoText}>
            {modalProduct?.sale_end_date && new Date(modalProduct.sale_end_date) > new Date() ? (
              <Text style={{ color: 'green' }}>
                Deri:{' '}
                {new Date(modalProduct.sale_end_date).toLocaleDateString('en-GB', {
                  day: '2-digit',
                  month: '2-digit',
                  year: '2-digit'
                })}
              </Text>
            ) : null}
          </Text>

          {/* Favorite + Flyer + Sale status */}
          <View style={styles.iconRow}>
            {/* Favorite */}
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() =>
                handleToggleFavorite(modalProduct?.productId, modalProduct?.isFavorite)
              }
            >
              <Image
                source={
                  modalProduct?.isFavorite
                    ? require('../../assets/star-fill-2.png')
                    : require('../../assets/star-empty.jpg')
                }
                style={styles.iconImage}
              />
              <Text style={styles.iconLabel}>
                {modalProduct?.isFavorite ? 'Hiq favorit' : 'Shto favorit'}
              </Text>
            </TouchableOpacity>

            {/* Flyer button */}
            {modalProduct?.flyer_book_id > 0 && handleFlyerModal && (
              <TouchableOpacity
                style={styles.iconButton}
                onPress={() => handleFlyerModal(modalProduct.flyer_book_id)}
              >
                <Image
                  source={require('../../assets/flyer.png')}
                  style={styles.iconImage}
                />
                <Text style={styles.iconLabel}>Fletushka</Text>
              </TouchableOpacity>
            )}

            {/* Sale status */}
            <View style={styles.iconButton}>
              <Image
                source={
                  modalProduct?.productOnSale
                    ? require('../../assets/sale-fill-2.png')
                    : require('../../assets/sale-empty.jpg')
                }
                style={styles.iconImage}
              />
              <Text
                style={[
                  styles.iconLabel,
                  { color: modalProduct?.productOnSale ? 'green' : 'red' }
                ]}
              >
                {modalProduct?.productOnSale ? 'Aktive' : 'Skaduar'}
              </Text>
            </View>
          </View>

          {/* Close button */}
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={{ color: 'white' }}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center'
  },
  modalContent: {
    backgroundColor: '#fff', borderRadius: 8, padding: 16, width: '85%', alignItems: 'center'
  },
  image: {
    width: '100%', height: 300, resizeMode: 'contain', marginBottom: 10
  },
  title: {
    fontSize: 18, fontWeight: 'bold', marginBottom: 8, textAlign: 'center'
  },
  price: {
    fontSize: 16, marginBottom: 8
  },
  infoText: {
    fontSize: 14, marginBottom: 4
  },
  iconRow: {
    flexDirection: 'row', justifyContent: 'space-around', width: '100%', marginVertical: 10
  },
  iconButton: {
    alignItems: 'center', justifyContent: 'center'
  },
  iconImage: {
    width: 32, height: 32, marginBottom: 4
  },
  iconLabel: {
    fontSize: 12
  },
  closeButton: {
    marginTop: 12, backgroundColor: '#000', padding: 10, borderRadius: 5
  }
});

export default ProductModal;
