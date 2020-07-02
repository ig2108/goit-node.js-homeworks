const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const contactsRouter = require('./routers/contactsRouter');

const PORT = 3096;

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined'));

app.use('/', contactsRouter);

app.listen(PORT, () => {
  console.log('Started listening on port', PORT);
});
