const express = require('express');
const { updateComment, deleteComment } = require('../controllers/commentController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.put('/:id', updateComment);
router.delete('/:id', deleteComment);

module.exports = router;
