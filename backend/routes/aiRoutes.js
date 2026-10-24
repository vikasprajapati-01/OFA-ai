import express from 'express';
import { auth, requirePremium } from '../middleware/auth.js';
import { upload } from "../config/multer.js";
import { generateArticle, generateBlogTitle, generateImage, removeImageBG, removeImageObject, reviewResume } from '../controller/aiController.js';

const aiRouter = express.Router();

aiRouter.post('/generate-article', auth, generateArticle);
aiRouter.post('/generate-blog-title', auth, generateBlogTitle);
aiRouter.post('/generate-image', auth, generateImage);
aiRouter.post('/remove-image-bg', auth, requirePremium, upload.single('image'), removeImageBG);
aiRouter.post('/remove-image-object', auth, requirePremium, upload.single('image'), removeImageObject);
aiRouter.post('/review-resume', auth, requirePremium, upload.single('resume'), reviewResume);

export default aiRouter;