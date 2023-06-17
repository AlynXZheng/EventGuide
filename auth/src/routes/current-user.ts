import express, { NextFunction, Request, Response } from "express";
import { currentUser } from "@tourguide/common";

const router = express.Router();

router.get(
  "/api/users/currentuser",
  currentUser,
  (req: Request, res: Response) => {
    res.send({ currentUser: req.currentUser || null });
  }
);

export { router as currentUserRouter };
