// src/services/mockService.js
import { products, telemetryPoints, operations } from "../mockData";

export const api = {
  // Products
  getProducts: async () => {
    await new Promise((r) => setTimeout(r, 200)); // simulate network
    return products;
  },
  getProductById: async (id) => {
    await new Promise((r) => setTimeout(r, 100));
    return products.find((p) => p.id === id);
  },

  // Telemetry
  getTelemetry: async () => {
    await new Promise((r) => setTimeout(r, 200));
    return telemetryPoints;
  },
  getTelemetryByPoint: async (key) => {
    await new Promise((r) => setTimeout(r, 100));
    return telemetryPoints.find((t) => t.pointKey === key);
  },

  // Operations
  getOperations: async () => {
    await new Promise((r) => setTimeout(r, 200));
    return operations;
  },
  createOperation: async (op) => {
    await new Promise((r) => setTimeout(r, 100));
    const newOp = { ...op, id: operations.length + 1, date: new Date() };
    operations.push(newOp);
    console.log("Mock operation created:", newOp);
    return newOp;
  },
};
