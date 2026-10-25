import express from 'express';
import { auth } from '../middleware/auth.js';
import { getUserCreations, getCreationById } from '../controller/userController.js';

const userRouter = express.Router();

userRouter.get('/get-user-creations', auth, getUserCreations);
userRouter.get('/get-creation/:id', auth, getCreationById);

export default userRouter;