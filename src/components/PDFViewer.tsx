import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Modal,
  Alert,
} from 'react-native';
import {WebView} from 'react-native-webview';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Ionicons} from '@expo/vector-icons';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';

interface PDFViewerProps {
  visible: boolean;
  pdfUrl: string;
  title?: string;
  onClose: () => void;
}

export default function PDFViewer({
  visible,
  pdfUrl,
  title = 'PDF Viewer',
  onClose,
}: PDFViewerProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleLoadEnd = () => {
    setLoading(false);
  };

  const handleError = (syntheticEvent: any) => {
    const {nativeEvent} = syntheticEvent;
    setError(nativeEvent.description || 'Failed to load PDF');
    setLoading(false);
  };

  const handleDownload = async () => {
    try {
      if (!(await Sharing.isAvailableAsync())) {
        Alert.alert('Error', 'Sharing is not available on this device');
        return;
      }

      const fileUri = FileSystem.documentDirectory + 'village_map.pdf';
      const downloadResumable = FileSystem.createDownloadResumable(pdfUrl, fileUri);

      const result = await downloadResumable.downloadAsync();
      
      if (result) {
        await Sharing.shareAsync(result.uri);
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to download PDF');
      console.error('Download error:', err);
    }
  };

  const handleShareWhatsApp = async () => {
    try {
      if (!(await Sharing.isAvailableAsync())) {
        Alert.alert('Error', 'Sharing is not available on this device');
        return;
      }

      const fileUri = FileSystem.documentDirectory + 'village_map.pdf';
      const downloadResumable = FileSystem.createDownloadResumable(pdfUrl, fileUri);

      const result = await downloadResumable.downloadAsync();
      
      if (result) {
        // Share with WhatsApp (if installed)
        await Sharing.shareAsync(result.uri, {
          mimeType: 'application/pdf',
          dialogTitle: 'Share PDF via WhatsApp',
        });
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to share PDF');
      console.error('Share error:', err);
    }
  };

  // Use PDF URL directly in WebView (Expo Go compatible)
  // For direct PDF URLs, display them directly without wrapper

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          <View style={styles.headerActions}>
            <TouchableOpacity
              onPress={handleShareWhatsApp}
              style={styles.actionButton}>
              <Ionicons name="logo-whatsapp" size={24} color="#25D366" />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleDownload} style={styles.actionButton}>
              <Ionicons name="download-outline" size={24} color="#000" />
            </TouchableOpacity>
          </View>
        </View>

        {error ? (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle-outline" size={48} color="#FF3B30" />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => {
                setError(null);
                setLoading(true);
              }}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.webViewContainer}>
            {loading && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#007AFF" />
                <Text style={styles.loadingText}>Loading PDF...</Text>
              </View>
            )}
            <WebView
              source={{uri: pdfUrl}}
              style={styles.webView}
              onLoadEnd={handleLoadEnd}
              onError={handleError}
              startInLoadingState={true}
              javaScriptEnabled={false}
              domStorageEnabled={false}
              // Display PDF directly
              originWhitelist={['*']}
              // Allow direct PDF viewing
              allowsInlineMediaPlayback={true}
              mediaPlaybackRequiresUserAction={false}
            />
          </View>
        )}

        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.footerButton}
            onPress={handleShareWhatsApp}>
            <Ionicons name="logo-whatsapp" size={24} color="#25D366" />
            <Text style={styles.footerButtonText}>Share to WhatsApp</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.footerButton} onPress={handleDownload}>
            <Ionicons name="download-outline" size={24} color="#000" />
            <Text style={styles.footerButtonText}>Download</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginHorizontal: 12,
    textAlign: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  webViewContainer: {
    flex: 1,
  },
  webView: {
    flex: 1,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    zIndex: 1,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 20,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#007AFF',
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    gap: 12,
  },
  footerButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    gap: 8,
  },
  footerButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
});

