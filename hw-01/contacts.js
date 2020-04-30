const fs = require("fs");
const path = require("path");
const { promises: fsPromises } = fs;

const contactsPath = path.join(__dirname, "./db/contacts.json");
let currentId = 10;

async function listContacts() {
  await fsPromises
    .readFile(contactsPath, "utf-8")
    .then((contacts) => {
      console.table(JSON.parse(contacts));
    })
    .catch((err) => console.warn(err));
}

async function getContactById(contactId) {
  await fsPromises
    .readFile(contactsPath, "utf-8")
    .then((contacts) =>
      JSON.parse(contacts).find((contact) => contact.id === contactId)
    )
    .then((contact) => console.table(contact))
    .catch((err) => console.warn(err));
}

async function removeContact(contactId) {
  await fsPromises
    .readFile(contactsPath, "utf-8")
    .then((contacts) => JSON.parse(contacts))
    .then((contacts) => contacts.filter((contact) => contact.id !== contactId))
    .then((contacts) => JSON.stringify(contacts))
    .then((contacts) => fsPromises.writeFile(contactsPath, contacts))
    .then(() => fsPromises.readFile(contactsPath, "utf-8"))
    .then((contacts) => console.table(JSON.parse(contacts)))
    .catch((err) => console.warn(err));
}

async function addContact(name, email, phone) {
  currentId += 1;
  await fsPromises
    .readFile(contactsPath, "utf-8")
    .then((contacts) => JSON.parse(contacts))
    .then((contacts) => [
      ...contacts,
      {
        id: currentId,
        name,
        email,
        phone,
      },
    ])
    .then((contacts) => JSON.stringify(contacts))
    .then((contacts) => fsPromises.writeFile(contactsPath, contacts))
    .then(() => fsPromises.readFile(contactsPath, "utf-8"))
    .then((contacts) => console.table(JSON.parse(contacts)))
    .catch((err) => console.warn(err));
}

module.exports = {
  listContacts,
  getContactById,
  removeContact,
  addContact,
};
