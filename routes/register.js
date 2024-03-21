const express = require('express');

const { auth } = require('../middleware/auth');

const router = express.Router();

const registerController = require('../controllers/register');

router.get('/', registerController.getUsers);

router.post('/verify-email', registerController.sendMailToUser);

router.post('/verify-email/:token', registerController.verifyEmailWithToken);

router.post('/', registerController.createUser);

router.put("/:userId", auth, registerController.updateUser);

router.delete('/userId', registerController.deleteUser);

module.exports = router;