const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const contactRouter = require('./contacts/contact.router');
const userRouter = require('./users/user.router');

require('dotenv').config();

module.exports = class ContactServer {
  constructor() {
    this.server = null;
  }

  async start() {
    this.initServer();
    this.initMiddlewares();
    this.initRoutes();
    await this.initDataBase();
    this.startListening();
  }

  initServer() {
    this.server = express();
  }

  initMiddlewares() {
    this.server.use(cors({ origin: '*' }));
    this.server.use(express.json());
    this.server.use(express.urlencoded({ extended: true }));
    this.server.use(morgan('combined'));
  }

  initRoutes() {
    this.server.use('/contacts', contactRouter);
    this.server.use('/users', userRouter);
    this.server.use('/auth', userRouter);
  }

  async initDataBase() {
    try {
      await mongoose.connect(process.env.MONGODB_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
      });
      console.log('Contacts database connection successful!');
    } catch (error) {
      console.log(err);
      process.exit(1);
    }
  }

  startListening() {
    const PORT = process.env.PORT;

    this.server.listen(PORT, () => {
      console.log('Server started listening on port', PORT);
    });
  }
};
