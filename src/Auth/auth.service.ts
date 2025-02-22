import { prisma } from "../Config/prisma.config";
import {
  comparePassword,
  generateToken,
  hashPassword,
} from "../Utils/jwt.config";

export const registerService = async (
  name: string,
  email: string,
  password: string,
  role: "USER" | "ADMIN"
) => {
  const hashedPassword = await hashPassword(password);
  const user = await prisma.user.create({
    data: { name, email, password: hashedPassword, role },
  });

  return user;
};

export const loginService = async (email: string, password: string) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error("Invalid credentials");

  const isValidPassword = await comparePassword(password, user.password);
  if (!isValidPassword) throw new Error("Invalid credentials");

  return generateToken(user.id.toString(), user.role);
};
