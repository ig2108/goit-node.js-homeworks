const { Router } = require('express');
const multer = require('multer');
const path = require('path');
const userController = require('./user.controller');

const userRouter = Router();

// MULTER

const storage = multer.diskStorage({
  destination: 'tmp',
  filename: function (req, file, cb) {
    const ext = path.parse(file.originalname).ext;
    cb(null, Date.now() + ext);
  },
});

const upload = multer({ storage: storage });

// POST

// Create & Register

userRouter.post(
  '/register',
  userController.validateCreateUser,
  userController.createUser,
);

// Create avatar

userRouter.post(
  '/avatar',
  upload.single('avatar'),
  userController.minifyImage,
  (req, res, next) => {
    res.status(200).json(req.file);
  },
);

// Login

userRouter.post('/login', userController.validateSignIn, userController.signIn);

// Logout

userRouter.post('/logout', userController.authorize, userController.logOut);

// GET

// Current user

userRouter.get(
  '/current',
  userController.authorize,
  userController.getCurrentUser,
);

// All users

userRouter.get('/', userController.getUsers);

// User by id

userRouter.get('/:id', userController.validateId, userController.getUserById);

// Verify email

userRouter.get('/verify/:verificationToken', userController.verifyEmail);

// DELETE

userRouter.delete(
  '/:id',
  userController.validateId,
  userController.deleteUserById,
);

// UPDATE

// Update user

userRouter.put(
  '/:id',
  userController.validateId,
  userController.validateUpdateUser,
  userController.updateUserById,
);

// Update avatar

userRouter.patch(
  '/avatar',
  upload.single('avatar'),
  userController.minifyImage,
  userController.updateAvatar,
  (req, res, next) => {
    res.status(200).send({ message: 'Avatar successfully updated' });
  },
);

// EXPORT

module.exports = userRouter;
