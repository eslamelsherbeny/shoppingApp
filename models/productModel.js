const mongoose = require('mongoose')

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: [3, 'Too short product title'],
      maxlength: [100, 'Too long product title'],
    },
    slug: {
      type: String,
      required: true,
      lowercase: true,
    },
    description: {
      type: String,
      required: [true, 'Product description is required'],
      minlength: [20, 'Too short product description'],
    },
    quantity: {
      type: Number,
      required: [true, 'Product quantity is required'],
    },
    sold: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, 'Product price is required'],
      trim: true,
      max: [200000, 'Too long product price'],
    },
    priceAfterDiscount: {
      type: Number,
    },

    colors: {
      type: [String],
    },

    sizes: {
      type: [String],
    },

    imageCover: {
      type: String,
      required: [true, 'Product Image cover is required'],
    },
    images: [String],
    category: {
      type: mongoose.Schema.ObjectId,
      ref: 'Category',
      required: [true, 'Product must be belong to category'],
    },
    subcategories: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'SubCategory',
      },
    ],
    brand: {
      type: mongoose.Schema.ObjectId,
      ref: 'Brand',
    },
    ratingsAverage: {
      type: Number,
      min: [1, 'Rating must be above or equal 1.0'],
      max: [5, 'Rating must be below or equal 5.0'],
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
)

productSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'product',
  localField: '_id',
})

// Mongoose query middleware
productSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'category',
    select: 'name', // ⚠️ شلنا -_id عشان الأدمن يحتاج الآيدي
  }).populate({
    path: 'subcategories', // ✅ عشان نعرض الفئات الفرعية للعميل
    select: 'name',
  })

  next()
})

// ✅ التعديل هنا: دالة ذكية للتعامل مع الصور المحلية وروابط Cloudinary
const setImageURL = (doc) => {
  // 1. معالجة صورة الغلاف
  if (doc.imageCover) {
    // لو الرابط مش بيبدأ بـ http (يعني اسم ملف محلي)، ضيف الدومين
    if (!doc.imageCover.startsWith('http')) {
      const imageUrl = `${process.env.BASE_URL}/products/${doc.imageCover}`
      doc.imageCover = imageUrl
    }
    // لو بيبدأ بـ http (زي Cloudinary)، سيبه زي ما هو
  }

  // 2. معالجة صور المعرض
  if (doc.images) {
    const imagesList = []
    doc.images.forEach((image) => {
      if (!image.startsWith('http')) {
        const imageUrl = `${process.env.BASE_URL}/products/${image}`
        imagesList.push(imageUrl)
      } else {
        imagesList.push(image)
      }
    })
    doc.images = imagesList
  }
}

// findOne, findAll and update
productSchema.post('init', (doc) => {
  setImageURL(doc)
})

// create
productSchema.post('save', (doc) => {
  setImageURL(doc)
})

module.exports = mongoose.model('Product', productSchema)
