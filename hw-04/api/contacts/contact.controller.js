const Joi = require('joi');
const contactModel = require('./contact.model');
const {
  Types: { ObjectId },
} = require('mongoose');

class ContactController {
  // CREATE
  async createContact(req, res, next) {
    try {
      const contact = await contactModel.create(req.body);

      return res.status(201).json(contact);
    } catch (error) {
      next(error);
    }
  }

  // READ

  async getContacts(req, res, next) {
    try {
      const contacts = await contactModel.find();
      return res.status(200).json(contacts);
    } catch (error) {
      next(error);
    }
  }

  async getContactById(req, res, next) {
    try {
      const contactId = req.params.id;

      const contact = await contactModel.findById(contactId);
      if (!contact) {
        return res.status(404).send();
      }

      return res.status(200).json(contact);
    } catch (error) {
      next(error);
    }
  }

  // DELETE

  async deleteContactById(req, res, next) {
    try {
      const contactId = req.params.id;

      const deletedContact = await contactModel.findByIdAndDelete(contactId);
      if (!deletedContact) {
        return res.status(404).send();
      }

      return res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  // UPDATE

  async updateContactById(req, res, next) {
    try {
      const contactId = req.params.id;

      const updatedContact = await contactModel.findContactByIdAndUpdate(
        contactId,
        req.body,
      );
      if (!updatedContact) {
        return res.status(404).send();
      }
      return res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  // VALIDATION FUNCTIONS

  validateCreateContact(req, res, next) {
    const validationRules = Joi.object({
      name: Joi.string().required(),
      email: Joi.string().required(),
      phone: Joi.string().required(),
    });
    const validationResult = Joi.validate(req.body, validationRules);
    if (validationResult.error) {
      return res.status(400).send(validationResult.error);
    }

    next();
  }

  validateUpdateContact(req, res, next) {
    const validationRules = Joi.object({
      name: Joi.string(),
      email: Joi.string(),
      phone: Joi.string(),
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
}

module.exports = new ContactController();
