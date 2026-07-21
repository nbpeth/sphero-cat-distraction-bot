const fs = require("fs");
const path = require("path");

const source = fs.readFileSync(path.join(__dirname, "catbot.js"), "utf8");

const EXPORTED = [
  "getTotalVelocity",
  "setNewHeading",
  "randomNumber",
  "changeCourse",
  "turnLeft",
  "turnRight",
  "reverse",
  "turnLeftOrRight",
  "onCollision",
  "setIndex",
  "unStick",
  "checkIfStuck",
  "sprint",
  "rollWithVariableSpeed",
  "taunt",
  "chaseMeProtocol",
];

const COLOR = {
  brightRed: { r: 255, g: 0, b: 0 },
  darkRed: { r: 100, g: 0, b: 0 },
  brightGreen: { r: 0, g: 255, b: 0 },
  brightBlue: { r: 0, g: 0, b: 255 },
  darkBlue: { r: 0, g: 0, b: 255 },
  cyan: { r: 0, g: 255, b: 255 },
  lime: { r: 255, g: 255, b: 0 },
  brightWhite: { r: 255, g: 255, b: 255 },
};

function loadCatbot({ initialHeading = 0, ...overrides } = {}) {
  let heading = initialHeading;

  const mocks = {
    getVelocity: jest.fn(() => ({ x: 0, y: 0 })),
    getHeading: jest.fn(() => heading),
    setHeading: jest.fn((next) => {
      heading = next;
    }),
    setFrontLed: jest.fn(),
    setBackLed: jest.fn(),
    setMainLed: jest.fn(),
    roll: jest.fn(async () => {}),
    stopRoll: jest.fn(async () => {}),
    delay: jest.fn(async () => {}),
    resetAim: jest.fn(async () => {}),
    registerEvent: jest.fn(),
    EventType: { onCollision: "onCollision" },
    ...overrides,
  };

  const factory = new Function(
    ...Object.keys(mocks),
    `${source}\n; return { ${EXPORTED.join(", ")} };`
  );
  const api = factory(...Object.values(mocks));

  return { api, mocks };
}

module.exports = { loadCatbot, COLOR };
