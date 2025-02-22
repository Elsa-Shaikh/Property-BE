import { Request, Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../Middleware/auth.middleware";

export const authorizeRole = (role: string) => {
  return (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): void => {
    if (!req.user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    if (req.user.role !== role) {
      res.status(403).json({ message: "Forbidden: Access denied" });
      return;
    }

    next();
  };
};
