const { loadCatbot, COLOR } = require("./testHarness");

const MAX_SPEED = 255;
const CRUISE_SPEED = 75;

const withRandom = (value) => jest.spyOn(Math, "random").mockReturnValue(value);

afterEach(() => {
  jest.restoreAllMocks();
});

describe("module load", () => {
  it("registers the collision handler and does not start driving", () => {
    const { mocks } = loadCatbot();

    expect(mocks.registerEvent).toHaveBeenCalledWith(
      "onCollision",
      expect.any(Function)
    );
    expect(mocks.roll).not.toHaveBeenCalled();
  });
});

describe("getTotalVelocity", () => {
  it("returns the magnitude of the velocity vector", () => {
    const { api } = loadCatbot({
      getVelocity: () => ({ x: 3, y: 4 }),
    });

    expect(api.getTotalVelocity()).toBe(5);
  });

  it("returns 0 when the robot is still", () => {
    const { api } = loadCatbot({ getVelocity: () => ({ x: 0, y: 0 }) });

    expect(api.getTotalVelocity()).toBe(0);
  });
});

describe("setNewHeading", () => {
  it("subtracts the adjustment from the current heading", () => {
    const { api, mocks } = loadCatbot({ initialHeading: 200 });

    expect(api.setNewHeading(90)).toBe(110);
    expect(mocks.setHeading).toHaveBeenCalledWith(110);
  });

  it("wraps a negative result back into 0..359", () => {
    const { api, mocks } = loadCatbot({ initialHeading: 0 });

    expect(api.setNewHeading(90)).toBe(270);
    expect(mocks.setHeading).toHaveBeenCalledWith(270);
  });

  it("wraps a result at or above 360 back into range", () => {
    const { api } = loadCatbot({ initialHeading: 0 });

    expect(api.setNewHeading(-90)).toBe(90);
  });
});

describe("randomNumber", () => {
  it("floors random * ceiling and adds the floor", () => {
    const { api } = loadCatbot();

    withRandom(0);
    expect(api.randomNumber(0, 10)).toBe(0);

    withRandom(0.55);
    expect(api.randomNumber(0, 10)).toBe(5);
  });
});

describe("turn helpers", () => {
  it("turnLeft sets the left-turn LEDs and heading", () => {
    const { api, mocks } = loadCatbot({ initialHeading: 0 });

    api.turnLeft();

    expect(mocks.setFrontLed).toHaveBeenCalledWith(COLOR.darkRed);
    expect(mocks.setBackLed).toHaveBeenCalledWith(COLOR.darkBlue);
    expect(mocks.setHeading).toHaveBeenCalledWith(270);
  });

  it("turnRight sets the right-turn LEDs and heading", () => {
    const { api, mocks } = loadCatbot({ initialHeading: 0 });

    api.turnRight();

    expect(mocks.setFrontLed).toHaveBeenCalledWith(COLOR.darkBlue);
    expect(mocks.setBackLed).toHaveBeenCalledWith(COLOR.darkRed);
    expect(mocks.setHeading).toHaveBeenCalledWith(90);
  });

  it("reverse sets the reverse LEDs and flips the heading", () => {
    const { api, mocks } = loadCatbot({ initialHeading: 0 });

    api.reverse();

    expect(mocks.setFrontLed).toHaveBeenCalledWith(COLOR.lime);
    expect(mocks.setBackLed).toHaveBeenCalledWith(COLOR.cyan);
    expect(mocks.setHeading).toHaveBeenCalledWith(180);
  });
});

describe("turnLeftOrRight", () => {
  it("turns left when the roll is 0", async () => {
    const { api, mocks } = loadCatbot({ initialHeading: 0 });
    withRandom(0);

    await api.turnLeftOrRight();

    expect(mocks.setFrontLed).toHaveBeenCalledWith(COLOR.darkRed);
  });

  it("reverses when the roll is 1", async () => {
    const { api, mocks } = loadCatbot({ initialHeading: 0 });
    withRandom(0.4);

    await api.turnLeftOrRight();

    expect(mocks.setFrontLed).toHaveBeenCalledWith(COLOR.lime);
  });

  it("turns right when the roll is 2", async () => {
    const { api, mocks } = loadCatbot({ initialHeading: 0 });
    withRandom(0.7);

    await api.turnLeftOrRight();

    expect(mocks.setFrontLed).toHaveBeenCalledWith(COLOR.darkBlue);
  });
});

describe("onCollision", () => {
  it("flashes red, picks a new direction, and rolls off at full speed", async () => {
    const { api, mocks } = loadCatbot({ initialHeading: 0 });
    withRandom(0);

    await api.onCollision();

    expect(mocks.setMainLed).toHaveBeenCalledWith(COLOR.darkRed);
    expect(mocks.roll).toHaveBeenCalledWith(270, MAX_SPEED);
  });
});

describe("checkIfStuck", () => {
  it("frees itself when velocity is below the threshold", async () => {
    const { api, mocks } = loadCatbot({
      initialHeading: 0,
      getVelocity: () => ({ x: 0, y: 0 }),
    });

    await api.checkIfStuck();

    expect(mocks.setMainLed).toHaveBeenCalledWith(COLOR.brightGreen);
    expect(mocks.roll).toHaveBeenCalledWith(expect.any(Number), MAX_SPEED);
  });

  it("does nothing when the robot is moving fast enough", async () => {
    const { api, mocks } = loadCatbot({
      getVelocity: () => ({ x: 10, y: 0 }),
    });

    await api.checkIfStuck();

    expect(mocks.roll).not.toHaveBeenCalled();
    expect(mocks.setMainLed).not.toHaveBeenCalled();
  });
});

describe("sprint", () => {
  it("rolls at max speed for the given duration", async () => {
    const { api, mocks } = loadCatbot({ initialHeading: 45 });

    await api.sprint(3);

    expect(mocks.roll).toHaveBeenCalledWith(45, MAX_SPEED, 3);
  });
});

describe("rollWithVariableSpeed", () => {
  it("sprints when the roll lands on a sprint (0)", async () => {
    const { api, mocks } = loadCatbot({ initialHeading: 0 });
    withRandom(0);

    await api.rollWithVariableSpeed();

    expect(mocks.roll).toHaveBeenCalledWith(0, MAX_SPEED, 3);
  });

  it("cruises at moderate speed otherwise", async () => {
    const { api, mocks } = loadCatbot({ initialHeading: 0 });
    withRandom(0.5);

    await api.rollWithVariableSpeed();

    expect(mocks.roll).toHaveBeenCalledWith(0, CRUISE_SPEED);
  });
});

describe("taunt", () => {
  it("stops, flashes green, re-aims, then dashes", async () => {
    const { api, mocks } = loadCatbot({ initialHeading: 0 });

    await api.taunt();

    expect(mocks.stopRoll).toHaveBeenCalled();
    expect(mocks.setMainLed).toHaveBeenCalledWith(COLOR.brightGreen);
    expect(mocks.delay).toHaveBeenCalledWith(5);
    expect(mocks.resetAim).toHaveBeenCalled();
    expect(mocks.roll).toHaveBeenCalledWith(0, MAX_SPEED, 5);
  });
});

describe("chaseMeProtocol", () => {
  const moving = { getVelocity: () => ({ x: 100, y: 0 }) };

  it("taunts roughly one cycle in ten", async () => {
    const { api, mocks } = loadCatbot({ initialHeading: 0, ...moving });
    withRandom(0);

    await api.chaseMeProtocol();

    expect(mocks.setMainLed).toHaveBeenCalledWith(COLOR.brightWhite);
    expect(mocks.stopRoll).toHaveBeenCalled();
    expect(mocks.roll).toHaveBeenCalledWith(0, MAX_SPEED, 5);
    expect(mocks.delay).toHaveBeenCalledWith(1);
  });

  it("otherwise rolls with variable speed", async () => {
    const { api, mocks } = loadCatbot({ initialHeading: 0, ...moving });
    withRandom(0.5);

    await api.chaseMeProtocol();

    expect(mocks.stopRoll).not.toHaveBeenCalled();
    expect(mocks.roll).toHaveBeenCalledWith(0, CRUISE_SPEED);
    expect(mocks.delay).toHaveBeenCalledWith(1);
  });
});

describe("setIndex", () => {
  it("increments on each call", () => {
    const { api } = loadCatbot();

    expect(api.setIndex()).toBe(1);
    expect(api.setIndex()).toBe(2);
    expect(api.setIndex()).toBe(3);
  });
});
