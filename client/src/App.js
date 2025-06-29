import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ChakraProvider } from '@chakra-ui/react';
import theme from './theme';
import HomePage from './pages/HomePage';
import FarmerDashboard from './pages/FarmerDashboard';
import BuyerMarketplace from './pages/BuyerMarketplace';
import ProductDetail from './pages/ProductDetail';
import SupplyChainTracker from './pages/SupplyChainTracker';
import CarbonCreditMarket from './pages/CarbonCreditMarket';
import AgriLoanPortal from './pages/AgriLoanPortal';
import AuthPage from './pages/AuthPage';
import UserProfile from './pages/UserProfile';
import NotFound from './pages/NotFound';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import { LanguageProvider } from './context/LanguageContext';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderConfirmation from './pages/OrderConfirmation';
// Add these routes

import FarmerAddProduct from './pages/FarmerAddProduct';

function App() {
  return (
    <ChakraProvider theme={theme}>
      <LanguageProvider>
        <AuthProvider>
          <Router>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/auth" element={<AuthPage />} />
              
              <Route path="/dashboard" element={
                <ProtectedRoute requiredRole="farmer">
                  <FarmerDashboard />
                </ProtectedRoute>
              } />
              
              <Route path="/marketplace" element={
                <ProtectedRoute allowedRoles={["buyer", "both"]}>
                  <BuyerMarketplace />
                </ProtectedRoute>
              } />
              
              <Route path="/product/:id" element={
                <ProtectedRoute allowedRoles={["buyer", "farmer"]}>
                  <ProductDetail />
                </ProtectedRoute>
              } />
               <Route
            path="/add-product"
            element={
              <ProtectedRoute allowedRoles={["farmer", "both"]}>
                <FarmerAddProduct />
              </ProtectedRoute>
            }/>
              
              <Route path="/supply-chain/:productId" element={
                <ProtectedRoute>
                  <SupplyChainTracker />
                </ProtectedRoute>
              } />
              
              <Route path="/carbon-market" element={
                <ProtectedRoute requiredRole="farmer">
                  <CarbonCreditMarket />
                </ProtectedRoute>
              } />
              
              <Route path="/loans" element={
                <ProtectedRoute requiredRole="farmer">
                  <AgriLoanPortal />
                </ProtectedRoute>
              } />
              
              <Route path="/profile" element={
                <ProtectedRoute>
                  <UserProfile />
                </ProtectedRoute>
              } />
             
              <Route path="/tracker/:productId" element={<SupplyChainTracker />} />
              <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/order-confirmation/:orderId" element={<OrderConfirmation />} />
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Router>
        </AuthProvider>
      </LanguageProvider>
    </ChakraProvider>
  );
}

export default App;