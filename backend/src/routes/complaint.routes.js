const express = require('express');
const ComplaintController = require('../controllers/complaint.controller');
const { authenticate } = require('../middlewares/auth.middleware');

const router = express.Router();

router.use(authenticate);

router.post('/', ComplaintController.createComplaint);
router.get('/my', ComplaintController.getMyComplaints);
router.post('/:id/messages', ComplaintController.addMessage);

module.exports = router;
