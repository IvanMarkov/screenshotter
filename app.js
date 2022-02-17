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

    await page.setViewport({
      width: 1366,
      height: 768,
    });

    await page.evaluateOnNewDocument((data) => {
      window.chart_data = {};
      window.chart_data = data;
    }, req.body);

    await page.goto("http://localhost:3000/service", {
      waitUntil: "networkidle0",
    });

    const chartWrapper = await page.$("#chart-wrapper");
    const chartWrapperBox = await chartWrapper.boundingBox();
    const tableChart = await page.$("#table-chart");
    if (!!tableChart) {
      const tableChartBox = await tableChart.boundingBox();
      const screenshot = await tableChart.screenshot({
        path: "service.png",
        clip: {
          x: chartWrapperBox.x,
          y: chartWrapperBox.y,
          width: Math.min(tableChartBox.width, page.viewport().width),
          height: Math.max(tableChartBox.height, page.viewport().height),
        },
      });
      // console.log(screenshot);
    } else {
      const screenshot = await page.screenshot({
        path: "service.png",
        clip: {
          x: chartWrapperBox.x,
          y: chartWrapperBox.y,
          width: Math.min(chartWrapperBox.width, page.viewport().width),
          height: Math.min(chartWrapperBox.height, page.viewport().height),
        },
      });
      // console.log(screenshot);
    }

    await browser.close();
  })();
});

app.listen(3001, function () {
  console.log("CORS-enabled web server listening on port 3001");
});
