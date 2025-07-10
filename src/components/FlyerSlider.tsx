import React, { useState } from 'react';
import { Modal, View, TouchableOpacity, StyleSheet, Dimensions, Text, FlatList } from 'react-native';
import ImageViewing from 'react-native-image-viewing';

type Props = {
  flyerBook: Array<{ image_url: string }>;
  baseUrl: string;
  isFlyerModalOpen: boolean;
  closeFlyerModal: () => void;
  isLoading?: boolean;
};

const FlyerSlider: React.FC<Props> = ({ flyerBook, baseUrl, isFlyerModalOpen, closeFlyerModal, isLoading }) => {
  const { width } = Dimensions.get('window');
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
          <Text style={{ color: '#fff', fontSize: 18 }}>Loading…</Text>
        ) : (
          <FlatList
            horizontal
            pagingEnabled
            data={images}
            keyExtractor={(_, index) => index.toString()}
            renderItem={({ item, index }) => (
              <TouchableOpacity
                activeOpacity={0.9}
                style={[styles.slide, { width: width }]}
                onPress={() => openZoomViewer(index)}
              >
                <View style={styles.imageWrapper}>
                  <ImageViewing
                    images={[{ uri: item.uri }]}
                    imageIndex={0}
                    visible={false} // Important → here we only use Image background, zoom done below
                    onRequestClose={() => setZoomViewerVisible(false)}
                  />
                  <Text style={styles.imageText}>Tap to Zoom</Text>
                  <ImageViewing
                    images={images}
                    imageIndex={currentIndex}
                    visible={zoomViewerVisible}
                    onRequestClose={() => setZoomViewerVisible(false)}
                  />
                </View>
              </TouchableOpacity>
            )}
          />
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'center', alignItems: 'center'
  },
  slide: {
    justifyContent: 'center', alignItems: 'center'
  },
  imageWrapper: {
    flex: 1, justifyContent: 'center', alignItems: 'center'
  },
  imageText: {
    color: '#fff', fontSize: 16, marginTop: 10
  },
  closeButton: {
    position: 'absolute', top: 40, right: 20, zIndex: 10
  },
  closeButtonContent: {
    backgroundColor: 'rgba(255,255,255,0.8)', borderRadius: 20, padding: 8
  }
});

export default FlyerSlider;
