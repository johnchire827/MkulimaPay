import React, { useState } from 'react';
import { 
  Box, Heading, Text, SimpleGrid, Card, CardHeader, CardBody, CardFooter, 
  Flex, Button, Badge, Icon, Input, InputGroup, InputLeftElement, 
  Select, useToast, Progress, Modal, ModalOverlay, ModalContent, 
  ModalHeader, ModalCloseButton, ModalBody, ModalFooter, FormControl, 
  FormLabel, useDisclosure, Tabs, TabList, Tab, TabPanels, TabPanel, 
  Table, Thead, Tbody, Tr, Th, Td, Stat, StatLabel, StatNumber, 
  StatHelpText, StatArrow, NumberInput, NumberInputField, NumberInputStepper,
  NumberIncrementStepper, NumberDecrementStepper
} from '@chakra-ui/react';
import { FaTree, FaStar, FaCoins, FaSearch, FaLeaf, FaChartLine, FaMoneyBillWave, FaHistory } from 'react-icons/fa';
import { useLanguage } from '../context/LanguageContext';

const CarbonCreditMarket = () => {
  const { t } = useLanguage();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedProject, setSelectedProject] = useState(null);
  const [mpesaData, setMpesaData] = useState({ amount: '', phone: '', provider: 'Safaricom' });
  const [activeTab, setActiveTab] = useState(0);
  const [userCredits, setUserCredits] = useState(120);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [purchaseHistory, setPurchaseHistory] = useState([
    { id: 1, date: "2025-06-15", project: "Kijabe Forest Conservation", credits: 15, amount: "KES 187.50", impact: "Protected 200 acres of indigenous forest" },
    { id: 2, date: "2025-05-22", project: "Lake Victoria Mangrove Restoration", credits: 10, amount: "KES 157.50", impact: "Restored critical fish breeding grounds" },
    { id: 3, date: "2025-04-10", project: "Solar Cookstoves Distribution", credits: 25, amount: "KES 255.00", impact: "Reduced deforestation for firewood" }
  ]);
  const [cart, setCart] = useState([]);
  
  const carbonProjects = [
    {
      id: 1,
      project: "Kijabe Forest Conservation",
      location: "Kijabe, Kenya",
      type: "Reforestation",
      creditsAvailable: 1500,
      pricePerCredit: 12.50,
      rating: 4.8,
      impact: "Protects 200 acres of indigenous forest habitat",
      description: "This project preserves critical montane forest ecosystems, preventing deforestation and protecting endangered species.",
      benefits: ["Biodiversity conservation", "Water catchment protection", "Carbon sequestration"],
      purchaseImpact: "Your credits will protect 1 acre of forest for every 5 credits purchased"
    },
    {
      id: 2,
      project: "Lake Victoria Mangrove Restoration",
      location: "Kisumu, Kenya",
      type: "Wetland Restoration",
      creditsAvailable: 800,
      pricePerCredit: 15.75,
      rating: 4.6,
      impact: "Restores critical fish breeding grounds and coastal protection",
      description: "Replanting mangroves along Lake Victoria shores to restore fish habitats and prevent soil erosion.",
      benefits: ["Fisheries enhancement", "Coastal protection", "Blue carbon storage"],
      purchaseImpact: "Each credit plants 3 mangrove seedlings and protects coastal communities"
    },
    {
      id: 3,
      project: "Solar Cookstoves Distribution",
      location: "Turkana, Kenya",
      type: "Renewable Energy",
      creditsAvailable: 2500,
      pricePerCredit: 10.20,
      rating: 4.9,
      impact: "Reduces deforestation for firewood and indoor air pollution",
      description: "Providing efficient solar cookstoves to communities in arid regions.",
      benefits: ["Deforestation reduction", "Health improvement", "Energy access"],
      purchaseImpact: "Every 5 credits provide a solar cookstove to a family, reducing firewood use by 70%"
    },
    {
      id: 4,
      project: "Sustainable Agriculture Program",
      location: "Embu, Kenya",
      type: "Soil Carbon",
      creditsAvailable: 3200,
      pricePerCredit: 9.80,
      rating: 4.7,
      impact: "Trains farmers in regenerative techniques to sequester carbon in soils",
      description: "Implementing conservation agriculture practices that increase soil organic matter.",
      benefits: ["Soil health improvement", "Crop yield increase", "Carbon sequestration"],
      purchaseImpact: "Each credit trains a farmer in carbon farming techniques covering 0.5 acres"
    },
    {
      id: 5,
      project: "Geothermal Energy Expansion",
      location: "Nakuru, Kenya",
      type: "Renewable Energy",
      creditsAvailable: 4200,
      pricePerCredit: 14.25,
      rating: 4.8,
      impact: "Expanding clean geothermal power generation to replace fossil fuels",
      description: "Developing new geothermal wells to provide baseload renewable energy.",
      benefits: ["Clean energy production", "Job creation", "Fossil fuel displacement"],
      purchaseImpact: "Each credit generates 250kWh of clean energy, powering 2 homes for a month"
    },
    {
      id: 6,
      project: "Urban Tree Planting Initiative",
      location: "Nairobi, Kenya",
      type: "Reforestation",
      creditsAvailable: 1800,
      pricePerCredit: 13.40,
      rating: 4.5,
      impact: "Increasing urban green cover to combat heat island effect",
      description: "Planting native tree species in urban areas to improve air quality.",
      benefits: ["Urban cooling", "Air purification", "Community wellbeing"],
      purchaseImpact: "Each credit plants and maintains 2 urban trees that cool neighborhoods"
    }
  ];
  
  const [filteredProjects, setFilteredProjects] = useState(carbonProjects);

  const handleSearch = () => {
    const filtered = carbonProjects.filter(project => {
      const matchesSearch = project.project.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            project.location.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = typeFilter ? project.type === typeFilter : true;
      return matchesSearch && matchesType;
    });
    
    setFilteredProjects(filtered);
  };

  const handleAddToCart = (project) => {
    setSelectedProject(project);
    setActiveTab(1); // Switch to My Credits tab
    toast({
      title: "Project Added",
      description: `${project.project} added to your carbon portfolio`,
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };

  const handleMpesaChange = (e) => {
    const { name, value } = e.target;
    setMpesaData({ ...mpesaData, [name]: value });
  };

  const handlePurchase = () => {
    if (!mpesaData.amount || parseFloat(mpesaData.amount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid credit amount",
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

    if (!selectedProject) {
      toast({
        title: "No Project Selected",
        description: "Please select a carbon credit project first",
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const creditsPurchased = Math.floor(parseFloat(mpesaData.amount) / selectedProject.pricePerCredit);
    
    // Add to purchase history
    const newPurchase = {
      id: Date.now(),
      date: new Date().toISOString().split('T')[0],
      project: selectedProject.project,
      credits: creditsPurchased,
      amount: `KES ${parseFloat(mpesaData.amount).toLocaleString()}`,
      impact: selectedProject.purchaseImpact,
      type: selectedProject.type
    };
    
    setPurchaseHistory([newPurchase, ...purchaseHistory]);
    
    // Update user credits
    setUserCredits(userCredits + creditsPurchased);
    
    toast({
      title: "Purchase Successful",
      description: `${creditsPurchased} carbon credits added to your account`,
      status: 'success',
      duration: 5000,
      isClosable: true,
    });
    
    // Reset form and close modal
    setMpesaData({ amount: '', phone: '', provider: 'Safaricom' });
    setSelectedProject(null);
    onClose();
  };

  const totalCreditsAvailable = carbonProjects.reduce((sum, project) => sum + project.creditsAvailable, 0);
  const averagePrice = carbonProjects.reduce((sum, project) => sum + project.pricePerCredit, 0) / carbonProjects.length;

  // Calculate total purchased credits
  const totalPurchasedCredits = purchaseHistory.reduce((sum, purchase) => sum + purchase.credits, 0);
  
  // Calculate total impact
  const totalImpact = purchaseHistory.reduce((sum, purchase) => sum + purchase.credits, 0) * 0.25;

  return (
    <Box p={{ base: 4, md: 8 }}>
      {/* M-Pesa Purchase Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="md">
        <ModalOverlay />
        <ModalContent borderRadius="xl">
          <ModalHeader bg="green.500" color="white" borderTopRadius="xl">
            <Flex align="center">
              <Icon as={FaMoneyBillWave} mr={2} />
              Purchase Carbon Credits
            </Flex>
          </ModalHeader>
          <ModalCloseButton color="white" />
          <ModalBody py={6}>
            {selectedProject && (
              <>
                <Text fontWeight="bold" mb={2}>Project: {selectedProject.project}</Text>
                <Text mb={4} fontSize="sm">{selectedProject.location}</Text>
                
                <Text mb={2}>Price Per Credit: <Text as="span" fontWeight="bold">KES {selectedProject.pricePerCredit.toFixed(2)}</Text></Text>
                <Text mb={4}>Your Impact: <Text as="span" fontWeight="bold">{selectedProject.purchaseImpact}</Text></Text>
              </>
            )}
            
            <FormControl mb={4}>
              <FormLabel>Credit Amount to Purchase</FormLabel>
              <Input 
                type="number"
                name="amount"
                value={mpesaData.amount}
                onChange={handleMpesaChange}
                placeholder="Enter credit amount"
              />
              <Text fontSize="sm" color="gray.500" mt={1}>
                Minimum purchase: 5 credits
              </Text>
            </FormControl>
            
            <FormControl mb={4}>
              <FormLabel>Phone Number</FormLabel>
              <Input 
                type="tel"
                name="phone"
                value={mpesaData.phone}
                onChange={handleMpesaChange}
                placeholder="e.g. 0712345678"
              />
            </FormControl>
            
            <FormControl>
              <FormLabel>Mobile Provider</FormLabel>
              <Select 
                name="provider"
                value={mpesaData.provider}
                onChange={handleMpesaChange}
              >
                <option value="Safaricom">Safaricom (M-Pesa)</option>
                <option value="Airtel">Airtel Money</option>
              </Select>
            </FormControl>
          </ModalBody>
          
          <ModalFooter>
            <Button variant="outline" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button 
              colorScheme="green" 
              onClick={handlePurchase}
              isDisabled={!mpesaData.amount || !mpesaData.phone}
            >
              Complete Purchase
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Heading size="xl" mb={6}>Carbon Credit Marketplace</Heading>
      
      <Tabs variant="soft-rounded" colorScheme="green" index={activeTab} onChange={setActiveTab}>
        <TabList mb={8}>
          <Tab><Icon as={FaCoins} mr={2} /> Marketplace</Tab>
          <Tab><Icon as={FaLeaf} mr={2} /> My Carbon Portfolio</Tab>
          <Tab><Icon as={FaHistory} mr={2} /> Transaction History</Tab>
        </TabList>
        
        <TabPanels>
          {/* Marketplace Tab */}
          <TabPanel>
            <Text mb={8} color="gray.600" fontSize="lg">
              Invest in verified carbon reduction projects to neutralize your environmental impact while supporting sustainable development in Kenya.
            </Text>
            
            {/* Stats Overview */}
            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} mb={8}>
              <Card bg="green.50" borderRadius="xl">
                <CardBody>
                  <Flex align="center">
                    <Box flex={1}>
                      <Text fontWeight="bold" color="gray.600">Total Credits Available</Text>
                      <Heading size="xl">{totalCreditsAvailable.toLocaleString()}</Heading>
                    </Box>
                    <Icon as={FaCoins} boxSize={8} color="green.500" />
                  </Flex>
                </CardBody>
              </Card>
              
              <Card bg="teal.50" borderRadius="xl">
                <CardBody>
                  <Flex align="center">
                    <Box flex={1}>
                      <Text fontWeight="bold" color="gray.600">Average Price</Text>
                      <Heading size="xl">KES {averagePrice.toFixed(2)}</Heading>
                    </Box>
                    <Icon as={FaChartLine} boxSize={8} color="teal.500" />
                  </Flex>
                </CardBody>
              </Card>
              
              <Card bg="blue.50" borderRadius="xl">
                <CardBody>
                  <Flex align="center">
                    <Box flex={1}>
                      <Text fontWeight="bold" color="gray.600">Your Credit Balance</Text>
                      <Heading size="xl">{userCredits} Credits</Heading>
                    </Box>
                    <Icon as={FaLeaf} boxSize={8} color="blue.500" />
                  </Flex>
                </CardBody>
              </Card>
            </SimpleGrid>
            
            {/* Search and Filter */}
            <Flex direction={{ base: 'column', md: 'row' }} gap={4} mb={8}>
              <InputGroup flex={{ base: '1', md: '2' }}>
                <InputLeftElement pointerEvents="none">
                  <Icon as={FaSearch} color="gray.300" />
                </InputLeftElement>
                <Input 
                  placeholder="Search projects by name or location" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </InputGroup>
              
              <Select 
                placeholder="All project types" 
                flex={{ base: '1', md: '1' }}
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <option value="Reforestation">Reforestation</option>
                <option value="Wetland Restoration">Wetland Restoration</option>
                <option value="Renewable Energy">Renewable Energy</option>
                <option value="Soil Carbon">Soil Carbon</option>
                <option value="Grassland Restoration">Grassland Restoration</option>
                <option value="Waste Management">Waste Management</option>
              </Select>
              
              <Button colorScheme="green" px={8} onClick={handleSearch}>
                Search Projects
              </Button>
            </Flex>
            
            {/* Carbon Credit Projects */}
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
              {filteredProjects.map(project => (
                <Card key={project.id} borderRadius="xl" overflow="hidden" h="100%">
                  <Box h="160px" bg="green.100" position="relative">
                    <Flex 
                      justify="center" 
                      align="center" 
                      h="full" 
                      color="green.800"
                      opacity={0.3}
                    >
                      <Icon as={FaTree} boxSize={12} />
                    </Flex>
                    <Badge 
                      colorScheme="green" 
                      position="absolute" 
                      top={4} 
                      right={4}
                    >
                      {project.type}
                    </Badge>
                  </Box>
                  
                  <CardHeader>
                    <Heading size="md">{project.project}</Heading>
                    <Text color="gray.500">{project.location}</Text>
                  </CardHeader>
                  
                  <CardBody pt={0}>
                    <Flex justify="space-between" mb={3}>
                      <Text fontWeight="bold">KES {project.pricePerCredit.toFixed(2)}/Credit</Text>
                      <Flex align="center">
                        <Icon as={FaStar} color="yellow.400" mr={1} />
                        <Text>{project.rating}</Text>
                      </Flex>
                    </Flex>
                    
                    <Text mb={4} noOfLines={2}>{project.impact}</Text>
                    
                    <Box mb={4}>
                      <Flex justify="space-between" mb={1}>
                        <Text fontSize="sm">Credits Available</Text>
                        <Text fontSize="sm" fontWeight="bold">{project.creditsAvailable.toLocaleString()}</Text>
                      </Flex>
                      <Progress 
                        value={(project.creditsAvailable / totalCreditsAvailable) * 100} 
                        colorScheme="green" 
                        size="sm" 
                        borderRadius="full" 
                      />
                    </Box>
                  </CardBody>
                  
                  <CardFooter>
                    <Button 
                      colorScheme="green" 
                      w="full"
                      leftIcon={<FaCoins />}
                      onClick={() => handleAddToCart(project)}
                    >
                      Select Project
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </SimpleGrid>
            
            {/* Education Section */}
            <Card mt={10} bg="green.50" borderRadius="xl">
              <CardBody>
                <Heading size="md" mb={4}>About Carbon Credits</Heading>
                <Text mb={4}>
                  Carbon credits represent verified reductions in greenhouse gas emissions. Each credit equals one ton of CO2 removed from the atmosphere or prevented from being emitted.
                </Text>
                <Text fontWeight="bold" mb={2}>How It Works:</Text>
                <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                  {[
                    { step: 1, title: "Select Project", desc: "Choose a verified carbon reduction initiative" },
                    { step: 2, title: "Purchase Credits", desc: "Buy credits to offset your carbon footprint" },
                    { step: 3, title: "Track Impact", desc: "Monitor your environmental contribution through our platform" }
                  ].map(item => (
                    <Box key={item.step} bg="white" p={4} borderRadius="lg">
                      <Flex align="center" mb={3}>
                        <Flex 
                          justify="center" 
                          align="center" 
                          w={8} 
                          h={8} 
                          bg="green.500" 
                          color="white" 
                          borderRadius="full"
                          mr={3}
                        >
                          {item.step}
                        </Flex>
                        <Text fontWeight="bold">{item.title}</Text>
                      </Flex>
                      <Text fontSize="sm">{item.desc}</Text>
                    </Box>
                  ))}
                </SimpleGrid>
              </CardBody>
            </Card>
          </TabPanel>
          
          {/* My Carbon Portfolio Tab */}
          <TabPanel>
            {selectedProject ? (
              <Card bg="green.50" borderRadius="xl" mb={6}>
                <CardBody>
                  <Heading size="md" mb={4}>Selected Carbon Project</Heading>
                  
                  <Box bg="white" p={4} borderRadius="lg" mb={4}>
                    <Text fontWeight="bold" fontSize="lg">{selectedProject.project}</Text>
                    <Text color="gray.600" mb={2}>{selectedProject.location} • {selectedProject.type}</Text>
                    <Text mb={3}>{selectedProject.description}</Text>
                    
                    <Text fontWeight="bold" mb={2}>Your Impact:</Text>
                    <Text fontStyle="italic" color="green.700">{selectedProject.purchaseImpact}</Text>
                    
                    <Flex mt={4} justify="space-between" align="center">
                      <Box>
                        <Text>Price Per Credit</Text>
                        <Text fontWeight="bold">KES {selectedProject.pricePerCredit.toFixed(2)}</Text>
                      </Box>
                      
                      <Button 
                        colorScheme="green"
                        onClick={onOpen}
                      >
                        Purchase Credits
                      </Button>
                    </Flex>
                  </Box>
                  
                  <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} mb={6}>
                    <Stat>
                      <StatLabel>Your Total Credits</StatLabel>
                      <StatNumber>{userCredits}</StatNumber>
                      <StatHelpText>
                        <StatArrow type="increase" />
                        15% this quarter
                      </StatHelpText>
                    </Stat>
                    
                    <Stat>
                      <StatLabel>Carbon Neutrality</StatLabel>
                      <StatNumber>68%</StatNumber>
                      <Text fontSize="sm">Of average Kenyan footprint</Text>
                    </Stat>
                    
                    <Stat>
                      <StatLabel>Total Impact</StatLabel>
                      <StatNumber>{totalImpact.toFixed(1)}</StatNumber>
                      <Text fontSize="sm">Tons of CO2 sequestered</Text>
                    </Stat>
                  </SimpleGrid>
                </CardBody>
              </Card>
            ) : (
              <Card bg="blue.50" borderRadius="xl" mb={6}>
                <CardBody textAlign="center" py={10}>
                  <Icon as={FaLeaf} boxSize={12} color="blue.500" mb={4} />
                  <Heading size="md" mb={2}>No Project Selected</Heading>
                  <Text mb={6}>Select a carbon credit project from the Marketplace to build your portfolio</Text>
                  <Button 
                    colorScheme="blue"
                    onClick={() => setActiveTab(0)}
                  >
                    Browse Projects
                  </Button>
                </CardBody>
              </Card>
            )}
            
            <Card borderRadius="xl">
              <CardBody>
                <Heading size="md" mb={4}>Portfolio Benefits</Heading>
                
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                  {[
                    { 
                      title: "Environmental Impact", 
                      desc: "Each credit directly funds verified projects that reduce emissions and restore ecosystems",
                      icon: FaTree
                    },
                    { 
                      title: "Certified Offsets", 
                      desc: "Receive verified certificates for all carbon credits purchased",
                      icon: FaCoins
                    },
                    { 
                      title: "Community Support", 
                      desc: "Projects create jobs and support local communities across Kenya",
                      icon: FaChartLine
                    },
                    { 
                      title: "Sustainability Reporting", 
                      desc: "Access detailed reports on your environmental contributions",
                      icon: FaLeaf
                    }
                  ].map((item, index) => (
                    <Card key={index} border="1px solid" borderColor="gray.200">
                      <CardBody>
                        <Flex align="center" mb={3}>
                          <Icon as={item.icon} boxSize={6} color="green.500" mr={3} />
                          <Heading size="md">{item.title}</Heading>
                        </Flex>
                        <Text>{item.desc}</Text>
                      </CardBody>
                    </Card>
                  ))}
                </SimpleGrid>
              </CardBody>
            </Card>
          </TabPanel>
          
          {/* Transaction History Tab */}
          <TabPanel>
            <Card borderRadius="xl" mb={6}>
              <CardBody>
                <Heading size="md" mb={4}>Credit Purchase Summary</Heading>
                
                <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} mb={6}>
                  <Stat bg="green.50" p={4} borderRadius="lg">
                    <StatLabel>Total Credits Purchased</StatLabel>
                    <StatNumber>{totalPurchasedCredits}</StatNumber>
                  </Stat>
                  
                  <Stat bg="teal.50" p={4} borderRadius="lg">
                    <StatLabel>Total Investment</StatLabel>
                    <StatNumber>
                      KES {purchaseHistory.reduce((sum, purchase) => sum + parseFloat(purchase.amount.replace('KES ', '').replace(',', '')), 0).toLocaleString()}
                    </StatNumber>
                  </Stat>
                  
                  <Stat bg="blue.50" p={4} borderRadius="lg">
                    <StatLabel>Total CO2 Offset</StatLabel>
                    <StatNumber>{totalImpact.toFixed(1)} tons</StatNumber>
                  </Stat>
                </SimpleGrid>
                
                <Heading size="md" mb={4}>Transaction History</Heading>
                
                {purchaseHistory.length > 0 ? (
                  <Table variant="simple">
                    <Thead>
                      <Tr>
                        <Th>Date</Th>
                        <Th>Project</Th>
                        <Th>Credits</Th>
                        <Th>Amount</Th>
                        <Th>Impact</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {purchaseHistory.map(transaction => (
                        <Tr key={transaction.id}>
                          <Td>{transaction.date}</Td>
                          <Td>{transaction.project}</Td>
                          <Td fontWeight="bold">{transaction.credits}</Td>
                          <Td fontWeight="bold">{transaction.amount}</Td>
                          <Td fontSize="sm" fontStyle="italic">{transaction.impact}</Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                ) : (
                  <Text color="gray.500" textAlign="center" py={6}>
                    No purchase history found
                  </Text>
                )}
              </CardBody>
            </Card>
            
            <Card bg="teal.50" borderRadius="xl">
              <CardBody>
                <Heading size="md" mb={4}>Environmental Impact Report</Heading>
                
                <Box bg="white" p={4} borderRadius="lg" mb={4}>
                  <Text fontWeight="bold" mb={2}>Your Carbon Reduction Achievements:</Text>
                  <SimpleGrid columns={2} spacing={4}>
                    <Box>
                      <Text>Total CO2 Offset</Text>
                      <Text fontSize="xl" fontWeight="bold">{totalImpact.toFixed(1)} tons</Text>
                    </Box>
                    <Box>
                      <Text>Equivalent To</Text>
                      <Text fontSize="xl" fontWeight="bold">{(totalImpact / 2.5).toFixed(1)} cars off the road</Text>
                    </Box>
                  </SimpleGrid>
                </Box>
                
                <Text fontWeight="bold" mb={2}>Project Contributions:</Text>
                {purchaseHistory.length > 0 ? (
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                    {purchaseHistory.map(transaction => (
                      <Box key={transaction.id} bg="white" p={4} borderRadius="lg">
                        <Text fontWeight="bold" mb={1}>{transaction.project}</Text>
                        <Text fontSize="sm" mb={2}>{transaction.date} • {transaction.credits} Credits</Text>
                        <Text fontStyle="italic">{transaction.impact}</Text>
                      </Box>
                    ))}
                  </SimpleGrid>
                ) : (
                  <Text color="gray.500" textAlign="center" py={4}>
                    No impact data available
                  </Text>
                )}
              </CardBody>
            </Card>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
};

export default CarbonCreditMarket;