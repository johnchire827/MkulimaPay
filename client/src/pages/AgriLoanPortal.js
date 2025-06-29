import React, { useState, useEffect } from 'react';
import { 
  Box, Heading, Text, Tabs, TabList, Tab, TabPanels, TabPanel, Card, CardBody, 
  SimpleGrid, Button, Flex, Icon, FormControl, FormLabel, Input, Select, 
  useToast, Progress, Stat, StatLabel, StatNumber, StatHelpText, StatArrow, Badge  
} from '@chakra-ui/react';
import { FaHandHoldingUsd, FaCalculator, FaHistory, FaChartLine } from 'react-icons/fa';
import { useLanguage } from '../context/LanguageContext';

const AgriLoanPortal = () => {
  const { t } = useLanguage();
  const toast = useToast();
  const [loanAmount, setLoanAmount] = useState(50000);
  const [loanTerm, setLoanTerm] = useState(12);
  const [purpose, setPurpose] = useState('equipment');
  const [eligibilityScore, setEligibilityScore] = useState(87);
  const [tabIndex, setTabIndex] = useState(0);
  const [loanHistory, setLoanHistory] = useState([]);
  const [currentLoanType, setCurrentLoanType] = useState('');
  
  // Loan products data
  const loanProducts = [
    {
      id: 1,
      name: "Seasonal Financing",
      type: "seasonal",
      amount: "Up to KES 200,000",
      term: "3-12 months",
      interest: "8% p.a.",
      features: [
        "Instant approval for verified farmers",
        "Harvest-cycle repayment scheduling",
        "No processing fees"
      ]
    },
    {
      id: 2,
      name: "Equipment Financing",
      type: "equipment",
      amount: "Up to KES 1,000,000",
      term: "12-36 months",
      interest: "10% p.a.",
      features: [
        "80% equipment cost coverage",
        "3-month grace period",
        "Maintenance cost inclusion"
      ]
    },
    {
      id: 3,
      name: "Expansion Capital",
      type: "expansion",
      amount: "Up to KES 5,000,000",
      term: "24-60 months",
      interest: "12% p.a.",
      features: [
        "Land acquisition support",
        "Infrastructure development",
        "Multi-year repayment"
      ]
    }
  ];

  

  const handleApplyNow = (product) => {
    switch(product.type) {
      case 'seasonal':
        setLoanAmount(200000);
        setLoanTerm(12);
        setPurpose('seeds');
        setCurrentLoanType(product.name);
        break;
      case 'equipment':
        setLoanAmount(1000000);
        setLoanTerm(36);
        setPurpose('equipment');
        setCurrentLoanType(product.name);
        break;
      case 'expansion':
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

  const calculateEligibility = () => {
    const newScore = Math.min(100, eligibilityScore + 5);
    setEligibilityScore(newScore);
    
    toast({
      title: "Eligibility Updated",
      description: "Your eligibility score has been recalculated",
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };

  const applyForLoan = () => {
    // Create new loan application
    const newLoan = {
      id: Date.now(), // Unique ID based on timestamp
      date: new Date().toISOString().split('T')[0], // Current date
      amount: `KES ${parseInt(loanAmount).toLocaleString()}`,
      status: "Pending Approval",
      type: currentLoanType || "Agricultural Loan"
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
    
    // Reset calculator fields
    setLoanAmount(50000);
    setLoanTerm(12);
    setPurpose('equipment');
    setCurrentLoanType('');
    
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
          <Tab><Icon as={FaHandHoldingUsd} mr={2} /> Loan Products</Tab>
          <Tab><Icon as={FaCalculator} mr={2} /> Loan Calculator</Tab>
          <Tab><Icon as={FaHistory} mr={2} /> Loan History</Tab>
          <Tab><Icon as={FaChartLine} mr={2} /> Financial Health</Tab>
        </TabList>
        
        <TabPanels>
          {/* Loan Products */}
          <TabPanel>
            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} mb={10}>
              {loanProducts.map(product => (
                <Card key={product.id} borderRadius="xl" borderTop="4px solid" borderTopColor="green.500">
                  <CardBody>
                    <Heading size="md" mb={3}>{product.name}</Heading>
                    <Text fontWeight="bold" mb={1}>Loan Amount: {product.amount}</Text>
                    <Text mb={1}>Loan Term: {product.term}</Text>
                    <Text mb={4}>Interest Rate: {product.interest}</Text>
                    
                    <Text fontWeight="medium" mb={2}>Key Features:</Text>
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
                <Heading size="md" mb={4}>Why Choose MkulimaPay Financing?</Heading>
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                  {[
                    { 
                      title: "Competitive Rates", 
                      desc: "Industry-low interest rates with no hidden fees" 
                    },
                    { 
                      title: "Rapid Approval", 
                      desc: "24-hour decisioning and 48-hour disbursement" 
                    },
                    { 
                      title: "Flexible Terms", 
                      desc: "Customized repayment aligned with harvest cycles" 
                    },
                    { 
                      title: "Minimal Collateral", 
                      desc: "Collateral-free options for loans up to KES 300,000" 
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
          
          {/* Loan Calculator */}
          <TabPanel>
            <Flex direction={{ base: 'column', md: 'row' }} gap={8}>
              <Card flex={1} borderRadius="xl">
                <CardBody>
                  <Heading size="md" mb={6}>Loan Simulator</Heading>
                  
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
                    onClick={calculateEligibility}
                  >
                    Check Eligibility
                  </Button>
                </CardBody>
              </Card>
              
              <Card flex={1} borderRadius="xl" bg="blue.50">
                <CardBody>
                  <Heading size="md" mb={6}>Eligibility Assessment</Heading>
                  
                  <Box textAlign="center" mb={6}>
                    <Text fontWeight="bold" mb={2}>Creditworthiness Score</Text>
                    <Progress 
                      value={eligibilityScore} 
                      size="lg" 
                      colorScheme={eligibilityScore > 75 ? 'green' : eligibilityScore > 50 ? 'yellow' : 'red'} 
                      mb={2}
                      borderRadius="full"
                    />
                    <Text fontSize="2xl" fontWeight="bold">{eligibilityScore}/100</Text>
                  </Box>
                  
                  {eligibilityScore >= 70 ? (
                    <Box bg="green.100" p={4} borderRadius="lg" mb={6}>
                      <Text fontWeight="bold" color="green.800">High Approval Probability</Text>
                      <Text color="green.800">Excellent credit profile with strong repayment capacity</Text>
                    </Box>
                  ) : eligibilityScore >= 50 ? (
                    <Box bg="yellow.100" p={4} borderRadius="lg" mb={6}>
                      <Text fontWeight="bold" color="yellow.800">Moderate Approval Probability</Text>
                      <Text color="yellow.800">Good profile with potential for approval with conditions</Text>
                    </Box>
                  ) : (
                    <Box bg="red.100" p={4} borderRadius="lg" mb={6}>
                      <Text fontWeight="bold" color="red.800">Improvement Needed</Text>
                      <Text color="red.800">Recommend financial counseling before application</Text>
                    </Box>
                  )}
                  
                  <Box mb={6}>
                    <Text fontWeight="bold" mb={2}>Loan Simulation:</Text>
                    <SimpleGrid columns={2} spacing={2}>
                      <Text>Loan Amount:</Text>
                      <Text fontWeight="bold">KES {parseInt(loanAmount).toLocaleString()}</Text>
                      
                      <Text>Interest Rate:</Text>
                      <Text fontWeight="bold">10.5% p.a.</Text>
                      
                      <Text>Monthly Payment:</Text>
                      <Text fontWeight="bold">KES {Math.round(loanAmount * 0.00875).toLocaleString()}</Text>
                      
                      <Text>Total Repayment:</Text>
                      <Text fontWeight="bold">KES {Math.round(loanAmount * 1.105).toLocaleString()}</Text>
                    </SimpleGrid>
                  </Box>
                  
                  <Button 
                    colorScheme="green" 
                    w="full"
                    isDisabled={eligibilityScore < 50}
                    onClick={applyForLoan}
                  >
                    Submit Application
                  </Button>
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
                    Browse Loan Products
                  </Button>
                </CardBody>
              </Card>
            )}
            
            <Card mt={8} bg="green.50" borderRadius="xl">
              <CardBody>
                <Heading size="md" mb={4}>Smart Repayment Strategies</Heading>
                <Text mb={4}>Effective techniques to manage loan obligations while maintaining farm operations:</Text>
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
                    <StatNumber>720</StatNumber>
                    <StatHelpText>
                      <StatArrow type="increase" />
                      15 points this year
                    </StatHelpText>
                    <Text fontSize="sm" mt={2}>Prime Tier (Top 30% of farmers)</Text>
                  </Stat>
                </CardBody>
              </Card>
              
              <Card bg="green.50" borderRadius="xl">
                <CardBody>
                  <Stat>
                    <StatLabel>Debt-to-Income Ratio</StatLabel>
                    <StatNumber>28%</StatNumber>
                    <StatHelpText>
                      Healthy Range: Below 35%
                    </StatHelpText>
                    <Text fontSize="sm" mt={2}>Sustainable debt management</Text>
                  </Stat>
                </CardBody>
              </Card>
              
              <Card bg="teal.50" borderRadius="xl">
                <CardBody>
                  <Stat>
                    <StatLabel>Savings Rate</StatLabel>
                    <StatNumber>15%</StatNumber>
                    <StatHelpText>
                      Recommended: 15-20%
                    </StatHelpText>
                    <Text fontSize="sm" mt={2}>Annual income retained</Text>
                  </Stat>
                </CardBody>
              </Card>
            </SimpleGrid>
            
            <Card borderRadius="xl" mb={8}>
              <CardBody>
                <Heading size="md" mb={4}>Financial Improvement Roadmap</Heading>
                <Text mb={4}>Personalized targets to enhance your financial resilience:</Text>
                
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  {[
                    { title: "Establish 6-month emergency fund", progress: 75 },
                    { title: "Reduce operational costs by 15%", progress: 40 },
                    { title: "Achieve debt-free status", progress: 90 },
                    { title: "Diversify income streams", progress: 30 }
                  ].map((goal, index) => (
                    <Box key={index} bg="gray.50" p={4} borderRadius="lg">
                      <Text fontWeight="bold" mb={2}>{goal.title}</Text>
                      <Progress value={goal.progress} colorScheme="green" size="sm" borderRadius="full" />
                      <Text mt={1} fontSize="sm" textAlign="right">{goal.progress}% complete</Text>
                    </Box>
                  ))}
                </SimpleGrid>
              </CardBody>
            </Card>

            <Card bg="purple.50" borderRadius="xl">
              <CardBody>
                <Heading size="md" mb={4}>Financial Education Resources</Heading>
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  {[
                    "Crop-cycle budgeting templates",
                    "Interest rate negotiation guide",
                    "Loan restructuring strategies",
                    "Profitability analysis tools"
                  ].map((resource, index) => (
                    <Flex key={index} align="center" p={3} bg="white" borderRadius="md">
                      <Icon as={FaChartLine} color="purple.500" mr={3} />
                      <Text>{resource}</Text>
                    </Flex>
                  ))}
                </SimpleGrid>
                <Button mt={4} colorScheme="purple" variant="outline">
                  Access Resource Library
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