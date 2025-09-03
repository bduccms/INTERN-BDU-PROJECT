import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import db from "./config/mysql.js";
import studentRoutes from "./route/studentRoutes.js";
import officialRoutes from "./route/officialRoutes.js";
import adminRoutes from "./route/adminRoutes.js";
import loginUser from "./middleware/login.js";

import createAdmin from "./middleware/createAdmin.js";
import path from "path";
import advisorRoutes from "./route/advisorRoutes.js";

const app = express();

console.log("DB_PASSWORD:", process.env.DB_PASSWORD ? "[SET]" : "[NOT SET]");

app.use(cors());
app.use("/pdfs", express.static(path.resolve("pdfs")));
app.use(express.json());

app.use("/api/student", studentRoutes);
app.use("/api/staff_official", officialRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/advisor", advisorRoutes);

app.use("/api/login", loginUser);
app.use("/api/createAdmin", createAdmin);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
