# Sphero Cat Distraction Bot 🐱🤖

A JavaScript program that turns a [Sphero](https://sphero.com) robot into an autonomous cat toy. Drop it on the floor, run the program, and let the bot zip around the room — darting, sprinting, and changing direction to keep your cat entertained (and hopefully out of trouble).

## What it does

The bot drives itself around continuously, mixing normal-speed cruising with random bursts of speed and unpredictable turns. It reacts to the world around it: when it bumps into something it recoils and heads off in a new direction, and if it gets wedged against a wall or piece of furniture it detects that it's stuck and frees itself. The onboard LEDs change color to signal what the bot is doing at any moment. The result is erratic, prey-like movement that cats find hard to ignore.

## The `chaseMeProtocol` behavior

`chaseMeProtocol` is the default behavior and the heart of the program. It runs in an infinite loop (see `startProgram`), and each pass through the loop does the following:

1. **Sets the main LED to bright white** to mark the start of a cycle.
2. **Rolls a random number (0–9).**
   - **~10% of the time** (the number is divisible by 10), the bot does a "taunt and dash": it stops, flashes **bright green**, pauses briefly, re-centers its aim, and then **sprints at full speed** for 5 seconds — a sudden burst designed to trigger a chase.
   - **The rest of the time**, it calls `rollWithVariableSpeed`, which itself has a ~25% chance to **sprint at max speed** for 3 seconds and otherwise cruises at a **moderate speed (75)**.
3. **Checks whether it's stuck** (`checkIfStuck`). If total velocity has dropped below a small threshold — meaning the bot is pinned against an obstacle — it turns left, flashes **bright green**, and rolls off at full speed to break free.
4. **Waits briefly** before starting the next cycle.

On top of the loop, a **collision handler** (`onCollision`) is always active. Whenever the bot hits something, it flashes **dark red**, picks a new direction (a random left turn, right turn, or full reverse), and rolls off at max speed. This is what gives the bot its bouncing, ricocheting movement around the room.

### Color cues at a glance

| Color | Meaning |
| --- | --- |
| Bright white | Start of a `chaseMeProtocol` cycle |
| Bright green | Taunt/dash pause, or freeing itself when stuck |
| Dark red | Collision — the bot just hit something |
| Red / blue front & back LEDs | Turning left or right |
| Lime / cyan | Reversing direction |

## Compatibility

- **Sphero Mini** — tested and supported.
- **Sphero BOLT** — tested and supported.

> **Note:** This program uses the standard LED calls (`setMainLed`, `setFrontLed`, `setBackLed`). It does **not** use the BOLT's 8×8 LED matrix — matrix colorizations are not supported here.

## How to run it

This program is written for the **Sphero Edu** JavaScript environment, not Node.js. To run it against a physical Sphero:

1. Download and install the **Sphero Edu** app from the [Sphero Edu apps page](https://sphero.com/pages/sphero-edu-app).
2. Create a new **JavaScript program** in the app.
3. Copy the contents of [catbot.js](catbot.js) into the program editor.
4. Connect the app to your Sphero over Bluetooth.
5. Press **Run**, set the bot on the floor, and let the cat take it from there.

## Reference

- Sphero Edu JavaScript API wiki: <https://sites.google.com/sphero.com/sphero-edu-javascript-wiki>
