import express from "express";
import evidenceRoutes from "./evidence.routes.js";
import tripRoutes from "./trip.routes.js";

const router = express.Router();

router.use("/evidence", evidenceRoutes);
router.use("/trips", tripRoutes);

export default router;
