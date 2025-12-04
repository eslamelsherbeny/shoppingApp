const cloudinary = require('cloudinary').v2

// ⚠️ تأكد من إضافة المتغيرات دي لملف .env عندك في الباك إند
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

/**
 * دالة لرفع ملفات الـ Buffer مباشرة إلى Cloudinary
 * @param {object} fileBuffer - الملف كما يظهر في req.file من Multer
 * @returns {Promise<string>} - رابط الصورة الآمن (secure URL)
 */
// eslint-disable-next-line arrow-body-style
exports.cloudinaryUpload = (fileBuffer) => {
  return new Promise((resolve, reject) => {
    // تحويل الـ Buffer إلى صيغة Base64 (مطلوبة لرفع الـ Buffer)
    const dataUri = `data:${fileBuffer.mimetype};base64,${fileBuffer.buffer.toString('base64')}`

    // عملية الرفع
    cloudinary.uploader.upload(
      dataUri,
      {
        folder: 'ayman-bashir-store-categories', // اسم المجلد في Cloudinary
      },
      (error, result) => {
        if (error) {
          console.error('Cloudinary Upload Error:', error)
          return reject(new Error('Cloudinary upload failed'))
        }
        // إرجاع الرابط الآمن (HTTPS)
        resolve(result.secure_url)
      }
    )
  })
}
