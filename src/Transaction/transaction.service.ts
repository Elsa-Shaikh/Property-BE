import { prisma } from "../Config/prisma.config";
import { TransactionBody } from "./transaction.types";

export const createService = async (body: TransactionBody) => {
  const data = await prisma.transaction.create({
    data: {
      type: body.type,
      amount: body.amount,
      description: body.description,
      property_id: body.property_id,
    },
  });

  return data;
};

export const editService = async (
  id: number,
  body: Partial<TransactionBody>
) => {
  const data = await prisma.transaction.update({
    where: { id },
    data: body,
  });

  return data;
};

export const deleteService = async (id: number) => {
  return await prisma.transaction.delete({
    where: { id },
  });
};

export const getService = async (page: number, limit: number) => {
  const skip = (page - 1) * limit;

  const totalCount = await prisma.property.count();

  const data = await prisma.transaction.findMany({
    skip,
    take: limit,
    orderBy: { id: "desc" },
    include: {
      property: true,
    },
  });

  const totalPages = Math.ceil(totalCount / limit);

  return { data, totalCount, totalPages };
};

export const getByIdService = async (id: number) => {
  const data = await prisma.transaction.findUnique({
    where: { id },
    include: {
      property: true,
    },
  });

  return data;
};
