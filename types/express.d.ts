// types/express.d.ts
import { Express } from "express-serve-static-core";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        username: string;
        role: string;
      };
    }
  }
}

export {};
