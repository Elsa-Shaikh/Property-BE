import express from "express";
import cors from "cors";
import authRoutes from "./Auth/auth.router";
import propertyRoutes from "./Property/property.router";
import transactionRoutes from "./Transaction/transaction.router";

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/property", propertyRoutes);
app.use("/api/transaction", transactionRoutes);

app.get("/", (req, res) => {
  res.send("Hello from TypeScript backend!");
});

export default app;
