import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function connectDB() {
  try {
    await prisma.$connect();
    console.log("PostgreSQL Database Connection Successful!");
  } catch (error) {
    console.error("PostgreSQL Database connection failed:", error);
  }
}

export { connectDB, prisma };
