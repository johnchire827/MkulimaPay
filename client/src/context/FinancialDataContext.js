import React, { createContext, useState, useContext } from 'react';

const FinancialDataContext = createContext();

export const FinancialDataProvider = ({ children }) => {
  const [financialData, setFinancialData] = useState({
    totalSales: 0,
    growthPercentage: 0,
    inventoryValue: 0,
    rating: 0,
    pendingOrders: 0,
    instoreSalesTotal: 0
  });

  return (
    <FinancialDataContext.Provider value={{ financialData, setFinancialData }}>
      {children}
    </FinancialDataContext.Provider>
  );
};

export const useFinancialData = () => useContext(FinancialDataContext);

// ✅ Add this to allow named import of the context directly
export { FinancialDataContext };
