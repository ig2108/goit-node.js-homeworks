const express = require('express');

const contactsRouter = express.Router();
const contactsControllers = require('../controllers/contactsControllers');

contactsRouter.get('/contacts', contactsControllers.listContacts);
contactsRouter.get('/contacts/:contactId', contactsControllers.getContactById);
contactsRouter.post('/contacts', contactsControllers.addContact);
contactsRouter.delete(
  '/contacts/:contactId',
  contactsControllers.removeContact,
);
contactsRouter.patch('/contacts/:contactId', contactsControllers.updateContact);

module.exports = contactsRouter;
