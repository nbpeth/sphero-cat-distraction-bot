
const MAX_SPEED = 255;
const MIN_SPEED = 1;

let index = 0;

// https://sites.google.com/sphero.com/sphero-edu-javascript-wiki

const colors = {
    "brightRed": { r: 255, g: 0, b: 0 },
    "darkRed": { r: 100, g: 0, b: 0 },
    "brightGreen": { r: 0, g: 255, b: 0 },
    "brightBlue": { r: 0, g: 0, b: 255 },
    "darkBlue": { r: 0, g: 0, b: 255 },
    "cyan": { r: 0, g: 255, b: 255 },
    "lime": { r: 255, g: 255, b: 0 },
    "brightWhite": { r: 255, g: 255, b: 255 },
}

const colorsAsList = Object.values(colors);

const getTotalVelocity = () => {
    return Math.sqrt((getVelocity().x ** 2) + (getVelocity().y ** 2))
}

const setNewHeading = (angleAdjust) => {
    let newHeading = (getHeading() - angleAdjust + 360) % 360;
    setHeading(newHeading);

    return newHeading;
}

const randomNumber = (floor, ceiling) => {
    return Math.floor(Math.random() * ceiling) + floor;
}

const turnLeft = () => {
    setFrontLed(colors.darkRed)
    setBackLed(colors.darkBlue)
    setNewHeading(90)
}

const turnRight = () => {
    setFrontLed(colors.darkBlue);
    setBackLed(colors.darkRed);

    setNewHeading(-90);
}

const reverse = () => {
    setFrontLed(colors.lime);
    setBackLed(colors.cyan);

    setNewHeading(180);
}

const turnLeftOrRight = async () => {
    const rando = randomNumber(0, 3);

    if (rando % 3 === 0) {
        return turnLeft();
    } else if (rando % 2 === 0) {
        return turnRight();
    } else if (rando % 1 === 0) {
        return reverse();
    }

    return turnRight();
}



async function onCollision() {
    // await speak("ouch!");
    setIndex();
    setMainLed(colors.darkRed);

    turnLeftOrRight();

    await roll(getHeading(), MAX_SPEED)
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

    await roll(getHeading(), MAX_SPEED)
}

async function checkIfStuck() {
    let totalVelocity = getTotalVelocity();

    if (totalVelocity < 5) {
        await unStick();
    }
}

async function sprint(time) {
    await roll(getHeading(), MAX_SPEED, time)
}

async function rollWithVariableSpeed() {
    let random = randomNumber(0, 4);
    let shouldSprint = random % 4 === 0;

    if (shouldSprint) {
        await sprint(3)
    } else {
        await roll(getHeading(), 75)
    }
}

async function chaseMeProtocol() {
    setMainLed(colors.brightWhite);
        setIndex();

        let random = randomNumber(0, 10);
        if (random % 10 === 0) {
            await stopRoll();
            setMainLed(colors.brightGreen);
            await delay(5);
            await resetAim();
            await sprint(5);
        } else {
            await rollWithVariableSpeed();
        }


        checkIfStuck();

        await delay(1);
}

async function startProgram() {
    setMainLed(colors.brightWhite);

    while (true) {
        chaseMeProtocol();
    }
}