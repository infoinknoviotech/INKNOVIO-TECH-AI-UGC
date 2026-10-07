const serverless = require('serverless-http');
const app = require('../../server');

const expressHandler = serverless(app);
const functionPath = '/.netlify/functions/api';

exports.handler = (event, context) => {
  const requestPath = event.path || '/';
  const appPath = requestPath.startsWith(functionPath)
    ? requestPath.slice(functionPath.length) || '/'
    : requestPath;

  return expressHandler({ ...event, path: appPath }, context);
};
