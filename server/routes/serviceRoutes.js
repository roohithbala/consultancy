import express from 'express';
import { createServiceRequest } from '../controllers/serviceController.js';

const router = express.Router();

router.post('/', createServiceRequest);

export default router;
