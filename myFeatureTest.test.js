const puppeteer = require("puppeteer");
const nock = require("nock");
const useNock = require("nock-puppeteer");
const path = "file://" + __dirname + "/src/index.html";
let page;
let browser;
const metadata = { id: "601375f8ef99c57c734b5334", private: true };
const mockToDos = [
  {
    text: "first task input",
    priority: "1",
    date: new Date("2021-02-02"),
  },
  {
    text: "second task input",
    priority: "4",
    date: new Date(),
  },
];

const mocks = {
  initBin: {
    record: {
      "my-todo": [],
    },
    metadata,
  },
  toDoAddResponse: {
    record: {
      "my-todo": mockToDos.slice(0, 1),
    },
    metadata,
  },
  toDoAddSecondResponse: {
    record: {
      "my-todo": mockToDos,
    },
    metadata,
  },
  fetchTest: {
    record: {
      "my-todo": [
        {
          text: `only fetch will pass me haha magic number: ${Math.floor(
            Math.random() * 1000000
          )}`,
          priority: "1",
          date: new Date(),
        },
      ],
      metadata,
    },
  },
};

jest.setTimeout(20000);
const projectName = "pre.Todo App";
describe(projectName, () => {
  beforeAll(async () => {
    browser = await puppeteer.launch({
      headless: false, // Uncomment me to see tests running in browser
      args: ["--disable-web-security"],
      slowMo: 50, // Uncomment and change me to slow down tests speed in browser.
    });
    page = await browser.newPage();
    useNock(page, ["https://api.jsonbin.io/v3"]);
    // await full4s.beforeAll();
  });
  afterEach(async () => {
    // await full4s.afterEach(page);
  });
  afterAll(async () => {
    // await full4s.afterAll(projectName);
    await browser.close();
  });
  test("The copy-button copies the task", async () => {
    const mockToDo = mockToDos[0];
    const firstTaskText = mockToDo.text;
    const firstTaskPriority = mockToDo.priority;
    await page.goto(path, { waitUntil: "networkidle0" });
    await page.type("#text-input", "Let's see if you can copy");
    await page.select("#priority-selector", firstTaskPriority);
    await page.click("#add-button");
    await page.waitForSelector(".todo-text");
    const elements = await page.$$(".todo-text");
    const firstItem = await (
      await elements[0].getProperty("innerText")
    ).jsonValue();

    await page.waitForSelector(".todo-priority");
    let priorityElements = await page.$$(".todo-priority");
    const firstItemPriority = await (
      await priorityElements[0].getProperty("innerText")
    ).jsonValue();

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    await nock("https://api.jsonbin.io/v3")
      .get(/.*/)
      .reply(200, mocks.toDoAddSecondResponse);

    await page.goto(path, { waitUntil: "networkidle0" });
    priorityElements = await page.$$(".todo-priority");
    const copyBtn = await page.$$(".copy-button");
    await page.waitForSelector(".todo-container");
    await priorityElements[0].hover();
    await copyBtn[0].click();
    const input = await page.$("#text-input");
    await input.focus();
    await page.keyboard.down("Control");
    await page.keyboard.press("V");
    await page.keyboard.up("Control");
    const result = await (await input.getProperty("value")).jsonValue();
    const { text, priority, date } = mockToDos[0];
    expect(result).toBe(text + date.toISOString() + priority);
  });
});
