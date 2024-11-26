import express from 'express';
import cors from 'cors';
import { WebSocketServer } from 'ws';

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors({ origin: '*' }));
app.use(express.json());

// Target data and initial state
const targetData = {
  totalSales: 285817810,
  totalNoOfGiftCardsSold: 79050986.8,
  giftCardsSold: 1581019736,
  giftCardsRedeem: 85745343,
  totalOrderValueLift: 114327124,
  loyaltyPointsEarn: 28581781,
  loyaltyPointsRedeem: 42872671.5,
  orderPlacedUsingLoyaltyPoints: 2858178.1
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
  totalOrdersPerMinute: 0,
};

const updateIntervalMs = 10 * 1000;
const totalDurationHours = 96;
const totalUpdates = (totalDurationHours * 60 * 60 * 1000) / updateIntervalMs;

// Increment steps
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

// Formatter for US locale
const numberFormatter = new Intl.NumberFormat('en-US');

// Update function
const updateData = () => {
  // Calculate Average Order Value (AOV)
  const averageOrderValue = targetData.totalOrderValueLift / targetData.giftCardsSold;

  // Estimate Total Orders based on updated sales value
  const totalOrders = data.totalSales / averageOrderValue;

  // Total time in minutes (96 hours)
  const totalTimeMinutes = 96 * 60;  // 5760 minutes

  // Calculate Orders Per Minute dynamically
  const TotalOrdersPerMinute = totalOrders / totalTimeMinutes;

  // Update the data object
  data = {
    totalSales: Math.min(data.totalSales + incrementSteps.totalSales, targetData.totalSales),
    totalNoOfGiftCardsSold: Math.min(data.totalNoOfGiftCardsSold + incrementSteps.totalNoOfGiftCardsSold, targetData.totalNoOfGiftCardsSold),
    giftCardsSold: Math.min(data.giftCardsSold + incrementSteps.giftCardsSold, targetData.giftCardsSold),
    giftCardsRedeem: Math.min(data.giftCardsRedeem + incrementSteps.giftCardsRedeem, targetData.giftCardsRedeem),
    totalOrderValueLift: Math.min(data.totalOrderValueLift + incrementSteps.totalOrderValueLift, targetData.totalOrderValueLift),
    loyaltyPointsEarn: Math.min(data.loyaltyPointsEarn + incrementSteps.loyaltyPointsEarn, targetData.loyaltyPointsEarn),
    loyaltyPointsRedeem: Math.min(data.loyaltyPointsRedeem + incrementSteps.loyaltyPointsRedeem, targetData.loyaltyPointsRedeem),
    orderPlacedUsingLoyaltyPoints: Math.min(data.orderPlacedUsingLoyaltyPoints + incrementSteps.orderPlacedUsingLoyaltyPoints, targetData.orderPlacedUsingLoyaltyPoints),
    totalOrdersPerMinute: TotalOrdersPerMinute, 
  };
};

// Format data for broadcast
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
    totalOrdersPerMinute: numberFormatter.format(Math.round(data.totalOrdersPerMinute)),
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
updateData(); // Initial update
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
