import { Request, RequestHandler, Response } from "express";
import { loginService, registerService } from "./auth.service";
import { loginSchema, registerSchema } from "./auth.validator";
import { ZodError } from "zod";
import { prisma } from "../Config/prisma.config";

export const registerController: RequestHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password || !role) {
      res.status(400).json({ message: "All fields are required!" });
      return;
    }
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      res.status(400).json({ message: "Email Already Exists!" });
      return;
    }
    const validatedData = registerSchema.parse(req.body);
    await registerService(
      validatedData.name,
      validatedData.email,
      validatedData.password,
      validatedData.role
    );

    res.status(201).json({ message: "User Registered Successfully!" });
  } catch (error: any) {
    if (error instanceof ZodError) {
      res.status(400).json({ message: error.errors.map((e) => e.message) });
      return;
    }
    res.status(500).json({ message: "Internal Server Error!" });
  }
};

export const loginController: RequestHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res
        .status(400)
        .json({ message: "Email and Password Fields are required!" });
      return;
    }
    const findUser = await prisma.user.findUnique({ where: { email } });
    if (!findUser) {
      res.status(404).json({ message: "Email not Found!" });
      return;
    }
    const validatedData = loginSchema.parse(req.body);
    const token = await loginService(
      validatedData.email,
      validatedData.password
    );
    res.status(200).json({
      message: "User Login Successfully",
      token,
      user: {
        id: findUser!.id,
        name: findUser!.name,
        email: findUser!.email,
        role: findUser!.role,
      },
    });
  } catch (error: any) {
    if (error.message === "Invalid credentials") {
      res.status(401).json({ message: "Invalid Credentials" });
      return;
    }
    if (error instanceof ZodError) {
      res.status(400).json({ message: error.errors.map((e) => e.message) });
      return;
    }
    console.log(error);
    res.status(500).json({ message: "Internal Server Error!" });
  }
};
