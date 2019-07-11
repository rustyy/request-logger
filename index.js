const program = require('commander');
const errorLogger = require('./lib/error-logger');

program
  .version('0.0.1')
  .command('failedRequest <url>')
  .option('-o, --output <output>', 'Output directory', './results')
  .option('-i, --interval <interval>', 'Request interval in ms', 10000)
  .option('-d, --device <Device>', 'Emulated device', 'Nexus 5')
  .action((url, cmd) => {
    const options = {
      url,
      output: cmd.output,
      interval: cmd.interval,
      device: cmd.device
    };

    errorLogger(options);
  });

program.parse(process.argv);
