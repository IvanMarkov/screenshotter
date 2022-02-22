var cors = require("cors");
const fs = require("fs");
var bodyParser = require("body-parser");
const express = require("express");
const puppeteer = require("puppeteer");

if (!fs.existsSync("screenshots")) {
  fs.mkdirSync("screenshots");
}

const app = express();
app.use(cors());
app.options("*", cors());

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.post("/screenshot", function (req, res) {
  (async () => {
    const lastIndex = fs
      .readdirSync("screenshots")
      .pop()
      ?.split("_")[1]
      .split(".")[0];

    const browser = await puppeteer.launch({
      headless: true,
    });

    const page = await browser.newPage();

    await page.setViewport({
      width: 1366,
      height: 768,
    });

    await page.evaluateOnNewDocument((data) => {
      window.chart_data = {};
      window.chart_data = data;
    }, req.body);

    await page.goto("http://localhost:3000/service");
    const chartWrapper = await page.$("#chart-wrapper");
    const chartWrapperBox = await chartWrapper.boundingBox();
    const tableChart = await page.$("#table-chart");
    if (!!tableChart) {
      const tableChartBox = await tableChart.boundingBox();
      const screenshot = await tableChart.screenshot({
        path: `screenshots/screenshot_${lastIndex ? +lastIndex + 1 : 0}.png`,
        clip: {
          x: chartWrapperBox.x,
          y: chartWrapperBox.y,
          width: Math.min(tableChartBox.width, page.viewport().width),
          height: tableChartBox.height + 53,
        },
        encoding: "base64",
      });
      let base64Encode = `data:image/png;base64,${screenshot}`;
      res.contentType("image/jpeg");
      await res.send(base64Encode);
    } else {
      const screenshot = await page.screenshot({
        path: `screenshots/screenshot_${lastIndex ? +lastIndex + 1 : 0}.png`,
        clip: {
          x: chartWrapperBox.x,
          y: chartWrapperBox.y,
          width: Math.min(chartWrapperBox.width, page.viewport().width),
          height: Math.min(chartWrapperBox.height, page.viewport().height),
        },
        encoding: "base64",
      });
      let base64Encode = `data:image/png;base64,${screenshot}`;
      res.contentType("image/jpeg");
      await res.send(base64Encode);
    }

    await browser.close();
  })();
});

app.listen(3001, function () {
  console.log("CORS-enabled web server listening on port 3001");
});
