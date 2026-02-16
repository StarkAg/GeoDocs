import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Ionicons} from '@expo/vector-icons';
import Dropdown from '../components/Dropdown';
import {fetchPdfUrl, openPdfUrl} from '../services/fetchPdfUrl';
import {
  getDistricts,
  getTaluks,
  getHoblis,
  getVillages,
} from '../data/karnatakaLocations';

interface DocumentOption {
  id: string;
  name: string;
  icon: keyof typeof Ionicons.glyphMap;
}

export default function DocumentsScreen() {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [district, setDistrict] = useState('');
  const [taluka, setTaluka] = useState('');
  const [hobli, setHobli] = useState('');
  const [village, setVillage] = useState('');
  
  // Dropdown options
  const [districtOptions, setDistrictOptions] = useState<{value: string; label: string}[]>([]);
  const [talukOptions, setTalukOptions] = useState<{value: string; label: string}[]>([]);
  const [hobliOptions, setHobliOptions] = useState<{value: string; label: string}[]>([]);
  const [villageOptions, setVillageOptions] = useState<{value: string; label: string}[]>([]);
  
  // Loading states
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingTaluks, setLoadingTaluks] = useState(false);
  const [loadingHoblis, setLoadingHoblis] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [statusLogs, setStatusLogs] = useState<string[]>([]);
  const [currentStatus, setCurrentStatus] = useState<string>('');
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  // Load districts on mount
  useEffect(() => {
    const districts = getDistricts();
    setDistrictOptions(districts);
    // Set default if available
    if (districts.length > 0 && !district) {
      setDistrict(districts[0].value);
    }
  }, []);

  // Load taluks when district changes
  useEffect(() => {
    if (district) {
      const taluks = getTaluks(district);
      setTalukOptions(taluks);
      // Reset taluk and hobli when district changes
      setTaluka('');
      setHobli('');
      setHobliOptions([]);
      // Set default taluk if available
      if (taluks.length > 0) {
        setTaluka(taluks[0].value);
      }
    } else {
      setTalukOptions([]);
      setTaluka('');
    }
  }, [district]);

  // Load hoblis when taluk changes
  useEffect(() => {
    if (district && taluka) {
      const hoblis = getHoblis(district, taluka);
      setHobliOptions(hoblis);
      // Reset hobli and village when taluk changes
      setHobli('');
      setVillage('');
      setVillageOptions([]);
      // Set default hobli if available
      if (hoblis.length > 0) {
        setHobli(hoblis[0].value);
      }
    } else {
      setHobliOptions([]);
      setHobli('');
      setVillageOptions([]);
      setVillage('');
    }
  }, [district, taluka]);

  // Load villages when hobli changes
  useEffect(() => {
    if (district && taluka && hobli) {
      const villages = getVillages(district, taluka, hobli);
      setVillageOptions(villages);
      // Reset village when hobli changes
      setVillage('');
      // Set default village if available
      if (villages.length > 0) {
        setVillage(villages[0].value);
      }
    } else {
      setVillageOptions([]);
      setVillage('');
    }
  }, [district, taluka, hobli]);

  const documentOptions: DocumentOption[] = [
    {id: '1', name: 'Village Map', icon: 'map-outline'},
    {id: '2', name: 'Survey Map', icon: 'location-outline'},
    {id: '3', name: 'Property Deed', icon: 'document-text-outline'},
    {id: '4', name: 'Land Records', icon: 'folder-outline'},
    {id: '5', name: 'Tax Receipt', icon: 'receipt-outline'},
    {id: '6', name: 'Encumbrance', icon: 'lock-closed-outline'},
  ];

  const handleOptionPress = (optionId: string) => {
    setSelectedOption(optionId);
  };

  const handleCloseModal = () => {
    setSelectedOption(null);
  };

  const handleViewSample = async () => {
    // Use the current selections to fetch a real PDF
    if (district && taluka && hobli && village) {
      // Same as handleSearch
      handleSearch();
    } else {
      // Show alert if not all fields are selected
      Alert.alert(
        'Please Select All Fields',
        'Please select District, Taluka, Hobli, and Village to view the PDF.',
        [{text: 'OK'}]
      );
    }
  };
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleSearch = async () => {
    // Clear any existing intervals/timeouts
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    // Close modal and show status logs
    handleCloseModal();
    setLoading(true);
    setLoadingProgress(0);
    setStatusLogs([]);
    setCurrentStatus('Starting...');
    
    addStatusLog('🚀 Starting PDF search...');
    
    try {
      // Get village label
      const villageLabel = villageOptions.find(v => v.value === village)?.label || village;
      
      addStatusLog('📤 Requesting PDF from API...');
      setCurrentStatus('Requesting PDF from API...');
      
      // Call API
      const pdfUrl = await fetchPdfUrl({
        district,
        taluk: taluka,
        hobli,
        village: villageLabel,
      });
      
      addStatusLog('✅ PDF URL received!');
      setCurrentStatus('PDF found! Opening...');
      
      // Open PDF URL
      await openPdfUrl(pdfUrl);
      
      addStatusLog('✅ PDF opened successfully!');
      setCurrentStatus('PDF opened!');
      
      // Close loading after a moment
      setTimeout(() => {
        setLoading(false);
        setStatusLogs([]);
        setCurrentStatus('');
      }, 2000);
      
    } catch (error: any) {
      console.error('PDF search error:', error);
      addStatusLog(`❌ Error: ${error.message}`);
      setCurrentStatus(`Error: ${error.message}`);
      
      setTimeout(() => {
        setLoading(false);
        Alert.alert(
          'PDF Not Found',
          error.message || 'Could not fetch the PDF. Please check your selections and try again.',
          [
            {
              text: 'OK',
              onPress: () => {
                setStatusLogs([]);
                setCurrentStatus('');
              },
            },
          ]
        );
      }, 2000);
    }
  };

  const addStatusLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setStatusLogs(prev => {
      const newLogs = [...prev, `[${timestamp}] ${message}`];
      // Keep only last 50 logs
      return newLogs.slice(-50);
    });
    setCurrentStatus(message);
    // Auto-scroll to bottom
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({animated: true});
    }, 100);
  };

  // handlePdfFound removed - now using openPdfUrl directly

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Documents</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.grid}>
          {documentOptions.map(option => (
            <TouchableOpacity
              key={option.id}
              style={styles.optionCard}
              onPress={() => handleOptionPress(option.id)}>
              <View style={styles.iconContainer}>
                <Ionicons name={option.icon} size={32} color="#007AFF" />
              </View>
              <Text style={styles.optionName}>{option.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Modal for Village Map Form */}
      <Modal
        visible={selectedOption === '1'}
        animationType="slide"
        transparent={false}
        onRequestClose={handleCloseModal}>
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={handleCloseModal} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color="#000" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Village Map</Text>
            <View style={styles.placeholder} />
          </View>

          <ScrollView style={styles.formContainer}>
            <Dropdown
              label="District"
              required
              value={district}
              options={districtOptions}
              onValueChange={setDistrict}
            />

            <Dropdown
              label="Taluka"
              required
              value={taluka}
              options={talukOptions}
              onValueChange={setTaluka}
              disabled={!district || talukOptions.length === 0}
            />

            <Dropdown
              label="Hobli/Town"
              required
              value={hobli}
              options={hobliOptions}
              onValueChange={setHobli}
              disabled={!taluka || hobliOptions.length === 0}
            />

            <Dropdown
              label="Village"
              required
              value={village}
              options={villageOptions}
              onValueChange={setVillage}
              disabled={!hobli || villageOptions.length === 0}
            />
          </ScrollView>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.viewSampleButton}
              onPress={handleViewSample}>
              <Text style={styles.viewSampleText}>View Sample</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
              <Text style={styles.searchButtonText}>Search</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>

      {/* Status Logs Modal */}
      <Modal
        visible={loading}
        transparent={false}
        animationType="slide">
        <SafeAreaView style={styles.logsModal}>
          <View style={styles.logsHeader}>
            <TouchableOpacity
              onPress={() => {
                setLoading(false);
                setStatusLogs([]);
                setCurrentStatus('');
              }}
              style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#000" />
            </TouchableOpacity>
            <Text style={styles.logsTitle}>PDF Search Status</Text>
            <View style={styles.placeholder} />
          </View>
          
          <View style={styles.currentStatusContainer}>
            <Text style={styles.currentStatusLabel}>Current Status:</Text>
            <Text style={styles.currentStatusText}>{currentStatus || 'Waiting...'}</Text>
          </View>

          <ScrollView 
            ref={scrollViewRef}
            style={styles.logsContainer}
            contentContainerStyle={styles.logsContent}>
            {statusLogs.length === 0 ? (
              <Text style={styles.noLogsText}>Waiting for status updates...</Text>
            ) : (
              statusLogs.map((log, index) => (
                <View key={index} style={styles.logItem}>
                  <Text style={styles.logText}>{log}</Text>
                </View>
              ))
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* WebView removed - using API instead */}

      {/* PDF Viewer removed - using Linking.openURL instead */}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
  },
  content: {
    padding: 20,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  optionCard: {
    width: '48%',
    aspectRatio: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  iconContainer: {
    marginBottom: 12,
  },
  optionName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
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
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  placeholder: {
    width: 40,
  },
  formContainer: {
    flex: 1,
    padding: 20,
  },
  loadingField: {
    marginBottom: 24,
    padding: 16,
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
  },
  loadingText: {
    marginTop: 8,
    fontSize: 14,
    color: '#666',
  },
  formField: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
  },
  required: {
    color: '#FF3B30',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  textInput: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: '#000',
  },
  buttonContainer: {
    flexDirection: 'row',
    padding: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    gap: 12,
  },
  viewSampleButton: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
  },
  viewSampleText: {
    fontSize: 16,
    color: '#000',
    fontWeight: '500',
  },
  searchButton: {
    flex: 1,
    backgroundColor: '#000',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  searchButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
  logsModal: {
    flex: 1,
    backgroundColor: '#fff',
  },
  logsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  currentStatusContainer: {
    padding: 16,
    backgroundColor: '#F5F5F5',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  currentStatusLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  currentStatusText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  logsContainer: {
    flex: 1,
  },
  logsContent: {
    padding: 16,
  },
  logItem: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 4,
    backgroundColor: '#F9F9F9',
    borderRadius: 6,
  },
  logText: {
    fontSize: 13,
    color: '#333',
    fontFamily: 'monospace',
  },
  noLogsText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 40,
    fontStyle: 'italic',
  },
});
