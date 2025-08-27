import express from "express";
import {
  changePassword,
  sendFormData,
  getMyWarning,
  checkClearanceStatus,
  studentRequest,
} from "../controller/studentController.js";
import { authStudent } from "../middleware/auth.js";

const studentRoutes = express.Router();

studentRoutes.post("/changePassword", authStudent, changePassword);
studentRoutes.post("/fillForm", authStudent, sendFormData); //authStudent
studentRoutes.get("/warning", authStudent, getMyWarning); //authStudent
studentRoutes.get(
  "/checkClearance/:request_id",
  authStudent,
  checkClearanceStatus
);
studentRoutes.get("/request", authStudent, studentRequest);

export default studentRoutes;
