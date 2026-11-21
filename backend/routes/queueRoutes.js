import express from 'express';
import { auth } from '../middleware/auth.js';
import { enqueueArticle, enqueueBlogTitle, getJobStatus } from '../controller/queueController.js';

const queueRouter = express.Router();

queueRouter.post('/generate-article', auth, enqueueArticle);
queueRouter.post('/generate-blog-title', auth, enqueueBlogTitle);
queueRouter.get('/jobs/:id', auth, getJobStatus);

export default queueRouter;