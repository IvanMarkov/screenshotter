var cors = require("cors");
var bodyParser = require("body-parser");
const express = require("express");
const puppeteer = require("puppeteer");

const app = express();
app.use(cors());
app.options("*", cors());

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.post("/screenshot", function (req, res) {
  res.send("test");
  (async () => {
    const browser = await puppeteer.launch({
      headless: true,
    });
    const page = await browser.newPage();

    await page.evaluateOnNewDocument((data) => {
      window.chart_data = {};
      window.chart_data = data;
    }, req.body);

    await page.goto("http://localhost:3000/service", {
      waitUntil: "networkidle0",
    });

    await page.waitForTimeout(2000);

    const screenshot = await page.screenshot({
      path: "service.png",
      fullPage: true,
    });
    console.log(screenshot);
    await browser.close();
  })();
});

app.listen(3001, function () {
  console.log("CORS-enabled web server listening on port 3001");
});
