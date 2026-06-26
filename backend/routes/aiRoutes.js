import express from 'express';
import { auth } from '../middleware/auth.js';
import { generateArticle, generateBlogTitle, generateImage, removeImageBG, removeImageObject, reviewResume } from '../controller/aiController.js';

const aiRouter = express.Router();

aiRouter.post('/generate-article', auth, generateArticle);
aiRouter.post('/generate-blog-title', auth, generateBlogTitle);
aiRouter.post('/generate-image', auth, generateImage);
aiRouter.post('/remove-image-bg', upload.single('image'), auth, removeImageBG);
aiRouter.post('/remove-image-object', upload.single('image'), auth, removeImageObject);
aiRouter.post('/review-resume', upload.single('resume'), auth, reviewResume);

export default aiRouter;