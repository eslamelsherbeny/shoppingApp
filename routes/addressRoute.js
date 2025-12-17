const express = require('express')

const authService = require('../services/authService')

const {
  addAddress,
  removeAddress,
  getLoggedUserAddresses,
  updateAddress, // ✅ إضافة
} = require('../services/addressService')

const router = express.Router()

router.use(authService.protect, authService.allowedTo('user'))

router.route('/').post(addAddress).get(getLoggedUserAddresses)

// ✅ تحديث route
router
  .route('/:addressId')
  .put(updateAddress) // إضافة PUT للتعديل
  .delete(removeAddress)

module.exports = router
