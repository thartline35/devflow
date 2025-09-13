// types/express.d.ts
import { Express } from "express-serve-static-core";
import { AuthUser } from './auth';

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export {};
