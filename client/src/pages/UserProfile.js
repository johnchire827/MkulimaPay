import React, { useState, useEffect, useRef } from 'react';
import { 
  Icon, Box, Heading, Text, Flex, Avatar, Button, Tabs, TabList, Tab, 
  TabPanels, TabPanel, Card, CardBody, SimpleGrid, FormControl, 
  FormLabel, Input, useToast, Badge, Modal, ModalOverlay, ModalContent, 
  ModalHeader, ModalCloseButton, ModalBody, ModalFooter, Select, 
  Stack, useDisclosure, Table, Thead, Tbody, Tr, Th, Td, InputGroup, InputLeftAddon,
  Spinner
} from '@chakra-ui/react';
import { FaUser, FaLock, FaWallet, FaHistory, FaMoneyBillWave, FaMapMarkerAlt, FaPhone, FaEnvelope } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const UserProfile = () => {
  const { user, logout, updateProfile } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [editMode, setEditMode] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    phone_number: user?.phone_number || '',
    email: user?.email || '',
    location: user?.location || '',
  });
  
  // Password change states
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  // Wallet states
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [mpesaData, setMpesaData] = useState({
    amount: '',
    phone: user?.phone_number || '',
    provider: 'Safaricom'
  });
  
  // Activity states
  const [orders, setOrders] = useState([]);
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState({
    wallet: true,
    activity: true,
    transactions: true
  });
  
  // M-Pesa modal controls
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [mpesaAction, setMpesaAction] = useState('add');
  const [isProcessing, setIsProcessing] = useState(false);
  const pollingRef = useRef(null);

  // Motion components
  const MotionCard = motion(Card);
  const MotionButton = motion(Button);

  // Fetch wallet data (balance and transactions)
  const fetchWalletData = async () => {
    if (!user?.id) return;
    
    try {
      // Fetch user balance
      const balanceRes = await api.get(`/users/${user.id}/balance`);
      setBalance(balanceRes.data.balance);
      
      // Fetch user transactions
      const transactionsRes = await api.get(`/transactions/user/${user.id}`);
      setTransactions(transactionsRes.data);
    } catch (error) {
      toast({
        title: "Error fetching wallet data",
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(prev => ({ ...prev, wallet: false, transactions: false }));
    }
  };

  // Poll for transaction updates
  const startTransactionPolling = (transactionId) => {
    if (pollingRef.current) clearInterval(pollingRef.current);
    
    pollingRef.current = setInterval(async () => {
      try {
        const res = await api.get(`/transactions/${transactionId}`);
        const updatedTransaction = res.data;
        
        if (updatedTransaction.status === 'completed') {
          clearInterval(pollingRef.current);
          fetchWalletData(); // Refresh wallet data
        }
      } catch (error) {
        console.error('Error polling transaction:', error);
      }
    }, 5000); // Poll every 5 seconds
  };

  useEffect(() => {
    fetchWalletData();
    
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [user, toast]);

  // Fetch activity data (orders and bids)
  useEffect(() => {
    const fetchActivityData = async () => {
      if (!user?.id) return;
      
      try {
        setLoading(prev => ({ ...prev, activity: true }));
        
        // Fetch user orders
        const ordersRes = await api.get(`/orders?user_id=${user.id}`);
        setOrders(ordersRes.data);
        
        // Fetch user bids
        const bidsRes = await api.get(`/bids?buyer_id=${user.id}`);
        setBids(bidsRes.data);
      } catch (error) {
        toast({
          title: "Error fetching activity data",
          description: error.message,
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      } finally {
        setLoading(prev => ({ ...prev, activity: false }));
      }
    };

    fetchActivityData();
  }, [user, toast]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData({ ...profileData, [name]: value });
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData({ ...passwordData, [name]: value });
  };

  const handleSave = async () => {
    try {
      // Update user profile
      await updateProfile({
        name: profileData.name,
        location: profileData.location
      });
      
      toast({
        title: "Profile Updated",
        description: "Your profile information has been saved",
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      setEditMode(false);
    } catch (error) {
      toast({
        title: "Update Failed",
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

 const handlePasswordUpdate = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "New passwords do not match",
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      const response = await api.put('/auth/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });

      if (response.data.success) {
        toast({
          title: "Password Updated",
          description: "Your password has been changed successfully",
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      }
    } catch (error) {
      toast({
        title: "Password Change Failed",
        description: error.response?.data?.error || error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleLogout = () => {
    logout();
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out",
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };

  const handleMpesaChange = (e) => {
    const { name, value } = e.target;
    setMpesaData({ ...mpesaData, [name]: value });
  };

  const initiateMpesaTransaction = async () => {
    const amount = parseInt(mpesaData.amount);
    if (!amount || amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount",
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (!mpesaData.phone.match(/^(\+254|0)[17]\d{8}$/)) {
      toast({
        title: "Invalid Phone",
        description: "Please enter a valid Kenyan phone number",
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      setIsProcessing(true);
      
      // Save transaction to database
      const response = await api.post('/transactions', {
        userId: user.id,
        amount,
        type: mpesaAction === 'add' ? "deposit" : "withdrawal",
        phone: mpesaData.phone,
        provider: mpesaData.provider,
      });

      const transaction = response.data;
      
      // Start polling for this transaction
      startTransactionPolling(transaction.id);
      
      // For deposits, show STK push message
      if (mpesaAction === 'add') {
        toast({
          title: "Check Your Phone",
          description: "Please check your phone to complete the payment by entering your M-PESA PIN",
          status: 'info',
          duration: 8000,
          isClosable: true,
          position: 'top'
        });
      } 
      // For withdrawals, show processing message
      else {
        toast({
          title: "Withdrawal Requested",
          description: "Your withdrawal request is being processed. It may take a few minutes.",
          status: 'info',
          duration: 5000,
          isClosable: true,
        });
      }

      // Reset form and close modal
      setMpesaData({ amount: '', phone: user?.phone_number || '', provider: 'Safaricom' });
      onClose();
    } catch (error) {
      toast({
        title: "Transaction Failed",
        description: error.response?.data?.error || error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsProcessing(false);
    }
  };
  const openMpesaModal = (action) => {
    setMpesaAction(action);
    onOpen();
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <Box p={{ base: 4, md: 8 }}>
      {/* M-Pesa Transaction Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="md">
        <ModalOverlay />
        <ModalContent borderRadius="xl">
          <ModalHeader 
            bgGradient="linear(to-r, green.500, teal.400)" 
            color="white" 
            borderTopRadius="xl"
            py={4}
          >
            <Flex align="center">
              <Icon as={FaMoneyBillWave} mr={2} />
              {mpesaAction === 'add' ? "Add Funds" : "Withdraw Funds"}
            </Flex>
          </ModalHeader>
          <ModalCloseButton color="white" />
          <ModalBody py={6}>
            <Text mb={4} fontWeight="medium">
              {mpesaAction === 'add' 
                ? "Enter amount to deposit to your wallet" 
                : "Enter amount to withdraw from your wallet"}
            </Text>
            
            <FormControl mb={4}>
              <FormLabel>Amount (KES)</FormLabel>
              <InputGroup>
                <InputLeftAddon>KES</InputLeftAddon>
                <Input 
                  type="number"
                  name="amount"
                  value={mpesaData.amount}
                  onChange={handleMpesaChange}
                  placeholder="Enter amount"
                  focusBorderColor="green.400"
                />
              </InputGroup>
            </FormControl>
            
            <FormControl mb={4}>
              <FormLabel>Phone Number</FormLabel>
              <Input 
                type="tel"
                name="phone"
                value={mpesaData.phone}
                onChange={handleMpesaChange}
                placeholder="e.g. 0712345678"
                focusBorderColor="green.400"
              />
            </FormControl>
            
            <FormControl>
              <FormLabel>Mobile Provider</FormLabel>
              <Select 
                name="provider"
                value={mpesaData.provider}
                onChange={handleMpesaChange}
                focusBorderColor="green.400"
              >
                <option value="Safaricom">Safaricom (M-Pesa)</option>
              
              </Select>
            </FormControl>
          </ModalBody>
          
          <ModalFooter>
            <MotionButton 
              variant="outline" 
              mr={3} 
              onClick={onClose}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Cancel
            </MotionButton>
            <MotionButton 
              colorScheme="green" 
              onClick={initiateMpesaTransaction}
              isLoading={isProcessing}
              loadingText={mpesaAction === 'add' ? "Initiating..." : "Processing..."}
              isDisabled={!mpesaData.amount || !mpesaData.phone || isProcessing}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {mpesaAction === 'add' ? "Deposit Funds" : "Withdraw Funds"}
            </MotionButton>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Flex justify="space-between" align="center" mb={8}>
        <Heading size="xl" bgGradient="linear(to-r, green.500, teal.400)" bgClip="text">
          My Profile
        </Heading>
        <MotionButton 
          colorScheme={editMode ? 'green' : 'blue'} 
          onClick={editMode ? handleSave : () => setEditMode(true)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {editMode ? "Save Changes" : "Edit Profile"}
        </MotionButton>
      </Flex>
      
      <Tabs variant="soft-rounded" colorScheme="green">
        <TabList mb={8} overflowX="auto" py={2}>
          <Tab><Icon as={FaUser} mr={2} /> Personal</Tab>
          <Tab><Icon as={FaLock} mr={2} /> Security</Tab>
          <Tab><Icon as={FaWallet} mr={2} /> Wallet</Tab>
          <Tab><Icon as={FaHistory} mr={2} /> Activity</Tab>
        </TabList>
        
        <TabPanels>
          {/* Personal Information Tab */}
          <TabPanel>
            <MotionCard 
              borderRadius="xl" 
              mb={6}
              whileHover={{ y: -5, boxShadow: 'lg' }}
              transition={{ duration: 0.2 }}
            >
              <CardBody>
                <Flex direction={{ base: 'column', md: 'row' }} gap={8}>
                  <Flex direction="column" align="center">
                    <Avatar 
                      size="2xl" 
                      name={profileData.name} 
                      mb={4} 
                      src={user?.avatar}
                      border="3px solid"
                      borderColor="green.300"
                    />
                  </Flex>
                  
                  <Box flex={1}>
                    <FormControl mb={4}>
                      <FormLabel>Full Name</FormLabel>
                      {editMode ? (
                        <Input 
                          name="name"
                          value={profileData.name} 
                          onChange={handleInputChange}
                          placeholder="Enter your full name"
                          focusBorderColor="green.400"
                        />
                      ) : (
                        <Text fontSize="xl" fontWeight="bold">
                          {profileData.name || "Not provided"}
                        </Text>
                      )}
                    </FormControl>
                    
                    <FormControl mb={4} isReadOnly>
                      <Flex align="center">
                        <Icon as={FaPhone} mr={2} color="green.500" />
                        <Text fontSize="lg">{profileData.phone_number || "Not provided"}</Text>
                      </Flex>
                    </FormControl>

                   
                  </Box>
                </Flex>
              </CardBody>
            </MotionCard>
            
            <MotionButton 
              colorScheme="red" 
              variant="outline"
              onClick={handleLogout}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Logout
            </MotionButton>
          </TabPanel>
          
          {/* Security Tab */}
          <TabPanel>
            <MotionCard 
              borderRadius="xl" 
              mb={6}
              whileHover={{ y: -5, boxShadow: 'lg' }}
              transition={{ duration: 0.2 }}
            >
              <CardBody>
                <Heading size="md" mb={4}>Password Management</Heading>
                
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} mb={6}>
                  <FormControl>
                    <FormLabel>Current Password</FormLabel>
                    <Input 
                      type="password" 
                      name="currentPassword"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      placeholder="Enter current password"
                      focusBorderColor="green.400"
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel>New Password</FormLabel>
                    <Input 
                      type="password" 
                      name="newPassword"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      placeholder="Create new password"
                      focusBorderColor="green.400"
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel>Confirm New Password</FormLabel>
                    <Input 
                      type="password" 
                      name="confirmPassword"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      placeholder="Confirm new password"
                      focusBorderColor="green.400"
                    />
                  </FormControl>
                </SimpleGrid>
                
                <MotionButton 
                  colorScheme="green"
                  onClick={handlePasswordUpdate}
                  isDisabled={!passwordData.currentPassword || 
                              !passwordData.newPassword || 
                              !passwordData.confirmPassword}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Update Password
                </MotionButton>
              </CardBody>
            </MotionCard>
          </TabPanel>
          
          {/* Wallet Tab */}
          <TabPanel>
            <MotionCard 
              borderRadius="xl" 
              mb={6}
              whileHover={{ y: -5, boxShadow: 'lg' }}
              transition={{ duration: 0.2 }}
            >
              <CardBody>
                <Flex justify="space-between" align="center" mb={6}>
                  <Box>
                    <Text color="gray.600">Available Balance</Text>
                    <Heading size="xl" color="green.600">KES {balance.toLocaleString()}</Heading>
                  </Box>
                  <Flex gap={3}>
                    <MotionButton 
                      colorScheme="green"
                      onClick={() => openMpesaModal('add')}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Add Funds
                    </MotionButton>
                    <MotionButton 
                      variant="outline"
                      colorScheme="teal"
                      onClick={() => openMpesaModal('withdraw')}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Withdraw Funds
                    </MotionButton>
                  </Flex>
                </Flex>
                
                <Text fontSize="sm" color="gray.500" mb={4}>
                  Funds are instantly available for marketplace transactions
                </Text>
              </CardBody>
            </MotionCard>
            
            <MotionCard 
              borderRadius="xl"
              whileHover={{ y: -5, boxShadow: 'lg' }}
              transition={{ duration: 0.2 }}
            >
              <CardBody>
                <Heading size="md" mb={4}>Transaction History</Heading>
                
                {loading.transactions ? (
                  <Flex justify="center" py={10}>
                    <Spinner size="xl" color="green.500" />
                  </Flex>
                ) : transactions.length > 0 ? (
                  <Table variant="simple">
                    <Thead bg="gray.50">
                      <Tr>
                        <Th>Date</Th>
                        <Th>Type</Th>
                        <Th>Amount</Th>
                        <Th>Status</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {transactions.map(transaction => (
                        <Tr key={transaction.id} _hover={{ bg: 'gray.50' }}>
                          <Td>{formatDate(transaction.created_at)}</Td>
                          <Td>{transaction.type}</Td>
                          <Td fontWeight="bold">KES {parseInt(transaction.amount).toLocaleString()}</Td>
                          <Td>
                            <Badge 
                              colorScheme={
                                transaction.status === 'completed' ? 'green' : 
                                transaction.status === 'processing' ? 'blue' : 
                                transaction.status === 'pending' ? 'yellow' : 'red'
                              }
                              px={2}
                              py={1}
                              borderRadius="full"
                            >
                              {transaction.status}
                            </Badge>
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                ) : (
                  <Text color="gray.500" textAlign="center" py={6}>
                    No transactions found
                  </Text>
                )}
              </CardBody>
            </MotionCard>
          </TabPanel>
          
          {/* Activity Tab */}
          <TabPanel>
            <MotionCard 
              borderRadius="xl" 
              mb={6}
              whileHover={{ y: -5, boxShadow: 'lg' }}
              transition={{ duration: 0.2 }}
            >
              <CardBody>
                <Heading size="md" mb={4}>Recent Orders</Heading>
                
                {loading.activity ? (
                  <Flex justify="center" py={10}>
                    <Spinner size="xl" color="green.500" />
                  </Flex>
                ) : orders.length === 0 ? (
                  <Text color="gray.500" textAlign="center" py={6}>
                    No orders found
                  </Text>
                ) : (
                  <Table variant="simple">
                    <Thead bg="gray.50">
                      <Tr>
                        <Th>Date</Th>
                        <Th>Order ID</Th>
                        <Th>Amount</Th>
                        <Th>Status</Th>
                        <Th>Payment</Th>
                        <Th>Action</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {orders.slice(0, 5).map(order => (
                        <Tr key={order.id} _hover={{ bg: 'gray.50' }}>
                          <Td>{formatDate(order.created_at)}</Td>
                          <Td fontWeight="bold">#{order.id}</Td>
                          <Td fontWeight="bold">KES {parseInt(order.total_amount).toLocaleString()}</Td>
                          <Td>
                            <Badge 
                              colorScheme={
                                order.status === 'completed' ? 'green' : 
                                order.status === 'processing' ? 'blue' : 'orange'
                              }
                              px={2}
                              py={1}
                              borderRadius="full"
                            >
                              {order.status}
                            </Badge>
                          </Td>
                          <Td>{order.payment_method}</Td>
                          <Td>
                            <Button 
                              size="sm" 
                              colorScheme="teal"
                              onClick={() => navigate(`/order-confirmation/${order.id}`)}
                            >
                              Track Order
                            </Button>
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                )}
              </CardBody>
            </MotionCard>
            
            <MotionCard 
              borderRadius="xl" 
              mb={6}
              whileHover={{ y: -5, boxShadow: 'lg' }}
              transition={{ duration: 0.2 }}
            >
              <CardBody>
                <Heading size="md" mb={4}>Recent Bids</Heading>
                
                {loading.activity ? (
                  <Flex justify="center" py={10}>
                    <Spinner size="xl" color="green.500" />
                  </Flex>
                ) : bids.length === 0 ? (
                  <Text color="gray.500" textAlign="center" py={6}>
                    No bids found
                  </Text>
                ) : (
                  <Table variant="simple">
                    <Thead bg="gray.50">
                      <Tr>
                        <Th>Date</Th>
                        <Th>Amount</Th>
                        <Th>Status</Th>
                        <Th>Product</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {bids.slice(0, 5).map(bid => (
                        <Tr key={bid.id} _hover={{ bg: 'gray.50' }}>
                          <Td>{formatDate(bid.created_at)}</Td>
                          <Td fontWeight="bold">KES {parseInt(bid.amount).toLocaleString()}</Td>
                          <Td>
                            <Badge 
                              colorScheme={
                                bid.status === 'accepted' ? 'green' : 
                                bid.status === 'pending' ? 'blue' : 'red'
                              }
                              px={2}
                              py={1}
                              borderRadius="full"
                            >
                              {bid.status}
                            </Badge>
                          </Td>
                          <Td>Product #{bid.product_id || 'N/A'}</Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                )}
              </CardBody>
            </MotionCard>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
};

export default UserProfile;