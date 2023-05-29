import compression from 'compression';
import cors from 'cors';
import express from 'express';
import { initFirebase } from './firebase/firebase_admin';

import Logger from './logger/logger';
import morganMiddleware from './middleware/morganMiddleware';

require('dotenv').config();

/* ------------------------------ NOTE Express ------------------------------ */
const PORT = process.env.PORT || 5777;
const app = express();
app.use(cors());
app.use(express.json());
app.use(compression({ level: 7 }));
app.use(morganMiddleware);

(async function () {
  try {
    await initFirebase();
    app.listen(PORT, () => {
      Logger.info(`Server Started at Port, http://localhost:${PORT}`);
    });
  } catch (error: any) {
    Logger.error(error);
  }
})();

/* ------------------------------- NOTE ROUTES ------------------------------ */
app.get('/', (req, res) => {
  res.send(`A working server lies here!`);
});

const stripeRouter = require('./routes/stripe');
app.use('/stripe', stripeRouter);

const usersRouter = require('./routes/users');
app.use('/users', usersRouter);

const contactRouter = require('./routes/contact');
app.use('/contact', contactRouter);

const notificationsRouter = require('./routes/notifications');
app.use('/notifications', notificationsRouter);
