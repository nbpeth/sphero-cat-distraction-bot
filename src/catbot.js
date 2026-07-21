const MAX_SPEED = 255;
const MIN_SPEED = 1;
const CRUISE_SPEED = 75;

const FULL_CIRCLE_DEGREES = 360;
const LEFT_TURN_ANGLE = 90;
const RIGHT_TURN_ANGLE = -90;
const REVERSE_ANGLE = 180;

const DIRECTION_CHOICE_COUNT = 3;
const SPRINT_ODDS = 4;
const TAUNT_ODDS = 10;

const STUCK_VELOCITY_THRESHOLD = 5;

const VARIABLE_SPRINT_DURATION_SECONDS = 3;
const TAUNT_SPRINT_DURATION_SECONDS = 5;

const TAUNT_PAUSE_DELAY_SECONDS = 5;
const CYCLE_DELAY_SECONDS = 1;

let index = 0;

// https://sites.google.com/sphero.com/sphero-edu-javascript-wiki

const colors = {
  brightRed: { r: 255, g: 0, b: 0 },
  darkRed: { r: 100, g: 0, b: 0 },
  brightGreen: { r: 0, g: 255, b: 0 },
  brightBlue: { r: 0, g: 0, b: 255 },
  darkBlue: { r: 0, g: 0, b: 255 },
  cyan: { r: 0, g: 255, b: 255 },
  lime: { r: 255, g: 255, b: 0 },
  brightWhite: { r: 255, g: 255, b: 255 },
};

const colorsAsList = Object.values(colors);

const getTotalVelocity = () => {
  return Math.sqrt(getVelocity().x ** 2 + getVelocity().y ** 2);
};

const setNewHeading = (angleAdjust) => {
  let newHeading =
    (getHeading() - angleAdjust + FULL_CIRCLE_DEGREES) % FULL_CIRCLE_DEGREES;
  setHeading(newHeading);

  return newHeading;
};

const randomNumber = (floor, ceiling) => {
  return Math.floor(Math.random() * ceiling) + floor;
};

const changeCourse = ({ frontColor, backColor, heading }) => {
  setFrontLed(frontColor);
  setBackLed(backColor);
  setNewHeading(heading);
};

const turnLeft = () => {
  changeCourse({
    frontColor: colors.darkRed,
    backColor: colors.darkBlue,
    heading: LEFT_TURN_ANGLE,
  });
};

const turnRight = () => {
  changeCourse({
    frontColor: colors.darkBlue,
    backColor: colors.darkRed,
    heading: RIGHT_TURN_ANGLE,
  });
};

const reverse = () => {
  changeCourse({
    frontColor: colors.lime,
    backColor: colors.cyan,
    heading: REVERSE_ANGLE,
  });
};

const turnLeftOrRight = async () => {
  const rando = randomNumber(0, DIRECTION_CHOICE_COUNT);

  if (rando % 3 === 0) {
    return turnLeft();
  } else if (rando % 2 === 0) {
    return turnRight();
  } else if (rando % 1 === 0) {
    return reverse();
  }

  return turnRight();
};

async function onCollision() {
  // await speak("ouch!");
  // setIndex();
  setMainLed(colors.darkRed);

  turnLeftOrRight();

  await roll(getHeading(), MAX_SPEED);
}

registerEvent(EventType.onCollision, onCollision);

function setIndex() {
  index++;
  if (index > colors.length - 1) {
    index = 0;
  }
  return index;
}

const unStick = async () => {
  setMainLed(colors.brightGreen);

  turnLeft();

  await roll(getHeading(), MAX_SPEED);
};

async function checkIfStuck() {
  let totalVelocity = getTotalVelocity();
  const probabyStuckBecauseTooSlow = totalVelocity < STUCK_VELOCITY_THRESHOLD;

  if (probabyStuckBecauseTooSlow) {
    await unStick();
  }
}

async function sprint(time) {
  await roll(getHeading(), MAX_SPEED, time);
}

async function rollWithVariableSpeed() {
  let random = randomNumber(0, SPRINT_ODDS);
  let shouldSprint = random % SPRINT_ODDS === 0;

  if (shouldSprint) {
    await sprint(VARIABLE_SPRINT_DURATION_SECONDS);
  } else {
    await roll(getHeading(), CRUISE_SPEED);
  }
}

async function taunt(params) {
  await stopRoll();
  setMainLed(colors.brightGreen);

  await delay(TAUNT_PAUSE_DELAY_SECONDS);
  await resetAim();

  await sprint(TAUNT_SPRINT_DURATION_SECONDS);
}

async function chaseMeProtocol() {
  setMainLed(colors.brightWhite);
  setIndex();

  let random = randomNumber(0, TAUNT_ODDS);
  if (random % TAUNT_ODDS === 0) {
    await taunt();
  } else {
    await rollWithVariableSpeed();
  }

  checkIfStuck();

  await delay(CYCLE_DELAY_SECONDS);
}

async function startProgram() {
  setMainLed(colors.brightWhite);

  while (true) {
    chaseMeProtocol();
  }
}
