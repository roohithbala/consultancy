import express from 'express';
import { getUserProfile, updateUserProfile, addAddress, deleteAddress, getUsers, sendUserEmail } from '../controllers/userController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
    .get(protect, admin, getUsers);

router.route('/:id/email')
    .post(protect, admin, sendUserEmail);

router.route('/profile')
    .get(protect, getUserProfile)
    .put(protect, updateUserProfile);

router.route('/address')
    .post(protect, addAddress);

router.route('/address/:id')
    .delete(protect, deleteAddress);

export default router;
