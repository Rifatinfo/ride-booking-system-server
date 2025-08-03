import { Router } from "express";
import { AuthProvider } from "./auth.controller";

const router = Router();

router.post("/login", AuthProvider.credentialLogin);

export const AuthRoutes = router;