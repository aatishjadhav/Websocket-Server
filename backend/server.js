import express from 'express';
import cors from 'cors';
import { WebSocketServer } from 'ws';

const app = express();
const port = process.env.PORT || 5000;

app.use(cors({ origin: '*' }));
app.use(express.json());

const targetData = {
  totalSales: 104005368,
  totalNoOfGiftCardsSold: 105000,
  giftCardsSold: 5200000,
  giftCardsRedeem: 6050000,
  totalOrderValueLift: 9000000,
  loyaltyPointsEarn: 8000000,
  loyaltyPointsRedeem: 29000000,
  orderPlacedUsingLoyaltyPoints: 285818,
  totalOrders: 3143996
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
  totalOrders: 0,
};

const updateIntervalMs = 60 * 1000;
const totalDurationHours = 96;

const randomVariation = Math.floor(Math.random() * (10 - (-10) + 1)) + (-10); 
const totalUpdates = (totalDurationHours * 60 * 60 * 1000) / updateIntervalMs + randomVariation; 

const incrementSteps = {
  totalSales: targetData.totalSales / totalUpdates,
  totalNoOfGiftCardsSold: targetData.totalNoOfGiftCardsSold / totalUpdates,
  giftCardsSold: targetData.giftCardsSold / totalUpdates,
  giftCardsRedeem: targetData.giftCardsRedeem / totalUpdates,
  totalOrderValueLift: targetData.totalOrderValueLift / totalUpdates,
  loyaltyPointsEarn: targetData.loyaltyPointsEarn / totalUpdates,
  loyaltyPointsRedeem: targetData.loyaltyPointsRedeem / totalUpdates,
  orderPlacedUsingLoyaltyPoints: targetData.orderPlacedUsingLoyaltyPoints / totalUpdates,
  totalOrders: targetData.totalOrders / totalUpdates,
};

const numberFormatter = new Intl.NumberFormat('en-US');

const updateData = () => {
  data = {
    totalSales: Math.min(data.totalSales + incrementSteps.totalSales, targetData.totalSales),
    totalNoOfGiftCardsSold: Math.min(data.totalNoOfGiftCardsSold + incrementSteps.totalNoOfGiftCardsSold, targetData.totalNoOfGiftCardsSold),
    giftCardsSold: Math.min(data.giftCardsSold + incrementSteps.giftCardsSold, targetData.giftCardsSold),
    giftCardsRedeem: Math.min(data.giftCardsRedeem + incrementSteps.giftCardsRedeem, targetData.giftCardsRedeem),
    totalOrderValueLift: Math.min(data.totalOrderValueLift + incrementSteps.totalOrderValueLift, targetData.totalOrderValueLift),
    loyaltyPointsEarn: Math.min(data.loyaltyPointsEarn + incrementSteps.loyaltyPointsEarn, targetData.loyaltyPointsEarn),
    loyaltyPointsRedeem: Math.min(data.loyaltyPointsRedeem + incrementSteps.loyaltyPointsRedeem, targetData.loyaltyPointsRedeem),
    orderPlacedUsingLoyaltyPoints: Math.min(data.orderPlacedUsingLoyaltyPoints + incrementSteps.orderPlacedUsingLoyaltyPoints, targetData.orderPlacedUsingLoyaltyPoints),
    totalOrders: Math.min(data.totalOrders + incrementSteps.totalOrders, targetData.totalOrders), 
  };
};

const formatData = (data) => {
  return {
    totalSales: numberFormatter.format(data.totalSales.toFixed(2)),
    totalNoOfGiftCardsSold: numberFormatter.format(data.totalNoOfGiftCardsSold.toFixed(0)),
    giftCardsSold: numberFormatter.format(data.giftCardsSold.toFixed(2)),
    giftCardsRedeem: numberFormatter.format(data.giftCardsRedeem.toFixed(2)),
    totalOrderValueLift: numberFormatter.format(data.totalOrderValueLift.toFixed(2)),
    loyaltyPointsEarn: numberFormatter.format(data.loyaltyPointsEarn.toFixed(0)),
    loyaltyPointsRedeem: numberFormatter.format(data.loyaltyPointsRedeem.toFixed(0)),
    orderPlacedUsingLoyaltyPoints: numberFormatter.format(Math.round(data.orderPlacedUsingLoyaltyPoints)),
    totalOrders: numberFormatter.format(Math.round(data.totalOrders)),
  };
};

// WebSocket Server
const server = app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
const wss = new WebSocketServer({ server });

// Broadcast data to clients
const broadcastData = () => {
  const formattedData = formatData(data);
  
  const jsonData = JSON.stringify(formattedData);
  
  wss.clients.forEach((client) => {
    if (client.readyState === client.OPEN) {
      client.send(jsonData);
    }
  });
};

// Update and broadcast periodically
updateData(); 
setInterval(() => {
  updateData();
  broadcastData();
}, updateIntervalMs);

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('Shutting down...');
  wss.clients.forEach((client) => client.close());
  server.close(() => process.exit(0));
});
