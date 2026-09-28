const express = require('express');
const {
  getUsers,
  getUserById,
  updateUser,
  updateUserStatus,
  deleteUser,
  updateProfileImage,
} = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const { requireRole } = require('../middleware/role');
const { uploadProfileImage } = require('../middleware/upload');

const router = express.Router();

router.use(protect);

router.get('/', requireRole('admin'), getUsers);
router.get('/:id', getUserById);
router.put('/:id', updateUser);
router.put('/:id/profile-image', uploadProfileImage, updateProfileImage);
router.patch('/:id/status', requireRole('admin'), updateUserStatus);
router.delete('/:id', requireRole('admin'), deleteUser);

module.exports = router;
