const express = require('express')

// استيراد الميدلوير الخاص بتهيئة البيانات
const { formatProductData } = require('../middlewares/formatFormData')

const {
  getProductValidator,
  createProductValidator,
  updateProductValidator,
  deleteProductValidator,
} = require('../utils/validators/productValidator')

const {
  getProducts,
  getProduct,
  getProductBySlug, // 👈 استيراد الدالة الجديدة
  createProduct,
  updateProduct,
  deleteProduct,
  uploadProductImages,
  resizeProductImages,
} = require('../services/productService')

const authService = require('../services/authService')
const reviewsRoute = require('./reviewRoute')

const router = express.Router()

// Nested route for reviews
router.use('/:productId/reviews', reviewsRoute)

router.route('/').get(getProducts).post(
  authService.protect,
  authService.allowedTo('admin', 'manager'),
  uploadProductImages,
  resizeProductImages,
  formatProductData, // ميدلوير إصلاح البيانات
  createProductValidator,
  createProduct
)

// ✅ إضافة راوت الـ Slug (يجب أن يكون قبل الـ ID)
router.route('/slug/:slug').get(getProductBySlug)

router
  .route('/:id')
  .get(getProductValidator, getProduct)
  .put(
    authService.protect,
    authService.allowedTo('admin', 'manager'),
    uploadProductImages,
    resizeProductImages,
    formatProductData, // ميدلوير إصلاح البيانات عند التعديل
    updateProductValidator,
    updateProduct
  )
  .delete(
    authService.protect,
    authService.allowedTo('admin'),
    deleteProductValidator,
    deleteProduct
  )

module.exports = router
