import { prisma } from "../Config/prisma.config";
import { PropertyBody } from "./property.types";

export const createService = async (userId: number, body: PropertyBody) => {
  const propertyData: any = {
    name: body.name,
    rent_per_month: body.rent_per_month,
    commission_percentage: body.commission_percentage,
    user_id: userId,
  };

  if (body.landlord_id) {
    propertyData.landlord_id = body.landlord_id;
  }
  if (body.tenant_id) {
    propertyData.tenant_id = body.tenant_id;
  }

  const data = await prisma.property.create({
    data: propertyData,
  });

  return data;
};

export const editService = async (id: number, body: Partial<PropertyBody>) => {
  const data = await prisma.property.update({
    where: { id },
    data: body,
  });

  return data;
};

export const deleteService = async (id: number) => {
  return await prisma.property.delete({
    where: { id },
  });
};

export const getService = async (page: number, limit: number) => {
  const skip = (page - 1) * limit;

  const totalCount = await prisma.property.count();

  const properties = await prisma.property.findMany({
    skip,
    take: limit,
    orderBy: { id: "desc" },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
      transactions: true,
    },
  });

  const totalPages = Math.ceil(totalCount / limit);

  return { properties, totalCount, totalPages };
};

export const getByIdService = async (id: number) => {
  const data = await prisma.property.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
      transactions: true,
    },
  });

  return data;
};

export const listService = async () => {
  const data = await prisma.property.findMany({
    select: {
      id: true,
      name: true,
    },
    distinct: ["name"],
  });

  return data;
};
