import { Router } from "express";
import { AuthProvider } from "./auth.controller";

const router = Router();

router.post("/login", AuthProvider.credentialLogin);
router.post("/refresh-token", AuthProvider.getNewAccessToken);
router.post("/logout", AuthProvider.logout);

export const AuthRoutes = router;