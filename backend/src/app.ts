import express, {
  type ErrorRequestHandler,
  type Request,
  type Response,
} from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { pool } from "./config/dbConnect.js";
import { ENV } from "./config/env.config.js";
import { HttpError } from "./utils/http-error.js";
import authRouter from "./features/auth/routes/auth.routes.js";
import profileRouter from "./features/profile/routes/profile.routes.js";

const app = express();

app.use(cors({ origin: ENV.FRONTEND_URL, credentials: true }));
app.use(cookieParser());
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

app.get("/health", async (_req: Request, res: Response) => {
  try {
    await pool.query("SELECT 1");
    res.json({ ok: true, db: "up" });
  } catch {
    res.status(503).json({ ok: false, db: "down" });
  }
});

app.use("/api/v1/auth", authRouter);
app.use("/api/v1", profileRouter);

app.use((_req, res) => {
  res.status(404).json({ error: "Not found" });
});

const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof HttpError) {
    return res.status(err.status).json({ error: err.message });
  }
  console.error("[error]", err);
  res.status(500).json({ error: "Internal server error" });
};
app.use(errorHandler);

export default app;
