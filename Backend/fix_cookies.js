
import fs from 'fs';
import path from 'path';

const filePath = 'd:/Programming/NIT/Backend/src/controller/auth.controller.js';
let content = fs.readFileSync(filePath, 'utf8');

// Use regex to replace the secure and sameSite flags in both places
content = content.replace(
  /secure: true,\s+sameSite: "none"/g,
  'secure: false, // Updated for local testing (http)\n            sameSite: "lax"'
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('✅ Updated auth.controller.js cookie flags.');
