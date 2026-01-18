import express from 'express';
import { getUserProfile, updateUserProfile, addAddress, deleteAddress } from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/profile')
    .get(protect, getUserProfile)
    .put(protect, updateUserProfile);

router.route('/address')
    .post(protect, addAddress);

router.route('/address/:id')
    .delete(protect, deleteAddress);

export default router;
