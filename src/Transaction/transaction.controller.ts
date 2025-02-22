import { Request, RequestHandler, Response } from "express";
import { ZodError } from "zod";
import { AuthenticatedRequest } from "../Middleware/auth.middleware";
import { transactionSchema } from "./transaction.validator";
import {
  createService,
  deleteService,
  editService,
  getByIdService,
  getService,
} from "./transaction.service";
import { prisma } from "../Config/prisma.config";
import { ReportData, TransactionBody } from "./transaction.types";
import { parse } from "json2csv";

export const transactionCreate: RequestHandler = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { property_id, type, description, amount } = req.body;

    if (!property_id || !type || !description || !amount) {
      res.status(400).json({
        message: "Property Id, Type, Description, Amount are required!",
      });
      return;
    }
    const propertyId = Number(property_id);
    if (isNaN(propertyId)) {
      res.status(400).json({ message: "Invalid Property ID!" });
      return;
    }
    const existingProperty = await prisma.property.findUnique({
      where: { id: propertyId },
    });
    if (!existingProperty) {
      res.status(404).json({ message: "Property not found!" });
      return;
    }
    const validatedData = transactionSchema.parse(req.body);

    await createService({
      type: validatedData.type,
      property_id: validatedData?.property_id,
      amount: validatedData?.amount,
      description: validatedData?.description,
    });
    res.status(201).json({ message: "Transaction Created Successfully!" });
  } catch (error: any) {
    if (error instanceof ZodError) {
      const firstError = error.errors[0]?.message || "Invalid input!";
      res.status(400).json({ message: firstError });
      return;
    }
    res.status(500).json({ message: "Internal Server Error!" });
  }
};

export const transactionEdit: RequestHandler = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    if (!id) {
      res.status(400).json({ message: "Transaction ID is required!" });
      return;
    }
    const transactionId = Number(id);
    if (isNaN(transactionId)) {
      res.status(400).json({ message: "Invalid Transaction ID!" });
      return;
    }
    const existingTransaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
    });
    if (!existingTransaction) {
      res.status(404).json({ message: "Transaction not found!" });
      return;
    }
    const updates: Partial<TransactionBody> = req.body;
    if (updates.property_id) {
      const propertyId = Number(updates.property_id);
      if (isNaN(propertyId)) {
        res.status(400).json({ message: "Invalid Property ID!" });
        return;
      }
      const existingProperty = await prisma.property.findUnique({
        where: { id: propertyId },
      });
      if (!existingProperty) {
        res.status(404).json({ message: "Property not found!" });
        return;
      }
    }
    await editService(transactionId, updates);
    res.status(201).json({ message: "Transaction Updated Successfully!" });
  } catch (error: any) {
    res.status(500).json({ message: "Internal Server Error!" });
  }
};

export const transactionDelete: RequestHandler = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    if (!id) {
      res.status(400).json({ message: "Transaction ID is required!" });
      return;
    }
    const transactionId = Number(id);
    if (isNaN(transactionId)) {
      res.status(400).json({ message: "Invalid Transaction ID!" });
      return;
    }
    const existingTransaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
    });
    if (!existingTransaction) {
      res.status(404).json({ message: "Transaction not found!" });
      return;
    }
    await deleteService(transactionId);
    res.status(201).json({ message: "Transaction Deleted Successfully!" });
  } catch (error: any) {
    res.status(500).json({ message: "Internal Server Error!" });
  }
};

export const transactionRead: RequestHandler = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    let { page = "1", limit = "10" } = req.query;

    const pageNumber = Number(page);
    const limitNumber = Number(limit);

    if (isNaN(pageNumber) || pageNumber < 1) {
      res.status(400).json({ message: "Invalid page number!" });
      return;
    }

    if (isNaN(limitNumber) || limitNumber < 1) {
      res.status(400).json({ message: "Invalid limit value!" });
      return;
    }
    const { data, totalCount, totalPages } = await getService(
      pageNumber,
      limitNumber
    );
    res.status(201).json({
      message: "Transactions Fetched Successfully!",
      pagination: {
        page: pageNumber,
        limit: limitNumber,
        totalPage: totalPages,
        totalCount,
      },
      data,
    });
  } catch (error: any) {
    res.status(500).json({ message: "Internal Server Error!" });
  }
};

export const transactionReadById: RequestHandler = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    if (!id) {
      res.status(400).json({ message: "Transaction ID is required!" });
      return;
    }
    const transactionId = Number(id);
    if (isNaN(transactionId)) {
      res.status(400).json({ message: "Invalid Transaction ID!" });
      return;
    }
    const existingTransaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
    });
    if (!existingTransaction) {
      res.status(404).json({ message: "Transaction not found!" });
      return;
    }
    const data = await getByIdService(transactionId);
    res
      .status(201)
      .json({ message: "Transaction Fetched By Id Successfully!", data });
  } catch (error: any) {
    res.status(500).json({ message: "Internal Server Error!" });
  }
};

export const monthlyReport: RequestHandler = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;

    const transactions = await prisma.transaction.findMany({
      where: {
        created_at: {
          gte: new Date(`${currentYear}-${currentMonth}-01`),
          lt: new Date(`${currentYear}-${currentMonth + 1}-01`),
        },
      },
      include: {
        property: {
          select: {
            id: true,
            name: true,
            rent_per_month: true,
            commission_percentage: true,
          },
        },
      },
    });

    const reportData: { [key: number]: ReportData } = {};

    transactions.forEach((transaction) => {
      const propertyId = transaction.property.id;
      const propertyName = transaction.property.name;
      const rent = transaction.property.rent_per_month;
      const commissionPercentage = transaction.property.commission_percentage;
      const amount = transaction.amount;
      const type = transaction.type;
      const description = transaction.description;

      const commission = (rent * commissionPercentage) / 100;
      const finalAmount = type === "DEBIT" ? rent - commission : 0;

      if (!reportData[propertyId]) {
        reportData[propertyId] = {
          propertyId,
          propertyName,
          income: 0,
          expenses: 0,
          agencyCommission: 0,
          finalAmount: 0,
          data: [],
        };
      }

      if (type === "DEBIT") {
        reportData[propertyId].income += amount;
      } else if (type === "CREDIT") {
        reportData[propertyId].expenses += amount;
      }

      reportData[propertyId].agencyCommission += commission;
      reportData[propertyId].finalAmount =
        reportData[propertyId].income -
        reportData[propertyId].expenses -
        reportData[propertyId].agencyCommission;

      reportData[propertyId].data.push({
        id: transaction.id,
        propertyId: transaction.property.id,
        type: transaction.type,
        description,
        amount,
        created_at: transaction.created_at.toISOString(),
      });
    });

    const csvData = Object.values(reportData).map((property) => ({
      Property: property.propertyName,
      Income: property.income,
      Expenses: property.expenses,
      AgencyCommission: property.agencyCommission,
      FinalAmountPayable: property.finalAmount,
      NoOfTransactions: property.data.length,
      NoOfCreditTransactions: property.data.filter((t) => t.type === "CREDIT")
        .length,
      NoOfDebitTransactions: property.data.filter((t) => t.type === "DEBIT")
        .length,
    }));

    const csv = parse(csvData);

    res.header("Content-Type", "text/csv");
    res.attachment("monthly-report.csv");

    res.send(csv);
  } catch (error: any) {
    res.status(500).json({ message: "Internal Server Error!" });
  }
};
