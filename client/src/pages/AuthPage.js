import React, { useState } from 'react';
import { 
  Icon, Select, Box, Heading, Text, Flex, Button, Input, FormControl, FormLabel, 
  Tabs, TabList, Tab, TabPanels, TabPanel, useToast, Checkbox, Link,
  InputGroup, InputLeftElement
} from '@chakra-ui/react';
import { FaUser, FaLock, FaEnvelope, FaPhone, FaStore } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useNavigate } from 'react-router-dom';

const AuthPage = () => {
  const { t } = useLanguage();
  const { login, register, user: authUser } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [loginData, setLoginData] = useState({ phone: '', password: '' });
  const [registerData, setRegisterData] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'farmer',
    acceptTerms: false
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    setIsLoading(true);
    try {
      const loggedInUser = await login(loginData.phone, loginData.password);
      
      if (loggedInUser.role === 'farmer' || loggedInUser.role === 'both') {
        navigate('/dashboard');
      } else if (loggedInUser.role === 'buyer') {
        navigate('/marketplace');
      } else {
        navigate('/');
      }
      
      toast({
        title: t('login success'),
        description: t('welcome back'),
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: t('login failed'),
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!registerData.name) {
      toast({
        title: t('name required'),
        description: t('please enter name'),
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }
    
    if (registerData.password !== registerData.confirmPassword) {
      toast({
        title: t('password mismatch'),
        description: t('passwords dont match'),
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }
    
    if (!registerData.acceptTerms) {
      toast({
        title: t('Terms not accepted'),
        description: t('accept terms'),
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }
    
    setIsLoading(true);
    try {
      // Create payload without unnecessary fields
      const registrationPayload = {
        name: registerData.name,
        phone: registerData.phone,
        email: registerData.email,
        password: registerData.password,
        role: registerData.role
      };
      
      console.log("Registration payload:", registrationPayload);
      
      const registeredUser = await register(registrationPayload);
      console.log("Registration response:", registeredUser);
      
      // Redirect based on role
      if (registeredUser.role === 'farmer' || registeredUser.role === 'both') {
        navigate('/add-product');
      } else if (registeredUser.role === 'buyer') {
        navigate('/marketplace');
      } else {
        navigate('/');
      }
      
      toast({
        title: t('registration success'),
        description: t('account created'),
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error("Registration error:", error);
      console.error("Error response:", error.response);
      
      let errorMessage = error.message || "Registration failed";
      
      if (error.response) {
        // Use backend error message if available
        errorMessage = error.response.data?.error || errorMessage;
        
        // Add details if available
        if (error.response.data?.details) {
          errorMessage += `: ${error.response.data.details}`;
        }
      }
      
      toast({
        title: t('registration failed'),
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Flex 
      minH="100vh" 
      align="center" 
      justify="center" 
      bg="green.50"
      p={4}
    >
      <Box 
        bg="white" 
        p={8} 
        borderRadius="xl" 
        boxShadow="xl" 
        w="100%" 
        maxW="500px"
      >
        <Heading size="xl" mb={2} textAlign="center">
          MkulimaPay
        </Heading>
        <Text mb={8} textAlign="center" color="gray.600">
          {t('My Marketplace')}
        </Text>
        
        <Tabs 
          index={activeTab} 
          onChange={setActiveTab} 
          variant="soft-rounded" 
          colorScheme="green"
        >
          <TabList justifyContent="center" mb={8}>
            <Tab>{t('Login')}</Tab>
            <Tab>{t('Register')}</Tab>
          </TabList>
          
          <TabPanels>
            <TabPanel>
              <FormControl mb={4}>
                <FormLabel>{t('Phone number')}</FormLabel>
                <InputGroup>
                  <InputLeftElement pointerEvents="none">
                    <Icon as={FaPhone} color="gray.300" />
                  </InputLeftElement>
                  <Input 
                    type="tel" 
                    placeholder={t('Enter phone no. ')} 
                    value={loginData.phone}
                    onChange={(e) => setLoginData({ ...loginData, phone: e.target.value })}
                    disabled={isLoading}
                  />
                </InputGroup>
              </FormControl>
              
              <FormControl mb={6}>
                <FormLabel>{t('Password')}</FormLabel>
                <InputGroup>
                  <InputLeftElement pointerEvents="none">
                    <Icon as={FaLock} color="gray.300" />
                  </InputLeftElement>
                  <Input 
                    type="Password" 
                    placeholder={t('Enter password')} 
                    value={loginData.password}
                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                    disabled={isLoading}
                  />
                </InputGroup>
              </FormControl>
              
              <Button 
                colorScheme="green" 
                w="full" 
                mb={4}
                onClick={handleLogin}
                isLoading={isLoading}
                loadingText={t('logging in')}
              >
                {t('Login')}
              </Button>
              
              <Text textAlign="center">
                <Link color="green.500" onClick={() => setActiveTab(1)}>
                  {t('No account')} {t('Register here')}
                </Link>
              </Text>
            </TabPanel>
            
            <TabPanel>
              <FormControl mb={4} isRequired>
                <FormLabel>{t('Full name')}</FormLabel>
                <InputGroup>
                  <InputLeftElement pointerEvents="none">
                    <Icon as={FaUser} color="gray.300" />
                  </InputLeftElement>
                  <Input 
                    type="text" 
                    placeholder={t('Enter full name')} 
                    value={registerData.name}
                    onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                    disabled={isLoading}
                  />
                </InputGroup>
              </FormControl>
              
              <FormControl mb={4} isRequired>
                <FormLabel>{t('Phone number')}</FormLabel>
                <InputGroup>
                  <InputLeftElement pointerEvents="none">
                    <Icon as={FaPhone} color="gray.300" />
                  </InputLeftElement>
                  <Input 
                    type="tel" 
                    placeholder={t('Enter phone no.')} 
                    value={registerData.phone}
                    onChange={(e) => setRegisterData({ ...registerData, phone: e.target.value })}
                    disabled={isLoading}
                  />
                </InputGroup>
              </FormControl>
              
              <FormControl mb={4}>
                <FormLabel>{t('Email')} ({t('optional')})</FormLabel>
                <InputGroup>
                  <InputLeftElement pointerEvents="none">
                    <Icon as={FaEnvelope} color="gray.300" />
                  </InputLeftElement>
                  <Input 
                    type="Email" 
                    placeholder={t('Enter email ')} 
                    value={registerData.email}
                    onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                    disabled={isLoading}
                  />
                </InputGroup>
              </FormControl>
              
              <FormControl mb={4} isRequired>
                <FormLabel>{t('Password')}</FormLabel>
                <InputGroup>
                  <InputLeftElement pointerEvents="none">
                    <Icon as={FaLock} color="gray.300" />
                  </InputLeftElement>
                  <Input 
                    type="Password" 
                    placeholder={t('Enter password')} 
                    value={registerData.password}
                    onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                    disabled={isLoading}
                  />
                </InputGroup>
              </FormControl>
              
              <FormControl mb={4} isRequired>
                <FormLabel>{t('Confirm password')}</FormLabel>
                <InputGroup>
                  <InputLeftElement pointerEvents="none">
                    <Icon as={FaLock} color="gray.300" />
                  </InputLeftElement>
                  <Input 
                    type="Password" 
                    placeholder={t('confirm password')} 
                    value={registerData.confirmPassword}
                    onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                    disabled={isLoading}
                  />
                </InputGroup>
              </FormControl>
              
              <FormControl mb={4} isRequired>
                <FormLabel>{t('I am a')}</FormLabel>
                <Select 
                  value={registerData.role}
                  onChange={(e) => setRegisterData({ ...registerData, role: e.target.value })}
                  disabled={isLoading}
                >
                  <option value="farmer">{t('Farmer')}</option>
                  <option value="buyer">{t('Buyer')}</option>
                  <option value="both">{t('Both')}</option>
                </Select>
              </FormControl>
              
              <Checkbox 
                mb={6}
                isChecked={registerData.acceptTerms}
                onChange={(e) => setRegisterData({ ...registerData, acceptTerms: e.target.checked })}
                disabled={isLoading}
                isRequired
              >
                {t('Accept Terms $ Conditions')} <Link color="green.500">{t('Terms')}</Link>
              </Checkbox>
              
              <Button 
                colorScheme="green" 
                w="full" 
                mb={4}
                onClick={handleRegister}
                isLoading={isLoading}
                loadingText={t('creating account')}
              >
                {t('Create account')}
              </Button>
              
              <Text textAlign="center">
                <Link color="green.500" onClick={() => setActiveTab(0)}>
                  {t('Have account')} {t('Login here')}
                </Link>
              </Text>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>
    </Flex>
  );
};

export default AuthPage;