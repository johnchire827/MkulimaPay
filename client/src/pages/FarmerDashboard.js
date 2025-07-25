import React, { useState, useEffect, useMemo, useRef, useContext } from 'react'; 
import { 
  Box, Heading, Text, Textarea, Button, SimpleGrid, Card, CardHeader, CardBody, CardFooter, 
  Flex, Spinner, Badge, Icon, Tabs, TabList, Tab, TabPanels, TabPanel, Stat, 
  StatLabel, StatNumber, StatHelpText, StatArrow, useDisclosure, useToast,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody,
  ModalFooter, FormControl, FormLabel, Input, Select, Table, Thead, Tbody,
  Tr, Th, Td, Progress, Tag, InputGroup, InputLeftAddon, InputRightElement, InputLeftElement,
  Image, Alert, AlertIcon, AlertTitle, AlertDescription, Stack, Avatar,
  VStack, Checkbox, Link, useColorModeValue, Wrap, WrapItem, Center, HStack
} from '@chakra-ui/react'; 
import { 
  FaPlus, FaStar, FaTractor, FaChartLine, FaLeaf, FaMoneyBillWave, 
  FaShoppingCart, FaCalendarAlt, FaEdit, FaTrash, FaSearch, FaCheck, FaTimes,
  FaHandshake, FaHandHoldingUsd, FaUserAlt, FaFileExport, FaShippingFast, FaStore,
  FaChartBar, FaChartPie, FaSeedling, FaPiggyBank, FaCoins
} from 'react-icons/fa'; 
import { motion } from 'framer-motion';
import YieldPrediction from '../components/farmer/YieldPrediction'; 
import { useAuth } from '../context/AuthContext'; 
import { useLanguage } from '../context/LanguageContext'; 
import { useNavigate } from 'react-router-dom';
import { FinancialDataContext } from '../context/FinancialDataContext';
import api from '../services/api';


const MotionCard = motion(Card);
const MotionButton = motion(Button);

// New Chart Component
const RevenueInventoryChart = ({ revenue, inventoryValue }) => {
  const maxValue = Math.max(revenue, inventoryValue, 1);
  
  return (
    <Box bg="white" p={6} borderRadius="xl" boxShadow="md" mb={8}>
      <Heading size="md" mb={6} textAlign="center">Financial Performance</Heading>
      
      <Flex justify="space-between" mb={4}>
        <Box w="45%">
          <Text fontWeight="bold" mb={2}>Total Revenue</Text>
          <Box bg="gray.100" h="200px" borderRadius="md" position="relative" overflow="hidden">
            <Box
              position="absolute"
              bottom="0"
              left="0"
              right="0"
              bg="green.400"
              height={`${(revenue / maxValue) * 100}%`}
              transition="height 0.5s ease-in-out"
              borderRadius="md md 0 0"
            />
            <Text 
              position="absolute" 
              bottom="10px" 
              left="0" 
              right="0" 
              textAlign="center" 
              fontWeight="bold" 
              fontSize="lg"
              color="white"
              textShadow="0 1px 2px rgba(0,0,0,0.5)"
            >
              KES {revenue.toLocaleString()}
            </Text>
          </Box>
        </Box>
        
        <Box w="45%">
          <Text fontWeight="bold" mb={2}>Inventory Value</Text>
          <Box bg="gray.100" h="200px" borderRadius="md" position="relative" overflow="hidden">
            <Box
              position="absolute"
              bottom="0"
              left="0"
              right="0"
              bg="blue.400"
              height={`${(inventoryValue / maxValue) * 100}%`}
              transition="height 0.5s ease-in-out"
              borderRadius="md md 0 0"
            />
            <Text 
              position="absolute" 
              bottom="10px" 
              left="0" 
              right="0" 
              textAlign="center" 
              fontWeight="bold" 
              fontSize="lg"
              color="white"
              textShadow="0 1px 2px rgba(0,0,0,0.5)"
            >
              KES {inventoryValue.toLocaleString()}
            </Text>
          </Box>
        </Box>
      </Flex>
      
      <SimpleGrid columns={2} spacing={4} mt={6}>
        <Card bg="green.50" borderRadius="lg">
          <CardBody>
            <Stat>
              <StatLabel>Revenue Trend</StatLabel>
              <StatNumber>KES {revenue.toLocaleString()}</StatNumber>
              <StatHelpText>
                Total sales to date
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>
        
        <Card bg="blue.50" borderRadius="lg">
          <CardBody>
            <Stat>
              <StatLabel>Inventory Value</StatLabel>
              <StatNumber>KES {inventoryValue.toLocaleString()}</StatNumber>
              <StatHelpText>
                Current stock valuation
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>
      </SimpleGrid>
    </Box>
  );
};

const FarmerDashboard = () => { 
  const navigate = useNavigate(); 
  const { user } = useAuth(); 
  const { t } = useLanguage(); 
  const toast = useToast(); 
  const { isOpen, onOpen, onClose } = useDisclosure(); 
  const [products, setProducts] = useState([]); 
  const [loading, setLoading] = useState(true); 
  const [stats, setStats] = useState({ 
    totalSales: 0, 
    pendingOrders: 0, 
    earnings: 0, 
    rating: 0,
    inventoryValue: 0, 
    pendingBids: 0,
    previousTotalSales: 0,
    growthPercentage: 0,
    instoreSalesTotal: 0
  }); 
  const [orders, setOrders] = useState([]); 
  const [editProduct, setEditProduct] = useState(null); 
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false); 
  const [productToDelete, setProductToDelete] = useState(null); 
  const [searchTerm, setSearchTerm] = useState(''); 
  const [selectedOrder, setSelectedOrder] = useState(null); 
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false); 
  const [bids, setBids] = useState([]); 
  const [isBidLoading, setIsBidLoading] = useState(true); 
  const [selectedBid, setSelectedBid] = useState(null); 
  const [isBidModalOpen, setIsBidModalOpen] = useState(false); 
  const [reviews, setReviews] = useState([]);
  
  // State for instore sales
  const [instoreSales, setInstoreSales] = useState([]);
  const [isInstoreLoading, setIsInstoreLoading] = useState(true);
  const [instoreForm, setInstoreForm] = useState({
    productId: '',
    quantity: 1,
    paymentMethod: 'cash'
  });
  
  const [formData, setFormData] = useState({ 
    name: '', 
    description: '', 
    price: '', 
    quantity: '',
    unit: 'kg', 
    category: 'Vegetables', 
    location: 'Nairobi', 
    organic: false, 
    image: null 
  }); 
  const [isSubmitting, setIsSubmitting] = useState(false); 

  // Financial context for credit scoring
  const { setFinancialData } = useContext(FinancialDataContext);
  
  // Backend configuration 
  const backendBaseUrl = process.env.REACT_APP_API_URL || 'http://localhost:8080'; 
  
  // Enhanced image URL handler for all images 
  const getFullImageUrl = (url) => { 
    if (!url) return '/placeholder.jpg'; 
    if (url.startsWith('http')) return url;
    return `${backendBaseUrl}${url}`; 
  }; 

  // UI Colors
  const bgGradient = useColorModeValue(
    'linear(to-r, teal.50, blue.50)',
    'linear(to-r, gray.800, blue.900)'
  );
  const cardBg = useColorModeValue('white', 'gray.700');
  const accentColor = useColorModeValue('teal.500', 'teal.300');
  const activeTabBg = useColorModeValue('teal.100', 'teal.700');
  const activeTabColor = useColorModeValue('teal.700', 'teal.100');

  // Calculate inventory value
  const inventoryValue = useMemo(() => {
    return products.reduce((total, product) => {
      return total + (parseFloat(product.price) || 0) * (parseInt(product.quantity) || 0);
    }, 0);
  }, [products]);

  // Update financial context when stats change
  useEffect(() => {
    setFinancialData({
      totalSales: stats.totalSales,
      growthPercentage: stats.growthPercentage,
      inventoryValue,
      rating: stats.rating,
      pendingOrders: stats.pendingOrders,
      instoreSalesTotal: stats.instoreSalesTotal
    });
  }, [stats, inventoryValue, setFinancialData]);

  // Fetch reviews for farmer's products
  const fetchFarmerReviews = async () => {
    try {
      const response = await api.get(`/farmers/${user.id}/reviews`);
      setReviews(response.data);
      
      if (response.data.length > 0) {
        const totalRating = response.data.reduce((sum, review) => sum + review.rating, 0);
        const avgRating = totalRating / response.data.length;
        
        setStats(prev => ({
          ...prev,
          rating: parseFloat(avgRating.toFixed(1))
        }));
      }
    } catch (error) {
      toast({ 
        title: "Error", 
        description: "Failed to load reviews", 
        status: 'error', 
        duration: 5000, 
        isClosable: true, 
      });
    }
  };

  // Fetch instore sales for the farmer
  const fetchFarmerInstoreSales = async () => {
    try {
      setIsInstoreLoading(true);
      const response = await api.get(`/instore-sales/farmer/${user.id}`);
      setInstoreSales(response.data);
      
      // Calculate total instore sales
      const total = response.data.reduce((sum, sale) => sum + (parseFloat(sale.amount) || 0), 0);
      
      setStats(prev => ({
        ...prev,
        instoreSalesTotal: total
      }));
    } catch (error) {
      toast({ 
        title: "Error", 
        description: "Failed to load instore sales", 
        status: 'error', 
        duration: 5000, 
        isClosable: true, 
      });
    } finally {
      setIsInstoreLoading(false);
    }
  };

  // Fetch bids for the farmer 
  const fetchFarmerBids = async () => { 
    try { 
      setIsBidLoading(true); 
      const response = await api.get(`/bids/farmer/${user.id}`); 
      setBids(response.data); 
      setStats(prev => ({ 
        ...prev, 
        pendingBids: response.data.filter(b => b.status === 'pending').length 
      })); 
    } catch (error) { 
      toast({ 
        title: "Error", 
        description: "Failed to load bids", 
        status: 'error', 
        duration: 5000, 
        isClosable: true, 
      }); 
    } finally { 
      setIsBidLoading(false); 
    } 
  }; 

  // Fetch products for the farmer 
  const fetchFarmerProducts = async () => { 
    try { 
      const response = await api.get(`/farmers/${user.id}/products`); 
      setProducts(response.data); 
    } catch (error) { 
      toast({ 
        title: "Error", 
        description: "Failed to load products", 
        status: 'error', 
        duration: 5000, 
        isClosable: true, 
      }); 
    } 
  }; 

  // Fetch stats for the farmer 
  const fetchFarmerStats = async () => { 
    try { 
      const response = await api.get(`/farmers/${user.id}/stats`); 
      setStats(prev => ({ ...prev, ...response.data })); 
    } catch (error) { 
      toast({ 
        title: "Error", 
        description: "Failed to load stats", 
        status: 'error', 
        duration: 5000, 
        isClosable: true, 
      }); 
    } 
  }; 

  // Fetch orders for the farmer 
  const fetchFarmerOrders = async () => { 
    try { 
      const response = await api.get(`/farmers/${user.id}/orders`); 
      setOrders(response.data); 
      
      const pendingOrders = response.data.filter(order => order.status === 'pending').length; 
      
      const totalSales = response.data
        .filter(order => order.status === 'completed')
        .reduce((sum, order) => sum + (parseFloat(order.total_amount) || 0), 0);
      
      const growthPercentage = stats.totalSales > 0 
        ? ((totalSales - stats.previousTotalSales) / stats.previousTotalSales) * 100 
        : 0;
      
      setStats(prev => ({ 
        ...prev, 
        pendingOrders,
        totalSales,
        growthPercentage
      })); 
    } catch (error) { 
      toast({ 
        title: "Error", 
        description: "Failed to load orders", 
        status: 'error', 
        duration: 5000, 
        isClosable: true, 
      }); 
    } 
  }; 

  // Fetch all data on component mount 
  useEffect(() => { 
    const fetchData = async () => { 
      try { 
        setLoading(true); 
        await Promise.all([ 
          fetchFarmerProducts(), 
          fetchFarmerStats(), 
          fetchFarmerOrders(), 
          fetchFarmerBids(),
          fetchFarmerReviews(),
          fetchFarmerInstoreSales()
        ]); 
      } catch (error) { 
        toast({ 
          title: "Error", 
          description: "Failed to load data", 
          status: 'error', 
          duration: 5000, 
        isClosable: true, 
      }); 
    } finally { 
      setLoading(false); 
    } 
  }; 
  
  if (user) fetchData(); 
}, [user, toast]); 

// Store previous total sales for growth calculation
const prevTotalSalesRef = useRef(0);
useEffect(() => {
  if (stats.totalSales !== prevTotalSalesRef.current) {
    prevTotalSalesRef.current = stats.totalSales;
    setStats(prev => ({
      ...prev,
      previousTotalSales: prevTotalSalesRef.current
    }));
  }
}, [stats.totalSales]);

// Handle instore sale form submission
const handleInstoreSale = async (e) => {
  e.preventDefault();
  try {
    await api.post('/instore-sales', {
      productId: instoreForm.productId,
      quantity: instoreForm.quantity,
      paymentMethod: instoreForm.paymentMethod
    });
    
    toast({
      title: "Sale Recorded",
      description: "Instore sale recorded successfully",
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
    
    // Reset form
    setInstoreForm({
      productId: '',
      quantity: 1,
      paymentMethod: instoreForm.paymentMethod // Keep payment method
    });
    
    // Refresh data
    await fetchFarmerProducts();
    await fetchFarmerStats();
    await fetchFarmerInstoreSales();
  } catch (error) {
    toast({
      title: "Error",
      description: error.response?.data?.error || "Failed to record sale",
      status: 'error',
      duration: 5000,
      isClosable: true,
    });
  }
};

// Initialize form data when modal opens 
useEffect(() => { 
  if (isOpen) { 
    if (editProduct) { 
      setFormData({ 
        name: editProduct.name, 
        description: editProduct.description, 
        price: editProduct.price.toString(), 
        quantity: editProduct.quantity.toString(),
        unit: editProduct.unit, 
        category: editProduct.category, 
        location: editProduct.location, 
        organic: editProduct.organic || false, 
        image: null 
      }); 
    } else { 
      setFormData({ 
        name: '', 
        description: '', 
        price: '', 
        quantity: '',
        unit: 'kg', 
        category: 'Vegetables', 
        location: 'Nairobi', 
        organic: false, 
        image: null 
      }); 
    } 
  } 
}, [isOpen, editProduct]); 

// Handle form input changes 
const handleFormChange = (e) => {
  const { name, value, type, checked } = e.target;
  setFormData(prev => ({
    ...prev,
    [name]: type === 'checkbox' ? checked : value
  }));
};

// Handle image selection 
const handleImageChange = (e) => { 
  if (e.target.files && e.target.files[0]) { 
    setFormData(prev => ({ ...prev, image: e.target.files[0] })); 
  } 
}; 

// Submit product form 
const handleSubmitProduct = async (e) => { 
  e.preventDefault(); 
  setIsSubmitting(true); 
  
  if (!formData.name || !formData.price || !formData.category || !formData.quantity) { 
    toast({ 
      title: 'Missing Information', 
      description: 'Please fill in all required fields', 
      status: 'warning', 
      duration: 5000, 
      isClosable: true, 
    }); 
    setIsSubmitting(false); 
    return; 
  } 
  
  try { 
    const formPayload = new FormData(); 
    
    Object.entries(formData).forEach(([key, value]) => { 
      if (value !== null && value !== undefined) { 
        if (key === 'image' && value) { 
          formPayload.append('image', value); 
        } else if (key === 'quantity' || key === 'price') {
          const numValue = key === 'quantity' ? parseInt(value) : parseFloat(value);
          formPayload.append(key, isNaN(numValue) ? 0 : numValue);
        } else { 
          formPayload.append(key, value); 
        } 
      } 
    }); 

    formPayload.append('farmer_id', user.id); 

    let response; 
    if (editProduct) { 
      response = await api.patch(`/products/${editProduct.id}`, formPayload, { 
        headers: {  
          'Content-Type': 'multipart/form-data', 
          'Authorization': `Bearer ${user.token}` 
        } 
      }); 
    } else { 
      response = await api.post('/products/', formPayload, { 
        headers: {  
          'Content-Type': 'multipart/form-data', 
          'Authorization': `Bearer ${user.token}` 
        } 
      }); 
    } 
    
    toast({ 
      title: editProduct ? 'Product Updated' : 'Product Added', 
      description: editProduct  
        ? 'Your product has been updated successfully'  
        : 'New product added to your inventory', 
      status: 'success', 
      duration: 3000, 
      isClosable: true, 
    }); 
    
    await fetchFarmerProducts(); 
    onClose(); 
  } catch (error) { 
    let errorMsg = 'Failed to save product'; 
    
    if (error.response) { 
      if (error.response.status === 401) { 
        errorMsg = 'Session expired. Please log in again'; 
      } else if (error.response.data && error.response.data.message) { 
        errorMsg = error.response.data.message; 
      } 
    } 
    
    toast({ 
      title: 'Error', 
      description: errorMsg, 
      status: 'error', 
      duration: 5000, 
      isClosable: true, 
    }); 
  } finally { 
    setIsSubmitting(false); 
    setEditProduct(null); 
  } 
}; 

// Edit a product 
const handleEditProduct = (product) => { 
  setEditProduct(product); 
  onOpen(); 
}; 

// Confirm product deletion 
const handleDeleteClick = (product) => { 
  setProductToDelete(product); 
  setIsDeleteModalOpen(true); 
}; 

// Delete a product 
const confirmDeleteProduct = async () => { 
  try { 
    await api.delete(`/products/${productToDelete.id}`, { 
      headers: {  
        'Authorization': `Bearer ${user.token}` 
      } 
    }); 
    
    setProducts(products.filter(p => p.id !== productToDelete.id)); 
    toast({ 
      title: "Product Deleted", 
      description: `${productToDelete.name} has been removed from your inventory`, 
      status: 'success', 
      duration: 3000, 
      isClosable: true, 
    }); 
    
    await fetchFarmerProducts();
  } catch (error) { 
    let errorMsg = "Failed to delete product"; 
    
    if (error.response) { 
      if (error.response.status === 404) { 
        errorMsg = "Product not found"; 
      } else if (error.response.data && error.response.data.error) { 
        errorMsg = error.response.data.error; 
      } 
    } 
    
    toast({ 
      title: "Error", 
      description: errorMsg, 
      status: 'error', 
      duration: 5000, 
      isClosable: true, 
    }); 
  } finally { 
    setIsDeleteModalOpen(false); 
    setProductToDelete(null); 
  } 
}; 

// View order details 
const handleViewOrder = (order) => { 
  setSelectedOrder(order); 
  setIsOrderModalOpen(true); 
}; 

// Update order status 
const handleUpdateOrderStatus = async (orderId, newStatus) => { 
  try { 
    const normalizedStatus = newStatus.toLowerCase(); 
    
    await api.patch( 
      `/orders/${orderId}/status`,  
      { status: normalizedStatus }, 
      { 
        headers: { 
          'Authorization': `Bearer ${user.token}` 
        } 
      } 
    ); 

    setOrders(orders.map(order =>  
      order.id === orderId ? { ...order, status: newStatus } : order 
    )); 
    
    if (selectedOrder && selectedOrder.id === orderId) { 
      setSelectedOrder({ ...selectedOrder, status: newStatus }); 
    } 

    if (newStatus === 'completed') {
      await fetchFarmerOrders();
    } else {
      setStats(prev => ({ 
        ...prev, 
        pendingOrders: orders.filter(order => order.status === 'pending').length
      })); 
    }
  } catch (error) { 
    console.error('Status update failed:', error.response?.data || error.message); 
    toast({ 
      title: "Update Failed", 
      description: error.response?.data?.error || "Could not update order status", 
      status: 'error', 
      duration: 5000, 
      isClosable: true, 
    }); 
  } 
}; 

// Update bid status 
const handleBidStatusUpdate = async (bidId, status) => { 
  try { 
    await api.patch(`/bids/${bidId}/status`, { status }); 
    
    setBids(bids.map(bid =>  
      bid.id === bidId ? { ...bid, status } : bid 
    )); 
    
    await fetchFarmerBids(); 
    
    toast({ 
      title: `Bid ${status.charAt(0).toUpperCase() + status.slice(1)}`, 
      description: status === 'accepted' ? 'Order created successfully' : 'Bid updated', 
      status: 'success', 
      duration: 3000, 
      isClosable: true, 
    }); 
    
    setIsBidModalOpen(false); 
    
  } catch (error) { 
    toast({ 
      title: "Update Failed", 
      description: error.response?.data?.message || "Could not update bid status", 
      status: 'error', 
      duration: 5000, 
      isClosable: true, 
    }); 
  } 
}; 

// View bid details 
const handleViewBid = (bid) => { 
  setSelectedBid(bid); 
  setIsBidModalOpen(true); 
}; 

// Filter products based on search term 
const filteredProducts = products.filter(product =>  
  product.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
  product.category.toLowerCase().includes(searchTerm.toLowerCase()) 
); 

// Calculate bid statistics 
const bidStatistics = useMemo(() => { 
  if (bids.length === 0) { 
    return { 
      avgBidValue: 0, 
      acceptanceRate: 0, 
      completionRate: 0
    }; 
  } 
  
  const totalBidAmount = bids.reduce((sum, bid) => sum + (parseFloat(bid.amount) || 0), 0); 
  const avgBidValue = totalBidAmount / bids.length; 
  
  const acceptedBids = bids.filter(bid => bid.status === 'accepted').length; 
  const respondedBids = bids.filter(bid =>  
    bid.status === 'accepted' || bid.status === 'rejected' 
  ).length; 
  const acceptanceRate = respondedBids > 0 ?  
    Math.round((acceptedBids / respondedBids) * 100) : 0; 
  
  const totalBids = bids.length;
  const completedBids = bids.filter(bid => 
    bid.status === 'accepted' || bid.status === 'rejected'
  ).length;
  const completionRate = totalBids > 0 ? 
    Math.round((completedBids / totalBids) * 100) : 0;
  
  return { 
    avgBidValue,
    acceptanceRate,
    completionRate
  }; 
}, [bids]); 

// Calculate category distribution for yield prediction 
const categoryDistribution = useMemo(() => { 
  const counts = {}; 
  products.forEach(product => { 
    const category = product.category || 'Other'; 
    counts[category] = (counts[category] || 0) + 1; 
  }); 
  
  const total = products.length; 
  const distribution = {}; 
  Object.keys(counts).forEach(category => { 
    distribution[category] = Math.round((counts[category] / total) * 100); 
  }); 
  
  return distribution; 
}, [products]); 

// Export inventory to CSV
const exportToCSV = (data, headers, rowMapper, filename) => {
  if (data.length === 0) {
    toast({
      title: "No data",
      description: `There are no ${filename} to export`,
      status: 'info',
      duration: 3000,
      isClosable: true,
    });
    return;
  }

  const rows = data.map(rowMapper);
  
  let csvContent = headers.join(',') + '\n';
  rows.forEach(row => {
    csvContent += row.join(',') + '\n';
  });

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${new Date().toISOString().slice(0,10)}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  toast({
    title: `${filename} Exported`,
    description: `Your ${filename} has been downloaded as CSV`,
    status: 'success',
    duration: 3000,
    isClosable: true,
  });
};

const exportInventoryToCSV = () => {
  const headers = ['Name', 'Category', 'Price (KES)', 'Unit', 'Quantity', 'Location', 'Organic', 'Total Value (KES)'];
  const rowMapper = product => [
    `"${product.name}"`,
    `"${product.category}"`,
    parseFloat(product.price) || 0,
    product.unit,
    parseInt(product.quantity) || 0,
    `"${product.location}"`,
    product.organic ? 'Yes' : 'No',
    (parseFloat(product.price) || 0) * (parseInt(product.quantity) || 0)
  ];
  
  exportToCSV(filteredProducts, headers, rowMapper, 'inventory');
};

const exportOrdersToCSV = () => {
  const headers = ['Order ID', 'Customer ID', 'Date', 'Total Amount (KES)', 'Status', 'Payment Method', 'Products'];
  const rowMapper = order => [
    order.id,
    order.user_id,
    new Date(order.created_at).toLocaleDateString(),
    parseFloat(order.total_amount) || 0,
    order.status,
    order.payment_method || 'N/A',
    (order.products || []).map(p => p.name).join('; ')
  ];
  
  exportToCSV(orders, headers, rowMapper, 'orders');
};

const exportBidsToCSV = () => {
  const headers = ['Bid ID', 'Buyer Name', 'Product', 'Amount (KES)', 'Status', 'Date'];
  const rowMapper = bid => [
    bid.id,
    `"${bid.buyer_name}"`,
    `"${bid.product_name}"`,
    parseFloat(bid.amount) || 0,
    bid.status,
    new Date(bid.created_at).toLocaleDateString()
  ];
  
  exportToCSV(bids, headers, rowMapper, 'bids');
};

// Group orders for financial transactions
const groupedTransactions = useMemo(() => {
  const groups = {};
  
  orders.forEach(order => {
    const key = `${order.user_id}-${order.status}`;
    
    if (!groups[key]) {
      groups[key] = {
        user_id: order.user_id,
        status: order.status,
        totalAmount: 0,
        orderCount: 0,
        products: new Set()
      };
    }
    
    groups[key].totalAmount += parseFloat(order.total_amount) || 0;
    groups[key].orderCount += 1;
    
    if (order.products && order.products.length > 0) {
      order.products.forEach(p => {
        groups[key].products.add(p.name);
      });
    }
  });
  
  return Object.values(groups).map(group => ({
    ...group,
    description: `${group.orderCount} orders: ${Array.from(group.products).join(', ')}`
  }));
}, [orders]);

// Realistic sustainability metrics based on farmer data
const sustainabilityMetrics = useMemo(() => {
  const totalProducts = products.length;
  const organicProducts = products.filter(p => p.organic).length;
  const localProducts = products.filter(p => p.location === 'Nairobi').length;
  
  return {
    organicPercentage: totalProducts > 0 ? Math.round((organicProducts / totalProducts) * 100) : 0,
    localPercentage: totalProducts > 0 ? Math.round((localProducts / totalProducts) * 100) : 0,
    completedOrders: orders.filter(o => o.status === 'completed').length,
    acceptedBids: bids.filter(b => b.status === 'accepted').length
  };
}, [products, orders, bids]);

// Tab data with counts
const tabData = [
  { id: 'products', name: 'Product Inventory', icon: FaTractor, count: products.length },
  { id: 'bids', name: 'Bid Management', icon: FaHandshake, count: stats.pendingBids },
  { id: 'orders', name: 'Orders', icon: FaShoppingCart, count: stats.pendingOrders },
  { id: 'analytics', name: 'Analytics', icon: FaChartBar },
  { id: 'sustainability', name: 'Sustainability', icon: FaSeedling },
  { id: 'finances', name: 'Finances', icon: FaPiggyBank },
  { id: 'instore', name: 'Instore Sales', icon: FaStore, count: instoreSales.length }
];

return ( 
  <Box p={{ base: 4, md: 8 }} bg={bgGradient} minH="100vh"> 
    {/* Delete Product Modal */} 
    <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)}> 
      <ModalOverlay /> 
      <ModalContent borderRadius="xl"> 
        <ModalHeader>Confirm Deletion</ModalHeader> 
        <ModalCloseButton /> 
        <ModalBody> 
          <Text mb={4}> 
            Are you sure you want to delete <Text as="span" fontWeight="bold">{productToDelete?.name}</Text>? This action cannot be undone. 
          </Text> 
        </ModalBody> 
        <ModalFooter> 
          <Button variant="outline" mr={3} onClick={() => setIsDeleteModalOpen(false)}> 
            Cancel 
          </Button> 
          <Button colorScheme="red" onClick={confirmDeleteProduct}> 
            Delete Product 
          </Button> 
        </ModalFooter> 
      </ModalContent> 
    </Modal> 

    {/* Order Detail Modal */} 
    <Modal isOpen={isOrderModalOpen} onClose={() => setIsOrderModalOpen(false)} size="xl"> 
      <ModalOverlay /> 
      <ModalContent borderRadius="xl"> 
        <ModalHeader>Order Details</ModalHeader> 
        <ModalCloseButton /> 
        <ModalBody> 
          {selectedOrder && ( 
            <> 
              <Flex justify="space-between" mb={4}> 
                <Box> 
                  <Text fontWeight="bold">Order ID: #{selectedOrder.id}</Text> 
                  <Text color="gray.500"> 
                    {new Date(selectedOrder.created_at).toLocaleDateString()} 
                  </Text> 
                </Box> 
                <Badge  
                  colorScheme={ 
                    selectedOrder.status === 'completed' ? 'green' :  
                    selectedOrder.status === 'processing' ? 'blue' :  
                    selectedOrder.status === 'pending' ? 'orange' : 'gray' 
                  } 
                  fontSize="md" 
                  px={3} 
                  py={1} 
                > 
                  {selectedOrder.status} 
                </Badge> 
              </Flex> 
              
              <Text fontWeight="bold" mb={2}>Customer Information:</Text> 
              <Text mb={4}>User #{selectedOrder.user_id}</Text> 

              <Text fontWeight="bold" mb={2}>Delivery Address:</Text> 
              <Text mb={4}>{selectedOrder.shipping_address || 'N/A'}</Text> 
              
              <Text fontWeight="bold" mb={2}>Payment Method:</Text> 
              <Text mb={4}>{selectedOrder.payment_method || 'N/A'}</Text> 
              
              <Text fontWeight="bold" mb={2}>Products:</Text>
              <Box mb={4}>
                {selectedOrder.products && selectedOrder.products.map((product, index) => (
                  <Text key={index}>
                    - {product.name} ({product.quantity} {product.unit})
                  </Text>
                ))}
              </Box>
              
              <Flex justify="flex-end" mb={4}> 
                <Box textAlign="right"> 
                  <Text fontWeight="bold" fontSize="lg"> 
                    Total: KES {selectedOrder.total_amount?.toLocaleString() || 'N/A'} 
                  </Text> 
                </Box> 
              </Flex> 
            </> 
          )} 
        </ModalBody> 
        <ModalFooter> 
          <Button  
            colorScheme="teal"
            mr={2}
            onClick={() => navigate(`/order-confirmation/${selectedOrder.id}`)}
            leftIcon={<FaShippingFast />}
          >
            Supply Chain Tracker
          </Button>
          <Button  
            colorScheme="green"  
            mr={2} 
            onClick={() => handleUpdateOrderStatus(selectedOrder.id, 'completed')} 
            isDisabled={selectedOrder?.status === 'completed'} 
          > 
            Mark as Completed 
          </Button> 
          <Button  
            variant="outline" 
            onClick={() => handleUpdateOrderStatus(selectedOrder.id, 'processing')} 
            isDisabled={selectedOrder?.status === 'processing' || selectedOrder?.status === 'completed'} 
          > 
            Mark as Processing 
          </Button> 
        </ModalFooter> 
      </ModalContent> 
    </Modal> 

    {/* Bid Detail Modal */} 
    <Modal isOpen={isBidModalOpen} onClose={() => setIsBidModalOpen(false)} size="lg"> 
      <ModalOverlay /> 
      <ModalContent borderRadius="xl"> 
        <ModalHeader>Bid Details</ModalHeader> 
        <ModalCloseButton /> 
        <ModalBody> 
          {selectedBid && ( 
            <> 
              <Flex justify="space-between" mb={4}> 
                <Box> 
                  <Text fontWeight="bold">Bid ID: #{selectedBid.id}</Text> 
                  <Text color="gray.500">{new Date(selectedBid.created_at).toLocaleDateString()}</Text> 
                </Box> 
                <Badge  
                  colorScheme={ 
                    selectedBid.status === 'accepted' ? 'green' :  
                    selectedBid.status === 'rejected' ? 'red' : 'orange' 
                  } 
                  fontSize="md" 
                  px={3} 
                  py={1} 
                > 
                  {selectedBid.status} 
                </Badge> 
              </Flex> 
              
              <Flex mb={4} align="center"> 
                <Avatar  
                  name={selectedBid.buyer_name}  
                  bg={selectedBid.status === 'accepted' ? 'green.500' : 
                      selectedBid.status === 'rejected' ? 'red.500' : 'orange.500'}
                  color="white"
                /> 
                <Box ml={3}> 
                  <Text fontWeight="bold">{selectedBid.buyer_name}</Text> 
                  <Text color="gray.500">{selectedBid.buyer_location}</Text> 
                </Box> 
              </Flex> 
              
              <Card mb={4} borderLeft="4px solid" borderColor="green.500"> 
                <CardBody> 
                  <Flex align="center"> 
                    <Image  
                      src={getFullImageUrl(selectedBid.product_image)}  
                      alt={selectedBid.product_name} 
                      boxSize="60px" 
                      objectFit="cover" 
                      borderRadius="md" 
                      mr={4} 
                      fallbackSrc="/placeholder.jpg"
                    /> 
                    <Box> 
                      <Text fontWeight="bold">{selectedBid.product_name}</Text> 
                      <Text color="gray.500">{selectedBid.product_category}</Text> 
                    </Box> 
                    <Text ml="auto" fontSize="xl" fontWeight="bold"> 
                      KES {selectedBid.amount.toLocaleString()} 
                    </Text> 
                  </Flex> 
                </CardBody> 
              </Card> 
              
              <Text fontWeight="bold" mb={2}>Bid Message:</Text> 
              <Text p={3} bg="gray.50" borderRadius="md" mb={4}> 
                {selectedBid.message || "No additional message provided"} 
              </Text> 
              
              {selectedBid.status === 'pending' && ( 
                <Alert status="info" borderRadius="md" mb={4}> 
                  <AlertIcon /> 
                  <Box> 
                    <AlertTitle>Action Required</AlertTitle> 
                    <AlertDescription> 
                      Respond to this bid within 48 hours 
                    </AlertDescription> 
                  </Box> 
                </Alert> 
              )} 
            </> 
          )} 
        </ModalBody> 
        <ModalFooter> 
          {selectedBid?.status === 'pending' && ( 
            <> 
              <Button  
                colorScheme="red"  
                mr={2} 
                onClick={() => handleBidStatusUpdate(selectedBid.id, 'rejected')} 
                leftIcon={<FaTimes />} 
              > 
                Reject Bid 
              </Button> 
              <Button  
                colorScheme="green"  
                onClick={() => handleBidStatusUpdate(selectedBid.id, 'accepted')} 
                leftIcon={<FaCheck />} 
              > 
                Accept Bid 
              </Button> 
            </> 
          )} 
        </ModalFooter> 
      </ModalContent> 
    </Modal> 

    {/* Add/Edit Product Modal */} 
    <Modal isOpen={isOpen} onClose={onClose} size="xl"> 
      <ModalOverlay /> 
      <ModalContent borderRadius="xl"> 
        <ModalHeader>{editProduct ? 'Edit Product' : 'Add New Product'}</ModalHeader> 
        <ModalCloseButton /> 
        <form onSubmit={handleSubmitProduct}> 
          <ModalBody> 
            <VStack spacing={5}> 
              <FormControl isRequired> 
                <FormLabel>Product Name</FormLabel> 
                <Input  
                  name="name" 
                  value={formData.name} 
                  onChange={handleFormChange} 
                  placeholder="e.g., Organic Tomatoes" 
                /> 
              </FormControl> 

              <FormControl isRequired> 
                <FormLabel>Description</FormLabel> 
                <Textarea  
                  name="description" 
                  value={formData.description} 
                  onChange={handleFormChange} 
                  placeholder="Describe your product..." 
                  rows={3} 
                /> 
              </FormControl> 

              <Flex gap={4} width="full" direction={{ base: 'column', md: 'row' }}> 
                <FormControl isRequired flex={1}> 
                  <FormLabel>Price (KES)</FormLabel> 
                  <Input  
                    type="number"
                    name="price" 
                    value={formData.price} 
                    onChange={handleFormChange} 
                    placeholder="150" 
                    min="0" 
                    step="0.01" 
                  /> 
                </FormControl> 

                <FormControl isRequired flex={1}> 
                  <FormLabel>Unit</FormLabel> 
                  <Select  
                    name="unit" 
                    value={formData.unit} 
                    onChange={handleFormChange} 
                  > 
                    <option value="kg">Kilogram (kg)</option> 
                    <option value="gram">Gram (g)</option> 
                    <option value="piece">Piece</option> 
                    <option value="bunch">Bunch</option> 
                    <option value="crate">Crate</option>
                    <option value="sack">Sack</option>
                    <option value="bag">Bag</option>
                    <option value="litre">Litre</option>
                    <option value="dozen">Dozen</option>
                    <option value="basket">Basket</option>
                  </Select> 
                </FormControl> 

                <FormControl isRequired flex={1}> 
                  <FormLabel>Quantity</FormLabel> 
                  <Input 
                    type="number"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleFormChange}
                    placeholder="100"
                    min="0"
                  />
                </FormControl>
              </Flex> 

              <Flex gap={4} width="full"> 
                <FormControl isRequired flex={1}> 
                  <FormLabel>Category</FormLabel> 
                  <Select  
                    name="category" 
                    value={formData.category} 
                    onChange={handleFormChange} 
                  > 
                    <option value="Vegetables">Vegetables</option> 
                    <option value="Fruits">Fruits</option> 
                    <option value="Grains">Grains</option> 
                    <option value="Dairy & Eggs">Dairy & Eggs</option> 
                    <option value="Coffee">Coffee</option> 
                    <option value="Tea">Tea</option>
                    <option value="Herbs">Herbs</option>
                    <option value="Spices">Spices</option>
                    <option value="Nuts">Nuts</option>
                    <option value="Tubers">Tubers</option>
                  </Select> 
                </FormControl> 

                <FormControl isRequired flex={1}> 
                  <FormLabel>Location</FormLabel> 
                  <Select  
                    name="location" 
                    value={formData.location} 
                    onChange={handleFormChange} 
                  > 
                    <option value="Nairobi">Nairobi</option> 
                    <option value="Kiambu">Kiambu</option> 
                    <option value="Nakuru">Nakuru</option> 
                    <option value="Eldoret">Eldoret</option> 
                    <option value="Mombasa">Mombasa</option>
                    <option value="Kisumu">Kisumu</option>
                    <option value="Kakamega">Kakamega</option>
                    <option value="Meru">Meru</option>
                    <option value="Thika">Thika</option>
                    <option value="Nyeri">Nyeri</option>
                  </Select> 
                </FormControl> 
              </Flex> 

              <FormControl> 
                <Checkbox  
                  name="organic" 
                  isChecked={formData.organic} 
                  onChange={handleFormChange} 
                  colorScheme="green" 
                > 
                  Organic Product 
                </Checkbox> 
              </FormControl> 

              <FormControl> 
                <FormLabel>Product Image</FormLabel> 
                <Input  
                  type="file" 
                  accept="image/*" 
                  onChange={handleImageChange} 
                  p={1} 
                  border="none" 
                /> 
                <Text fontSize="sm" color="gray.500" mt={1}> 
                  JPG or PNG (Max 5MB) 
                </Text> 
              </FormControl> 
            </VStack> 
          </ModalBody> 
          <ModalFooter> 
            <Button variant="outline" mr={3} onClick={onClose}> 
              Cancel 
            </Button> 
            <Button  
              colorScheme="green"  
              type="submit" 
              isLoading={isSubmitting} 
              loadingText={editProduct ? "Updating..." : "Adding..."} 
            > 
              {editProduct ? 'Update Product' : 'Add Product'} 
            </Button> 
          </ModalFooter> 
        </form> 
      </ModalContent> 
    </Modal> 

    <Flex justify="space-between" align="flex-start" mb={8} wrap="wrap">
      <Flex direction="column" gap={2}>
        <Heading 
          size="xl" 
          mb={2}
          bgGradient="linear(to-r, teal.500, blue.500)"
          bgClip="text"
          fontWeight="extrabold"
        >
          MkulimaPay Dashboard
        </Heading>
        <Text color="gray.600" fontSize="lg">
          Manage Business In One Place
        </Text>
      </Flex>

      <Flex gap={3} align="center">
        <Button 
          colorScheme="teal" 
          variant="solid"
          onClick={() => navigate('/marketplace')}
          leftIcon={<FaShoppingCart />}
        >
          E-Market
        </Button>
        <Button 
          leftIcon={<FaPlus />} 
          colorScheme="green" 
          onClick={onOpen}
        >
          Add Product
        </Button>
        <Button 
          colorScheme="blue" 
          variant="outline" 
          leftIcon={<FaUserAlt />} 
          onClick={() => navigate('/profile')}
        >
          Profile
        </Button>
      </Flex>
    </Flex>

    {/* Stats Overview */} 
    <SimpleGrid columns={{ base: 1, md: 2, lg: 6 }} spacing={6} mb={8}> 
      <MotionCard 
        bg="green.50" 
        borderRadius="xl" 
        whileHover={{ y: -5 }}
      > 
        <CardBody> 
          <Stat> 
            <StatLabel>Total Revenue</StatLabel> 
            <StatNumber>KES {stats.totalSales.toLocaleString()}</StatNumber> 
            <StatHelpText> 
              <StatArrow type={stats.growthPercentage >= 0 ? 'increase' : 'decrease'} /> 
              {Math.abs(stats.growthPercentage).toFixed(2)}% from last period
            </StatHelpText> 
          </Stat> 
        </CardBody> 
      </MotionCard> 
      
      <MotionCard 
        bg="blue.50" 
        borderRadius="xl" 
        whileHover={{ y: -5 }}
      > 
        <CardBody> 
          <Stat> 
            <StatLabel>Pending Orders</StatLabel> 
            <StatNumber>{orders.filter(o => o.status === 'pending').length}</StatNumber> 
            <StatHelpText> 
              Requires your attention 
            </StatHelpText> 
          </Stat> 
        </CardBody> 
      </MotionCard> 
      
      <MotionCard 
        bg="yellow.50" 
        borderRadius="xl" 
        whileHover={{ y: -5 }}
      > 
        <CardBody> 
          <Stat> 
            <StatLabel>Pending Bids</StatLabel> 
            <StatNumber>{stats.pendingBids}</StatNumber> 
            <StatHelpText> 
              Waiting for your response 
            </StatHelpText> 
          </Stat> 
        </CardBody> 
      </MotionCard> 
      
      <MotionCard 
        bg="purple.50" 
        borderRadius="xl" 
        whileHover={{ y: -5 }}
      > 
        <CardBody> 
          <Stat> 
            <StatLabel>Customer Rating</StatLabel> 
            <StatNumber>{stats.rating}</StatNumber> 
            <Flex align="center"> 
              {[...Array(5)].map((_, i) => (
                <Icon 
                  key={i} 
                  as={FaStar} 
                  color={i < Math.floor(stats.rating) ? "yellow.400" : "gray.300"} 
                  mr={1} 
                />
              ))}
            </Flex> 
          </Stat> 
        </CardBody> 
      </MotionCard> 
      
      <MotionCard 
        bg="blue.50" 
        borderRadius="xl" 
        whileHover={{ y: -5 }}
      > 
        <CardBody> 
          <Stat> 
            <StatLabel>Inventory Value</StatLabel> 
            <StatNumber>
              KES {inventoryValue.toLocaleString()}
            </StatNumber> 
            <StatHelpText>Current stock valuation</StatHelpText> 
          </Stat> 
        </CardBody> 
      </MotionCard>
      
      <MotionCard 
        bg="orange.50" 
        borderRadius="xl" 
        whileHover={{ y: -5 }}
      > 
        <CardBody> 
          <Stat> 
            <StatLabel>Instore Sales</StatLabel> 
            <StatNumber>KES {stats.instoreSalesTotal?.toLocaleString() || 0}</StatNumber> 
            <StatHelpText>Cash and Mpesa transactions</StatHelpText> 
          </Stat> 
        </CardBody> 
      </MotionCard>
    </SimpleGrid> 

    {/* Modern Horizontal Tab Navigation */}
    <Box 
      mb={8} 
      overflowX="auto"
      css={{
        '&::-webkit-scrollbar': { height: '6px' },
        '&::-webkit-scrollbar-track': { background: 'transparent' },
        '&::-webkit-scrollbar-thumb': { 
          background: useColorModeValue('teal.300', 'teal.600'),
          borderRadius: '4px'
        }
      }}
    >
      <HStack spacing={4} pb={2}>
        {tabData.map((tab) => (
          <MotionButton
            key={tab.id}
            size="lg"
            px={6}
            borderRadius="xl"
            variant="outline"
            colorScheme="teal"
            onClick={() => navigate(`#${tab.id}`)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            leftIcon={<Icon as={tab.icon} />}
            bg={window.location.hash === `#${tab.id}` ? activeTabBg : 'transparent'}
            color={window.location.hash === `#${tab.id}` ? activeTabColor : 'inherit'}
            borderColor={window.location.hash === `#${tab.id}` ? 'teal.500' : 'gray.200'}
            fontWeight={window.location.hash === `#${tab.id}` ? 'bold' : 'normal'}
          >
            {tab.name}
            {tab.count !== undefined && (
              <Badge ml={2} colorScheme="red" borderRadius="full">
                {tab.count}
              </Badge>
            )}
          </MotionButton>
        ))}
      </HStack>
    </Box>

    <Tabs variant="unstyled" colorScheme="teal" index={tabData.findIndex(tab => `#${tab.id}` === window.location.hash)}>
      <TabList 
        display="none" // Hide default tab list since we have custom navigation
      /> 
        
      <TabPanels> 
        {/* Products Tab */} 
        <TabPanel p={0} id="products"> 
          <Flex mb={6} direction={{ base: 'column', md: 'row' }} gap={4}> 
            <InputGroup maxW={{ md: '300px' }}> 
              <InputLeftElement pointerEvents="none"> 
                <Icon as={FaSearch} color="gray.300" /> 
              </InputLeftElement> 
              <Input  
                placeholder="Search products..."  
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)} 
              /> 
            </InputGroup> 
            <Button 
              colorScheme="blue" 
              ml={{ md: 'auto' }} 
              leftIcon={<FaFileExport />}
              onClick={exportInventoryToCSV}
            > 
              Export Inventory 
            </Button> 
          </Flex> 
          
          {loading ? ( 
            <Flex justify="center" py={20}> 
              <Spinner size="xl" /> 
            </Flex> 
          ) : filteredProducts.length === 0 ? ( 
            <Box textAlign="center" py={10}> 
              <Text fontSize="xl" mb={4}>No products found</Text> 
              <Button colorScheme="green" onClick={onOpen}> 
                Add Your First Product 
              </Button> 
            </Box> 
          ) : ( 
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}> 
              {filteredProducts.map(product => ( 
                <MotionCard 
                  key={product.id} 
                  borderRadius="xl" 
                  overflow="hidden" 
                  position="relative"
                  whileHover={{ y: -5 }}
                  bg={cardBg}
                > 
                  <Box position="relative" h="160px" overflow="hidden"> 
                    <Image 
                      src={getFullImageUrl(product.imageUrl)} 
                      alt={product.name} 
                      objectFit="cover" 
                      w="full" 
                      h="full" 
                      fallbackSrc="/placeholder.jpg"
                    /> 
                    {product.organic && ( 
                      <Badge  
                        colorScheme="green"  
                        position="absolute"  
                        top={4}  
                        left={4} 
                      > 
                        <Flex align="center"> 
                          <Icon as={FaLeaf} mr={1} /> Organic 
                        </Flex> 
                      </Badge> 
                    )} 
                    <Badge  
                      colorScheme={product.quantity > 0 ? "green" : "red"}  
                      position="absolute"  
                      top={4}  
                      right={4} 
                      px={2}
                      py={1}
                      borderRadius="md"
                    > 
                      {product.quantity > 0 ? `${product.quantity} ${product.unit}` : "Out of Stock"} 
                    </Badge> 
                  </Box> 
                  
                  <CardHeader> 
                    <Heading size="md">{product.name}</Heading> 
                    <Flex align="center" mt={1}> 
                      <Tag colorScheme="blue" mr={2}>{product.category}</Tag> 
                      <Text color="gray.500">Location: {product.location}</Text> 
                    </Flex> 
                  </CardHeader> 
                  
                  <CardBody pt={0}> 
                    <Flex justify="space-between" mb={2}> 
                      <Text fontWeight="bold">KES {product.price}/{product.unit}</Text>
                      <Text fontWeight="bold">Qty: {product.quantity || 0}</Text>
                    </Flex> 
                    <Flex justify="space-between">
                      <Text fontWeight="bold" color="blue.600">
                        Total: KES {(parseFloat(product.price) * (parseInt(product.quantity) || 0)).toLocaleString()}
                      </Text>
                    </Flex>
                    <Text mb={4} noOfLines={2}>{product.description}</Text> 
                  </CardBody> 
                  
                  <CardFooter> 
                    <Flex w="full" gap={2}> 
                      <Button  
                        colorScheme="blue"  
                        flex={1} 
                        leftIcon={<FaEdit />} 
                        onClick={() => handleEditProduct(product)} 
                      > 
                        Edit 
                      </Button> 
                      <Button  
                        colorScheme="red"  
                        variant="outline" 
                        flex={1} 
                        leftIcon={<FaTrash />} 
                        onClick={() => handleDeleteClick(product)} 
                      > 
                        Delete 
                      </Button> 
                    </Flex> 
                  </CardFooter> 
                </MotionCard> 
          ))} 
            </SimpleGrid> 
          )} 
        </TabPanel> 
        
        {/* Bid Management Tab */} 
        <TabPanel p={0} id="bids"> 
          <Flex justify="space-between" mb={6}>
            <Heading size="md">Bid Management</Heading>
            <Button 
              colorScheme="blue" 
              leftIcon={<FaFileExport />}
              onClick={exportBidsToCSV}
            > 
              Export Bids 
            </Button>
          </Flex>
          
          {isBidLoading ? ( 
            <Flex justify="center" py={10}> 
              <Spinner size="xl" /> 
            </Flex> 
          ) : bids.length === 0 ? ( 
            <Card borderRadius="xl"> 
              <CardBody textAlign="center" py={10}> 
                <Icon as={FaHandHoldingUsd} boxSize={12} color="gray.400" mb={4} /> 
                <Text fontSize="xl" mb={2}>No Active Bids</Text> 
                <Text color="gray.500" mb={6}>Buyers will appear here when they bid on your products</Text> 
                <Button colorScheme="green" onClick={() => navigate('/marketplace')}>View Marketplace</Button> 
              </CardBody> 
            </Card> 
          ) : ( 
            <Box> 
              <Tabs variant="soft-rounded" colorScheme="green" mb={6}> 
                <TabList> 
                  <Tab> 
                    <Badge colorScheme="orange" mr={2}> 
                      {bids.filter(b => b.status === 'pending').length} 
                    </Badge> 
                    Pending 
                  </Tab> 
                  <Tab> 
                    <Badge colorScheme="green" mr={2}> 
                      {bids.filter(b => b.status === 'accepted').length} 
                    </Badge> 
                    Accepted 
                  </Tab> 
                  <Tab> 
                    <Badge colorScheme="red" mr={2}> 
                      {bids.filter(b => b.status === 'rejected').length} 
                    </Badge> 
                    Rejected 
                  </Tab> 
                </TabList> 
                <TabPanels> 
                  <TabPanel p={0}> 
                    {bids.filter(b => b.status === 'pending').length === 0 ? ( 
                      <Alert status="info" borderRadius="lg"> 
                        <AlertIcon /> 
                        No pending bids at this time 
                      </Alert> 
                    ) : ( 
                      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}> 
                        {bids.filter(b => b.status === 'pending').map(bid => ( 
                          <MotionCard 
                            key={bid.id} 
                            borderLeft="4px solid" 
                            borderColor="orange.500" 
                            borderRadius="xl"
                            whileHover={{ y: -5 }}
                            bg={cardBg}
                          > 
                            <CardBody> 
                              <Flex align="center" mb={4}> 
                                <Avatar 
                                  name={bid.buyer_name} 
                                  bg="orange.500"
                                  color="white"
                                  size="sm" 
                                  mr={3}
                                /> 
                                <Box> 
                                  <Text fontWeight="bold">{bid.buyer_name}</Text> 
                                  <Text fontSize="sm" color="gray.500">{bid.buyer_location}</Text> 
                                </Box> 
                                <Text ml="auto" fontSize="lg" fontWeight="bold"> 
                                  KES {bid.amount.toLocaleString()} 
                                </Text> 
                              </Flex> 
                              
                              <Flex align="center" mb={4}> 
                                <Image 
                                  src={getFullImageUrl(bid.product_image)} 
                                  alt={bid.product_name} 
                                  boxSize="50px" 
                                  objectFit="cover" 
                                  borderRadius="md" 
                                  mr={3} 
                                  fallbackSrc="/placeholder.jpg"
                                /> 
                                <Box> 
                                  <Text fontWeight="bold">{bid.product_name}</Text> 
                                  <Text fontSize="sm">{bid.product_category}</Text> 
                                </Box> 
                              </Flex> 
                              
                              <Text fontSize="sm" color="gray.600" mb={4} noOfLines={2}> 
                                {bid.message || "No additional message"} 
                              </Text> 
                              
                              <Text fontSize="xs" color="gray.500" textAlign="right"> 
                                Bid placed: {new Date(bid.created_at).toLocaleDateString()} 
                              </Text> 
                            </CardBody> 
                            <CardFooter> 
                              <Button  
                                size="sm"  
                                colorScheme="blue" 
                                onClick={() => handleViewBid(bid)} 
                              > 
                                Review Bid 
                              </Button> 
                            </CardFooter> 
                          </MotionCard> 
                    ))} 
                      </SimpleGrid> 
                    )} 
                  </TabPanel> 
                  <TabPanel p={0}> 
                    {bids.filter(b => b.status === 'accepted').length === 0 ? ( 
                      <Alert status="info" borderRadius="lg"> 
                        <AlertIcon /> 
                        No accepted bids at this time 
                      </Alert> 
                    ) : ( 
                      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}> 
                        {bids.filter(b => b.status === 'accepted').map(bid => ( 
                          <MotionCard 
                            key={bid.id} 
                            borderLeft="4px solid" 
                            borderColor="green.500" 
                            borderRadius="xl"
                            whileHover={{ y: -5 }}
                            bg={cardBg}
                          > 
                            <CardBody> 
                              <Flex align="center" mb={4}> 
                                <Avatar 
                                  name={bid.buyer_name} 
                                  bg="green.500"
                                  color="white"
                                  size="sm" 
                                  mr={3}
                                /> 
                                <Box> 
                                  <Text fontWeight="bold">{bid.buyer_name}</Text> 
                                  <Text fontSize="sm" color="gray.500">{bid.buyer_location}</Text> 
                                </Box> 
                                <Text ml="auto" fontSize="lg" fontWeight="bold"> 
                                  KES {bid.amount.toLocaleString()} 
                                </Text> 
                              </Flex> 
                              
                              <Flex align="center" mb={4}> 
                                <Image 
                                  src={getFullImageUrl(bid.product_image)} 
                                  alt={bid.product_name} 
                                  boxSize="50px" 
                                  objectFit="cover" 
                                  borderRadius="md" 
                                  mr={3} 
                                  fallbackSrc="/placeholder.jpg"
                                /> 
                                <Box> 
                                  <Text fontWeight="bold">{bid.product_name}</Text> 
                                  <Text fontSize="sm">{bid.product_category}</Text> 
                                </Box> 
                              </Flex> 
                              
                              <Text fontSize="sm" color="gray.600" mb={4} noOfLines={2}> 
                                {bid.message || "No additional message"} 
                              </Text> 
                              
                              <Text fontSize="xs" color="gray.500" textAlign="right"> 
                                Accepted on: {new Date(bid.created_at).toLocaleDateString()} 
                              </Text> 
                            </CardBody> 
                            <CardFooter> 
                              <Button  
                                size="sm"  
                                variant="outline" 
                                colorScheme="green" 
                                onClick={() => handleViewBid(bid)} 
                              > 
                                View Details 
                              </Button> 
                            </CardFooter> 
                          </MotionCard> 
                    ))} 
                      </SimpleGrid> 
                    )} 
                  </TabPanel> 
                  <TabPanel p={0}> 
                    {bids.filter(b => b.status === 'rejected').length === 0 ? ( 
                      <Alert status="info" borderRadius="lg"> 
                        <AlertIcon /> 
                        No rejected bids at this time 
                      </Alert> 
                    ) : ( 
                      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}> 
                        {bids.filter(b => b.status === 'rejected').map(bid => ( 
                          <MotionCard 
                            key={bid.id} 
                            borderLeft="4px solid" 
                            borderColor="red.500" 
                            borderRadius="xl"
                            whileHover={{ y: -5 }}
                            bg={cardBg}
                          > 
                            <CardBody> 
                              <Flex align="center" mb={4}> 
                                <Avatar 
                                  name={bid.buyer_name} 
                                  bg="red.500"
                                  color="white"
                                  size="sm" 
                                  mr={3}
                                /> 
                                <Box> 
                                  <Text fontWeight="bold">{bid.buyer_name}</Text> 
                                  <Text fontSize="sm" color="gray.500">{bid.buyer_location}</Text> 
                                </Box> 
                                <Text ml="auto" fontSize="lg" fontWeight="bold"> 
                                  KES {bid.amount.toLocaleString()} 
                                </Text> 
                              </Flex> 
                              
                              <Flex align="center" mb={4}> 
                                <Image 
                                  src={getFullImageUrl(bid.product_image)} 
                                  alt={bid.product_name} 
                                  boxSize="50px" 
                                  objectFit="cover" 
                                  borderRadius="md" 
                                  mr={3} 
                                  fallbackSrc="/placeholder.jpg"
                                /> 
                                <Box> 
                                  <Text fontWeight="bold">{bid.product_name}</Text> 
                                  <Text fontSize="sm">{bid.product_category}</Text> 
                                </Box> 
                              </Flex> 
                              
                              <Text fontSize="sm" color="gray.600" mb={4} noOfLines={2}> 
                                {bid.message || "No additional message"} 
                              </Text> 
                              
                              <Text fontSize="xs" color="gray.500" textAlign="right"> 
                                Rejected on: {new Date(bid.created_at).toLocaleDateString()} 
                              </Text> 
                            </CardBody> 
                            <CardFooter> 
                              <Button  
                                size="sm"  
                                variant="outline" 
                                colorScheme="red" 
                                onClick={() => handleViewBid(bid)} 
                              > 
                                View Details 
                              </Button> 
                            </CardFooter> 
                          </MotionCard> 
                     ) )} 
                      </SimpleGrid> 
                    )} 
                  </TabPanel> 
                </TabPanels> 
              </Tabs> 
              
              <Card bg="orange.50" borderRadius="xl"> 
                <CardBody> 
                  <Heading size="md" mb={4}>Bid Statistics</Heading> 
                  <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}> 
                    <Box bg="white" p={4} borderRadius="lg"> 
                      <Text fontWeight="bold" mb={2}>Avg. Bid Value</Text> 
                      <Text fontSize="2xl" color="green.600"> 
                        KES {bidStatistics.avgBidValue.toLocaleString(undefined, { maximumFractionDigits: 0 })} 
                      </Text> 
                      <Text>Across all products</Text> 
                    </Box> 
                    <Box bg="white" p={4} borderRadius="lg"> 
                      <Text fontWeight="bold" mb={2}>Acceptance Rate</Text> 
                      <Text fontSize="2xl" color="blue.500"> 
                        {bidStatistics.acceptanceRate}% 
                      </Text> 
                      <Text>Of bids received</Text> 
                    </Box> 
                    <Box bg="white" p={4} borderRadius="lg"> 
                      <Text fontWeight="bold" mb={2}>Response Rate</Text> 
                      <Text fontSize="2xl" color="purple.500"> 
                        {bidStatistics.completionRate}% 
                      </Text> 
                      <Text>Of bids responded to</Text> 
                    </Box> 
                  </SimpleGrid> 
                </CardBody> 
              </Card> 
            </Box> 
          )} 
        </TabPanel> 
        
        {/* Orders Tab */} 
        <TabPanel id="orders"> 
          <Flex justify="space-between" mb={6}>
            <Heading size="md">Order Management</Heading>
            <Button 
              colorScheme="blue" 
              leftIcon={<FaFileExport />}
              onClick={exportOrdersToCSV}
            > 
              Export Orders 
            </Button>
          </Flex>
          
          {orders.length === 0 ? ( 
            <Card borderRadius="xl"> 
              <CardBody textAlign="center" py={10}> 
                <Icon as={FaShoppingCart} boxSize={12} color="gray.400" mb={4} /> 
                <Text fontSize="xl" mb={2}>No Orders Yet</Text> 
                <Text color="gray.500" mb={6}>Your orders will appear here when customers make purchases</Text> 
                <Button colorScheme="green" onClick={() => navigate('/marketplace')}>Market Your Products</Button> 
              </CardBody> 
            </Card> 
          ) : ( 
            <Card borderRadius="xl" overflow="hidden"> 
              <CardBody p={0}> 
                <Table variant="simple"> 
                  <Thead bg="gray.50"> 
                    <Tr> 
                      <Th>Order ID</Th> 
                      <Th>Customer</Th> 
                      <Th>Date</Th> 
                      <Th>Total</Th> 
                      <Th>Status</Th> 
                      <Th>Payment Method</Th> 
                      <Th>Actions</Th> 
                    </Tr> 
                  </Thead> 
                  <Tbody> 
                    {orders.map(order => ( 
                      <Tr key={order.id} _hover={{ bg: 'gray.50' }}> 
                        <Td fontWeight="bold">#{order.id}</Td> 
                        <Td>User #{order.user_id}</Td> 
                        <Td>{new Date(order.created_at).toLocaleDateString()}</Td> 
                        <Td fontWeight="bold">KES {order.total_amount?.toLocaleString()}</Td> 
                        <Td> 
                          <Badge  
                            colorScheme={ 
                              order.status === 'completed' ? 'green' :  
                              order.status === 'processing' ? 'blue' :  
                              order.status === 'pending' ? 'orange' : 'gray' 
                            } 
                          > 
                            {order.status} 
                          </Badge> 
                        </Td> 
                        <Td>{order.payment_method || 'N/A'}</Td> 
                        <Td> 
                          <Button  
                            size="sm"  
                            onClick={() => handleViewOrder(order)} 
                          > 
                            View Details 
                          </Button> 
                        </Td> 
                      </Tr> 
            ))} 
                  </Tbody> 
                </Table> 
              </CardBody> 
            </Card> 
          )} 
          
          <Card mt={8} bg="blue.50" borderRadius="xl"> 
            <CardBody> 
              <Heading size="md" mb={4}>Order Statistics</Heading> 
              <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}> 
                <Box bg="white" p={4} borderRadius="lg"> 
                  <Text fontWeight="bold" mb={2}>Pending Orders</Text> 
                  <Text fontSize="2xl" color="orange.500"> 
                    {orders.filter(o => o.status === 'pending').length} 
                  </Text> 
                </Box> 
                <Box bg="white" p={4} borderRadius="lg"> 
                  <Text fontWeight="bold" mb={2}>Avg. Order Value</Text> 
                  <Text fontSize="2xl" color="green.500"> 
                    {orders.length > 0  
                      ? `KES ${Math.round(orders.reduce((sum, o) => sum + (parseFloat(o.total_amount) || 0), 0) / orders.length).toLocaleString()}` 
                      : 'KES 0'} 
                  </Text> 
                </Box> 
                <Box bg="white" p={4} borderRadius="lg"> 
                  <Text fontWeight="bold" mb={2}>Completion Rate</Text> 
                  <Text fontSize="2xl" color="blue.500"> 
                    {orders.length > 0  
                      ? `${Math.round((orders.filter(o => o.status === 'completed').length / orders.length) * 100)}%`  
                      : '0%'} 
                  </Text> 
                </Box> 
              </SimpleGrid> 
            </CardBody> 
          </Card> 
        </TabPanel> 
        
        {/* Analytics Tab */} 
        <TabPanel id="analytics"> 
          <Heading size="md" mb={6}>Product Category Distribution</Heading> 
          <Box bg="white" p={6} borderRadius="xl" mb={8}> 
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}> 
              {Object.entries(categoryDistribution).map(([category, percentage]) => ( 
                <Box key={category} borderLeft="4px solid" borderColor="green.500" p={4}> 
                  <Text fontSize="lg" fontWeight="bold">{category}</Text> 
                  <Text fontSize="3xl" fontWeight="bold" color="green.600"> 
                    {percentage}% 
                  </Text> 
                  <Text>{categoryDistribution[category]} products</Text> 
                </Box> 
              ))} 
            </SimpleGrid> 
          </Box> 
          
          {/* NEW: Instore Sales Financial Performance Section */}
          <Heading size="md" mb={6}>Instore Sales Financial Performance</Heading>
          <Box bg="white" p={6} borderRadius="xl" boxShadow="md" mb={8}>
            <SimpleGrid columns={2} spacing={4}>
              <Card bg="green.50" borderRadius="lg">
                <CardBody>
                  <Stat>
                    <StatLabel>Total Revenue</StatLabel>
                    <StatNumber>KES {stats.instoreSalesTotal?.toLocaleString() || 0}</StatNumber>
                    <StatHelpText>
                      From instore sales
                    </StatHelpText>
                  </Stat>
                </CardBody>
              </Card>
              
              <Card bg="blue.50" borderRadius="lg">
                <CardBody>
                  <Stat>
                    <StatLabel>Inventory Value</StatLabel>
                    <StatNumber>KES {inventoryValue.toLocaleString()}</StatNumber>
                    <StatHelpText>
                      Current stock valuation
                    </StatHelpText>
                  </Stat>
                </CardBody>
              </Card>
            </SimpleGrid>
            
            <Flex justify="space-between" mt={6}>
              <Box w="45%">
                <Text fontWeight="bold" mb={2}>Revenue Trend</Text>
                <Box bg="gray.100" h="150px" borderRadius="md" position="relative" overflow="hidden">
                  <Box
                    position="absolute"
                    bottom="0"
                    left="0"
                    right="0"
                    bg="green.400"
                    height={`${Math.min(100, (stats.instoreSalesTotal / Math.max(1, inventoryValue)) * 100)}%`}
                    borderRadius="md md 0 0"
                  />
                  <Text 
                    position="absolute" 
                    bottom="10px" 
                    left="0" 
                    right="0" 
                    textAlign="center" 
                    fontWeight="bold" 
                    fontSize="md"
                    color="white"
                    textShadow="0 1px 2px rgba(0,0,0,0.5)"
                  >
                    KES {stats.instoreSalesTotal?.toLocaleString() || 0}
                  </Text>
                </Box>
              </Box>
              
              <Box w="45%">
                <Text fontWeight="bold" mb={2}>Inventory Value</Text>
                <Box bg="gray.100" h="150px" borderRadius="md" position="relative" overflow="hidden">
                  <Box
                    position="absolute"
                    bottom="0"
                    left="0"
                    right="0"
                    bg="blue.400"
                    height={`${Math.min(100, (inventoryValue / Math.max(1, stats.instoreSalesTotal)) * 100)}%`}
                    borderRadius="md md 0 0"
                  />
                  <Text 
                    position="absolute" 
                    bottom="10px" 
                    left="0" 
                    right="0" 
                    textAlign="center" 
                    fontWeight="bold" 
                    fontSize="md"
                    color="white"
                    textShadow="0 1px 2px rgba(0,0,0,0.5)"
                  >
                    KES {inventoryValue.toLocaleString()}
                  </Text>
                </Box>
              </Box>
            </Flex>
          </Box>
          
          <RevenueInventoryChart 
            revenue={stats.totalSales} 
            inventoryValue={inventoryValue} 
          />
          
          <Card mt={8} bg="teal.50" borderRadius="xl"> 
            <CardBody> 
              <Heading size="md" mb={4}>Customer Reviews</Heading>
              {reviews.length === 0 ? (
                <Text textAlign="center" py={4}>No reviews yet</Text>
              ) : (
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  {reviews.map(review => (
                    <Card key={review.id} borderRadius="md">
                      <CardBody>
                        <Flex mb={2}>
                          {[...Array(5)].map((_, i) => (
                            <Icon 
                              key={i} 
                              as={FaStar} 
                              color={i < review.rating ? "yellow.400" : "gray.300"} 
                              mr={1} 
                            />
                          ))}
                        </Flex>
                        <Text mb={2} fontStyle={review.comment ? "normal" : "italic"}>
                          {review.comment || "No comment provided"}
                        </Text>
                        <Text fontSize="sm" color="gray.500">
                          {new Date(review.created_at).toLocaleDateString()}
                        </Text>
                      </CardBody>
                    </Card>
                  ))}
                </SimpleGrid>
              )}
            </CardBody> 
          </Card> 
        </TabPanel> 
        
        {/* Sustainability Tab */} 
        <TabPanel id="sustainability"> 
          <Card bg="green.50" borderRadius="xl" mb={6}> 
            <CardBody> 
              <Heading size="md" mb={4}>Sustainability Metrics</Heading> 
              <Text mb={4}> 
                Your sustainable farming practices are making a difference. Here's your impact:
              </Text> 
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} mb={6}> 
                <Box bg="white" p={4} borderRadius="lg"> 
                  <Text fontWeight="bold" mb={2}>Organic Products</Text> 
                  <Text fontSize="2xl" fontWeight="bold" color="green.600">
                    {sustainabilityMetrics.organicPercentage}%
                  </Text> 
                  <Text>of your products are certified organic</Text> 
                </Box> 
                <Box bg="white" p={4} borderRadius="lg"> 
                  <Text fontWeight="bold" mb={2}>Local Sourcing</Text> 
                  <Text fontSize="2xl" fontWeight="bold" color="blue.500">
                    {sustainabilityMetrics.localPercentage}%
                  </Text> 
                  <Text>of products sold locally in Nairobi</Text> 
                </Box>
              </SimpleGrid>
              <Button colorScheme="green" onClick={() => navigate('/carbon-market')}>View Carbon Market</Button> 
            </CardBody> 
          </Card> 
          
          <Card borderRadius="xl" mb={6}>
            <CardBody>
              <Heading size="md" mb={4}>Crop Diversity</Heading>
              <Text mb={4}>
                A diverse crop portfolio contributes to soil health and reduces risk:
              </Text>
              <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                {Object.entries(categoryDistribution).map(([category, percentage]) => (
                  <Box key={category} bg="white" p={4} borderRadius="lg" borderLeft="4px solid" borderColor="green.500">
                    <Text fontWeight="bold">{category}</Text>
                    <Text fontSize="2xl" fontWeight="bold" color="green.600">
                      {percentage}%
                    </Text>
                    <Text fontSize="sm">
                      {percentage >= 40 
                        ? "Dominant crop - consider diversifying" 
                        : percentage >= 20 
                        ? "Balanced crop" 
                        : "Specialty crop - good for niche markets"}
                    </Text>
                  </Box>
                ))}
              </SimpleGrid>
            </CardBody>
          </Card>
          
          <Card bg="teal.50" borderRadius="xl"> 
            <CardBody> 
              <Heading size="md" mb={4}>Sustainable Farming Resources</Heading> 
              <Text mb={4}> 
                Access tools and knowledge to enhance your environmental stewardship: 
              </Text> 
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}> 
                {[ 
                  { 
                    title: "Water conservation techniques", 
                    link: "https://www.fao.org/water/en/" 
                  },
                  { 
                    title: "Organic pest control guide", 
                    link: "https://www.rodaleinstitute.org/why-organic/organic-farming-practices/" 
                  },
                  { 
                    title: "Soil health assessment tool", 
                    link: "https://soilhealth.cals.cornell.edu/" 
                  },
                  { 
                    title: "Renewable energy financing options", 
                    link: "https://www.greenclimate.fund/" 
                  }
                ].map((resource, index) => ( 
                  <Flex key={index} align="center" bg="white" p={3} borderRadius="md"> 
                    <Icon as={FaLeaf} color="teal.500" mr={3} /> 
                    <Box>
                      <Link href={resource.link} isExternal color="blue.500">
                        {resource.title}
                      </Link>
                    </Box>
                  </Flex> 
                ))} 
              </SimpleGrid> 
            </CardBody> 
          </Card> 
        </TabPanel> 
        
        {/* Finances Tab */} 
        <TabPanel id="finances"> 
          <Card bg="blue.50" borderRadius="xl" mb={6}> 
            <CardBody> 
              <Heading size="md" mb={4}>Agricultural Financing in Kenya</Heading> 
              <Text mb={4}> 
                Financial institutions offering agricultural loans:
              </Text>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                <Box bg="white" p={4} borderRadius="lg">
                  <Text fontWeight="bold">Equity Bank</Text>
                  <Text>Types: Asset financing, seasonal loans</Text>
                  <Text>Interest: 10-14% p.a.</Text>
                </Box>
                <Box bg="white" p={4} borderRadius="lg">
                  <Text fontWeight="bold">Cooperative Bank</Text>
                  <Text>Types: Sacco loans, dairy loans</Text>
                  <Text>Interest: 12-15% p.a.</Text>
                </Box>
                <Box bg="white" p={4} borderRadius="lg">
                  <Text fontWeight="bold">KCB Bank</Text>
                  <Text>Types: Agri-business loans, input financing</Text>
                  <Text>Interest: 9-13% p.a.</Text>
                </Box>
                <Box bg="white" p={4} borderRadius="lg">
                  <Text fontWeight="bold">Agricultural Finance Corporation</Text>
                  <Text>Types: Long-term loans, machinery loans</Text>
                  <Text>Interest: 8-12% p.a.</Text>
                </Box>
              </SimpleGrid>
              <Button mt={4} colorScheme="blue" onClick={() => navigate('/loans')}>Verify your loan eligibility</Button> 
            </CardBody> 
          </Card> 
          
          <Card borderRadius="xl" mb={6}> 
            <CardBody> 
              <Heading size="md" mb={4}>Recent Transactions</Heading> 
              <Table variant="simple"> 
                <Thead> 
                  <Tr> 
                    <Th>Date</Th> 
                    <Th>Description</Th> 
                    <Th>Amount (KES)</Th> 
                    <Th>Status</Th> 
                  </Tr> 
                </Thead> 
                <Tbody> 
                  {groupedTransactions.map((transaction, index) => ( 
                    <Tr key={index}> 
                      <Td>{new Date().toLocaleDateString()}</Td> 
                      <Td>{transaction.description}</Td> 
                      <Td fontWeight="bold">{transaction.totalAmount.toLocaleString()}</Td> 
                      <Td> 
                        <Badge  
                          colorScheme={ 
                            transaction.status === 'completed' ? 'green' :  
                            transaction.status === 'processing' ? 'blue' : 'orange' 
                          } 
                        > 
                          {transaction.status} 
                        </Badge> 
                      </Td> 
                    </Tr> 
                  ))} 
                </Tbody> 
              </Table> 
            </CardBody> 
          </Card> 
          
          <Card bg="purple.50" borderRadius="xl"> 
            <CardBody> 
              <Heading size="md" mb={4}>Financial Planning Tools</Heading> 
              <Text mb={4}> 
                Tools to optimize your farm's financial performance: 
              </Text> 
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}> 
                {[ 
                  {
                    title: "Crop profitability calculator",
                    link: "https://www.agriculture.com/profitability-calculator",
                    description: "Calculate potential profits for different crops"
                  },
                  {
                    title: "Seasonal budget planner",
                    link: "https://www.farmfinance.org/seasonal-planner",
                    description: "Plan your expenses and income throughout the year"
                  },
                  {
                    title: "Market price forecasting",
                    link: "https://www.agrimarketinsights.com/forecasting",
                    description: "Predict future market prices for your products"
                  },
                  {
                    title: "Investment ROI analysis",
                    link: "https://www.agribusinessinvestment.com/roi-tool",
                    description: "Analyze return on investment for farm equipment"
                  }
                ].map((tool, index) => ( 
                  <Flex key={index} align="start" bg="white" p={3} borderRadius="md"> 
                    <Icon as={FaChartLine} color="purple.500" mr={3} mt={1} /> 
                    <Box>
                      <Link href={tool.link} isExternal fontWeight="bold" color="blue.500">
                        {tool.title}
                      </Link>
                      <Text fontSize="sm">{tool.description}</Text>
                    </Box>
                  </Flex> 
                ))} 
              </SimpleGrid> 
            </CardBody> 
          </Card> 
        </TabPanel>
        
        {/* Instore Sales Tab */}
        <TabPanel id="instore">
          <Tabs variant="soft-rounded" colorScheme="green">
            <TabList mb={4}>
              <Tab>Cash Sales</Tab>
              <Tab>Mpesa Sales Transactions</Tab>
            </TabList>
            
            <TabPanels>
              <TabPanel p={0}>
                <Box bg="white" p={6} borderRadius="xl" mb={6}>
                  <Heading size="md" mb={4}>Record Cash Sale</Heading>
                  <form onSubmit={handleInstoreSale}>
                    <FormControl mb={4} isRequired>
                      <FormLabel>Product</FormLabel>
                      <Select 
                        placeholder="Select product"
                        value={instoreForm.productId}
                        onChange={(e) => setInstoreForm({...instoreForm, productId: e.target.value})}
                      >
                        {products.map(product => (
                          <option key={product.id} value={product.id}>
                            {product.name} ({product.quantity} {product.unit} available)
                          </option>
                        ))}
                      </Select>
                    </FormControl>

                    <FormControl mb={4} isRequired>
                      <FormLabel>Quantity</FormLabel>
                      <Input 
                        type="number"
                        min="1"
                        value={instoreForm.quantity}
                        onChange={(e) => setInstoreForm({...instoreForm, quantity: parseInt(e.target.value) || 1})}
                      />
                    </FormControl>

                    <Input type="hidden" name="paymentMethod" value="cash" />
                    
                    <Button 
                      colorScheme="green" 
                      type="submit"
                      isDisabled={!instoreForm.productId}
                    >
                      Record Cash Sale
                    </Button>
                  </form>
                </Box>
              </TabPanel>
              
              <TabPanel p={0}>
                <Box bg="white" p={6} borderRadius="xl" mb={6}>
                  <Heading size="md" mb={4}>Record Mpesa Transaction</Heading>
                  <form onSubmit={handleInstoreSale}>
                    <FormControl mb={4} isRequired>
                      <FormLabel>Product</FormLabel>
                      <Select 
                        placeholder="Select product"
                        value={instoreForm.productId}
                        onChange={(e) => setInstoreForm({...instoreForm, productId: e.target.value})}
                      >
                        {products.map(product => (
                          <option key={product.id} value={product.id}>
                            {product.name} ({product.quantity} {product.unit} available)
                          </option>
                        ))}
                      </Select>
                    </FormControl>

                    <FormControl mb={4} isRequired>
                      <FormLabel>Quantity</FormLabel>
                      <Input 
                        type="number"
                        min="1"
                        value={instoreForm.quantity}
                        onChange={(e) => setInstoreForm({...instoreForm, quantity: parseInt(e.target.value) || 1})}
                      />
                    </FormControl>

                    <Input type="hidden" name="paymentMethod" value="mpesa" />
                    
                    <Button 
                      colorScheme="green" 
                      type="submit"
                      isDisabled={!instoreForm.productId}
                    >
                      Record Mpesa Transaction
                    </Button>
                  </form>
                </Box>
              </TabPanel>
            </TabPanels>
          </Tabs>

          <Card borderRadius="xl">
            <CardHeader>
              <Heading size="md">Recent Instore Sales</Heading>
            </CardHeader>
            <CardBody>
              {isInstoreLoading ? (
                <Flex justify="center"><Spinner /></Flex>
              ) : instoreSales.length === 0 ? (
                <Text textAlign="center" py={4}>No instore sales recorded yet</Text>
              ) : (
                <Table variant="simple">
                  <Thead>
                    <Tr>
                      <Th>Product</Th>
                      <Th>Quantity</Th>
                      <Th>Amount (KES)</Th>
                      <Th>Payment Method</Th>
                      <Th>Date</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {instoreSales.map(sale => (
                      <Tr key={sale.id}>
                        <Td>{sale.product?.name || 'N/A'}</Td>
                        <Td>{sale.quantity}</Td>
                        <Td>{sale.amount?.toLocaleString()}</Td>
                        <Td>
                          <Badge 
                            colorScheme={sale.payment_method === 'cash' ? 'green' : 'blue'}
                            textTransform="capitalize"
                          >
                            {sale.payment_method}
                          </Badge>
                        </Td>
                        <Td>{new Date(sale.created_at).toLocaleDateString()}</Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              )}
            </CardBody>
          </Card>
        </TabPanel>
      </TabPanels> 
    </Tabs> 
  </Box> 
); 
};

export default FarmerDashboard;