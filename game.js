"use strict";

const canvas = document.querySelector("#game-canvas");
const context = canvas.getContext("2d");

const returnMenuButton = document.querySelector("#return-menu");
const interactButton = document.querySelector("#interact-button");

const messageBox = document.querySelector("#message-box");
const messageText = document.querySelector("#message-text");

const objectiveText = document.querySelector("#objective-text");

const woodCount = document.querySelector("#wood-count");
const stoneCount = document.querySelector("#stone-count");
const foodCount = document.querySelector("#food-count");

const controlButtons = Array.from(
    document.querySelectorAll(".control-button")
);

const GAME_WIDTH = canvas.width;
const GAME_HEIGHT = canvas.height;

const FOOD_OBJECTIVE = 6;
const BUSH_RESPAWN_TIME = 10000;

const island = {
    x: GAME_WIDTH / 2,
    y: GAME_HEIGHT / 2 + 10,
    radiusX: 375,
    radiusY: 215
};

const player = {
    x: GAME_WIDTH / 2,
    y: GAME_HEIGHT / 2,
    width: 24,
    height: 32,
    speed: 190,
    direction: "down"
};

const inventory = {
    wood: 0,
    stone: 0,
    food: 0
};

const keys = {
    up: false,
    down: false,
    left: false,
    right: false
};

const trees = [
    { x: 300, y: 190 },
    { x: 665, y: 175 },
    { x: 235, y: 335 },
    { x: 725, y: 350 },
    { x: 390, y: 405 }
];

const rocks = [
    { x: 425, y: 165 },
    { x: 585, y: 395 },
    { x: 760, y: 265 }
];

const berryBushes = [
    {
        x: 345,
        y: 245,
        active: true
    },
    {
        x: 610,
        y: 290,
        active: true
    },
    {
        x: 470,
        y: 420,
        active: true
    },
    {
        x: 700,
        y: 230,
        active: true
    }
];

const landmarks = [
    {
        x: 530,
        y: 210,
        name: "Abandoned Camp"
    },
    {
        x: 320,
        y: 395,
        name: "Freshwater Spring"
    }
];

let lastTime = 0;
let messageTimer = null;
let objectiveComplete = false;

function drawPixelRectangle(
    x,
    y,
    width,
    height,
    colour
) {
    context.fillStyle = colour;

    context.fillRect(
        Math.round(x),
        Math.round(y),
        Math.round(width),
        Math.round(height)
    );
}

function drawBackground() {
    context.fillStyle = "#298eb8";

    context.fillRect(
        0,
        0,
        GAME_WIDTH,
        GAME_HEIGHT
    );

    drawWaterPattern();
}

function drawWaterPattern() {
    context.fillStyle =
        "rgba(143, 228, 245, 0.32)";

    for (
        let y = 25;
        y < GAME_HEIGHT;
        y += 45
    ) {
        const rowOffset =
            y % 90 === 0 ? 20 : 0;

        for (
            let x = -30;
            x < GAME_WIDTH;
            x += 90
        ) {
            context.fillRect(
                x + rowOffset,
                y,
                34,
                5
            );
        }
    }
}

function drawIsland() {
    context.save();

    context.beginPath();

    context.ellipse(
        island.x,
        island.y,
        island.radiusX + 18,
        island.radiusY + 18,
        0,
        0,
        Math.PI * 2
    );

    context.fillStyle = "#e5c46d";
    context.fill();

    context.beginPath();

    context.ellipse(
        island.x,
        island.y - 4,
        island.radiusX,
        island.radiusY,
        0,
        0,
        Math.PI * 2
    );

    context.fillStyle = "#62ad4f";
    context.fill();

    context.restore();

    drawGrassDetails();
}

function drawGrassDetails() {
    context.fillStyle =
        "rgba(48, 126, 57, 0.45)";

    const details = [
        [360, 240],
        [610, 255],
        [470, 360],
        [280, 285],
        [700, 310],
        [520, 130],
        [410, 425]
    ];

    details.forEach(([x, y]) => {
        context.fillRect(x, y, 5, 12);
        context.fillRect(x - 5, y + 5, 5, 5);
        context.fillRect(x + 5, y + 5, 5, 5);
    });
}

function drawTree(tree) {
    drawPixelRectangle(
        tree.x - 6,
        tree.y,
        12,
        32,
        "#79502e"
    );

    drawPixelRectangle(
        tree.x - 22,
        tree.y - 22,
        44,
        28,
        "#24683a"
    );

    drawPixelRectangle(
        tree.x - 14,
        tree.y - 34,
        28,
        18,
        "#2f8b49"
    );

    drawPixelRectangle(
        tree.x - 28,
        tree.y - 12,
        18,
        18,
        "#2f8b49"
    );

    drawPixelRectangle(
        tree.x + 10,
        tree.y - 12,
        18,
        18,
        "#2f8b49"
    );
}

function drawRock(rock) {
    drawPixelRectangle(
        rock.x - 20,
        rock.y - 10,
        40,
        24,
        "#56636b"
    );

    drawPixelRectangle(
        rock.x - 12,
        rock.y - 18,
        25,
        15,
        "#78858c"
    );

    drawPixelRectangle(
        rock.x - 16,
        rock.y + 12,
        32,
        5,
        "#37444a"
    );
}

function drawBerryBush(bush) {
    if (!bush.active) {
        return;
    }

    drawPixelRectangle(
        bush.x - 20,
        bush.y - 8,
        40,
        24,
        "#276b3b"
    );

    drawPixelRectangle(
        bush.x - 13,
        bush.y - 18,
        26,
        18,
        "#318749"
    );

    const berryPositions = [
        [-12, -8],
        [0, -13],
        [12, -6],
        [-4, 2],
        [10, 7]
    ];

    berryPositions.forEach(([offsetX, offsetY]) => {
        drawPixelRectangle(
            bush.x + offsetX - 3,
            bush.y + offsetY - 3,
            6,
            6,
            "#c83d52"
        );
    });
}

function drawLandmark(landmark) {
    if (landmark.name === "Abandoned Camp") {
        drawPixelRectangle(
            landmark.x - 25,
            landmark.y - 5,
            50,
            25,
            "#9a6032"
        );

        context.fillStyle = "#d7a45a";

        context.beginPath();

        context.moveTo(
            landmark.x - 25,
            landmark.y - 5
        );

        context.lineTo(
            landmark.x,
            landmark.y - 35
        );

        context.lineTo(
            landmark.x + 25,
            landmark.y - 5
        );

        context.fill();
    }

    if (
        landmark.name ===
        "Freshwater Spring"
    ) {
        context.beginPath();

        context.ellipse(
            landmark.x,
            landmark.y,
            34,
            18,
            0,
            0,
            Math.PI * 2
        );

        context.fillStyle = "#43bddd";
        context.fill();

        context.lineWidth = 5;
        context.strokeStyle = "#b8f3ff";
        context.stroke();
    }
}

function drawPlayer() {
    const x = Math.round(player.x);
    const y = Math.round(player.y);

    drawPixelRectangle(
        x - 10,
        y - 16,
        20,
        20,
        "#e4b477"
    );

    drawPixelRectangle(
        x - 12,
        y + 4,
        24,
        22,
        "#315e9b"
    );

    drawPixelRectangle(
        x - 10,
        y + 26,
        8,
        10,
        "#4a3529"
    );

    drawPixelRectangle(
        x + 2,
        y + 26,
        8,
        10,
        "#4a3529"
    );

    if (player.direction === "left") {
        drawPixelRectangle(
            x - 11,
            y - 8,
            4,
            4,
            "#101820"
        );
    } else if (
        player.direction === "right"
    ) {
        drawPixelRectangle(
            x + 7,
            y - 8,
            4,
            4,
            "#101820"
        );
    } else {
        drawPixelRectangle(
            x - 6,
            y - 8,
            4,
            4,
            "#101820"
        );

        drawPixelRectangle(
            x + 3,
            y - 8,
            4,
            4,
            "#101820"
        );
    }
}

function isInsideIsland(x, y) {
    const normalizedX =
        (x - island.x) /
        (island.radiusX - 22);

    const normalizedY =
        (y - island.y) /
        (island.radiusY - 22);

    return (
        normalizedX * normalizedX +
        normalizedY * normalizedY
    ) <= 1;
}

function updatePlayer(deltaTime) {
    let movementX = 0;
    let movementY = 0;

    if (keys.left) {
        movementX -= 1;
        player.direction = "left";
    }

    if (keys.right) {
        movementX += 1;
        player.direction = "right";
    }

    if (keys.up) {
        movementY -= 1;
        player.direction = "up";
    }

    if (keys.down) {
        movementY += 1;
        player.direction = "down";
    }

    if (
        movementX === 0 &&
        movementY === 0
    ) {
        return;
    }

    const movementLength = Math.hypot(
        movementX,
        movementY
    );

    movementX /= movementLength;
    movementY /= movementLength;

    const nextX =
        player.x +
        movementX *
        player.speed *
        deltaTime;

    const nextY =
        player.y +
        movementY *
        player.speed *
        deltaTime;

    if (isInsideIsland(nextX, player.y)) {
        player.x = nextX;
    }

    if (isInsideIsland(player.x, nextY)) {
        player.y = nextY;
    }
}

function drawScene() {
    drawBackground();
    drawIsland();

    landmarks.forEach(drawLandmark);
    berryBushes.forEach(drawBerryBush);
    trees.forEach(drawTree);
    rocks.forEach(drawRock);

    drawPlayer();
}

function gameLoop(currentTime) {
    const elapsedTime = Math.min(
        (currentTime - lastTime) / 1000,
        0.05
    );

    lastTime = currentTime;

    updatePlayer(elapsedTime);
    drawScene();

    window.requestAnimationFrame(gameLoop);
}

function updateInventoryDisplay() {
    woodCount.textContent = inventory.wood;
    stoneCount.textContent = inventory.stone;
    foodCount.textContent = inventory.food;

    if (
        inventory.food >= FOOD_OBJECTIVE &&
        !objectiveComplete
    ) {
        objectiveComplete = true;

        objectiveText.textContent =
            "Food collected — explore the abandoned camp";

        showMessage(
            "Objective complete! You collected enough food."
        );
    }
}

function showMessage(message) {
    messageText.textContent = message;

    messageBox.classList.remove("hidden");

    window.clearTimeout(messageTimer);

    messageTimer = window.setTimeout(
        () => {
            messageBox.classList.add("hidden");
        },
        2200
    );
}

function distanceBetween(first, second) {
    return Math.hypot(
        first.x - second.x,
        first.y - second.y
    );
}

function collectBerryBush(bush) {
    if (!bush.active) {
        return;
    }

    bush.active = false;

    inventory.food += 2;

    updateInventoryDisplay();

    showMessage(
        "Collected 2 food. The bush will regrow."
    );

    window.setTimeout(
        () => {
            bush.active = true;
        },
        BUSH_RESPAWN_TIME
    );
}

function interact() {
    const nearbyBush = berryBushes.find(
        (bush) =>
            bush.active &&
            distanceBetween(player, bush) < 55
    );

    if (nearbyBush) {
        collectBerryBush(nearbyBush);
        return;
    }

    const nearbyLandmark = landmarks.find(
        (landmark) =>
            distanceBetween(
                player,
                landmark
            ) < 65
    );

    if (nearbyLandmark) {
        showMessage(
            `You discovered: ${nearbyLandmark.name}`
        );

        return;
    }

    const nearbyTree = trees.find(
        (tree) =>
            distanceBetween(player, tree) < 55
    );

    if (nearbyTree) {
        showMessage(
            "This tree could provide wood once you have an axe."
        );

        return;
    }

    const nearbyRock = rocks.find(
        (rock) =>
            distanceBetween(player, rock) < 55
    );

    if (nearbyRock) {
        showMessage(
            "You need a pickaxe to collect stone."
        );

        return;
    }

    showMessage(
        "There is nothing nearby to use."
    );
}

function setDirection(
    direction,
    isPressed
) {
    keys[direction] = isPressed;

    const button = controlButtons.find(
        (controlButton) =>
            controlButton.dataset.direction ===
            direction
    );

    if (button) {
        button.classList.toggle(
            "pressed",
            isPressed
        );
    }
}

document.addEventListener(
    "keydown",
    (event) => {
        const key = event.key.toLowerCase();

        if (
            key === "arrowup" ||
            key === "w"
        ) {
            event.preventDefault();
            setDirection("up", true);
        }

        if (
            key === "arrowdown" ||
            key === "s"
        ) {
            event.preventDefault();
            setDirection("down", true);
        }

        if (
            key === "arrowleft" ||
            key === "a"
        ) {
            event.preventDefault();
            setDirection("left", true);
        }

        if (
            key === "arrowright" ||
            key === "d"
        ) {
            event.preventDefault();
            setDirection("right", true);
        }

        if (
            key === "e" ||
            key === " "
        ) {
            event.preventDefault();
            interact();
        }
    }
);

document.addEventListener(
    "keyup",
    (event) => {
        const key = event.key.toLowerCase();

        if (
            key === "arrowup" ||
            key === "w"
        ) {
            setDirection("up", false);
        }

        if (
            key === "arrowdown" ||
            key === "s"
        ) {
            setDirection("down", false);
        }

        if (
            key === "arrowleft" ||
            key === "a"
        ) {
            setDirection("left", false);
        }

        if (
            key === "arrowright" ||
            key === "d"
        ) {
            setDirection("right", false);
        }
    }
);

controlButtons.forEach((button) => {
    const direction =
        button.dataset.direction;

    const startMoving = (event) => {
        event.preventDefault();

        setDirection(direction, true);
    };

    const stopMoving = (event) => {
        event.preventDefault();

        setDirection(direction, false);
    };

    button.addEventListener(
        "pointerdown",
        startMoving
    );

    button.addEventListener(
        "pointerup",
        stopMoving
    );

    button.addEventListener(
        "pointercancel",
        stopMoving
    );

    button.addEventListener(
        "pointerleave",
        stopMoving
    );
});

interactButton.addEventListener(
    "click",
    interact
);

returnMenuButton.addEventListener(
    "click",
    () => {
        window.location.href = "index.html";
    }
);

window.addEventListener(
    "blur",
    () => {
        Object.keys(keys).forEach(
            (direction) => {
                setDirection(
                    direction,
                    false
                );
            }
        );
    }
);

updateInventoryDisplay();
drawScene();

window.requestAnimationFrame(gameLoop);