import express from 'express';
import { auth } from '../middleware/auth.js';
import { getUserCreations } from '../controller/userController.js';

const userRouter = express.Router();

userRouter.get('/get-user-creations', auth, getUserCreations);

export default userRouter;