import { Request, RequestHandler, Response } from "express";
import { ZodError } from "zod";
import { propertySchema } from "./property.validator";
import {
  createService,
  deleteService,
  editService,
  getByIdService,
  getService,
  listService,
} from "./property.service";
import { AuthenticatedRequest } from "../Middleware/auth.middleware";
import { prisma } from "../Config/prisma.config";
import { PropertyBody } from "./property.types";

export const propertyCreate: RequestHandler = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { name, rent_per_month, commission_percentage } = req.body;

    if (!name || !rent_per_month || !commission_percentage) {
      res
        .status(400)
        .json({ message: "Name, Rent, Commission fields are required!" });
      return;
    }

    const validatedData = propertySchema.parse(req.body);

    const userId = req?.user?.id ? Number(req.user.id) : null;
    if (userId === null) {
      res
        .status(401)
        .json({ message: "Unauthorized, userId is missing or invalid!" });
      return;
    }

    await createService(userId, {
      name: validatedData.name,
      rent_per_month: validatedData?.rent_per_month,
      commission_percentage: validatedData?.commission_percentage,
      landlord_id: validatedData?.landlord_id,
      tenant_id: validatedData?.tenant_id,
    });
    res.status(201).json({ message: "Property Created Successfully!" });
  } catch (error: any) {
    if (error instanceof ZodError) {
      const firstError = error.errors[0]?.message || "Invalid input!";
      res.status(400).json({ message: firstError });
      return;
    }
    res.status(500).json({ message: "Internal Server Error!" });
  }
};

export const propertyEdit: RequestHandler = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    if (!id) {
      res.status(400).json({ message: "Property ID is required!" });
      return;
    }
    const propertyId = Number(id);
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
    const updates: Partial<PropertyBody> = req.body;

    await editService(propertyId, updates);
    res.status(201).json({ message: "Property Updated Successfully!" });
  } catch (error: any) {
    res.status(500).json({ message: "Internal Server Error!" });
  }
};

export const propertyDelete: RequestHandler = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    if (!id) {
      res.status(400).json({ message: "Property ID is required!" });
      return;
    }
    const propertyId = Number(id);
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
    await deleteService(propertyId);
    res.status(201).json({ message: "Property Deleted Successfully!" });
  } catch (error: any) {
    res.status(500).json({ message: "Internal Server Error!" });
  }
};

export const propertyRead: RequestHandler = async (
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
    const { properties, totalCount, totalPages } = await getService(
      pageNumber,
      limitNumber
    );
    res.status(201).json({
      message: "Property Fetched Successfully!",
      pagination: {
        page: pageNumber,
        limit: limitNumber,
        totalPage: totalPages,
        totalCount,
      },
      data: properties,
    });
  } catch (error: any) {
    res.status(500).json({ message: "Internal Server Error!" });
  }
};

export const propertyById: RequestHandler = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    if (!id) {
      res.status(400).json({ message: "Property ID is required!" });
      return;
    }
    const propertyId = Number(id);
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
    const data = await getByIdService(propertyId);
    res
      .status(201)
      .json({ message: "Property Fetched By Id Successfully!", data });
  } catch (error: any) {
    res.status(500).json({ message: "Internal Server Error!" });
  }
};

export const propertyList: RequestHandler = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const data = await listService();
    res
      .status(201)
      .json({ message: "Property List Fetched Successfully!", data });
  } catch (error: any) {
    res.status(500).json({ message: "Internal Server Error!" });
  }
};
