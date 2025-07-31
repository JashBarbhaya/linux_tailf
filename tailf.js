const fs = require('fs');
const readline = require('readline');
const path = require('path');

/**
 * Print last N lines and then follow file for new lines, like tail -f.
 * @param {string} filePath - Path to the file to tail.
 * @param {number} n - Number of last lines to show initially.
 */
function tailf(filePath, n = 10) {
  // First print out the last n lines
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading file:', err.message);
      return;
    }
    const lines = data.split('\n');
    const tailLines = lines.slice(-n);
    tailLines.forEach(line => console.log(line));
    // Start following for new lines
    followFile(filePath, Buffer.byteLength(data));
  });
}

// Watch for new lines being appended to the file
function followFile(filePath, startPos) {
  let pos = startPos;
  fs.watchFile(filePath, { interval: 500 }, (curr, prev) => {
    if (curr.size > prev.size) {
      // New data added; read and print it
      const stream = fs.createReadStream(filePath, { start: pos, end: curr.size });
      const rl = readline.createInterface({ input: stream });
      rl.on('line', line => console.log(line));
      rl.on('close', () => { pos = curr.size; });
    }
  });
}

// CLI usage: node tailf.js /path/to/file.log [N]
if (require.main === module) {
  const [,, inputFile, n] = process.argv;
  if (!inputFile) {
    console.log('Usage: node tailf.js <filename> [N]');
    process.exit(1);
  }
  const resolvedPath = path.resolve(inputFile);
  tailf(resolvedPath, n ? Number(n) : 10);
}

// Export for testing or future extensions
module.exports = tailf;
