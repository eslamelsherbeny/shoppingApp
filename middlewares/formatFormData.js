// backend/middlewares/formatFormData.js

exports.formatProductData = (req, res, next) => {
  // 1. تحويل الأرقام من نصوص (String) إلى أرقام (Number)
  if (req.body.price) req.body.price = Number(req.body.price)
  if (req.body.quantity) req.body.quantity = Number(req.body.quantity)
  if (req.body.sold) req.body.sold = Number(req.body.sold)
  if (req.body.ratingsAverage)
    req.body.ratingsAverage = Number(req.body.ratingsAverage)
  if (req.body.ratingsQuantity)
    req.body.ratingsQuantity = Number(req.body.ratingsQuantity)

  // التعامل مع السعر بعد الخصم
  if (req.body.priceAfterDiscount) {
    req.body.priceAfterDiscount = Number(req.body.priceAfterDiscount)
  }

  // 2. تحويل العناصر الفردية إلى مصفوفات (Arrays)
  // لأن FormData بتبعت العنصر الواحد كنص عادي مش مصفوفة

  // معالجة الألوان
  if (req.body.colors) {
    if (!Array.isArray(req.body.colors)) {
      req.body.colors = [req.body.colors]
    }
  }

  // معالجة المقاسات
  if (req.body.sizes) {
    if (!Array.isArray(req.body.sizes)) {
      req.body.sizes = [req.body.sizes]
    }
  }

  // معالجة الفئات الفرعية
  if (req.body.subcategories) {
    if (!Array.isArray(req.body.subcategories)) {
      req.body.subcategories = [req.body.subcategories]
    }
  }

  // معالجة الصور (لو اتبعتت كنصوص مش ملفات)
  if (req.body.images && !Array.isArray(req.body.images)) {
    req.body.images = [req.body.images]
  }

  next()
}
