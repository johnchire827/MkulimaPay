import React, { useState } from 'react';
import { 
  Box, Heading, Text, Button, Flex, Image, SimpleGrid, Card, CardBody, 
  Icon, useDisclosure, Avatar, Stack, Container, IconButton, Badge
} from '@chakra-ui/react';
import { 
  FaLeaf, FaShoppingCart, FaChartLine, FaTractor, FaMoneyBillWave, 
  FaQuoteLeft, FaArrowLeft, FaArrowRight, FaUserFriends, FaChartPie,
  FaShieldAlt, FaMapMarkerAlt
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import ProductForm from '../components/farmer/ProductForm';
import { motion } from 'framer-motion';

const MotionBox = motion(Box);
const MotionCard = motion(Card);

const HomePage = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [isLoggedIn] = useState(false); // Simulated auth state - replace with actual auth check

  const features = [
    { 
      icon: FaShoppingCart, 
      title: t('Direct Marketplace'), 
      desc: t('Buy and sell farm produce directly without middlemen. Connect farmers and customers for fair, transparent trade.'),
      bg: "linear-gradient(145deg, #e6fffa, #b2f5ea)", // Very subtle teal gradient
      iconColor: "teal.600"
    },
    { 
      icon: FaChartLine, 
      title: t('Real Time Pricing'), 
      desc: t('Stay informed with live price updates. Make smart selling and buying decisions based on real-time market trends.'),
      bg: "linear-gradient(145deg, #f0fff4, #c6f6d5)", // Very subtle green gradient
      iconColor: "green.600"
    },
    { 
      icon: FaTractor, 
      title: t('Farm Management'), 
      desc: t('Track crops, harvests, and inventory with ease. Boost productivity with digital tools tailored for farmers.'),
      bg: "linear-gradient(145deg, #fffaf0, #feebc8)", // Very subtle orange gradient
      iconColor: "orange.600"
    },
    { 
      icon: FaMoneyBillWave, 
      title: t('Mobile Payments'), 
      desc: t('Send and receive secure payments via M-Pesa and other mobile platforms. Fast, easy, and farmer-friendly.'),
      bg: "linear-gradient(145deg, #ebf8ff, #bee3f8)", // Very subtle blue gradient
      iconColor: "blue.600"
    },
  ];

  const testimonials = [
    {
      name: 'Samuel Kariuki',
      role: t('Coffee Farmer'),
      location: 'Kiambu',
      image: 'https://images.unsplash.com/photo-1564564321837-a57b7070ac4f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8YWZyaWNhbiUyMG1hbnxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=200&q=80',
      quote: t('MkulimaPay increased my profits by 40%! Buyers now come directly to me, and payments are instant.'),
      product: t('Arabica Coffee')
    },
    {
      name: 'Wanjiku Mwangi',
      role: t('Dairy Farmer'),
      location: 'Nakuru',
      image: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8YWZyaWNhbiUyMHdvbWFufGVufDB8fDB8fHww&auto=format&fit=crop&w=200&q=80',
      quote: t('The real-time pricing helped me negotiate better deals. My milk sales have doubled since joining!'),
      product: t('Fresh Milk')
    },
    {
      name: 'James Omondi',
      role: t('Vegetable Farmer'),
      location: 'Kisumu',
      image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8YWZyaWNhbiUyMG1hbnxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=200&q=80',
      quote: t('Managing my farm has never been easier. The platform connects me with reliable buyers within minutes.'),
      product: t('Organic Kale')
    }
  ];

  const benefits = [
    {
      icon: FaUserFriends,
      title: t('Connect Directly'),
      description: t('Register now to interact directly with Kenyan farmers and buyers nationwide'),
      bg: "#e6fffa",
      iconColor: "teal.600"
    },
    {
      icon: FaChartPie,
      title: t('Be Your Own Boss'),
      description: t('Set your own prices and schedule. Maximize your farming income independently'),
      bg: "#f0fff4",
      iconColor: "green.600"
    },
    {
      icon: FaShieldAlt,
      title: t('Secure Transactions'),
      description: t('Guaranteed safe payments and delivery tracking for worry-free trading'),
      bg: "#fffaf0",
      iconColor: "orange.600"
    },
    {
      icon: FaMapMarkerAlt,
      title: t('Nationwide Access'),
      description: t('Available to anyone in Kenya - from urban buyers to rural farmers'),
      bg: "#ebf8ff",
      iconColor: "blue.600"
    }
  ];

  const nextTestimonial = () => {
    setCurrentTestimonial((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1));
  };

  const prevTestimonial = () => {
    setCurrentTestimonial((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1));
  };

  const handleBrowseMarketplace = () => {
    if (isLoggedIn) {
      navigate('/marketplace');
    } else {
      navigate('/auth');
    }
  };

  return (
    <Box>
      {/* Hero Section - Deep Green Theme */}
      <Flex
        direction={{ base: 'column', md: 'row' }}
        align="center"
        justify="space-between"
        py={{ base: 10, md: 20 }}
        px={{ base: 4, md: 8 }}
        bgGradient="linear(to-r, green.700, green.900)"
        color="white"
        position="relative"
        overflow="hidden"
      >
        <Box 
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          bgImage="url('https://images.unsplash.com/photo-1464226184884-fa280b87c399?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80')"
          bgSize="cover"
          bgPosition="center"
          opacity={0.15}
        />
        
        <Box flex={1} mb={{ base: 8, md: 0 }} zIndex={1}>
          <MotionBox
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Heading size="2xl" mb={4} lineHeight="1.2">
              {t('Empowering')} <Text as="span" color="lime.300">{t('Kenyan Farmers')}</Text><br />
              {t('Through Digital Innovation and Marketplace')}
            </Heading>
            <Text fontSize="xl" mb={8} maxW="600px" color="green.100">
              {t('Discover fresh, organic produce straight from Kenyan farms — securely, affordably, and sustainably.')}
            </Text>
            <Flex gap={4} flexWrap="wrap">
              <Button 
                colorScheme="lime" 
                size="lg" 
                onClick={handleBrowseMarketplace}
                _hover={{ transform: 'translateY(-3px)' }}
                transition="all 0.3s"
              >
                {t('Browse Marketplace')}
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                color="white"
                borderColor="white"
                _hover={{ bg: 'whiteAlpha.200' }}
                onClick={() => navigate('/auth')}
              >
                {t('Sign Up Free')}
              </Button>
            </Flex>
          </MotionBox>
        </Box>
        
        <Box flex={1} display="flex" justifyContent="center" zIndex={1}>
          <MotionBox
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            position="relative"
            borderRadius="2xl"
            overflow="hidden"
            boxShadow="2xl"
            maxW="500px"
          >
            <Image 
              src="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
              alt="Happy farmer with produce"
            />
            <Box
              position="absolute"
              bottom={0}
              left={0}
              right={0}
              bg="green.900"
              bgOpacity="0.8"
              p={4}
            >
              <Text fontSize="lg" fontWeight="bold" color="lime.100">
                {t('Fresh produce delivered directly from farm to table')}
              </Text>
            </Box>
          </MotionBox>
        </Box>
      </Flex>

      {/* Features Section - With Subtle Colored Card Backgrounds */}
      <Box py={20} bg="green.50">
        <Container maxW="container.xl">
          <Box textAlign="center" mb={16}>
            <Text color="green.600" fontWeight="bold" mb={2}>
              {t('YOUR AGRICULTURE ECOSYSTEM')}
            </Text>
            <Heading size="xl" mb={4} color="green.800">
              {t('Everything You Need in One Place')}
            </Heading>
            <Text color="green.700" maxW="800px" mx="auto" fontSize="lg">
              {t('Integrated tools designed specifically for Kenyan agriculture')}
            </Text>
          </Box>
          
          <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={8}>
            {features.map((feature, index) => (
              <MotionCard 
                key={index}
                borderRadius="xl"
                overflow="hidden"
                boxShadow="lg"
                whileHover={{ y: -5, boxShadow: 'xl' }}
                transition={{ duration: 0.3 }}
                bg={feature.bg}
                h="100%"
              >
                <CardBody textAlign="center" p={8}>
                  <Flex justify="center" mb={6}>
                    <Box
                      bg="white"
                      p={4}
                      borderRadius="full"
                      color={feature.iconColor}
                      boxShadow="md"
                    >
                      <Icon as={feature.icon} boxSize={8} />
                    </Box>
                  </Flex>
                  <Heading size="lg" mb={3} color="green.800">{feature.title}</Heading>
                  <Text fontSize="md" color="gray.700">{feature.desc}</Text>
                </CardBody>
              </MotionCard>
            ))}
          </SimpleGrid>
        </Container>
      </Box>

      {/* Benefits Section - With Subtle Colored Card Backgrounds */}
      <Box py={20} bgGradient="linear(to-b, teal.50, green.50)">
        <Container maxW="container.xl">
          <Box textAlign="center" mb={16}>
            <Text color="teal.600" fontWeight="bold" mb={2}>
              {t('WHY JOIN MKULIMAPAY')}
            </Text>
            <Heading size="xl" mb={4} color="green.800">
              {t('Transform Your Agricultural Journey')}
            </Heading>
          </Box>
          
          <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={8}>
            {benefits.map((benefit, index) => (
              <MotionCard
                key={index}
                borderRadius="xl"
                overflow="hidden"
                boxShadow="md"
                whileHover={{ y: -10, boxShadow: 'lg' }}
                transition={{ duration: 0.3 }}
                bg={benefit.bg}
              >
                <CardBody textAlign="center" p={8}>
                  <Flex justify="center" mb={6}>
                    <Box
                      bg="white"
                      p={4}
                      borderRadius="full"
                      color={benefit.iconColor}
                      boxShadow="md"
                    >
                      <Icon as={benefit.icon} boxSize={8} />
                    </Box>
                  </Flex>
                  <Heading size="md" mb={3} color="green.800">{benefit.title}</Heading>
                  <Text fontSize="md" color="gray.700">{benefit.description}</Text>
                </CardBody>
              </MotionCard>
            ))}
          </SimpleGrid>
        </Container>
      </Box>

      {/* Testimonials Section - Earthy Green Theme */}
      <Box py={20} bg="green.100">
        <Container maxW="container.lg">
          <Box textAlign="center" mb={16}>
            <Text color="green.700" fontWeight="bold" mb={2}>
              {t('SUCCESS STORIES')}
            </Text>
            <Heading size="xl" mb={4} color="green.900">
              {t('Real Farmers, Real Results')}
            </Heading>
          </Box>
          
          <Box position="relative">
            <IconButton
              icon={<FaArrowLeft />}
              aria-label="Previous testimonial"
              position="absolute"
              left={{ base: 2, md: -12 }}
              top="50%"
              zIndex={10}
              transform="translateY(-50%)"
              borderRadius="full"
              bg="green.500"
              color="white"
              _hover={{ bg: 'green.600' }}
              onClick={prevTestimonial}
            />
            
            <MotionBox
              key={currentTestimonial}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card borderRadius="2xl" overflow="hidden" boxShadow="xl" bg="white">
                <CardBody p={8}>
                  <Flex direction={{ base: 'column', md: 'row' }} gap={8}>
                    <Box flex={1} textAlign="center">
                      <Avatar 
                        size="2xl" 
                        src={testimonials[currentTestimonial].image} 
                        mb={4}
                        border="4px solid"
                        borderColor="green.200"
                      />
                      <Heading size="md" color="green.800">{testimonials[currentTestimonial].name}</Heading>
                      <Text color="green.600" mb={1}>
                        {testimonials[currentTestimonial].role}
                      </Text>
                      <Text fontSize="sm" color="green.700">
                        {testimonials[currentTestimonial].location}
                      </Text>
                      <Badge 
                        colorScheme="green" 
                        mt={2} 
                        px={3} 
                        py={1} 
                        borderRadius="full"
                        bg="green.100"
                        color="green.800"
                        border="1px solid"
                        borderColor="green.300"
                      >
                        {testimonials[currentTestimonial].product}
                      </Badge>
                    </Box>
                    
                    <Box flex={2} position="relative">
                      <Icon 
                        as={FaQuoteLeft} 
                        boxSize={8} 
                        color="green.100" 
                        position="absolute"
                        top={-4}
                        left={-2}
                      />
                      <Text fontSize="xl" fontStyle="italic" mb={6} pt={6} color="green.800">
                        "{testimonials[currentTestimonial].quote}"
                      </Text>
                      <Image 
                        src="https://images.unsplash.com/photo-1542838132-92c53300491e?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" 
                        alt="Fresh produce marketplace"
                        borderRadius="lg"
                        height="200px"
                        objectFit="cover"
                        width="100%"
                      />
                    </Box>
                  </Flex>
                </CardBody>
              </Card>
            </MotionBox>
            
            <IconButton
              icon={<FaArrowRight />}
              aria-label="Next testimonial"
              position="absolute"
              right={{ base: 2, md: -12 }}
              top="50%"
              zIndex={10}
              transform="translateY(-50%)"
              borderRadius="full"
              bg="green.500"
              color="white"
              _hover={{ bg: 'green.600' }}
              onClick={nextTestimonial}
            />
          </Box>
          
          <Flex justify="center" mt={6} gap={2}>
            {testimonials.map((_, index) => (
              <Box
                key={index}
                as="button"
                w="12px"
                h="12px"
                borderRadius="full"
                bg={index === currentTestimonial ? 'green.600' : 'green.300'}
                onClick={() => setCurrentTestimonial(index)}
              />
            ))}
          </Flex>
        </Container>
      </Box>

      {/* Call to Action - Rich Green Theme */}
      <Box 
        py={20} 
        textAlign="center"
        bgImage="url('https://images.unsplash.com/photo-1471194402529-8e0f5a675de6?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80')"
        bgSize="cover"
        bgPosition="center"
        position="relative"
      >
        <Box
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          bgGradient="linear(to-r, green.800, teal.900)"
          opacity={0.9}
        />
        <Container maxW="container.md" position="relative" zIndex={1}>
          <Heading size="xl" mb={4} color="white">
            {t('Join Kenya\'s Agricultural Revolution')}
          </Heading>
          <Text fontSize="xl" mb={8} color="green.100">
            {t('Join thousands of farmers and buyers transforming agriculture with MkulimaPay.')}
          </Text>
          <Stack direction={{ base: 'column', sm: 'row' }} justifyContent="center" spacing={4}>
            <Button 
              colorScheme="lime" 
              size="lg"
              onClick={() => navigate('/auth?type=farmer')}
              _hover={{ transform: 'scale(1.05)' }}
              transition="all 0.3s"
            >
              {t('Register as Farmer')}
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              color="white"
              borderColor="white"
              _hover={{ bg: 'whiteAlpha.200' }}
              onClick={() => navigate('/auth?type=buyer')}
            >
              {t('Register as Buyer')}
            </Button>
          </Stack>
          <Text mt={8} color="green.200" fontSize="lg">
            {t('No hidden fees • Instant payments • 24/7 support')}
          </Text>
        </Container>
      </Box>
      
      <ProductForm isOpen={isOpen} onClose={onClose} />
    </Box>
  );
};

export default HomePage;