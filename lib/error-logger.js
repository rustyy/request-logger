const { existsSync, mkdirSync, writeFileSync } = require('fs');
const { join } = require('path');
const puppeteer = require('puppeteer');

async function log({ url, device }) {
  const DEVICE = puppeteer.devices[device];
  const errors = [];
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  try {
    await page.emulate(DEVICE);
  } catch (e) {
    console.log(e);
    process.exit();
  }

  page.on('requestfailed', req => {
    const result = {};
    result.headers = req.headers();
    result.url = req.url();
    result.errorText = req.failure().errorText;
    errors.push(result);
  });

  try {
    await page.goto(url, { waitUntil: 'networkidle0' });
  } catch (e) {
    console.error(e); // eslint-disable-line no-console
    process.exit(1);
  }

  await browser.close();

  return errors;
}

async function run({ url, output, device }) {
  const d = new Date();
  const ts = d.getTime();

  let errors = [];

  console.log(`START run ${d} - ${ts}`); // eslint-disable-line no-console

  const reqError = await log({ url, device });
  errors = [...errors, ...reqError];

  if (reqError.length) {
    if (existsSync(output) === false) {
      mkdirSync(output);
    }

    writeFileSync(join(output, `${ts}.json`), JSON.stringify(errors));
  }

  console.log(`END run - errors: ${errors.length}`); // eslint-disable-line no-console
}

module.exports = async ({ url, interval, output, device }) => {
  await run({ url, output, device });
  setInterval(() => run({ url, output, device }), interval);
};
