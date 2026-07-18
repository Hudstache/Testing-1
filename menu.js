"use strict";

const menuButtons = Array.from(
    document.querySelectorAll(".menu-button")
);

const statusMessage = document.querySelector(
    "#status-message"
);

const gamePanel = document.querySelector(
    "#game-panel"
);

const settingsPanel = document.querySelector(
    "#settings-panel"
);

const closeGamePanelButton = document.querySelector(
    "#close-game-panel"
);

const closeSettingsPanelButton = document.querySelector(
    "#close-settings-panel"
);

const saveSlotOneButton = document.querySelector(
    '.save-slot[data-slot="1"]'
);

let selectedButtonIndex = 0;
let activePanel = null;

function updateSelectedButton() {
    menuButtons.forEach((button, index) => {
        const isSelected =
            index === selectedButtonIndex;

        button.classList.toggle(
            "selected",
            isSelected
        );
    });
}

function moveSelection(direction) {
    selectedButtonIndex += direction;

    if (selectedButtonIndex < 0) {
        selectedButtonIndex =
            menuButtons.length - 1;
    }

    if (
        selectedButtonIndex >=
        menuButtons.length
    ) {
        selectedButtonIndex = 0;
    }

    updateSelectedButton();
}

function showPanel(panel) {
    panel.classList.remove("hidden");
    panel.setAttribute("aria-hidden", "false");

    activePanel = panel;
}

function hidePanel(panel) {
    panel.classList.add("hidden");
    panel.setAttribute("aria-hidden", "true");

    activePanel = null;

    updateSelectedButton();
}

function showMessage(message) {
    statusMessage.textContent = message;

    window.clearTimeout(showMessage.timer);

    showMessage.timer = window.setTimeout(
        () => {
            statusMessage.textContent = "";
        },
        2500
    );
}

function runMenuAction(action) {
    switch (action) {
        case "select-game":
            showPanel(gamePanel);
            break;

        case "settings":
            showPanel(settingsPanel);
            break;

        case "quit":
            showMessage(
                "Quit will close the game in the iPhone version."
            );
            break;

        default:
            showMessage("Unknown menu option.");
    }
}

menuButtons.forEach((button, index) => {
    button.addEventListener(
        "mouseenter",
        () => {
            selectedButtonIndex = index;
            updateSelectedButton();
        }
    );

    button.addEventListener(
        "click",
        () => {
            selectedButtonIndex = index;
            updateSelectedButton();

            runMenuAction(
                button.dataset.action
            );
        }
    );
});

document.addEventListener(
    "keydown",
    (event) => {
        if (activePanel) {
            if (event.key === "Escape") {
                hidePanel(activePanel);
            }

            return;
        }

        if (event.key === "ArrowUp") {
            event.preventDefault();
            moveSelection(-1);
        }

        if (event.key === "ArrowDown") {
            event.preventDefault();
            moveSelection(1);
        }

        if (event.key === "Enter") {
            event.preventDefault();

            const selectedButton =
                menuButtons[selectedButtonIndex];

            runMenuAction(
                selectedButton.dataset.action
            );
        }
    }
);

closeGamePanelButton.addEventListener(
    "click",
    () => {
        hidePanel(gamePanel);
    }
);

closeSettingsPanelButton.addEventListener(
    "click",
    () => {
        hidePanel(settingsPanel);
    }
);

gamePanel.addEventListener(
    "click",
    (event) => {
        if (event.target === gamePanel) {
            hidePanel(gamePanel);
        }
    }
);

settingsPanel.addEventListener(
    "click",
    (event) => {
        if (event.target === settingsPanel) {
            hidePanel(settingsPanel);
        }
    }
);

saveSlotOneButton.addEventListener(
    "click",
    () => {
        window.location.href = "game.html";
    }
);

updateSelectedButton();