import React, { createContext, useState, useEffect, useContext } from 'react';

const LanguageContext = createContext();

// Expanded translations with real-world use cases
const translations = {
  en: {
    // Add to en translations
order_confirmed: "Order Confirmed!",
order_confirmation_message: "Thank you for your order",
items: "Items",
shipping_to: "Shipping To",
delivery_time: "Delivery Time",
within_days: "Within {days} business days",
track_shipment: "Track Shipment",
view_order_history: "View Order History",
order_fetch_error: "Order Error",
order_fetch_error_desc: "Failed to load order details",
order_not_found: "Order Not Found",


    welcome: "Welcome to MkulimaPay",
    login: "Login",
    register: "Register",
    // Marketplace
    marketplace: "Marketplace",
    product: "Product",
    price: "Price",
    quantity: "Quantity",
    add_to_cart: "Add to Cart",
    view_details: "View Details",
    // Product Details
    description: "Description",
    supply_chain: "Supply Chain",
    reviews: "Reviews",
    track_supply_chain: "Track Supply Chain",
    related_products: "Related Products",
    // Supply Chain
    current_stage: "Current Stage",
    planting: "Planting",
    harvesting: "Harvesting",
    transport: "Transport",
    processing: "Processing",
    distribution: "Distribution",
    // Checkout
    checkout: "Checkout",
    subtotal: "Subtotal",
    shipping: "Shipping",
    total: "Total",
    place_order: "Place Order",
    // Error Messages
    error_loading: "Error loading content",
    try_again: "Try Again",
    // Parameterized translations
    welcome_user: "Welcome, {name}!",
    items_in_cart: "You have {count} items in your cart",
    // Pluralization
    items: {
      one: "{count} item",
      other: "{count} items"
    }
  },
  sw: {
    // Add to sw translations
order_confirmed: "Agizo Limethibitishwa!",
order_confirmation_message: "Asante kwa agizo lako",
items: "Bidhaa",
shipping_to: "Inapelekwa Kwa",
delivery_time: "Muda Wa Kufikishwa",
within_days: "Ndani ya siku {days} za kazi",
track_shipment: "Fuatilia Usafirishaji",
view_order_history: "Tazama Historia ya Maagizo",
order_fetch_error: "Hitilafu ya Agizo",
order_fetch_error_desc: "Imeshindwa kupakua maelezo ya agizo",
    order_not_found: "Agizo Halikupatikana",

    welcome: "Karibu MkulimaPay",
    login: "Ingia",
    register: "Jisajili",
    // Marketplace
    marketplace: "Soko",
    product: "Bidhaa",
    price: "Bei",
    quantity: "Idadi",
    add_to_cart: "Weka kwenye Mkokoteni",
    view_details: "Angalia Maelezo",
    // Product Details
    description: "Maelezo",
    supply_chain: "Mnyororo wa Usambazaji",
    reviews: "Maoni",
    track_supply_chain: "Fuatilia Mnyororo wa Usambazaji",
    related_products: "Bidhaa Zinazohusiana",
    // Supply Chain
    current_stage: "Hatua ya Sasa",
    planting: "Kupanda",
    harvesting: "Uvunaji",
    transport: "Usafirishaji",
    processing: "Uchakataji",
    distribution: "Usambazaji",
    // Checkout
    checkout: "Malipo",
    subtotal: "Jumla Ndogo",
    shipping: "Usafirishaji",
    total: "Jumla",
    place_order: "Weka Agizo",
    // Error Messages
    error_loading: "Hitilafu katika kupakia maudhui",
    try_again: "Jaribu Tena",
    // Parameterized translations
    welcome_user: "Karibu, {name}!",
    items_in_cart: "Una vitu {count} kwenye mkokoteni wako",
    // Pluralization
    items: {
      one: "kitu {count}",
      other: "vitu {count}"
    }
  }
};

export function LanguageProvider({ children }) {
  // Initialize language from localStorage or browser preference
  const [language, setLanguage] = useState(() => {
    const savedLanguage = localStorage.getItem('language');
    const browserLanguage = navigator.language.split('-')[0];
    return savedLanguage || (['en', 'sw'].includes(browserLanguage) ? browserLanguage : 'en');
  });

  // Save language preference to localStorage
  useEffect(() => {
    localStorage.setItem('language', language);
    document.documentElement.lang = language; // Set HTML lang attribute
  }, [language]);

  // Enhanced translation function with parameter support
  const t = (key, params = {}) => {
    // Handle nested keys (e.g., t('items.one'))
    const keys = key.split('.');
    let translation = translations[language];
    
    for (const k of keys) {
      translation = translation?.[k];
      if (!translation) break;
    }

    // Fallback to English if translation not found
    if (!translation && language !== 'en') {
      let enTranslation = translations.en;
      for (const k of keys) {
        enTranslation = enTranslation?.[k];
        if (!enTranslation) break;
      }
      translation = enTranslation;
    }

    // Return key if no translation found
    if (!translation) return key;

    // Handle plural forms
    if (typeof translation === 'object') {
      const count = params.count || 0;
      const pluralRule = new Intl.PluralRules(language).select(count);
      translation = translation[pluralRule] || translation.other;
    }

    // Replace parameters in translation string
    if (typeof translation === 'string') {
      return translation.replace(/{(\w+)}/g, (match, param) => {
        return params[param] !== undefined ? params[param] : match;
      });
    }

    return key;
  };

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'sw' : 'en');
  };

  const value = {
    language,
    t,
    toggleLanguage,
    setLanguage
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};