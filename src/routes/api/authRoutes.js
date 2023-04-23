const { Router } = require('express');
const authenticate = require('../../middlewares/authenticate');
const validateBody = require('../../middlewares/validateBody');
const upload = require('../../middlewares/upload');
const {
  userLoginJoiSchema,
  userRegisterJoiSchema,
  updateSubscriptionSchema,
} = require('../../utils/validation/userValidationSchemas');

const {
  register,
  login,
  logout,
  getCurrent,
  updateSubscription,
  updateAvatar,
} = require('../../controllers/authControllers');

const router = Router();

router.post('/register', validateBody(userRegisterJoiSchema), register);
router.post('/login', validateBody(userLoginJoiSchema), login);
router.post('/logout', authenticate, logout);
router.get('/current', authenticate, getCurrent);
router.patch(
  '/subscription',
  authenticate,
  validateBody(updateSubscriptionSchema),
  updateSubscription
);
router.patch('/avatars', authenticate, upload.single('avatar'), updateAvatar);

module.exports = router;
