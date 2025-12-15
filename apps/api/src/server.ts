import { createServer } from 'node:http';

import { createApp } from './serverApp.js';

const port = Number(process.env.PORT ?? 4000);

const app = createApp();
const server = createServer(app);

server.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`[api] listening on http://localhost:${port}`);
});


