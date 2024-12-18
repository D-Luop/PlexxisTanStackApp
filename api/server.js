const express = require('express');
const fs = require('fs');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = 5000;
const CONTACTS_FILE = './contacts.json';

app.use(cors());
app.use(bodyParser.json());

// Utility Function: Shift IDs after Deletion
const shiftIdsAfterDelete = (contacts, deletedId) => {
  return contacts.map((contact) => {
    if (contact.id > deletedId) {
      return { ...contact, id: contact.id - 1 }; // Decrement ID by 1
    }
    return contact;
  });
};

app.put('/contacts/:id', (req, res) => {
  const contactId = parseInt(req.params.id, 10);
  const updatedContact = req.body;

  fs.readFile(CONTACTS_FILE, 'utf8', (err, data) => {
    if (err) return res.status(500).json({ error: 'Failed to read data' });

    const contacts = JSON.parse(data);
    const contactIndex = contacts.findIndex((contact) => contact.id === contactId);

    if (contactIndex === -1) {
      return res.status(404).json({ error: 'Contact not found' });
    }

    // Update contact details
    contacts[contactIndex] = { ...contacts[contactIndex], ...updatedContact };

    fs.writeFile(CONTACTS_FILE, JSON.stringify(contacts, null, 2), (err) => {
      if (err) return res.status(500).json({ error: 'Failed to save data' });
      res.json(contacts[contactIndex]);
    });
  });
});

// GET: Fetch all contacts
app.get('/contacts', (req, res) => {
  fs.readFile(CONTACTS_FILE, 'utf8', (err, data) => {
    if (err) return res.status(500).json({ error: 'Failed to load data' });
    res.json(JSON.parse(data));
  });
});

// GET: Fetch a single contact by ID
app.get('/contacts/:id', (req, res) => {
  const contactId = parseInt(req.params.id);

  fs.readFile(CONTACTS_FILE, 'utf8', (err, data) => {
    if (err) return res.status(500).json({ error: 'Failed to load data' });

    const contacts = JSON.parse(data);
    const contact = contacts.find((c) => c.id === contactId);
    if (!contact) {
      return res.status(404).json({ error: 'Contact not found' });
    }

    res.json(contact);
  });
});

// POST: Add a new contact
app.post('/contacts', (req, res) => {
  const newContact = req.body;

  fs.readFile(CONTACTS_FILE, 'utf8', (err, data) => {
    if (err) return res.status(500).json({ error: 'Failed to read data' });

    let contacts = JSON.parse(data);

    // Assign the next sequential ID
    newContact.id = contacts.length+1;
    contacts.push(newContact);

    fs.writeFile(CONTACTS_FILE, JSON.stringify(contacts, null, 2), (err) => {
      if (err) return res.status(500).json({ error: 'Failed to save data' });
      res.status(201).json(newContact);
    });
  });
});

// DELETE: Remove a contact and shift IDs
app.delete('/contacts/:id', (req, res) => {
  const contactId = parseInt(req.params.id);

  fs.readFile(CONTACTS_FILE, 'utf8', (err, data) => {
    if (err) return res.status(500).json({ error: 'Failed to load data' });

    let contacts = JSON.parse(data);
    const initialLength = contacts.length;

    // Filter out the contact to delete
    contacts = contacts.filter((c) => c.id !== contactId);

    if (contacts.length === initialLength) {
      return res.status(404).json({ error: 'Contact not found' });
    }

    // Shift IDs for all contacts with higher IDs
    contacts = shiftIdsAfterDelete(contacts, contactId);

    fs.writeFile(CONTACTS_FILE, JSON.stringify(contacts, null, 2), (err) => {
      if (err) return res.status(500).json({ error: 'Failed to save data' });
      res.json({ message: 'Contact deleted successfully', updatedContacts: contacts });
    });
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
