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

// CREATE & REGISTER

userRouter.post(
  '/register',
  userController.validateCreateUser,
  userController.createUser,
);

userRouter.post(
  '/avatar',
  upload.single('avatar'),
  userController.minifyImage,
  (req, res, next) => {
    res.status(200).json(req.file);
  },
);

// LOGIN

userRouter.post('/login', userController.validateSignIn, userController.signIn);

//LOGOUT

userRouter.post('/logout', userController.authorize, userController.logOut);

// READ

userRouter.get(
  '/current',
  userController.authorize,
  userController.getCurrentUser,
);

userRouter.get('/', userController.getUsers);

userRouter.get('/:id', userController.validateId, userController.getUserById);

// DELETE

userRouter.delete(
  '/:id',
  userController.validateId,
  userController.deleteUserById,
);

// UPDATE

userRouter.put(
  '/:id',
  userController.validateId,
  userController.validateUpdateUser,
  userController.updateUserById,
);

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
