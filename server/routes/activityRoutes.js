import express from 'express';
const router = express.Router();
import { 
    createLog, 
    getLogs, 
    getActivityStats 
} from '../controllers/activityController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

// Public endpoint for client events (protected internally by checking req.user if present)
router.route('/log').post(createLog);

// Admin endpoints
router.route('/').get(protect, admin, getLogs);
router.route('/stats').get(protect, admin, getActivityStats);

export default router;
