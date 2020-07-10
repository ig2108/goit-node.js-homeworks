const Joi = require('joi');
// Joi.objectId = require('joi-objectid')(Joi);
const bcryptjs = require('bcryptjs');
const userModel = require('./user.model');
const jwt = require('jsonwebtoken');
const {
  UnauthorizedError,
  NotFoundError,
} = require('../helpers/errors.constructors');
const {
  Types: { ObjectId },
} = require('mongoose');

class UserController {
  constructor() {
    this._costFactor = 4;
  }

  // GETTERS

  get createUser() {
    return this._createUser.bind(this);
  }
  get getUsers() {
    return this._getUsers.bind(this);
  }
  get getUserById() {
    return this._getUserById.bind(this);
  }
  get getCurrentUser() {
    return this._getCurrentUser.bind(this);
  }

  // CREATE

  async _createUser(req, res, next) {
    try {
      const { password, email, subscription } = req.body;
      const passwordHash = await bcryptjs.hash(password, this._costFactor);

      const existingUser = await userModel.findUserByEmail(email);
      if (existingUser) {
        return res.status(409).json({ message: 'Email in use' });
      }

      const user = await userModel.create({
        email,
        password: passwordHash,
        subscription,
      });

      return res.status(201).json({
        email: user.email,
        subscription: user.subscription,
      });
    } catch (error) {
      next(error);
    }
  }

  // SIGNIN

  async signIn(req, res, next) {
    try {
      const { email, password } = req.body;

      const user = await userModel.findUserByEmail(email);
      if (!user) {
        return res.status(401).send({ message: 'Email or password is wrong' });
      }

      const isPasswordValid = await bcryptjs.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).send({ message: 'Email or password is wrong' });
      }

      const token = await jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: 2 * 24 * 60 * 60, // 2 days
      });
      await userModel.updateToken(user._id, token);

      return res.status(200).json({
        email: user.email,
        subscription: user.subscription,
        token,
      });
    } catch (error) {
      next(error);
    }
  }

  // LOGOUT

  async logOut(req, res, next) {
    try {
      const user = req.user;
      await userModel.updateToken(user._id, null);

      return res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  // READ

  async _getUsers(req, res, next) {
    try {
      const user = await userModel.find();
      return res.status(200).json(this.prepareUsersResponse(users));
    } catch (error) {
      next(error);
    }
  }

  async _getUserById(req, res, next) {
    try {
      const userId = req.params.id;

      const user = await userModel.findById(userId);
      if (!user) {
        return res.status(404).send();
      }

      const [userForResponse] = this.prepareUsersResponse([user]);

      return res.status(200).json(userForResponse);
    } catch (error) {
      next(error);
    }
  }

  async _getCurrentUser(req, res, next) {
    try {
      const [userForResponse] = this.prepareUsersResponse([req.user]);

      return res.status(200).json(userForResponse);
    } catch (error) {
      next(error);
    }
  }

  // DELETE

  async deleteUserById(req, res, next) {
    try {
      const userId = req.params.id;

      const deletedUser = await userModel.findByIdAndDelete(userId);
      if (!deletedUser) {
        return res.status(404).send();
      }

      return res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  // UPDATE

  async updateUserById(req, res, next) {
    try {
      const userId = req.params.id;

      const updatedUser = await userModel.findUserByIdAndUpdate(
        userId,
        req.body,
      );
      if (!updatedUser) {
        return res.status(404).send();
      }
      return res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  // AUTHORIZE

  async authorize(req, res, next) {
    try {
      // 1. витягнути токен користувача з заголовка Authorization
      const authorizationHeader = req.get('Authorization');
      const token = authorizationHeader.replace('Bearer ', '');

      // 2. витягнути id користувача з пейлоада або вернути користувачу
      // помилку зі статус кодом 401
      let userId;
      try {
        userId = await jwt.verify(token, process.env.JWT_SECRET).id;
      } catch (err) {
        next(new UnauthorizedError('Not authorized'));
      }

      // 3. витягнути відповідного користувача. Якщо такого немає - викинути
      // помилку зі статус кодом 401
      // userModel - модель користувача в нашій системі
      const user = await userModel.findById(userId);
      if (!user || user.token !== token) {
        throw new UnauthorizedError('Not authorized');
      }

      // 4. Якщо все пройшло успішно - передати запис користувача і токен в req
      // і передати обробку запиту на наступний middleware
      req.user = user;
      req.token = token;

      next();
    } catch (err) {
      next(err);
    }
  }

  // VALIDATION FUNCTIONS

  validateCreateUser(req, res, next) {
    const validationRules = Joi.object({
      email: Joi.string().required(),
      subscription: Joi.string().required(),
      password: Joi.string().required(),
    });

    const validationResult = Joi.validate(req.body, validationRules);
    if (validationResult.error) {
      return res.status(400).send(validationResult.error);
    }

    next();
  }

  validateUpdateUser(req, res, next) {
    const validationRules = Joi.object({
      email: Joi.string(),
      subscription: Joi.string(),
      password: Joi.string(),
    });

    const validationResult = Joi.validate(req.body, validationRules);
    if (validationResult.error) {
      return res.status(400).send(validationResult.error);
    }

    next();
  }

  validateId(req, res, next) {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).send();
    }

    next();
  }

  validateSignIn(req, res, next) {
    const validationRules = Joi.object({
      email: Joi.string(),
      password: Joi.string(),
    });

    const validationResult = Joi.validate(req.body, validationRules);
    if (validationResult.error) {
      return res.status(400).send(validationResult.error);
    }

    next();
  }

  prepareUsersResponse(users) {
    return users.map(user => {
      const { email, subscription, _id } = user;

      return { id: _id, email, subscription };
    });
  }
}

module.exports = new UserController();
