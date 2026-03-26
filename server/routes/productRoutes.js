import express from 'express';
import { getProducts, getProductById, createProduct, deleteProduct, updateProduct, addProductQuestion, answerProductQuestion, getAllQuestions } from '../controllers/productController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').get(getProducts).post(protect, admin, createProduct);

// Place generic routes before /:id to avoid param capture
router.route('/admin/questions').get(protect, admin, getAllQuestions);

router
    .route('/:id')
    .get(getProductById)
    .delete(protect, admin, deleteProduct)
    .put(protect, admin, updateProduct);

router.route('/:id/questions').post(protect, addProductQuestion);
router.route('/:id/questions/:questionId').put(protect, admin, answerProductQuestion);

export default router;
