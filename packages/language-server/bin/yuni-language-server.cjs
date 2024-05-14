#!/usr/bin/env node

if (process.argv.includes("--version")) {
  const { version } = require("../package.json");
  console.log(version);
} else {
  require("../dist/index.js")
}