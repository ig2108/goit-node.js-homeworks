const { Router } = require('express');
const contactController = require('./contact.controller');

const contactRouter = Router();

contactRouter.post(
  '/',
  contactController.validateCreateContact,
  contactController.createContact,
);

contactRouter.get('/', contactController.getContacts);

contactRouter.get(
  '/:id',
  contactController.validateId,
  contactController.getContactById,
);

contactRouter.delete(
  '/:id',
  contactController.validateId,
  contactController.deleteContactById,
);

contactRouter.put(
  '/:id',
  contactController.validateId,
  contactController.validateUpdateContact,
  contactController.updateContactById,
);

module.exports = contactRouter;
