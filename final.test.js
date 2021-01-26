/**
 * @jest-environment node
 */
const puppeteer = require("puppeteer");
const full4s = require("@suvelocity/tester");
const nock = require("nock");
const useNock = require("nock-puppeteer");

const path = "file://" + __dirname + "/src/index.html";
let page;
let browser;

const mockToDos = [
  {
    text: "first task input",
    priority: "1",
    date: new Date(),
  },
  {
    text: "second task input",
    priority: "4",
    date: new Date(),
  },
];
const metadata = { id: "nvkdf48sd85jfnbvhfd72nd0", private: true };
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

jest.setTimeout(10000);
const projectName = "pre.Todo App";

describe(projectName, () => {
  beforeAll(async () => {
    browser = await puppeteer.launch({
      // headless: false, // Uncomment me to see tests running
      args: ["--disable-web-security"],
      // slowMo: 50, // Uncomment and change me to slow down tests speed.
    });
    page = await browser.newPage();
    useNock(page, ["https://api.jsonbin.io/v3"]);

    await full4s.beforeAll();
  });

  afterEach(async () => {
    await full4s.afterEach(page);
  });

  afterAll(async () => {
    await full4s.afterAll(projectName);
    await browser.close();
  });

  test("The todo list should be empty first", async () => {
    await nock("https://api.jsonbin.io/v3").get(/.*/).reply(200, mocks.initBin);

    await page.goto(path, { waitUntil: "networkidle0" });

    const elements = await page.$$(".todoText");
    expect(elements.length).toBe(0);
  });

  test("Can add todo task with text and priority", async () => {
    const mockToDo = mockToDos[0];
    const firstTaskText = mockToDo.text;
    const firstTaskPriority = mockToDo.priority;

    await nock("https://api.jsonbin.io/v3").get(/.*/).reply(200, mocks.initBin);

    await nock("https://api.jsonbin.io/v3")
      .put(/.*/, () => true)
      .reply(200, mocks.toDoAddResponse);

    await page.goto(path, { waitUntil: "networkidle0" });

    await page.type("#textInput", firstTaskText);
    await page.select("#prioritySelector", firstTaskPriority);
    await page.click("#addButton");

    await page.waitForSelector(".todoText");

    const elements = await page.$$(".todoText");
    const firstItem = await (
      await elements[0].getProperty("innerText")
    ).jsonValue();

    await page.waitForSelector(".todoPriority");

    const priorityElements = await page.$$(".todoPriority");
    const firstItemPriority = await (
      await priorityElements[0].getProperty("innerText")
    ).jsonValue();

    expect(elements.length).toBe(1);
    expect(firstItem).toBe(firstTaskText);
    expect(firstItemPriority).toBe(firstTaskPriority);
  });

  test("After add task the input should be empty", async () => {
    const mockToDo = mockToDos[1];
    const secondTaskText = mockToDo.text;
    const secondTaskPriority = mockToDo.priority;

    await nock("https://api.jsonbin.io/v3")
      .get(/.*/)
      .reply(200, mocks.toDoAddResponse);

    await nock("https://api.jsonbin.io/v3")
      .put(/.*/, () => true)
      .reply(200, mocks.toDoAddSecondResponse);

    await page.goto(path, { waitUntil: "networkidle0" });

    await page.waitForSelector("#textInput");

    await page.type("#textInput", secondTaskText);
    await page.select("#prioritySelector", secondTaskPriority);
    await page.click("#addButton");
    const inputElement = await page.$("#textInput");
    const currentInput = await (
      await inputElement.getProperty("value")
    ).jsonValue();
    expect(currentInput).toBe("");
  });

  test("Task should be added in the end of the list", async () => {
    await nock("https://api.jsonbin.io/v3")
      .get(/.*/)
      .reply(200, mocks.toDoAddSecondResponse);

    await page.goto(path, { waitUntil: "networkidle0" });

    const mockToDo = mockToDos[1];

    await page.waitForSelector(".todoText");
    const elements = await page.$$(".todoText");
    const secondItem = await (
      await elements[1].getProperty("innerText")
    ).jsonValue();

    const priorityElements = await page.$$(".todoPriority");
    const secondItemPriority = await (
      await priorityElements[1].getProperty("innerText")
    ).jsonValue();
    expect(secondItem).toBe(mockToDo.text);
    expect(secondItemPriority).toBe(mockToDo.priority);
  });

  test("Counter increase", async () => {
    await nock("https://api.jsonbin.io/v3")
      .get(/.*/)
      .reply(200, mocks.toDoAddSecondResponse);

    await page.goto(path, { waitUntil: "networkidle0" });

    await page.waitForSelector(".todoContainer");

    const counterElement = await page.$("#counter");
    const currentCounter = await (
      await counterElement.getProperty("innerText")
    ).jsonValue();
    expect(currentCounter).toBe("2");
  });

  test("Can sort by priority", async () => {
    await nock("https://api.jsonbin.io/v3")
      .get(/.*/)
      .reply(200, mocks.toDoAddSecondResponse);

    await page.goto(path, { waitUntil: "networkidle0" });
    const mockToDo = mockToDos[1];

    await page.click("#sortButton");
    const elements = await page.$$(".todoText");
    const secondItem = await (
      await elements[0].getProperty("innerText")
    ).jsonValue();
    const priorityElements = await page.$$(".todoPriority");
    const secondItemPriority = await (
      await priorityElements[0].getProperty("innerText")
    ).jsonValue();
    expect(secondItem).toBe(mockToDo.text);
    expect(secondItemPriority).toBe(mockToDo.priority);
  });

  test("If data structure is correct in localStorage", async () => {
    const dataInLocalStorage = await page.evaluate(() => {
      return localStorage.getItem("my-todo");
    });

    if (!dataInLocalStorage) {
      expect(dataInLocalStorage).toEqual(null);
      return;
    }

    for (let taskObj of JSON.parse(dataInLocalStorage)) {
      expect(taskObj.text).not.toBe(undefined);
      expect(taskObj.priority).not.toBe(undefined);
      expect(taskObj.date).not.toBe(undefined);
    }
  });

  test("Fetches GET JSONBIN.io", async () => {
    await nock("https://api.jsonbin.io/v3")
      .get(/.*/)
      .reply(200, mocks.fetchTest);

    await page.goto(path, { waitUntil: "networkidle0" });

    await page.waitForSelector(".todoContainer");

    const textNode = await page.$$(".todoText");
    const priorityNode = await page.$$(".todoPriority");

    const text = await (await textNode[0].getProperty("innerText")).jsonValue();
    const priority = await (
      await priorityNode[0].getProperty("innerText")
    ).jsonValue();

    expect(text).toBe(mocks.fetchTest.record["my-todo"][0].text);
    expect(priority).toBe(mocks.fetchTest.record["my-todo"][0].priority);
  });
});
