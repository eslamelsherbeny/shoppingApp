const asyncHandler = require('express-async-handler')

const User = require('../models/userModel')

// @desc    Add address to user addresses list
// @route   POST /api/v1/addresses
// @access  Protected/User
exports.addAddress = asyncHandler(async (req, res, next) => {
  // $addToSet => add address object to user addresses array if address not exist
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $addToSet: { addresses: req.body },
    },
    { new: true }
  )

  res.status(200).json({
    status: 200,
    message: 'Address added successfully.',
    data: user.addresses,
  })
})

// ✅ إضافة دالة التعديل
// @desc    Update specific address from user addresses list
// @route   PUT /api/v1/addresses/:addressId
// @access  Protected/User
exports.updateAddress = asyncHandler(async (req, res, next) => {
  const { addressId } = req.params
  const { alias, details, phone, city, postalCode } = req.body

  // Find user
  const user = await User.findById(req.user._id)

  if (!user) {
    return res.status(404).json({
      status: 404,
      message: 'User not found',
    })
  }

  // Find address index
  const addressIndex = user.addresses.findIndex(
    (addr) => addr._id.toString() === addressId
  )

  if (addressIndex === -1) {
    return res.status(404).json({
      status: 404,
      message: 'Address not found',
    })
  }

  // Update address fields
  if (alias !== undefined) user.addresses[addressIndex].alias = alias
  if (details !== undefined) user.addresses[addressIndex].details = details
  if (phone !== undefined) user.addresses[addressIndex].phone = phone
  if (city !== undefined) user.addresses[addressIndex].city = city
  if (postalCode !== undefined)
    user.addresses[addressIndex].postalCode = postalCode

  // Save user
  await user.save()

  res.status(200).json({
    status: 200,
    message: 'Address updated successfully.',
    data: user.addresses[addressIndex],
  })
})

// @desc    Remove address from user addresses list
// @route   DELETE /api/v1/addresses/:addressId
// @access  Protected/User
exports.removeAddress = asyncHandler(async (req, res, next) => {
  // $pull => remove address object from user addresses array if addressId exist
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $pull: { addresses: { _id: req.params.addressId } },
    },
    { new: true }
  )

  res.status(200).json({
    status: 200,
    message: 'Address removed successfully.',
    data: user.addresses,
  })
})

// @desc    Get logged user addresses list
// @route   GET /api/v1/addresses
// @access  Protected/User
exports.getLoggedUserAddresses = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id).populate('addresses')

  res.status(200).json({
    status: 200,
    results: user.addresses.length,
    data: user.addresses,
  })
})
