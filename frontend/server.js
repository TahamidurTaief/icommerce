// server.js
const { exec } = require('child_process');

// This command will run 'npm start', which should be configured in your package.json
// to execute 'next start'. This allows Next.js to handle its own server and port.
console.log('Starting Next.js application via npm start...');
const child = exec('npm start', (error, stdout, stderr) => {
    if (error) {
        console.error(`exec error: ${error}`);
        return;
    }
    console.log(`stdout: ${stdout}`);
    console.error(`stderr: ${stderr}`);
});

child.stdout.on('data', (data) => {
    console.log(`Next.js stdout: ${data}`);
});

child.stderr.on('data', (data) => {
    console.error(`Next.js stderr: ${data}`);
});

child.on('close', (code) => {
    console.log(`Next.js process exited with code ${code}`);
});

// Keep the process alive, as cPanel's Node.js app requires a running process
// This is a minimal way to keep it running; 'npm start' usually takes over.
// If issues arise, consider a more robust custom server as shown in Next.js docs.
setInterval(() => {}, 1000); // Keep process alive