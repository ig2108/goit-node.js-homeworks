const fs = require('fs');
const path = require('path');
const Joi = require('joi');

const contactsPath = path.join(__dirname, '../db/contacts.json');
let currentId = 10;

const getContacts = () => JSON.parse(fs.readFileSync(contactsPath, 'utf-8'));

// @ GET /api/contacts
function listContacts(req, res, next) {
  const contacts = getContacts();
  res.status(200).send(contacts);
}

// @ GET /api/contacts/:contactId
function getContactById(req, res, next) {
  const contact = findContactById(req.params.contactId);
  if (contact) {
    res.status(200).send(contact);
  } else {
    res.status(404).json({ message: 'Contact not found' });
  }
}

// @ POST /api/contacts
function addContact(req, res, next) {
  currentId += 1;
  const { name, email, phone } = req.body;
  const errorMessage = { message: 'missing required name field' };
  const validationResult = validateContact(req.body);
  if (validationResult.error) {
    return res.status(400).send(errorMessage);
  } else {
    const newContact = {
      id: currentId,
      name,
      email,
      phone,
    };
    const contacts = getContacts();
    const updatedContacts = JSON.stringify([...contacts, newContact]);
    refreshContacts(res, updatedContacts, 201, newContact);
  }
}

// @ DELETE /api/contacts/:contactId
function removeContact(req, res, next) {
  const deletedMessage = { message: 'Contact deleted' };
  const notFoundMessage = { message: 'Contact not found' };
  if (findContactById(req.params.contactId)) {
    const updatedContacts = JSON.stringify(
      filterContactsByIdExclude(req.params.contactId),
    );
    refreshContacts(res, updatedContacts, 200, deletedMessage);
  } else {
    res.status(404).send(notFoundMessage);
  }
}

// @ PATCH /api/contacts/:contactId
function updateContact(req, res, next) {
  const { contactId } = req.params;
  const errorMessage = { message: 'missing required fields' };
  const notFoundMessage = { message: 'Not found' };
  const validationResult = validateUpdateContact(req.body);
  if (validationResult.error || Object.keys(req.body).length === 0) {
    return res.status(400).send(errorMessage);
  } else {
    const needToUpdateContact = findContactById(contactId);
    if (needToUpdateContact) {
      const filteredContacts = filterContactsByIdExclude(contactId);
      const patchedContact = {
        id: contactId,
        ...needToUpdateContact,
        ...req.body,
      };
      const updatedContacts = JSON.stringify([
        ...filteredContacts,
        patchedContact,
      ]);
      refreshContacts(res, updatedContacts, 200, patchedContact);
    } else {
      return res.status(404).send(notFoundMessage);
    }
  }
}

// HELPERS FUNCTION

function findContactById(id) {
  const contacts = getContacts();
  return (findContact = contacts.find(contact => contact.id === Number(id)));
}

function filterContactsByIdExclude(id, arr = getContacts()) {
  return (filteredContacts = arr.filter(contact => contact.id !== Number(id)));
}

function refreshContacts(
  res,
  refreshContacts,
  statusAccept = 200,
  messageComplete = 'Updated!',
) {
  fs.writeFile(contactsPath, refreshContacts, function (err) {
    if (err) return res.send(err);
    res.status(statusAccept).send(messageComplete);
  });
}

function validateContact(obj) {
  const contactRules = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().required(),
    phone: Joi.string().required(),
  });

  return (result = Joi.validate(obj, contactRules));
}
function validateUpdateContact(obj) {
  const contactRules = Joi.object({
    name: Joi.string(),
    email: Joi.string(),
    phone: Joi.string(),
  }).required();

  return (result = Joi.validate(obj, contactRules));
}

module.exports = {
  listContacts,
  getContactById,
  addContact,
  removeContact,
  updateContact,
};
