import express from 'express';
import cors from 'cors';
import { WebSocketServer } from 'ws';

const app = express();
const port = process.env.PORT || 5000;

const corsOptions = {
  origin: '*', 
};
app.use(cors(corsOptions));
app.use(express.json());

const targetData = {
  totalSales: 285817810, 
  totalNoOfGiftCardSold: 4747267, 
  giftCardSold: 4747267, 
  giftCardRedeem: 270049, 
  totalOrderLift: 270049, 
  loyaltyPointEarn: 2045610, 
  loyaltyPointRedeem: 700000, 
  orderPlacedUsingLoyaltyPoint: 100000, 
};

let data = {
  totalSales: 0,
  totalNoOfGiftCardSold: 0, 
  giftCardSold: 0,
  giftCardRedeem: 0,
  totalOrderLift: 0,
  loyaltyPointEarn: 0,
  loyaltyPointRedeem: 0,
  orderPlacedUsingLoyaltyPoint: 0,
  TotalOrdersPerMinute: 0, 
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
  loyaltyPointEarn: targetData.loyaltyPointEarn / totalUpdates,
  loyaltyPointRedeem: targetData.loyaltyPointRedeem / totalUpdates,
  orderPlacedUsingLoyaltyPoint: targetData.orderPlacedUsingLoyaltyPoint / totalUpdates,
};

let previousTotalOrderLift = 0; // To calculate orders per minute

const updateData = (() => {
  let elapsedTimeMs = 0;

  return () => {
    elapsedTimeMs += updateIntervalMs;

    const elapsedProportion = elapsedTimeMs / (totalDurationHours * 60 * 60 * 1000);
    const growthModifier = Math.sin(elapsedProportion * Math.PI / 2) ** 2;
    const giftCardRedeemIncrement = incrementSteps.giftCardRedeem * growthModifier;
    const totalOrderLiftIncrement = giftCardRedeemIncrement * (Math.random() * 0.1 + 0.7);

    data = {
      totalSales: Math.min(data.totalSales + incrementSteps.totalSales * growthModifier, targetData.totalSales), // Float
      totalNoOfGiftCardSold: Math.floor(Math.min(data.totalNoOfGiftCardSold + incrementSteps.totalNoOfGiftCardSold * growthModifier, targetData.totalNoOfGiftCardSold)), // Integer
      giftCardSold: Math.min(data.giftCardSold + incrementSteps.giftCardSold * growthModifier, targetData.giftCardSold), // Float
      giftCardRedeem: Math.min(data.giftCardRedeem + giftCardRedeemIncrement, targetData.giftCardRedeem), // Float
      totalOrderLift: Math.min(data.totalOrderLift + totalOrderLiftIncrement, targetData.totalOrderLift), // Float
      loyaltyPointEarn: Math.floor(Math.min(data.loyaltyPointEarn + incrementSteps.loyaltyPointEarn * growthModifier, targetData.loyaltyPointEarn)), // Integer
      loyaltyPointRedeem: Math.floor(Math.min(data.loyaltyPointRedeem + incrementSteps.loyaltyPointRedeem * growthModifier, targetData.loyaltyPointRedeem)), // Integer
      orderPlacedUsingLoyaltyPoint: Math.floor(Math.min(data.orderPlacedUsingLoyaltyPoint + incrementSteps.orderPlacedUsingLoyaltyPoint * growthModifier, targetData.orderPlacedUsingLoyaltyPoint)), // Integer
      TotalOrdersPerMinute: Math.floor(((data.totalOrderLift - previousTotalOrderLift) / (updateIntervalMs / 60000))), // Calculate orders per minute
    };

    previousTotalOrderLift = data.totalOrderLift; // Update for the next interval
  };
})();

// Start server
const server = app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});

// WebSocket server
const wss = new WebSocketServer({ server });

// Broadcast data to all connected clients
const broadcastData = () => {
  try {
    const jsonData = JSON.stringify(data);
    wss.clients.forEach((client) => {
      if (client.readyState === client.OPEN) {
        client.send(jsonData);
      }
    });
  } catch (error) {
    console.error('Error broadcasting data:', error);
  }
};


// Update and broadcast data periodically
setInterval(() => {
  updateData();
  broadcastData();
}, updateIntervalMs);
