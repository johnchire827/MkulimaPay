import React, { useState, useEffect, useContext } from 'react';
import { 
  Box, Heading, Text, Tabs, TabList, Tab, TabPanels, TabPanel, Card, CardBody, 
  SimpleGrid, Button, Flex, Icon, FormControl, FormLabel, Input, Select, 
  useToast, Progress, Stat, StatLabel, StatNumber, StatHelpText, StatArrow, Badge  
} from '@chakra-ui/react';
import { FaHandHoldingUsd, FaCalculator, FaHistory, FaChartLine } from 'react-icons/fa';
import { FinancialDataContext } from '../context/FinancialDataContext';

// Credit scoring algorithm weights
const CREDIT_WEIGHTS = {
  totalRevenue: 0.3,
  growthRate: 0.2,
  inventoryValue: 0.15,
  customerRating: 0.15,
  pendingOrders: 0.1,
  instoreSales: 0.1
};

const AgriLoanPortal = () => {
  const toast = useToast();
  const [loanAmount, setLoanAmount] = useState(50000);
  const [loanTerm, setLoanTerm] = useState(12);
  const [purpose, setPurpose] = useState('equipment');
  const [eligibilityScore, setEligibilityScore] = useState(0);
  const [tabIndex, setTabIndex] = useState(0);
  const [loanHistory, setLoanHistory] = useState([]);
  const [currentLoanType, setCurrentLoanType] = useState('');
  
  // Get real-time financial data from context
  const { financialData } = useContext(FinancialDataContext);
  
  // Calculate credit score based on dashboard metrics
  const calculateCreditScore = () => {
    if (!financialData) return 0;
    
    const { 
      totalSales = 0, 
      growthPercentage = 0, 
      inventoryValue = 0,
      rating = 0,
      pendingOrders = 0,
      instoreSalesTotal = 0
    } = financialData;
    
    // Calculate individual components
    const revenueScore = Math.min(100, (totalSales / 500000) * 100) * CREDIT_WEIGHTS.totalRevenue;
    const growthScore = (growthPercentage > 0 ? Math.min(100, growthPercentage * 10) : 0) * CREDIT_WEIGHTS.growthRate;
    const inventoryScore = Math.min(100, (inventoryValue / 300000) * 100) * CREDIT_WEIGHTS.inventoryValue;
    const ratingScore = Math.min(100, rating * 20) * CREDIT_WEIGHTS.customerRating;
    const ordersScore = Math.min(100, pendingOrders * 10) * CREDIT_WEIGHTS.pendingOrders;
    const instoreScore = Math.min(100, (instoreSalesTotal / 100000) * 100) * CREDIT_WEIGHTS.instoreSales;
    
    // Sum all components for final score
    return Math.min(100, Math.round(
      revenueScore + 
      growthScore + 
      inventoryScore + 
      ratingScore + 
      ordersScore + 
      instoreScore
    ));
  };

  // Financial institutions data
  const loanProducts = [
    {
      id: 1,
      name: "Equity Bank",
      type: "seasonal",
      amount: "Up to KES 200,000",
      term: "3-12 months",
      interest: "10-14% p.a.",
      features: [
        "Asset financing, seasonal loans",
        "Collateral required for loans above KES 100,000",
        "Flexible repayment options"
      ]
    },
    {
      id: 2,
      name: "Cooperative Bank",
      type: "dairy",
      amount: "Up to KES 500,000",
      term: "12-36 months",
      interest: "12-15% p.a.",
      features: [
        "Sacco loans, dairy loans",
        "Group lending options",
        "Discounts for cooperative members"
      ]
    },
    {
      id: 3,
      name: "KCB Bank",
      type: "agribusiness",
      amount: "Up to KES 1,000,000",
      term: "6-24 months",
      interest: "9-13% p.a.",
      features: [
        "Agri-business loans, input financing",
        "Insurance bundled with loan",
        "Mobile banking integration"
      ]
    },
    {
      id: 4,
      name: "Agricultural Finance Corporation",
      type: "long-term",
      amount: "Up to KES 5,000,000",
      term: "24-60 months",
      interest: "8-12% p.a.",
      features: [
        "Long-term loans, machinery loans",
        "Government guaranteed",
        "Technical support included"
      ]
    }
  ];

  // Calculate debt-to-income ratio
  const calculateDebtRatio = () => {
    if (!financialData || !financialData.totalSales) return 0;
    
    // Calculate monthly income (annual sales / 12)
    const monthlyIncome = financialData.totalSales / 12;
    
    // Calculate monthly debt payments (estimated)
    const monthlyDebt = loanAmount * 0.00875; // Approx 10.5% APR
    
    // Return debt-to-income ratio
    return monthlyIncome > 0 ? 
      Math.min(100, (monthlyDebt / monthlyIncome) * 100) : 0;
  };

  // Calculate savings rate
  const calculateSavingsRate = () => {
    if (!financialData || !financialData.totalSales || !financialData.inventoryValue) return 0;
    
    // Estimate savings as 15% of revenue minus inventory investment
    return Math.min(100, Math.max(0, 15 - (financialData.inventoryValue / financialData.totalSales) * 5));
  };

  // Generate personalized financial roadmap
  const generateFinancialRoadmap = () => {
    if (!financialData) return [];
    
    const roadmap = [];
    
    // Revenue growth target
    roadmap.push({
      title: `Increase total revenue to KES ${Math.round((financialData.totalSales || 0) * 1.2).toLocaleString()}`,
      progress: financialData.totalSales > 0 
        ? Math.min(100, (financialData.totalSales / (financialData.totalSales * 1.2)) * 100)
        : 0
    });
    
    // Inventory optimization
    const targetInventoryRatio = 0.3; // 30% of revenue
    const currentInventoryRatio = financialData.totalSales > 0 ? 
      (financialData.inventoryValue || 0) / financialData.totalSales : 0;
      
    roadmap.push({
      title: `Optimize inventory to ${(targetInventoryRatio * 100).toFixed(0)}% of revenue`,
      progress: Math.min(100, (1 - Math.max(0, currentInventoryRatio - targetInventoryRatio) / targetInventoryRatio) * 100)
    });
    
    // Customer rating improvement
    if ((financialData.rating || 0) < 4.5) {
      roadmap.push({
        title: "Achieve customer rating of 4.5 stars",
        progress: ((financialData.rating || 0) / 4.5) * 100
      });
    }
    
    // Emergency fund
    const emergencyFundTarget = (financialData.totalSales || 0) * 0.1; // 10% of annual revenue
    roadmap.push({
      title: `Establish emergency fund of KES ${Math.round(emergencyFundTarget).toLocaleString()}`,
      progress: 0 // Starts at 0
    });
    
    return roadmap;
  };

  // Initialize credit score
  useEffect(() => {
    const score = calculateCreditScore();
    setEligibilityScore(score);
  }, [financialData]);

  const handleApplyNow = (product) => {
    switch(product.type) {
      case 'seasonal':
        setLoanAmount(200000);
        setLoanTerm(12);
        setPurpose('seeds');
        setCurrentLoanType(product.name);
        break;
      case 'dairy':
        setLoanAmount(500000);
        setLoanTerm(36);
        setPurpose('livestock');
        setCurrentLoanType(product.name);
        break;
      case 'agribusiness':
        setLoanAmount(1000000);
        setLoanTerm(24);
        setPurpose('equipment');
        setCurrentLoanType(product.name);
        break;
      case 'long-term':
        setLoanAmount(5000000);
        setLoanTerm(60);
        setPurpose('expansion');
        setCurrentLoanType(product.name);
        break;
      default:
        setLoanAmount(50000);
        setLoanTerm(12);
        setCurrentLoanType('Custom Loan');
    }
    
    toast({
      title: "Loan Pre-filled",
      description: `${product.name} details added to calculator`,
      status: 'info',
      duration: 3000,
      isClosable: true,
    });
    
    // Switch to Loan Calculator tab
    setTabIndex(1);
  };

  const applyForLoan = () => {
    // Create new loan application
    const amount = parseInt(loanAmount) || 0;
    
    const newLoan = {
      id: Date.now(),
      date: new Date().toISOString().split('T')[0],
      amount: `KES ${amount.toLocaleString()}`,
      status: "Pending Approval",
      type: currentLoanType || "Agricultural Loan",
      institution: currentLoanType.includes('Bank') ? currentLoanType : 'Agricultural Finance Corporation'
    };
    
    // Add to loan history
    setLoanHistory([newLoan, ...loanHistory]);
    
    toast({
      title: "Application Submitted",
      description: "Your loan application has been received",
      status: 'success',
      duration: 5000,
      isClosable: true,
    });
    
    // Switch to Loan History tab
    setTabIndex(2);
  };

  return (
    <Box p={{ base: 4, md: 8 }}>
      <Heading size="xl" mb={6}>Agricultural Financing Portal</Heading>
      
      <Tabs 
        variant="soft-rounded" 
        colorScheme="green" 
        index={tabIndex} 
        onChange={setTabIndex}
      >
        <TabList mb={8}>
          <Tab><Icon as={FaHandHoldingUsd} mr={2} /> Financial Institutions</Tab>
          <Tab><Icon as={FaCalculator} mr={2} /> Loan Simulator</Tab>
          <Tab><Icon as={FaHistory} mr={2} /> Loan History</Tab>
          <Tab><Icon as={FaChartLine} mr={2} /> Financial Health</Tab>
        </TabList>
        
        <TabPanels>
          {/* Financial Institutions */}
          <TabPanel>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} mb={10}>
              {loanProducts.map(product => (
                <Card key={product.id} borderRadius="xl" borderTop="4px solid" borderTopColor="green.500">
                  <CardBody>
                    <Heading size="md" mb={3}>{product.name}</Heading>
                    <Text fontWeight="bold" mb={1}>Loan Amount: {product.amount}</Text>
                    <Text mb={1}>Loan Term: {product.term}</Text>
                    <Text mb={4}>Interest Rate: {product.interest}</Text>
                    
                    <Text fontWeight="medium" mb={2}>Features:</Text>
                    <Box mb={4}>
                      {product.features.map((feature, index) => (
                        <Flex key={index} align="center" mb={2}>
                          <Box w="8px" h="8px" bg="green.500" borderRadius="full" mr={2}></Box>
                          <Text fontSize="sm">{feature}</Text>
                        </Flex>
                      ))}
                    </Box>
                    
                    <Button 
                      colorScheme="green" 
                      w="full"
                      onClick={() => handleApplyNow(product)}
                    >
                      Apply Now
                    </Button>
                  </CardBody>
                </Card>
              ))}
            </SimpleGrid>
            
            <Card bg="green.50" borderRadius="xl">
              <CardBody>
                <Heading size="md" mb={4}>Loan Application Requirements</Heading>
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                  {[
                    { 
                      title: "Credit Score", 
                      desc: "Minimum score of 60 required for all loans" 
                    },
                    { 
                      title: "Business History", 
                      desc: "At least 6 months of transaction history" 
                    },
                    { 
                      title: "Revenue Threshold", 
                      desc: "Minimum KES 50,000 monthly revenue" 
                    },
                    { 
                      title: "Collateral", 
                      desc: "Required for loans above KES 500,000" 
                    }
                  ].map((item, index) => (
                    <Box key={index} bg="white" p={4} borderRadius="lg">
                      <Text fontWeight="bold" mb={2}>{item.title}</Text>
                      <Text fontSize="sm">{item.desc}</Text>
                    </Box>
                  ))}
                </SimpleGrid>
              </CardBody>
            </Card>
          </TabPanel>
          
          {/* Loan Simulator */}
          <TabPanel>
            <Flex direction={{ base: 'column', md: 'row' }} gap={8}>
              <Card flex={1} borderRadius="xl">
                <CardBody>
                  <Heading size="md" mb={6}>Loan Application</Heading>
                  
                  <FormControl mb={4}>
                    <FormLabel>Loan Amount (KES)</FormLabel>
                    <Input 
                      type="number" 
                      value={loanAmount} 
                      onChange={(e) => setLoanAmount(e.target.value)}
                    />
                  </FormControl>
                  
                  <FormControl mb={4}>
                    <FormLabel>Loan Term (months)</FormLabel>
                    <Select 
                      value={loanTerm} 
                      onChange={(e) => setLoanTerm(e.target.value)}
                    >
                      <option value={6}>6 months</option>
                      <option value={12}>12 months</option>
                      <option value={24}>24 months</option>
                      <option value={36}>36 months</option>
                      <option value={48}>48 months</option>
                      <option value={60}>60 months</option>
                    </Select>
                  </FormControl>
                  
                  <FormControl mb={6}>
                    <FormLabel>Loan Purpose</FormLabel>
                    <Select 
                      value={purpose} 
                      onChange={(e) => setPurpose(e.target.value)}
                    >
                      <option value="equipment">Farm Equipment</option>
                      <option value="seeds">Seeds & Fertilizers</option>
                      <option value="expansion">Farm Expansion</option>
                      <option value="livestock">Livestock Acquisition</option>
                      <option value="other">Other Agricultural Needs</option>
                    </Select>
                  </FormControl>
                  
                  <Button 
                    colorScheme="green" 
                    w="full"
                    onClick={applyForLoan}
                    isDisabled={eligibilityScore < 60}
                  >
                    Submit Application
                  </Button>
                </CardBody>
              </Card>
              
              <Card flex={1} borderRadius="xl" bg="blue.50">
                <CardBody>
                  <Heading size="md" mb={6}>Credit Assessment</Heading>
                  
                  <Box textAlign="center" mb={6}>
                    <Text fontWeight="bold" mb={2}>Creditworthiness Score</Text>
                    <Progress 
                      value={eligibilityScore} 
                      size="lg" 
                      colorScheme={eligibilityScore > 75 ? 'green' : eligibilityScore > 60 ? 'yellow' : 'red'} 
                      mb={2}
                      borderRadius="full"
                    />
                    <Text fontSize="2xl" fontWeight="bold">{eligibilityScore}/100</Text>
                  </Box>
                  
                  {eligibilityScore >= 75 ? (
                    <Box bg="green.100" p={4} borderRadius="lg" mb={6}>
                      <Text fontWeight="bold" color="green.800">Excellent Credit</Text>
                      <Text color="green.800">High approval probability across all lenders</Text>
                    </Box>
                  ) : eligibilityScore >= 60 ? (
                    <Box bg="yellow.100" p={4} borderRadius="lg" mb={6}>
                      <Text fontWeight="bold" color="yellow.800">Good Credit</Text>
                      <Text color="yellow.800">Approval likely with standard terms</Text>
                    </Box>
                  ) : (
                    <Box bg="red.100" p={4} borderRadius="lg" mb={6}>
                      <Text fontWeight="bold" color="red.800">Needs Improvement</Text>
                      <Text color="red.800">Recommend improving business metrics before applying</Text>
                    </Box>
                  )}
                  
                  <Box mb={6}>
                    <Text fontWeight="bold" mb={2}>Financial Metrics:</Text>
                    <SimpleGrid columns={2} spacing={2}>
                      <Text>Total Revenue:</Text>
                      <Text fontWeight="bold">
                        {financialData ? `KES ${(financialData.totalSales || 0).toLocaleString()}` : 'N/A'}
                      </Text>
                      
                      <Text>Revenue Growth:</Text>
                      <Text fontWeight="bold">
                        {financialData ? `${(financialData.growthPercentage || 0).toFixed(2)}%` : 'N/A'}
                      </Text>
                      
                      <Text>Inventory Value:</Text>
                      <Text fontWeight="bold">
                        {financialData ? `KES ${(financialData.inventoryValue || 0).toLocaleString()}` : 'N/A'}
                      </Text>
                      
                      <Text>Customer Rating:</Text>
                      <Text fontWeight="bold">
                        {financialData ? (financialData.rating || 0).toFixed(1) : 'N/A'} / 5
                      </Text>
                    </SimpleGrid>
                  </Box>
                  
                  <Box>
                    <Text fontWeight="bold" mb={2}>Recommended Loan Products:</Text>
                    {eligibilityScore >= 75 ? (
                      <Text>All loan products available</Text>
                    ) : eligibilityScore >= 60 ? (
                      <Text>Seasonal, Equipment, and Expansion loans</Text>
                    ) : (
                      <Text>Seasonal loans only</Text>
                    )}
                  </Box>
                </CardBody>
              </Card>
            </Flex>
          </TabPanel>
          
          {/* Loan History */}
          <TabPanel>
            <Flex justify="space-between" align="center" mb={6}>
              <Heading size="md">Loan Portfolio</Heading>
              <Text color="gray.500">{loanHistory.length} loan applications</Text>
            </Flex>
            
            {loanHistory.length > 0 ? (
              <Card borderRadius="xl">
                <CardBody p={0}>
                  {loanHistory.map(loan => (
                    <Flex 
                      key={loan.id} 
                      p={4} 
                      borderBottom="1px solid" 
                      borderColor="gray.100"
                      _last={{ borderBottom: 'none' }}
                      _hover={{ bg: 'gray.50' }}
                    >
                      <Box flex={1}>
                        <Text fontWeight="bold">{loan.type}</Text>
                        <Text color="gray.500">{loan.date}</Text>
                        <Text fontSize="sm" color="gray.500">{loan.institution}</Text>
                      </Box>
                      <Box flex={1} textAlign="right">
                        <Text fontWeight="bold">{loan.amount}</Text>
                        <Badge 
                          colorScheme={
                            loan.status === 'Repaid' ? 'green' : 
                            loan.status === 'Repaying' ? 'blue' : 
                            loan.status === 'Pending Approval' ? 'orange' : 'gray'
                          }
                          mt={1}
                        >
                          {loan.status}
                        </Badge>
                      </Box>
                    </Flex>
                  ))}
                </CardBody>
              </Card>
            ) : (
              <Card borderRadius="xl">
                <CardBody textAlign="center" py={10}>
                  <Text color="gray.500">No loan applications found</Text>
                  <Button mt={4} colorScheme="green" onClick={() => setTabIndex(0)}>
                    Browse Financial Institutions
                  </Button>
                </CardBody>
              </Card>
            )}
            
            <Card mt={8} bg="green.50" borderRadius="xl">
              <CardBody>
                <Heading size="md" mb={4}>Loan Repayment Strategies</Heading>
                <Text mb={4}>Optimize your repayment schedule with these techniques:</Text>
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  {[
                    "Align payments with harvest cycles and market sales",
                    "Prioritize high-interest loans first in repayment strategy",
                    "Establish automatic payment deductions from sales proceeds",
                    "Maintain 10% cash reserve for unexpected repayment challenges"
                  ].map((tip, index) => (
                    <Flex key={index} align="flex-start">
                      <Box w="8px" h="8px" bg="green.500" borderRadius="full" mr={3} mt={2}></Box>
                      <Text>{tip}</Text>
                    </Flex>
                  ))}
                </SimpleGrid>
              </CardBody>
            </Card>
          </TabPanel>
          
          {/* Financial Health */}
          <TabPanel>
            <Heading size="md" mb={6}>Financial Wellness Dashboard</Heading>
            
            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} mb={8}>
              <Card bg="blue.50" borderRadius="xl">
                <CardBody>
                  <Stat>
                    <StatLabel>Credit Score</StatLabel>
                    <StatNumber>{eligibilityScore}</StatNumber>
                    <StatHelpText>
                      {eligibilityScore >= 75 ? 'Excellent' : 
                       eligibilityScore >= 60 ? 'Good' : 'Needs Improvement'}
                    </StatHelpText>
                  </Stat>
                </CardBody>
              </Card>
              
              <Card bg="green.50" borderRadius="xl">
                <CardBody>
                  <Stat>
                    <StatLabel>Debt-to-Income Ratio</StatLabel>
                    <StatNumber>{calculateDebtRatio().toFixed(1)}%</StatNumber>
                    <StatHelpText>
                      {calculateDebtRatio() < 35 ? 'Healthy' : 'High Risk'}
                    </StatHelpText>
                  </Stat>
                </CardBody>
              </Card>
              
              <Card bg="teal.50" borderRadius="xl">
                <CardBody>
                  <Stat>
                    <StatLabel>Savings Rate</StatLabel>
                    <StatNumber>{calculateSavingsRate().toFixed(1)}%</StatNumber>
                    <StatHelpText>
                      Recommended: 15-20%
                    </StatHelpText>
                  </Stat>
                </CardBody>
              </Card>
            </SimpleGrid>
            
            <Card borderRadius="xl" mb={8}>
              <CardBody>
                <Heading size="md" mb={4}>Financial Improvement Roadmap</Heading>
                <Text mb={4}>Personalized targets to enhance your financial health:</Text>
                
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  {generateFinancialRoadmap().map((goal, index) => (
                    <Box key={index} bg="gray.50" p={4} borderRadius="lg">
                      <Text fontWeight="bold" mb={2}>{goal.title}</Text>
                      <Progress value={goal.progress} colorScheme="green" size="sm" borderRadius="full" />
                      <Text mt={1} fontSize="sm" textAlign="right">{goal.progress.toFixed(1)}% complete</Text>
                    </Box>
                  ))}
                </SimpleGrid>
              </CardBody>
            </Card>

            <Card bg="purple.50" borderRadius="xl">
              <CardBody>
                <Heading size="md" mb={4}>Credit Improvement Resources</Heading>
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  {[
                    "Revenue optimization strategies",
                    "Inventory management techniques",
                    "Customer satisfaction improvement guide",
                    "Debt management counseling"
                  ].map((resource, index) => (
                    <Flex key={index} align="center" p={3} bg="white" borderRadius="md">
                      <Icon as={FaChartLine} color="purple.500" mr={3} />
                      <Text>{resource}</Text>
                    </Flex>
                  ))}
                </SimpleGrid>
                <Button mt={4} colorScheme="purple" variant="outline">
                  Access Resources
                </Button>
              </CardBody>
            </Card>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
};

export default AgriLoanPortal;