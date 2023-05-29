import fs from 'fs';
import morgan, { StreamOptions } from 'morgan';
import path from 'path';
const morganLogs = path.join(__dirname, '../../logs/morgan.log');

// Override the stream method by telling
// Morgan to use our custom logger instead of the console.log.
const stream: StreamOptions = {
  // Use the http severity
  // write: (message) => Logger.http(message)
  write: (message) => fs.createWriteStream(morganLogs, { flags: 'a' }).write(`${getDateTimeBogota()} ${message}`)
};

// Skip all the Morgan http log if the
// application is not running in development mode.
// This method is not really needed here since
// we already told to the logger that it should print
// only warning and error messages in production.
function skip(req: any, res: any) {
  return res.statusCode < 400;
}

// Build the morgan middleware
const morganMiddleware = morgan(
  // Define message format string (this is the default one).
  // The message format is made from tokens, and each token is
  // defined inside the Morgan library.
  // You can create your custom token to show what do you want from a request.
  `:method :url :status :res[content-length] - :response-time ms -IP:remote-addr`,
  // Options: in this case, I overwrote the stream and the skip logic.
  // See the methods above.
  { stream, skip }
);

export default morganMiddleware;

//get current time in bogota locale time and format YYYY-MM-DD HH:mm:ss
function getDateTimeBogota() {
  const date = new Date();
  const time = date.toLocaleTimeString('en-US', {
    hour12: false,
    timeZone: 'America/Bogota'
  });
  return `${date.toISOString().slice(0, 10)} ${time}`;
}
