import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Box, Heading, Text, Flex, Spinner, Tabs, TabList, Tab, TabPanels, TabPanel, 
  Card, CardBody, SimpleGrid, Badge, Icon, useToast, Progress, Button,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalCloseButton,
  Select, Textarea, Input, Image, useDisclosure, VStack, HStack, Link,
  FormControl, FormLabel, Stack, Alert, AlertIcon
} from '@chakra-ui/react';
import { 
  FaSeedling, FaTruck, FaWarehouse, FaStore, FaMapMarkedAlt, 
  FaCheckCircle, FaQrcode, FaLocationArrow, FaBox, FaHome,
  FaCopy, FaExternalLinkAlt, FaPlus, FaTrash, FaFilePdf, FaSave
} from 'react-icons/fa';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import jsPDF from 'jspdf';
import api from '../services/api';
import { useParams } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';

// Fix Leaflet default icons
import icon from 'leaflet/dist/images/marker-icon.png';
import iconRetina from 'leaflet/dist/images/marker-icon-2x.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

// Fix default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: iconRetina,
  iconUrl: icon,
  shadowUrl: iconShadow,
});

// Create default icon instance
const defaultIcon = L.icon({
  iconUrl: icon,
  iconRetinaUrl: iconRetina,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Custom green icon for last location
const greenIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Stage definitions with icons and groups
const STAGE_DEFINITIONS = {
  production: [
    { key: 'planting', name: 'Planting', icon: FaSeedling },
    { key: 'harvesting', name: 'Harvesting', icon: FaSeedling },
    { key: 'transport', name: 'Transport', icon: FaTruck },
    { key: 'processing', name: 'Processing', icon: FaWarehouse },
    { key: 'distribution', name: 'Distribution', icon: FaStore }
  ],
  fulfillment: [
    { key: 'packaging', name: 'Packaging', icon: FaBox },
    { key: 'shipped', name: 'Shipped', icon: FaTruck },
    { key: 'delivered', name: 'Delivered', icon: FaHome }
  ]
};

// Custom map component
const SupplyChainMap = ({ locations, center, zoom, onLocationSelect }) => {
  const mapRef = useRef(null);
  // Filter locations with valid coordinates
  const validLocations = locations.filter(loc => loc.coordinates);
  
  // Create polyline points
  const polylinePoints = validLocations.map(loc => [
    loc.coordinates.lat, 
    loc.coordinates.lng
  ]);
  
  // Cleanup map on unmount
  useEffect(() => {
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
      }
    };
  }, []);

  return (
    <Box height="500px" width="100%" borderRadius="md" overflow="hidden">
      <MapContainer 
        ref={mapRef}
        center={center} 
        zoom={zoom} 
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Draw connecting lines between locations */}
        {validLocations.length > 1 && (
          <Polyline 
            positions={polylinePoints} 
            color="#3182CE" 
            weight={3}
            dashArray="5, 5"
          />
        )}
        
        {/* Create markers for each location */}
        {validLocations.map((loc, index) => {
          const isLast = index === validLocations.length - 1;
          return (
            <Marker
              key={index}
              position={[loc.coordinates.lat, loc.coordinates.lng]}
              icon={isLast ? greenIcon : defaultIcon}
              eventHandlers={{
                click: () => onLocationSelect(loc)
              }}
            >
              <Popup>
                <Box>
                  <Text fontWeight="bold">{loc.name}</Text>
                  <Text fontSize="sm" textTransform="capitalize">{loc.type}</Text>
                  <Text fontSize="sm">{loc.address}</Text>
                  <Text fontSize="sm" color="gray.600">
                    {new Date(loc.date).toLocaleDateString()}
                  </Text>
                </Box>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </Box>
  );
};

// Location input component
const LocationInputSection = ({ 
  locations, 
  onLocationsChange,
  onSaveJourney,
  isSaving,
  productId
}) => {
  const [newLocation, setNewLocation] = useState({
    name: '',
    type: 'farm',
    address: '',
    status: 'pending',
    date: new Date().toISOString().split('T')[0]
  });

  const handleAddLocation = () => {
    if (newLocation.name && newLocation.address) {
      onLocationsChange([...locations, newLocation]);
      setNewLocation({
        name: '',
        type: 'farm',
        address: '',
        status: 'pending',
        date: new Date().toISOString().split('T')[0]
      });
    }
  };

  const handleRemoveLocation = (index) => {
    const updated = [...locations];
    updated.splice(index, 1);
    onLocationsChange(updated);
  };

  return (
    <Box bg="white" p={4} borderRadius="md" boxShadow="md" mb={4}>
      <Heading size="md" mb={4}>Supply Chain Locations</Heading>
      
      <Stack spacing={3}>
        <FormControl>
          <FormLabel>Location Type</FormLabel>
          <Select 
            value={newLocation.type}
            onChange={(e) => setNewLocation({...newLocation, type: e.target.value})}
          >
            <option value="farm">Farm</option>
            <option value="processing">Processing</option>
            <option value="distribution">Distribution</option>
            <option value="retail">Retail</option>
            <option value="transport">Transport</option>
          </Select>
        </FormControl>
        
        <FormControl>
          <FormLabel>Location Name</FormLabel>
          <Input 
            value={newLocation.name}
            onChange={(e) => setNewLocation({...newLocation, name: e.target.value})}
            placeholder="e.g., Kamau Farm, Nyeri"
          />
        </FormControl>
        
        <FormControl>
          <FormLabel>Full Address</FormLabel>
          <Input 
            value={newLocation.address}
            onChange={(e) => setNewLocation({...newLocation, address: e.target.value})}
            placeholder="Enter complete address"
          />
        </FormControl>
        
        <Flex>
          <FormControl mr={2}>
            <FormLabel>Status</FormLabel>
            <Select 
              value={newLocation.status}
              onChange={(e) => setNewLocation({...newLocation, status: e.target.value})}
            >
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
            </Select>
          </FormControl>
          
          <FormControl ml={2}>
            <FormLabel>Date</FormLabel>
            <Input 
              type="date"
              value={newLocation.date}
              onChange={(e) => setNewLocation({...newLocation, date: e.target.value})}
            />
          </FormControl>
        </Flex>
        
        <Button 
          colorScheme="teal" 
          leftIcon={<FaPlus />}
          onClick={handleAddLocation}
          isDisabled={!newLocation.name || !newLocation.address}
        >
          Add Location
        </Button>
      </Stack>
      
      <Box mt={4}>
        <Heading size="sm" mb={2}>Added Locations</Heading>
        {locations.length === 0 ? (
          <Text color="gray.500">No locations added yet</Text>
        ) : (
          locations.map((loc, index) => (
            <Flex 
              key={index} 
              p={2} 
              borderBottom="1px solid" 
              borderColor="gray.100"
              align="center"
              justify="space-between"
            >
              <Box>
                <Text fontWeight="bold">{loc.name}</Text>
                <Text fontSize="sm">{loc.type} • {loc.status}</Text>
              </Box>
              <Button 
                size="sm" 
                variant="ghost" 
                colorScheme="red" 
                onClick={() => handleRemoveLocation(index)}
              >
                <FaTrash />
              </Button>
            </Flex>
          ))
        )}
      </Box>
      
      <Button 
        mt={4}
        colorScheme="blue" 
        leftIcon={<FaSave />}
        onClick={() => onSaveJourney(locations)}
        isLoading={isSaving}
        isDisabled={locations.length === 0}
        w="100%"
      >
        Save Journey to Database
      </Button>
    </Box>
  );
};

const SupplyChainTracker = () => {
  const { productId } = useParams();
  const { t } = useLanguage();
  const { user } = useAuth();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [supplyChainData, setSupplyChainData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [mapCenter, setMapCenter] = useState([-1.2921, 36.8219]); // Default to Nairobi coordinates
  const [mapZoom, setMapZoom] = useState(6);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [mapLocations, setMapLocations] = useState([]);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [geocodedLocations, setGeocodedLocations] = useState([]);
  const [generatingReport, setGeneratingReport] = useState(false);
  const [savingJourney, setSavingJourney] = useState(false);

  const mapViewRef = useRef(null);
  const blockchainRef = useRef(null);
  const journeyRef = useRef(null);

  const [updateData, setUpdateData] = useState({
    stage: '',
    description: ''
  });

  // Fetch supply chain data
  const fetchSupplyChainData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get(`/supply-chain/${productId}`);
      const data = response.data;
      
      const enhancedData = {
        ...data,
        events: data.events.map(event => ({
          ...event,
          coordinates: event.location_coordinates 
            ? { 
                lat: event.location_coordinates.coordinates[1],
                lng: event.location_coordinates.coordinates[0]
              } 
            : null,
          location: event.location_name || "Location not specified"
        }))
      };
      
      setSupplyChainData(enhancedData);
      setIsVerified(data.blockchainVerified || false);
      
      if (enhancedData.events && enhancedData.events.length > 0) {
        const latestEvent = enhancedData.events[enhancedData.events.length - 1];
        if (latestEvent.coordinates) {
          setMapCenter([latestEvent.coordinates.lat, latestEvent.coordinates.lng]);
          setMapZoom(12);
        }
      }
    } catch (error) {
      setError(t('fetch_supply_chain_error'));
      console.error('Failed to fetch supply chain data:', error);
    } finally {
      setLoading(false);
    }
  }, [productId, t]);

  useEffect(() => {
    if (isNaN(productId)) {
      setError('Invalid product ID');
      setLoading(false);
      return;
    }
    
    fetchSupplyChainData();
  }, [fetchSupplyChainData, productId]);

  // Geocode addresses to coordinates
  useEffect(() => {
    if (mapLocations.length > 0) {
      const geocodeAddresses = async () => {
        setIsGeocoding(true);
        try {
          const results = [];
          
          for (const loc of mapLocations) {
            try {
              const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(loc.address)}`
              );
              const data = await response.json();
              
              if (data && data.length > 0) {
                results.push({
                  ...loc,
                  coordinates: {
                    lat: parseFloat(data[0].lat),
                    lng: parseFloat(data[0].lon)
                  }
                });
              } else {
                results.push({
                  ...loc,
                  coordinates: null
                });
              }
            } catch (err) {
              console.error('Geocoding error:', err);
              results.push({
                ...loc,
                coordinates: null
              });
            }
          }
          
          setGeocodedLocations(results);
          
          if (results.length > 0 && results[results.length - 1].coordinates) {
            const lastLoc = results[results.length - 1];
            setMapCenter([lastLoc.coordinates.lat, lastLoc.coordinates.lng]);
            setMapZoom(10);
          }
          
        } catch (error) {
          toast({
            title: 'Geocoding Error',
            description: 'Failed to convert addresses to map coordinates',
            status: 'error',
            duration: 5000,
            isClosable: true,
          });
        } finally {
          setIsGeocoding(false);
        }
      };
      
      geocodeAddresses();
    }
  }, [mapLocations, toast]);

  // Submit stage update to backend
  const handleStageUpdate = async () => {
    try {
      const formData = new FormData();
      formData.append('stage', updateData.stage);
      formData.append('description', updateData.description);

      await api.post(`/supply-chain/${productId}/update`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      toast({
        title: t('update_success'),
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      fetchSupplyChainData();
      onClose();
      setUpdateData({ stage: '', description: '' });
    } catch (error) {
      toast({
        title: t('update_failed'),
        description: error.response?.data?.message || t('update_error_description'),
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  // Save journey to database
  const saveJourneyToDatabase = async (locations) => {
    try {
      setSavingJourney(true);
      
      // Prepare locations for backend
      const locationsToSave = locations.map(loc => ({
        name: loc.name,
        type: loc.type,
        address: loc.address,
        status: loc.status,
        date: loc.date,
        coordinates: loc.coordinates 
          ? { 
              lat: loc.coordinates.lat, 
              lng: loc.coordinates.lng 
            } 
          : null
      }));

      await api.post(`/supply-chain/${productId}/journey`, {
        locations: locationsToSave
      });
      
      toast({
        title: 'Journey Saved',
        description: 'Supply chain locations saved to database',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      // Refresh supply chain data
      fetchSupplyChainData();
    } catch (error) {
      toast({
        title: 'Save Failed',
        description: error.response?.data?.message || 'Could not save journey',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      console.error('Error saving journey:', error);
    } finally {
      setSavingJourney(false);
    }
  };

  // Perform blockchain verification
  const verifyBlockchain = async () => {
    setIsVerifying(true);
    try {
      const response = await api.get(`/api/v1/blockchain/verify/${productId}`);
      const verificationResult = response.data.verified;
      
      setIsVerified(verificationResult);
      toast({
        title: verificationResult ? t('verification_success') : t('verification_failed'),
        description: verificationResult 
          ? t('blockchain_verification_success_desc') 
          : t('blockchain_verification_failed_desc'),
        status: verificationResult ? 'success' : 'error',
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: t('verification_error'),
        description: error.response?.data?.message || t('blockchain_connection_error'),
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsVerifying(false);
    }
  };

  // Copy text to clipboard
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast({
      title: t('copied_to_clipboard'),
      status: 'success',
      duration: 2000,
      isClosable: true,
    });
    setTimeout(() => setCopied(false), 2000);
  };

  // Center map on specific location
  const viewLocationOnMap = (coordinates) => {
    if (coordinates) {
      setMapCenter([coordinates.lat, coordinates.lng]);
      setMapZoom(15);
      setActiveTab(0);
    }
  };

  // Calculate stage statuses
  const calculateStageStatus = (stages, currentStage) => {
    const stageKeys = stages.map(s => s.key);
    const currentIndex = stageKeys.indexOf(currentStage);
    
    return stages.map((stage, index) => {
      if (index < currentIndex) return 'completed';
      if (index === currentIndex) return 'active';
      return 'pending';
    });
  };

  // Get current stages and statuses
  const getCurrentStages = () => {
    if (!supplyChainData || supplyChainData.currentStage == null) {
      return { productionStages: [], fulfillmentStages: [] };
    }
    
    const currentStage = supplyChainData.currentStage;
    const allStages = [
      ...STAGE_DEFINITIONS.production,
      ...STAGE_DEFINITIONS.fulfillment
    ];
    
    const currentIndex = allStages.findIndex(s => s.key === currentStage);
    const isInProduction = currentIndex < STAGE_DEFINITIONS.production.length;
    
    const productionStatuses = calculateStageStatus(
      STAGE_DEFINITIONS.production,
      isInProduction ? currentStage : STAGE_DEFINITIONS.production[STAGE_DEFINITIONS.production.length - 1].key
    );
    
    const productionStages = STAGE_DEFINITIONS.production.map((stage, i) => ({
      ...stage,
      status: productionStatuses[i],
      name: t(stage.name)
    }));
    
    let fulfillmentStages = [];
    if (!isInProduction) {
      const fulfillmentStatuses = calculateStageStatus(
        STAGE_DEFINITIONS.fulfillment,
        currentStage
      );
      
      fulfillmentStages = STAGE_DEFINITIONS.fulfillment.map((stage, i) => ({
        ...stage,
        status: fulfillmentStatuses[i],
        name: t(stage.name)
      }));
    }
    
    return { productionStages, fulfillmentStages };
  };

  const { productionStages, fulfillmentStages } = getCurrentStages();
  const showFulfillmentBar = fulfillmentStages && fulfillmentStages.length > 0;

  // Progress bar component
  const ProgressBar = ({ stages = [], title }) => (
    <Box mb={6}>
      {title && <Heading size="md" mb={4}>{title}</Heading>}
      <Box position="relative">
        <Flex justify="space-between" mb={2} position="relative" zIndex={1}>
          {stages.map((stage) => (
            <Box key={stage.key} textAlign="center" position="relative" zIndex={1}>
              <Flex
                justify="center"
                align="center"
                w={{ base: '40px', md: '50px' }}
                h={{ base: '40px', md: '50px' }}
                borderRadius="full"
                bg={
                  stage.status === 'completed' ? 'green.500' : 
                  stage.status === 'active' ? 'blue.500' : 'gray.200'
                }
                color="white"
                mx="auto"
                mb={2}
                border="2px solid white"
                boxShadow="md"
              >
                <Icon as={stage.icon} boxSize={{ base: 4, md: 5 }} />
              </Flex>
              <Text fontSize="sm" fontWeight="medium">{stage.name}</Text>
              {stage.status === 'active' && (
                <Badge colorScheme="blue" mt={1} fontSize="xs">
                  {t('Current')}
                </Badge>
              )}
            </Box>
          ))}
        </Flex>
        <Progress 
          value={100} 
          size="sm" 
          colorScheme="gray" 
          position="absolute" 
          top="20px" 
          left="0" 
          right="0"
          zIndex={0}
          borderRadius="full"
        />
      </Box>
    </Box>
  );

  // Generate QR code URL
  const generateQRCodeUrl = () => {
    const url = `${window.location.origin}/tracker/${productId}`;
    return `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(url)}`;
  };

  // Get all locations to display on map
  const getMapLocations = () => {
    return geocodedLocations.filter(loc => loc.coordinates);
  };

  // Generate PDF report
  const generateReport = async () => {
    setGeneratingReport(true);
    try {
      const doc = new jsPDF('p', 'mm', 'a4');
      const productName = supplyChainData?.product?.name || 'Product';
      
      // Report title
      doc.setFontSize(20);
      doc.text(`Supply Chain Report: ${productName}`, 105, 15, null, null, 'center');
      doc.setFontSize(12);
      doc.text(`Product ID: ${productId}`, 105, 22, null, null, 'center');
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 105, 28, null, null, 'center');
      
      // Page 1: Location Details
      doc.addPage();
      doc.setFontSize(16);
      doc.text('Location Details', 105, 15, null, null, 'center');
      
      // Add location details
      let yPos = 25;
      getMapLocations().forEach((loc, index) => {
        if (yPos > 250) {
          doc.addPage();
          yPos = 15;
        }
        
        const isLast = index === getMapLocations().length - 1;
        doc.setFontSize(12);
        doc.setTextColor(isLast ? '#38A169' : '#000000');
        doc.text(`Location ${index + 1}: ${loc.name}`, 20, yPos);
        yPos += 7;
        doc.text(`Type: ${loc.type}`, 20, yPos);
        yPos += 7;
        doc.text(`Address: ${loc.address}`, 20, yPos);
        yPos += 7;
        doc.text(`Status: ${loc.status}`, 20, yPos);
        yPos += 7;
        doc.text(`Date: ${loc.date}`, 20, yPos);
        yPos += 12;
      });
      
      // Page 2: Blockchain Verification
      doc.addPage();
      doc.setFontSize(16);
      doc.text('Blockchain Verification', 105, 15, null, null, 'center');
      
      doc.setFontSize(12);
      doc.setTextColor('#000000');
      doc.text(`Verification Status: ${isVerified ? 'Verified' : 'Not Verified'}`, 20, 30);
      
      if (supplyChainData?.blockchainTxHash) {
        doc.text(`Transaction Hash: ${supplyChainData.blockchainTxHash}`, 20, 40);
        doc.text(`Blockchain Explorer Link: https://etherscan.io/tx/${supplyChainData.blockchainTxHash}`, 20, 50, { maxWidth: 170 });
      }
      
      // Add QR code image
      const qrImg = new window.Image();
      qrImg.src = generateQRCodeUrl();
      await new Promise(resolve => {
        qrImg.onload = resolve;
      });
      doc.addImage(qrImg, 'PNG', 80, 60, 50, 50);
      doc.text('Product Verification QR Code', 105, 115, null, null, 'center');
      
      // Page 3: Journey Details
      doc.addPage();
      doc.setFontSize(16);
      doc.text('Journey Details', 105, 15, null, null, 'center');
      
      yPos = 25;
      supplyChainData?.events?.forEach((event, index) => {
        if (yPos > 250) {
          doc.addPage();
          yPos = 15;
        }
        
        doc.setFontSize(12);
        doc.text(`Event ${index + 1}: ${event.stage}`, 20, yPos);
        yPos += 7;
        doc.text(`Description: ${event.description}`, 20, yPos);
        yPos += 7;
        doc.text(`Location: ${event.location || 'N/A'}`, 20, yPos);
        yPos += 7;
        doc.text(`Date: ${new Date(event.timestamp).toLocaleString()}`, 20, yPos);
        yPos += 7;
        doc.text(`Status: ${event.status}`, 20, yPos);
        yPos += 12;
      });
      
      // Save the PDF
      doc.save(`supply-chain-report-${productName}-${productId}.pdf`);
      
      toast({
        title: 'Report Generated',
        description: 'Supply chain report downloaded successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Report Generation Failed',
        description: 'Could not generate the supply chain report',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      console.error('Error generating report:', error);
    } finally {
      setGeneratingReport(false);
    }
  };

  if (loading) {
    return (
      <Flex justify="center" align="center" h="70vh">
        <Spinner size="xl" thickness="4px" />
      </Flex>
    );
  }

  if (error || !supplyChainData) {
    return (
      <Flex justify="center" align="center" h="50vh" direction="column">
        <Text color="red.500" fontSize="xl" mb={4}>
          {error || t('fetch_supply_chain_error')}
        </Text>
        <Button colorScheme="blue" onClick={fetchSupplyChainData}>
          {t('retry')}
        </Button>
      </Flex>
    );
  }

  return (
    <Box p={{ base: 4, md: 8 }} maxW="1200px" mx="auto">
      <Flex justify="space-between" align="center" mb={6}>
        <Heading size="xl">{t('Supply Chain Tracker')}</Heading>
        
        <Flex>
          {user?.role === 'buyer' && (
            <Box bg="white" p={2} borderRadius="md" boxShadow="md" mr={2}>
              <Image 
                src={generateQRCodeUrl()} 
                alt="QR Code" 
                boxSize="80px"
              />
              <Text fontSize="xs" mt={1} textAlign="center">
                {t('scan_to_verify')}
              </Text>
            </Box>
          )}
          
          <Button 
            colorScheme="blue" 
            leftIcon={<FaFilePdf />}
            onClick={generateReport}
            isLoading={generatingReport}
          >
            Download Report
          </Button>
        </Flex>
      </Flex>

      <Text mb={8} fontSize="lg" color="gray.600">
        {t('Tracking Product')}: <strong>{supplyChainData?.product?.name}</strong>
        {supplyChainData?.product?.origin && (
          <Text fontSize="md" color="gray.500">
            {t('Origin')}: {supplyChainData.product.origin}
          </Text>
        )}
      </Text>
      
      {user?.role === 'farmer' && (
        <Flex mb={6} gap={3} wrap="wrap">
          <Button 
            colorScheme="teal" 
            leftIcon={<FaCheckCircle />}
            onClick={onOpen}
          >
            {t('Update Product Stage')}
          </Button>
          
          <Button 
            variant="outline" 
            leftIcon={<FaQrcode />}
            onClick={() => setActiveTab(1)}
          >
            {t('View QR Code')}
          </Button>
        </Flex>
      )}

      <VStack spacing={8} mb={10}>
        <ProgressBar 
          stages={productionStages} 
          title={t('Production Process')}
        />
        
        {showFulfillmentBar && (
          <ProgressBar 
            stages={fulfillmentStages} 
            title={t('Order Fulfillment')}
          />
        )}
      </VStack>
      
      <Tabs index={activeTab} onChange={setActiveTab} variant="enclosed" colorScheme="teal">
        <TabList>
          <Tab><Icon as={FaMapMarkedAlt} mr={2} /> {t('Map View')}</Tab>
          <Tab>
            <Flex align="center">
              {t('Blockchain Verification')}
              {isVerified && (
                <Icon as={FaCheckCircle} color="green.500" ml={2} />
              )}
            </Flex>
          </Tab>
          <Tab>{t('Journey Details')}</Tab>
        </TabList>
        
        <TabPanels mt={4}>
          {/* Enhanced Map View with Location Input */}
          <TabPanel p={0} ref={mapViewRef}>
            {user?.role === 'farmer' && (
              <LocationInputSection 
                locations={mapLocations} 
                onLocationsChange={setMapLocations} 
                onSaveJourney={saveJourneyToDatabase}
                isSaving={savingJourney}
                productId={productId}
              />
            )}
            
            {isGeocoding && (
              <Alert status="info" mb={4}>
                <AlertIcon />
                Converting locations to map points...
              </Alert>
            )}
            
            <SupplyChainMap 
              locations={getMapLocations()}
              center={mapCenter}
              zoom={mapZoom}
              onLocationSelect={(location) => {
                setSelectedLocation(location);
                if (location.coordinates) {
                  setMapCenter([location.coordinates.lat, location.coordinates.lng]);
                  setMapZoom(15);
                }
              }}
            />
            
            <Box mt={4} p={4} bg="white" borderRadius="md" boxShadow="md">
              <Heading size="md" mb={3}>Location Details</Heading>
              
              {getMapLocations().length > 0 ? (
                <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
                  {getMapLocations().map((loc, index) => {
                    const isLast = index === getMapLocations().length - 1;
                    return (
                      <Card 
                        key={index} 
                        borderRadius="md" 
                        boxShadow="sm"
                        borderLeft={isLast ? "4px solid" : undefined}
                        borderLeftColor={isLast ? "green.500" : undefined}
                      >
                        <CardBody>
                          <Flex justify="space-between" align="center">
                            <Badge 
                              colorScheme={
                                loc.type === 'farm' ? 'green' : 
                                loc.type === 'processing' ? 'blue' : 
                                loc.type === 'distribution' ? 'orange' : 'purple'
                              }
                              textTransform="capitalize"
                            >
                              {loc.type}
                            </Badge>
                            <Badge 
                              colorScheme={
                                loc.status === 'completed' ? 'green' : 
                                loc.status === 'in-progress' ? 'blue' : 'yellow'
                              }
                            >
                              {loc.status}
                            </Badge>
                          </Flex>
                          
                          <Text fontWeight="bold" mt={2}>{loc.name}</Text>
                          <Text fontSize="sm" color="gray.600">{loc.address}</Text>
                          
                          <Text fontSize="sm" mt={2}>
                            {new Date(loc.date).toLocaleDateString()}
                          </Text>
                          
                          {loc.coordinates && (
                            <Button 
                              size="sm" 
                              mt={2} 
                              leftIcon={<FaMapMarkedAlt />}
                              onClick={() => viewLocationOnMap(loc.coordinates)}
                            >
                              View on Map
                            </Button>
                          )}
                        </CardBody>
                      </Card>
                    );
                  })}
                </SimpleGrid>
              ) : (
                <Text color="gray.500" textAlign="center" py={4}>
                  {user?.role === 'farmer' 
                    ? 'Add locations above to see them displayed here' 
                    : 'No location data available'}
                </Text>
              )}
            </Box>
          </TabPanel>
          
          {/* Blockchain Verification */}
          <TabPanel ref={blockchainRef}>
            <Box mb={8} p={6} bg="white" borderRadius="xl" boxShadow="md">
              <Heading size="md" mb={4}>{t('Blockchain Verification')}</Heading>
              
              <Flex align="center" mb={4}>
                <Text mr={4} fontWeight="medium">{t('Verification Status')}:</Text>
                {isVerified ? (
                  <Badge colorScheme="green" fontSize="md" px={3} py={1} borderRadius="full">
                    <Flex align="center">
                      <Icon as={FaCheckCircle} mr={2} />
                      {t('Verified')}
                    </Flex>
                  </Badge>
                ) : (
                  <Badge colorScheme="red" fontSize="md" px={3} py={1} borderRadius="full">
                    {t('Not Verified')}
                  </Badge>
                )}
              </Flex>

              <Button
                colorScheme="blue"
                isLoading={isVerifying}
                onClick={verifyBlockchain}
                leftIcon={<FaCheckCircle />}
                mb={4}
              >
                {t('Verify on Blockchain')}
              </Button>

              {supplyChainData?.blockchainTxHash && (
                <Box mt={4}>
                  <Text fontWeight="medium" mb={2}>
                    {t('Blockchain Transaction')}:
                  </Text>
                  <Flex align="center" flexWrap="wrap">
                    <Link 
                      href={`https://etherscan.io/tx/${supplyChainData.blockchainTxHash}`} 
                      isExternal
                      color="blue.500"
                      wordBreak="break-word"
                      mr={2}
                      fontSize="sm"
                    >
                      {supplyChainData.blockchainTxHash}
                    </Link>
                    <Button 
                      size="xs" 
                      leftIcon={<FaCopy />}
                      onClick={() => copyToClipboard(supplyChainData.blockchainTxHash)}
                      mt={{ base: 1, md: 0 }}
                    >
                      {t('copy')}
                    </Button>
                  </Flex>
                  <Text mt={2} fontSize="sm" color="gray.600">
                    {t('blockchain explorer note')}
                  </Text>
                </Box>
              )}
            </Box>
            
            <Box p={6} bg="white" borderRadius="xl" boxShadow="md">
              <Heading size="md" mb={4}>{t('QR Verification')}</Heading>
              <Flex direction={{ base: 'column', md: 'row' }} align="center">
                <Box bg="white" p={3} borderRadius="md" border="1px solid" borderColor="gray.200">
                  <Image 
                    src={generateQRCodeUrl()} 
                    alt="QR Code" 
                    boxSize="128px"
                  />
                </Box>
                <Box ml={{ md: 6 }} mt={{ base: 4, md: 0 }}>
                  <Text mb={3}>
                    {t('scan qr description')}
                  </Text>
                  <Text fontSize="sm" color="gray.600" mb={2}>
                    {t('product_id')}: <Badge colorScheme="blue">{productId}</Badge>
                  </Text>
                  
                  <Text mt={4} fontSize="sm" fontStyle="italic" color="gray.500">
                    {t('blockchain note')}
                  </Text>
                </Box>
              </Flex>
            </Box>
          </TabPanel>
          
          {/* Journey Details */}
          <TabPanel ref={journeyRef}>
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
              {(supplyChainData?.events || []).map((event, index) => (
                <Card 
                  key={index} 
                  borderRadius="xl" 
                  boxShadow="md" 
                  borderTop="4px solid" 
                  borderTopColor={
                    event.status === 'completed' ? 'green.500' : 
                    event.status === 'in-progress' ? 'blue.500' : 'gray.300'
                  }
                  onClick={() => viewLocationOnMap(event.coordinates)}
                  cursor="pointer"
                  _hover={{ transform: 'translateY(-5px)', transition: 'transform 0.2s' }}
                >
                  <CardBody>
                    <Flex justify="space-between" align="center" mb={3}>
                      <Heading size="md">{event.stage}</Heading>
                      <Badge colorScheme={
                        event.status === 'completed' ? 'green' : 
                        event.status === 'in-progress' ? 'blue' : 'gray'
                      }>
                        {t(event.status)}
                      </Badge>
                    </Flex>
                    
                    <Text mb={2}>{event.description}</Text>
                    
                    <Text color="gray.500" fontSize="sm" mb={2}>
                      {new Date(event.timestamp).toLocaleString()}
                    </Text>
                    
                    {event.location && (
                      <Flex align="center" mb={2}>
                        <Icon as={FaLocationArrow} color="blue.500" mr={1} />
                        <Text fontWeight="medium">{event.location}</Text>
                      </Flex>
                    )}
                    
                    {event.coordinates && (
                      <HStack spacing={2} mb={2}>
                        <Text fontSize="xs" color="gray.500">
                          {event.coordinates.lat.toFixed(6)}, {event.coordinates.lng.toFixed(6)}
                        </Text>
                        <Button 
                          size="xs" 
                          variant="ghost" 
                          leftIcon={<FaCopy />}
                          onClick={(e) => {
                            e.stopPropagation();
                            copyToClipboard(
                              `${event.coordinates.lat},${event.coordinates.lng}`
                            );
                          }}
                        >
                          {t('copy')}
                        </Button>
                      </HStack>
                    )}
                    
                    {event.imageUrl && (
                      <Image 
                        src={event.imageUrl} 
                        alt={event.stage} 
                        mt={3}
                        borderRadius="md"
                        maxH="150px"
                        objectFit="cover"
                      />
                    )}
                    
                    {event.blockchainTxHash && (
                      <Box mt={2}>
                        <Text fontSize="xs" fontWeight="bold" color="gray.500">
                          {t('blockchain hash')}:
                        </Text>
                        <Text fontSize="xs" color="gray.500" wordBreak="break-all">
                          {event.blockchainTxHash}
                        </Text>
                      </Box>
                    )}
                    
                    <Button 
                      size="sm" 
                      mt={3} 
                      variant="outline" 
                      leftIcon={<FaExternalLinkAlt />}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (event.coordinates) {
                          window.open(
                            `https://www.google.com/maps/search/?api=1&query=${event.coordinates.lat},${event.coordinates.lng}`,
                            '_blank'
                          );
                        }
                      }}
                      isDisabled={!event.coordinates}
                    >
                      {t('view on map')}
                    </Button>
                  </CardBody>
                </Card>
              ))}
            </SimpleGrid>
          </TabPanel>
        </TabPanels>
      </Tabs>

      {/* Update Stage Modal - Only for farmers */}
      {user?.role === 'farmer' && (
        <Modal isOpen={isOpen} onClose={onClose} size="xl">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>{t('Update Product Stage')}</ModalHeader>
            <ModalCloseButton />
            <ModalBody pb={6}>
              <Select 
                placeholder={t('select stage')}
                value={updateData.stage}
                onChange={(e) => setUpdateData({...updateData, stage: e.target.value})}
                mb={4}
              >
                <optgroup label={t('Production Process')}>
                  <option value="planting">{t('Planting')}</option>
                  <option value="harvesting">{t('Harvesting')}</option>
                  <option value="transport">{t('Transport')}</option>
                  <option value="processing">{t('Processing')}</option>
                  <option value="distribution">{t('Distribution')}</option>
                </optgroup>
                
                <optgroup label={t('Order Fulfillment')}>
                  <option value="packaging">{t('Packaging')}</option>
                  <option value="shipped">{t('Shipped')}</option>
                  <option value="delivered">{t('Delivered')}</option>
                </optgroup>
              </Select>
              
              <Textarea 
                placeholder={t('update details placeholder')}
                value={updateData.description}
                onChange={(e) => setUpdateData({...updateData, description: e.target.value})}
                mb={4}
                minH="120px"
              />
              
              <Flex justify="flex-end" mt={4}>
                <Button variant="outline" mr={3} onClick={onClose}>
                  {t('cancel')}
                </Button>
                <Button 
                  colorScheme="teal" 
                  onClick={handleStageUpdate}
                  isDisabled={!updateData.stage}
                >
                  {t('update stage')}
                </Button>
              </Flex>
            </ModalBody>
          </ModalContent>
        </Modal>
      )}
    </Box>
  );
};

export default SupplyChainTracker;