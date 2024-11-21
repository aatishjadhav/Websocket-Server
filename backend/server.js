import express from 'express';
import cors from 'cors';
import { WebSocketServer } from 'ws';

const app = express();
const port = process.env.PORT || 5000;

const corsOptions = {
  origin: '*', // Allow all origins or specify your frontend URL
};
app.use(cors(corsOptions));
app.use(express.json());

const targetData = {
    totalSales: 285817810, 
    totalNoOfGiftCardSold: 4747267, 
    giftCardSold: 4747267, 
    giftCardRedeem: 270049, 
    totalOrderLift: 270049, 
    loyaltySignup: 500000,
    loyaltyPointEarn: 2045610, 
    loyaltyPointRedeem: 700000, 
    orderPlacedUsingLoyaltyPoint: 100000, 
    orderPlacedUsingCashback: 100000, 
    orderPlacedUsingStoreCredit: 200000, 
  };
  
  let data = {
    totalSales: 0,
    totalNoOfGiftCardSold: 0, 
    giftCardSold: 0,
    giftCardRedeem: 0,
    totalOrderLift: 0,
    loyaltySignup: 0,
    loyaltyPointEarn: 0,
    loyaltyPointRedeem: 0,
    orderPlacedUsingLoyaltyPoint: 0,
    orderPlacedUsingCashback: 0,
    orderPlacedUsingStoreCredit: 0,
  };
  
  const totalDurationHours = 96;
  const updateIntervalMs = 10 * 1000;
  const totalUpdates = (totalDurationHours * 60 * 60 * 1000) / updateIntervalMs;
  
  
  const incrementSteps = {
    totalSales: targetData.totalSales / totalUpdates,
    totalNoOfGiftCardSold: targetData.totalNoOfGiftCardSold / totalUpdates, 
    giftCardSold: targetData.giftCardSold / totalUpdates,
    giftCardRedeem: targetData.giftCardRedeem / totalUpdates,
    totalOrderLift: targetData.totalOrderLift / totalUpdates,
    loyaltySignup: targetData.loyaltySignup / totalUpdates,
    loyaltyPointEarn: targetData.loyaltyPointEarn / totalUpdates,
    loyaltyPointRedeem: targetData.loyaltyPointRedeem / totalUpdates,
    orderPlacedUsingLoyaltyPoint: targetData.orderPlacedUsingLoyaltyPoint / totalUpdates,
    orderPlacedUsingCashback: targetData.orderPlacedUsingCashback / totalUpdates,
    orderPlacedUsingStoreCredit: targetData.orderPlacedUsingStoreCredit / totalUpdates,
  };
  
  
  const updateData = (() => {
  let elapsedTimeMs = 0;
  return () => {
    elapsedTimeMs += updateIntervalMs;
    // Calculate the proportion of time elapsed
    const elapsedProportion = elapsedTimeMs / (totalDurationHours * 60 * 60 * 1000);
    // Adjust growth with more emphasis in the initial phase
    const growthModifier = Math.sin(elapsedProportion * Math.PI * 2) ** 2 * (1 - elapsedProportion / 2);
    // Ensure `growthModifier` remains high in the initial phase
    const initialBoost = elapsedProportion < 0.25 ? 1.5 : 1; // 1.5x boost in the first quarter
    // Calculate increments with adjusted growth
    const giftCardRedeemIncrement = incrementSteps.giftCardRedeem * growthModifier * initialBoost;
    const totalOrderLiftIncrement = giftCardRedeemIncrement * (Math.random() * 0.1 + 0.7);
    // Update all data values
    data = {
      totalSales: Math.min(data.totalSales + incrementSteps.totalSales * growthModifier * initialBoost, targetData.totalSales), // Float
      totalNoOfGiftCardSold: Math.floor(Math.min(data.totalNoOfGiftCardSold + incrementSteps.totalNoOfGiftCardSold * growthModifier, targetData.totalNoOfGiftCardSold)), // Integer
      giftCardSold: Math.min(data.giftCardSold + incrementSteps.giftCardSold * growthModifier, targetData.giftCardSold), // Float
      giftCardRedeem: Math.min(data.giftCardRedeem + giftCardRedeemIncrement, targetData.giftCardRedeem), // Float
      totalOrderLift: Math.min(data.totalOrderLift + totalOrderLiftIncrement, targetData.totalOrderLift), // Float
      loyaltySignup: Math.floor(Math.min(data.loyaltySignup + incrementSteps.loyaltySignup * growthModifier, targetData.loyaltySignup)), // Integer
      loyaltyPointEarn: Math.floor(Math.min(data.loyaltyPointEarn + incrementSteps.loyaltyPointEarn * growthModifier, targetData.loyaltyPointEarn)), // Integer
      loyaltyPointRedeem: Math.floor(Math.min(data.loyaltyPointRedeem + incrementSteps.loyaltyPointRedeem * growthModifier, targetData.loyaltyPointRedeem)), // Integer
      orderPlacedUsingLoyaltyPoint: Math.floor(Math.min(data.orderPlacedUsingLoyaltyPoint + incrementSteps.orderPlacedUsingLoyaltyPoint * growthModifier, targetData.orderPlacedUsingLoyaltyPoint)), // Integer
      orderPlacedUsingCashback: Math.min(data.orderPlacedUsingCashback + incrementSteps.orderPlacedUsingCashback * growthModifier, targetData.orderPlacedUsingCashback), // Float
      orderPlacedUsingStoreCredit: Math.min(data.orderPlacedUsingStoreCredit + incrementSteps.orderPlacedUsingStoreCredit * growthModifier, targetData.orderPlacedUsingStoreCredit), // Float
    };
  };
})();
  
  
  // Start server
const server = app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
    console.log(data);
    
  });
  
  // WebSocket server
  const wss = new WebSocketServer({ server });
  
  // Broadcast data to all connected clients
  const broadcastData = () => {
    const jsonData = JSON.stringify(data);
    console.log(data);
    
    wss.clients.forEach((client) => {
      if (client.readyState === client.OPEN) {
        client.send(jsonData);
        
        
      }
    });
  };
  
  // Update and broadcast data periodically
  setInterval(() => {
    updateData();
    broadcastData();
  }, updateIntervalMs);
