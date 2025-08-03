import React, { useState } from 'react';
import { Modal, View, TouchableOpacity, StyleSheet, Dimensions, Text, FlatList, ImageBackground } from 'react-native';
import ImageViewing from 'react-native-image-viewing';

type Props = {
  flyerBook: Array<{ image_url: string }>;
  baseUrl: string;
  isFlyerModalOpen: boolean;
  closeFlyerModal: () => void;
  isLoading?: boolean;
};

const FlyerSlider: React.FC<Props> = ({ flyerBook, baseUrl, isFlyerModalOpen, closeFlyerModal, isLoading }) => {
  const { width, height } = Dimensions.get('window');
  const images = flyerBook.map((item) => ({
    uri: item.image_url.startsWith('http') ? item.image_url : `${baseUrl}/${item.image_url}`,
  }));

  const [currentIndex, setCurrentIndex] = useState(0);
  const [zoomViewerVisible, setZoomViewerVisible] = useState(false);

  const openZoomViewer = (index: number) => {
    setCurrentIndex(index);
    setZoomViewerVisible(true);
  };

  if (!isFlyerModalOpen) return null;

  return (
    <Modal animationType="fade" transparent visible={isFlyerModalOpen} onRequestClose={closeFlyerModal}>
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.closeButton} onPress={closeFlyerModal}>
          <View style={styles.closeButtonContent}>
            <Text style={{ fontSize: 20, color: '#000' }}>X</Text>
          </View>
        </TouchableOpacity>

        {isLoading ? (
          <Text style={{ color: '#fff', fontSize: 18 }}>Duke ngarkuar...</Text>
        ) : (
          <FlatList
            horizontal
            pagingEnabled
            data={images}
            keyExtractor={(_, index) => index.toString()}
            renderItem={({ item, index }) => (
              // The slide now has a defined height, allowing the content to fill it
              <TouchableOpacity
                activeOpacity={0.9}
                style={[styles.slide, { width, height }]}
                onPress={() => openZoomViewer(index)}
              >
                {/* Use ImageBackground for better performance and to overlay text */}
                <ImageBackground
                  source={{ uri: item.uri }}
                  style={styles.image}
                  resizeMode="contain"
                >
                  <Text style={styles.imageText}>Prek për zmadhim</Text>
                </ImageBackground>
              </TouchableOpacity>
            )}
          />
        )}
        
        {/* The zoom viewer is now outside the list, rendered only once */}
        <ImageViewing
          images={images}
          imageIndex={currentIndex}
          visible={zoomViewerVisible}
          onRequestClose={() => setZoomViewerVisible(false)}
        />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    // FIX: Removed justifyContent and alignItems to allow FlatList to fill the screen
  },
  slide: {
    // This container now correctly centers its content (the image)
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    // The image will fill the available space of the slide
    width: '100%',
    height: '100%',
    justifyContent: 'flex-end', // Position text at the bottom
    alignItems: 'center', // Center text horizontally
  },
  imageText: {
    color: '#fff',
    fontSize: 16,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    overflow: 'hidden', // Ensures background respects borderRadius
    marginBottom: 60, // Position above the bottom edge
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 10,
  },
  closeButtonContent: {
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderRadius: 20,
    padding: 8,
  },
});

export default FlyerSlider;
