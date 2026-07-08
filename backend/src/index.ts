import { createApp } from './app.js';
import { assertEnv, env } from './config/env.js';

assertEnv();

createApp().listen(env.port, () => {
  console.log(`GrowEasy import API running at http://localhost:${env.port}`);
});
