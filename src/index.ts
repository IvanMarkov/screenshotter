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

    if (req.body.is_dashboard) {
      await page.goto(`${clientUrl}/service-dashboard`);
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
    } else if (req.body.is_network) {
      await page.goto(`${clientUrl}/service-network`);
      const screenshot = await page.screenshot({
        encoding: "base64",
      });
      let base64Encode = `data:image/png;base64,${screenshot}`;
      res.contentType("image/jpeg");
      await res.send(base64Encode);
    }
    if (req.body.is_keywords) {
      await page.goto(`${clientUrl}/service-keywords`);
      await page.setViewport({
        width: 1920,
        height: 1080,
      });
      const keywordsChart = await page.$("#keywords-chart");
      const keywordsChartBox = await keywordsChart?.boundingBox();
      const filterContainer = await page.$("#filter-container");
      const filterContainerBox = await filterContainer?.boundingBox();
      const filterHeight = filterContainerBox?.height
        ? Math.round(filterContainerBox?.height)
        : 0;
      await page.setViewport({
        width: 1920,
        height: Math.round(keywordsChartBox?.height) + filterHeight + 16,
      });
      const screenshot = await page.screenshot({
        encoding: "base64",
      });
      let base64Encode = `data:image/png;base64,${screenshot}`;
      res.contentType("image/jpeg");
      await res.send(base64Encode);
    }
    if (req.body.is_feedback) {
      await page.goto(`${clientUrl}/service-feedback`);
      await page.setViewport({
        width: 1920,
        height: 1080,
      });
      const postWrapper = await page.$("#post-wrapper");
      const postWrapperBox = await postWrapper?.boundingBox();
      const filterContainer = await page.$("#filter-container");
      const filterContainerBox = await filterContainer?.boundingBox();
      const filterHeight = filterContainerBox?.height
        ? Math.round(filterContainerBox?.height)
        : 0;
      await page.setViewport({
        width: 1920,
        height: Math.round(postWrapperBox?.height) + filterHeight + 16,
      });
      const screenshot = await page.screenshot({
        encoding: "base64",
      });
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
