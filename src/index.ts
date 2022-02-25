import cors from "cors";
import fs from "fs";
import bodyParser from "body-parser";
import express from "express";
import puppeteer from "puppeteer";
import dotenv from "dotenv";

if (!fs.existsSync("screenshots")) {
  fs.mkdirSync("screenshots");
}

dotenv.config();
const app = express();
app.use(cors());
app.options("*", cors());
const port = process.env.PORT;
const clientUrl = process.env.CLIENT_URL;

app.use(bodyParser.urlencoded({ extended: true, limit: "50mb" }));
app.use(bodyParser.json({ limit: "50mb" }));

app.post("/screenshot", function (req, res) {
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
      (window as any).chart_data = {};
      (window as any).chart_data = data;
    }, req.body);

    await page.goto(`${clientUrl}/service`);
    const chartWrapper = await page.$("#chart-wrapper");
    const chartWrapperBox = await chartWrapper?.boundingBox();
    const tableChart = await page.$("#table-chart");
    if (!!chartWrapper) {
      if (!!tableChart) {
        const tableChartBox = await tableChart.boundingBox();
        const screenshot = await tableChart.screenshot({
          clip: {
            x: chartWrapperBox?.x,
            y: chartWrapperBox?.y,
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
    } else {
      const screenshot = await page.screenshot({ encoding: "base64" });
      let base64Encode = `data:image/png;base64,${screenshot}`;
      res.contentType("image/jpeg");
      await res.send(base64Encode);
    }

    await browser.close();
  })();
});

app.listen(port, function () {
  console.log(`Screenshotter is running on port ${port}`);
});
