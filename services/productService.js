const sharp = require('sharp')
const { v4: uuidv4 } = require('uuid')
const asyncHandler = require('express-async-handler')
const { cloudinaryUpload } = require('../utils/cloudinary')
const ApiError = require('../utils/apiError') // 👈 ضروري لاستخدام كلاس الأخطاء

const factory = require('./handlersFactory')
const { uploadMixOfImages } = require('../middlewares/uploadImageMiddleware')
const Product = require('../models/productModel')

// 1. إعداد Multer لاستقبال الصور
exports.uploadProductImages = uploadMixOfImages([
  {
    name: 'imageCover',
    maxCount: 1,
  },
  {
    name: 'images',
    maxCount: 5,
  },
])

// 2. معالجة الصور ورفعها إلى Cloudinary
exports.resizeProductImages = asyncHandler(async (req, res, next) => {
  // أ) معالجة صورة الغلاف
  if (req.files.imageCover) {
    const processedBuffer = await sharp(req.files.imageCover[0].buffer)
      .resize(2000, 1333, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 0 },
      })
      .toFormat('png')
      .png({ quality: 95 })
      .toBuffer()

    const imageUrl = await cloudinaryUpload({
      buffer: processedBuffer,
      mimetype: 'image/png',
    })

    req.body.imageCover = imageUrl
  }

  // ب) معالجة صور المعرض
  if (req.files.images) {
    if (!req.body.images) req.body.images = []
    if (!Array.isArray(req.body.images)) req.body.images = [req.body.images]

    await Promise.all(
      req.files.images.map(async (img) => {
        const processedBuffer = await sharp(img.buffer)
          .resize(2000, 1333, {
            fit: 'contain',
            background: { r: 255, g: 255, b: 255, alpha: 0 },
          })
          .toFormat('png')
          .png({ quality: 95 })
          .toBuffer()

        const imageUrl = await cloudinaryUpload({
          buffer: processedBuffer,
          mimetype: 'image/png',
        })

        req.body.images.push(imageUrl)
      })
    )
  }

  next()
})

// @desc    Get list of products
exports.getProducts = factory.getAll(Product, 'Products')

// @desc    Get specific product by id (للأدمن وللعمليات الداخلية)
exports.getProduct = factory.getOne(Product, 'reviews')

// ✅ @desc    Get specific product by SLUG (للعملاء - Storefront)
// ✅ Route:   GET /api/v1/products/slug/:slug
exports.getProductBySlug = asyncHandler(async (req, res, next) => {
  const product = await Product.findOne({ slug: req.params.slug }).populate(
    'reviews'
  )

  if (!product) {
    return next(
      new ApiError(`No product for this slug ${req.params.slug}`, 404)
    )
  }

  // إرجاع البيانات في هيكل موحد
  res.status(200).json({
    status: 200,
    message: 'success',
    data: product,
  })
})

// @desc    Create product
exports.createProduct = factory.createOne(Product)

// @desc    Update specific product
exports.updateProduct = factory.updateOne(Product)

// @desc    Delete specific product
exports.deleteProduct = factory.deleteOne(Product)
