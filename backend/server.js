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
  totalNoOfGiftCardsSold: 4747267, 
  giftCardsSold: 4747267, 
  giftCardsRedeem: 270049, 
  totalOrderValueLift: 270049, 
  loyaltyPointsEarn: 2045610, 
  loyaltyPointsRedeem: 700000, 
  orderPlacedUsingLoyaltyPoints: 100000, 
};

let data = {
  totalSales: 0,
  totalNoOfGiftCardsSold: 0, 
  giftCardsSold: 0,
  giftCardsRedeem: 0,
  totalOrderValueLift: 0,
  loyaltyPointsEarn: 0,
  loyaltyPointsRedeem: 0,
  orderPlacedUsingLoyaltyPoints: 0,
  TotalOrdersPerMinute: 0, 
};

const totalDurationHours = 96;
const updateIntervalMs = 10 * 1000;
const totalUpdates = (totalDurationHours * 60 * 60 * 1000) / updateIntervalMs;

const incrementSteps = {
  totalSales: targetData.totalSales / totalUpdates,
  totalNoOfGiftCardsSold: targetData.totalNoOfGiftCardsSold / totalUpdates, 
  giftCardsSold: targetData.giftCardsSold / totalUpdates,
  giftCardsRedeem: targetData.giftCardsRedeem / totalUpdates,
  totalOrderValueLift: targetData.totalOrderValueLift / totalUpdates,
  loyaltyPointsEarn: targetData.loyaltyPointsEarn / totalUpdates,
  loyaltyPointsRedeem: targetData.loyaltyPointsRedeem / totalUpdates,
  orderPlacedUsingLoyaltyPoints: targetData.orderPlacedUsingLoyaltyPoints / totalUpdates,
};

let previousTotalOrderLift = 0; // To calculate orders per minute

const updateData = (() => {
  let elapsedTimeMs = 0;

  return () => {
    elapsedTimeMs += updateIntervalMs;

    const elapsedProportion = elapsedTimeMs / (totalDurationHours * 60 * 60 * 1000);
    const growthModifier = Math.sin(elapsedProportion * Math.PI / 2) ** 2;
    const giftCardsRedeemIncrement = incrementSteps.giftCardsRedeem * growthModifier;
    const totalOrderValueLiftIncrement = giftCardsRedeemIncrement * (Math.random() * 0.1 + 0.7);

    data = {
      totalSales: Math.min(data.totalSales + incrementSteps.totalSales * growthModifier, targetData.totalSales), // Float
      totalNoOfGiftCardsSold: Math.floor(Math.min(data.totalNoOfGiftCardsSold + incrementSteps.totalNoOfGiftCardsSold * growthModifier, targetData.totalNoOfGiftCardsSold)), // Integer
      giftCardsSold: Math.min(data.giftCardsSold + incrementSteps.giftCardsSold * growthModifier, targetData.giftCardsSold), // Float
      giftCardsRedeem: Math.min(data.giftCardsRedeem + giftCardsRedeemIncrement, targetData.giftCardsRedeem), // Float
      totalOrderValueLift: Math.min(data.totalOrderValueLift + totalOrderValueLiftIncrement, targetData.totalOrderValueLift), // Float
      loyaltyPointsEarn: Math.floor(Math.min(data.loyaltyPointsEarn + incrementSteps.loyaltyPointsEarn * growthModifier, targetData.loyaltyPointsEarn)), // Integer
      loyaltyPointsRedeem: Math.floor(Math.min(data.loyaltyPointsRedeem + incrementSteps.loyaltyPointsRedeem * growthModifier, targetData.loyaltyPointsRedeem)), // Integer
      orderPlacedUsingLoyaltyPoints: Math.floor(Math.min(data.orderPlacedUsingLoyaltyPoints + incrementSteps.orderPlacedUsingLoyaltyPoints * growthModifier, targetData.orderPlacedUsingLoyaltyPoints)), // Integer
      TotalOrdersPerMinute: Math.floor(((data.totalOrderValueLift - previousTotalOrderLift) / (updateIntervalMs / 60000))), // Calculate orders per minute
    };

    previousTotalOrderLift = data.totalOrderValueLift; // Update for the next interval
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
