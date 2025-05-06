import { NextFunction, Request, Response } from "express";

const ensureAuthenticated = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Please log in to access this resource" });
};

export { ensureAuthenticated };
