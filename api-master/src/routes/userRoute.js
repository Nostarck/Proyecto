import { Router } from 'express';
import { login, register } from '../controllers/userController.js';

const router = Router();

// Registration route
router.post('/auth/register', register);

// Login route
router.post('/login', login);

export default router;