const fs = require('fs');
const path = 'c:\\Users\\taham\\OneDrive\\Desktop\\icommerce\\frontend\\app\\confirmation\\page.js';

try {
  fs.unlinkSync(path);
  console.log('File deleted successfully');
} catch (error) {
  console.error('Error deleting file:', error.message);
}
