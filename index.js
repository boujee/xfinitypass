'use strict';

const {Builder, By, Key, until} = require('selenium-webdriver');
const path = require('path');

// from developer.mozilla.org Math
function rng(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randEmail(firstName, lastName) {
  const seed = rng(100000000, 999999999);
  return `${firstName}.${lastName}.${seed}@mail.com`;
}

function randZip() {
  return String(rng(10000, 99999));
}

function genPassword() {
  const seed = rng(100, 999);
  return `mypassword${seed}`;
}

function genCar() {
  const seed = rng(100, 999);
  return `Toyota ${seed}`;
}

async function selectPass(driver) {
  const path = By.xpath('//span[text()="Complimentary Hour Pass"]');
  await driver.wait(until.elementLocated(path));
  await driver.findElement(path).click();
  await driver.findElement(By.id('continueButton')).click();
}

async function register(driver) {
  await driver.wait(until.elementLocated(By.id('registerFirstName'))).sendKeys('John');
  await driver.findElement(By.id('registerLastName')).sendKeys('Smith');
  await driver.findElement(By.id('registerEmail')).sendKeys(randEmail('John', 'Smith'));
  await driver.findElement(By.id('registerZipCode')).sendKeys(randZip());
  const continueButton = driver.findElement(By.id('registerContinueButton'));
  await driver.wait(until.elementIsEnabled(continueButton));
  await continueButton.click();
}

async function fillPasswords(driver, password) {
  // the JS inside page interferes with sendKeys
  await driver.executeScript(`
    document.getElementById('password').setAttribute('value', '${password}');
    document.getElementById('passwordRetype').setAttribute('value', '${password}');
  `);
}

async function createUser(driver) {
  await driver.wait(until.elementLocated(By.id('usePersonalEmail'))).click();
  await fillPasswords(driver, genPassword());
  await driver.findElement(By.id('dk0-combobox')).click();
  const option = driver.findElement(By.id('dk0-What-was your first car (make and model)?'));
  await driver.wait(until.elementIsVisible(option));
  await option.click();
  await driver.findElement(By.id('secretAnswer')).sendKeys(genCar());
  await driver.findElement(By.id('submitButton')).click();
}

async function activate(driver) {
  const element = await driver.wait(until.elementLocated(By.id('orderConfirmationActivatePass')));
  await driver.wait(until.elementIsVisible(element));
  // sleeping to avoid element not clickable
  await driver.sleep(3000);
  await element.click();
  const div = await driver.wait(until.elementLocated(By.id('orderConfirmationActive')));
  await driver.wait(until.elementTextContains(div, 'Your pass is now active'));
  await driver.wait(until.urlContains('wifilogin.xfinity.com/xwod_ftue.php'));
}

async function run() {
  const driver = await new Builder().forBrowser('firefox').build();
  await driver.get('http://google.com');
  await driver.findElement(By.id('amdocs_signup')).click();
  await selectPass(driver);
  await register(driver);
  await createUser(driver);
  await activate(driver);
  await driver.close();
}

function getBinPath() {
  return path.join(__dirname, 'node_modules', '.bin');
}

module.exports = {run, getBinPath};