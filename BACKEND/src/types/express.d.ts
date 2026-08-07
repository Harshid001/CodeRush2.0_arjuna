declare namespace Express {
  interface Request {
    auth?: {
      userId: string;
      email: string;
      role: "developer" | "provider" | "admin";
    };
  }
}