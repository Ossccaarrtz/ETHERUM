import express from "express";
import evidenceRoutes from "./evidence.routes.js";

const router = express.Router();

router.use("/evidence", evidenceRoutes);

export default router;
