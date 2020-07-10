const { Router } = require('express');
const userController = require('./user.controller');

const userRouter = Router();

// CREATE & REGISTER

userRouter.post(
  '/register',
  userController.validateCreateUser,
  userController.createUser,
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

// EXPORT

module.exports = userRouter;
