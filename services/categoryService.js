const sharp = require('sharp')
const { v4: uuidv4 } = require('uuid')
const asyncHandler = require('express-async-handler')
const { cloudinaryUpload } = require('../utils/cloudinary') // 👈 يجب التأكد من مسار الدالة
const ApiError = require('../utils/apiError')

const factory = require('./handlersFactory')
const { uploadSingleImage } = require('../middlewares/uploadImageMiddleware')
const Category = require('../models/categoryModel')

// Upload single image (تستخدم memoryStorage)
exports.uploadCategoryImage = uploadSingleImage('image')

/**
 * دالة معالجة وتغيير حجم الصورة ثم رفعها إلى Cloudinary
 * هذه الدالة تحل مشكلة "read-only file system"
 */
exports.resizeImage = asyncHandler(async (req, res, next) => {
  if (!req.file) {
    return next()
  }

  // 1. معالجة الصورة في الذاكرة (التحويل إلى PNG للشفافية)
  const processedBuffer = await sharp(req.file.buffer)
    .resize(600, 600, {
      fit: 'contain',
      // 👈 تم حذف خاصية background للحصول على الشفافية
    })
    .toFormat('png') // 👈 الأهم: تغيير الصيغة إلى PNG
    .png({ quality: 90 })
    .toBuffer()

  // 2. تجهيز البيانات للرفع السحابي
  const fileToUpload = {
    buffer: processedBuffer,
    mimetype: 'image/png', // 👈 تم تغيير نوع الـ Mimetype ليطابق PNG
  }

  // 3. رفع الـ Buffer المعالج إلى Cloudinary
  const imageUrl = await cloudinaryUpload(fileToUpload)

  // 4. حفظ الرابط (URL) في الـ req.body
  req.body.image = imageUrl

  next()
})
// @desc 	Get list of categories
// @route 	GET /api/v1/categories
// @access 	Public
exports.getCategories = factory.getAll(Category)

// @desc 	Get specific category by id
// @route 	GET /api/v1/categories/:id
// @access 	Public
exports.getCategory = factory.getOne(Category)

// @desc 	Create category
// @route 	POST 	/api/v1/categories
// @access 	Private/Admin-Manager
exports.createCategory = factory.createOne(Category)

// @desc 	Update specific category
// @route 	PUT /api/v1/categories/:id
// @access 	Private/Admin-Manager
exports.updateCategory = factory.updateOne(Category)

// @desc 	Delete specific category
// @route 	DELETE /api/v1/categories/:id
// @access 	Private/Admin
exports.deleteCategory = factory.deleteOne(Category)
