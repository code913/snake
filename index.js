import chalk from "chalk";
import keypress from "keypress";

const
    unicode = {
        vertical: "┃",
        horizontal: "━",
        corner: {
            top: ["┏", "┓"],
            bottom: ["┗", "┛"]
        }
    },
    screenHeight = 8,
    screenWidth = 25,
    angleMap = new Map(["up", "right", "down", "left"].map((d, i) => [d, i]));

let
    // All coordinates are zero indexed
    // The snake body is built of pieces that are offset to each other by some amount
    // They start offsetting from the head
    body = Array(2).fill({ x: 1 }),
    head = { x: 4, y: 3 },
    fruit = null,
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
        console.log(chalk.red("Exiting..."));
        return process.exit();
    }

    let newAngle = angleMap.get(key.name);

    // Check if the angle isn't in the same axis
    if (newAngle !== undefined && (newAngle + angle) % 2 === 1) angle = newAngle;
    move();
});

const move = (_ => {
    let interval;

    function move() {
        const angleToYOffset = [-1, 0, 1, 0];
        let newHead = structuredClone(head);
        newHead.y += angleToYOffset[angle];
        newHead.x += angleToYOffset[(angle + 1) % 4];

        if (fruit?.x === newHead.x && fruit?.y === newHead.y) {
            fruit = null;
            grow++;
        }

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
    }

    return _ => {
        clearInterval(interval);

        move();
        interval = setInterval(move, 1000);
    };
})();

function clearScreen() {
    process.stdout.cursorTo(0, 1);
    process.stdout.clearScreenDown();
}

function draw() {
    // The 1s account for the border
    const screen = Array(1 + screenHeight + 1).fill(0).map(_ => Array(1 + screenWidth + 1).fill(" "));

    // Draw the border
    for (let x = 1; x <= screenWidth; x++) {
        screen[screenHeight + 1][x] = screen[0][x] = unicode.horizontal;
    }
    for (let y = 0; y <= screenHeight + 1; y++) {
        [screen[y][0], screen[y][screenWidth + 1]] = y === 0 ? unicode.corner.top : y === screenHeight + 1 ? unicode.corner.bottom : Array(2).fill(unicode.vertical);
    }

    // Draw the snake
    let lastPos = head;
    function setPart(x, y, string) {
        if (screen[y + 1][x + 1] !== " ") {
            // Rip the snake either touched itself or the edge
            console.log(chalk.red("You lost!"));
            console.log("Your final length was", chalk.yellow(body.length + 1));
            process.exit();
        }

        screen[y + 1][x + 1] = string;
    }

    setPart(head.x, head.y, chalk.green("▲▶▼◀".split("")[angle]));

    for (let part of body) {
        part.y ??= 0;
        part.x ??= 0;
        let newPos = { y: lastPos.y + part.y, x: lastPos.x + part.x }
        setPart(newPos.x, newPos.y, chalk.green("+"));
        lastPos = newPos;
    }

    // Place the fruit
    function generateFruitPosition() {
        const
            r = Math.floor(Math.random() * screenHeight * screenWidth),
            x = r % screenWidth,
            y = Math.floor(r / screenWidth);

        return screen[y + 1][x + 1] === " " ? { x, y } : generateFruitPosition();
    }

    fruit ??= generateFruitPosition();
    screen[fruit.y + 1][fruit.x + 1] = chalk.yellow("∙");

    clearScreen(); // Delete the previous output
    const shamelessSelfPromo = "Snake by code913";
    process.stdout.write([
        " ".repeat(Math.ceil((screenWidth - shamelessSelfPromo.length) / 2) + 1) + chalk.blue(shamelessSelfPromo),
        screen.map(row => " " + row.join("")).join("\n"),
        "Use arrow keys to move and press q to exit"
    ].join("\n") + "\n");
}

move();