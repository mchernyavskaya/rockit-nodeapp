const express = require("express");

const PORT = process.env.PORT || 5000;
const DEFAULT_DURATION = 5 * 60 * 1000; // ms - 5 minutes
const API_PATH = "/kabachok/rock";
const app = express();

let rockStatus = "stopped";
let timeoutObject = null;
let startTime = 0;

const sendStatusResponse = (res) => {
    res.format({
        text: function () {
            res.send(rockStatus);
        },
        json: function () {
            res.json({status: `${rockStatus}`, since: startTime});
        }
    });

};

const sendStart = (res) => {
    console.log(`Starting cradle...`);
    if (!startTime) {
        startTime = new Date().getTime();
    }
    rockStatus = "started";
    if (!!res) {
        sendStatusResponse(res);
    }
};

const sendStop = (res) => {
    console.log(`Stopping cradle...`);
    rockStatus = "stopped";
    startTime = 0;
    if (!!res) {
        sendStatusResponse(res);
    } else {
        console.log(`Cradle stopped - timed out`);
    }
};

const sendStartTime = (res) => {
    console.log(`Start time requested...`);
    if (!!res) {
        sendStatusResponse(res);
    }
};

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

app.route(API_PATH)
    .get((req, res) => {
        console.log(`Sending status: ${rockStatus}`);
        sendStatusResponse(res);
    });

// for simplicity - gets
app.route(`${API_PATH}/start`)
    .get((req, res) => {
        sendStart(res);
        if (timeoutObject) {
            clearTimeout(timeoutObject);
        }
        timeoutObject = setTimeout(sendStop, DEFAULT_DURATION, null);
    });

app.route(`${API_PATH}/stop`)
    .get((req, res) => {
        sendStop(res);
    });

app.route(`${API_PATH}/since`)
    .get((req, res) => {
        sendStartTime(res);
    });
