import chalk from "chalk";
import keypress from "keypress";

const
    unicode = {
        heavy: {
            vertical: "┃",
            horizontal: "━",
            corner: {
                top: ["┏", "┓"],
                bottom: ["┗", "┛"]
            }
        },
        light: {
            vertical: "┃",
            horizontal: "─",
            corner: {
                top: ["┏", "┓"],
                bottom: ["┗", "┛"]
            }
        },
    },
    screenHeight = 8,
    screenWidth = 12,
    angleMap = new Map(["up", "right", "down", "left"].map((d, i) => [d, i]));

let
    // All coordinates are zero indexed
    // The snake body is built of pieces that are offset to each other by some amount
    // They start offsetting from the head
    body = Array(5).fill(0).map(_ => ({ x: 1 })),//.concat({ y: 1 }, { x: 1 }),
    head = { x: 3, y: 3 },
    // A number from 0 - 3 which represents the direction the snake is heading towards
    // Follows CSS padding order i.e. 0 is top, 1 is right
    angle = 3,
    // Amount to grow after eating a fruit
    // May add special fruits which stimulate bigger growth, hence code is designed to work with arbitrary amount
    // Currently the fruit only allows growth by 1
    grow = 0;
keypress(process.stdin);
process.stdin.setRawMode(true);
process.stdin.resume();

process.stdin.on("keypress", (char, key) => {
    if (key.name === "q" || (key.ctrl && key.name === "c")) {
        // clearScreen();
        console.log("Exiting...");
        return process.exit();
    }

    angle = angleMap.get(key.name) ?? angle;
});

setInterval(() => {
    const angleToYOffset = [-1, 0, 1, 0];
    let newHead = structuredClone(head);
    newHead.y += angleToYOffset[angle];
    newHead.x += angleToYOffset[(angle + 1) % 4];

    body.unshift({
        x: head.x - newHead.x,
        y: head.y - newHead.y
    });

    if (grow === 0) {
        body.pop();
    } else {
        grow--;
    }

    head = newHead;
    draw();
}, 1000);

function clearScreen() {
    process.stdout.cursorTo(0, 0);
    process.stdout.clearScreenDown();
}

function draw() {
    clearScreen();

    // The 1s account for the border
    const screen = Array(1 + screenHeight + 1).fill(0).map(_ => Array(1 + screenWidth + 1).fill(" "));

    // Draw the border
    for (let x = 1; x <= screenWidth; x++) {
        screen[screenHeight + 1][x] = screen[0][x] = unicode.heavy.horizontal;
    }
    for (let y = 0; y <= screenHeight + 1; y++) {
        [screen[y][0], screen[y][screenWidth + 1]] = y === 0 ? unicode.heavy.corner.top : y === screenHeight + 1 ? unicode.heavy.corner.bottom : Array(2).fill(unicode.heavy.vertical);
    }

    // Draw the snake
    let lastPos = head;
    screen[head.y + 1][head.x + 1] = chalk.red("+");

    for (let part of body) {
        part.y ??= 0;
        part.x ??= 0;
        let newPos = { y: lastPos.y + part.y, x: lastPos.x + part.x }
        screen[newPos.y + 1][newPos.x + 1] = chalk.green("+");
        lastPos = newPos;
    }

    process.stdout.write(screen.map(row => " " + row.join("")).join("\n") + "\n");
}

draw();
// grow += 5;