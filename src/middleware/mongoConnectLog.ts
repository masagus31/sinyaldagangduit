import { RequestHandler } from 'express';
import mongoose, { Document, Model, Schema } from 'mongoose';

const mongoConnectLogs: RequestHandler = (req, res, next) => {
  console.info('checkCachedMongoConnId', (global as any).cachedMongoConnId);
  console.log('mongoose.connection.listenerCount', mongoose.connection.listenerCount(''));
  console.log('mongoose.connection.getMaxListeners', mongoose.connection.getMaxListeners());
  return next();
};

export { mongoConnectLogs };
