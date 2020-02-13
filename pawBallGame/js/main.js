//GLOBAL VARIABLES
// colors of the game
let colors = ['red', '#004219', '#1e00a6', 'orange', '#f2bfff'];
// field for clicking and shooting balls
let activeGameField = document.getElementById('paw-div');
// paw
let paw = document.getElementById('paw');
// start button
let startButton = document.getElementById("start");
// reset the game
let resetButton = document.getElementById("reset");
// spiral path
let svgPath = document.getElementById("motionPath");
// stop creating a ball
let skipABall = false;
// chain of balls
let chainBallsField = document.getElementById('balls');
// id of the balls
let nextBallId = 0;
// field for the conclusion of the game
let endGameField = document.getElementById("end-game");
// picking a random color for a paw/bullet/balls
let randColor = colors[Math.floor(Math.random() * colors.length)];
// setting a random color to a global variable for a paw
document.documentElement.style.setProperty(`--paw-color`, `${randColor}`);
// saving last shot time to stop frequent bullet shooting 
let lastShotTime = 0;
// indicates if the Game is going
let interval = null;

//----------------------------------------------------------------------

//Start the Game
startButton.addEventListener("click", startGame);

function startGame() {
    if (interval !== null) {
        return;
    }
    startBallProduction(1);
};

function startBallProduction(durationSec) {
    interval = setInterval(createBall, 1000);
    setTimeout(stopBallProduction, durationSec * 1000);
};

//----------------------------------------------------------------------

//Reset the Game
resetButton.addEventListener("click", resetGame);

function resetGame() {
    stopBallProduction();
    deleteAllExistingBalls();

    endGameField.textContent = "";
    return;
};

function stopBallProduction() {
    clearInterval(interval);
    interval = null;
};

function deleteAllExistingBalls() {
    let child = chainBallsField.lastElementChild;
    while (child) {
        chainBallsField.removeChild(child);
        child = chainBallsField.lastElementChild;
    };
};

//----------------------------------------------------------------------

// Rotating the paw
activeGameField.addEventListener('mousemove', rotatePawOnMousemove);

function rotatePawOnMousemove(e) {
    let relX = getRelativeCoordinates(e.clientX, e.clientY).x;
    let relY = getRelativeCoordinates(e.clientX, e.clientY).y;

    let angleRad = getDirectionAngle(relX, relY);
    document.documentElement.style.setProperty(`--rotate`, `${angleRad}rad`);
};

function getRelativeCoordinates(x, y) {
    let pawBoundingRect = paw.getBoundingClientRect();
    let pawCenterX = pawBoundingRect.x + pawBoundingRect.width / 2;
    let pawCenterY = pawBoundingRect.y + pawBoundingRect.height / 2;
    let relX = x - pawCenterX;
    let relY = y - pawCenterY;

    return { 'x': relX, 'y': relY };
};

//----------------------------------------------------------------------

function getNextBallId() {
    let currentBallId = `circle${nextBallId}`;
    nextBallId += 1;

    return currentBallId;
};

// Shooting bubbles
activeGameField.addEventListener('click', shootBallOnClick);

function allocateBall(r, color, ballTotalTravelDuration, gameEndTime) {
    let bullet = document.createElementNS("http://www.w3.org/2000/svg", 'circle');
    bullet.setAttribute("id", getNextBallId());
    bullet.setAttribute("r", r);
    bullet.setAttribute("cx", 0);
    bullet.setAttribute("cy", 0);
    bullet.setAttribute('ballTotalTravelDuration', ballTotalTravelDuration);
    bullet.setAttribute("fill", color);
    registerEndGameCondition(bullet, gameEndTime);
    return bullet;
}

function shootBallOnClick(e) {
    if (new Date().getTime() - lastShotTime < 1000) {
        return;
    };
    lastShotTime = new Date().getTime();
    let relX = getRelativeCoordinates(e.clientX, e.clientY).x;
    let relY = getRelativeCoordinates(e.clientX, e.clientY).y;
    let ballsToPutInFreezer = getBallsInTailToFreeze({ 'x': relX, 'y': relY });


    let firstPaused = ballsToPutInFreezer[0];
    // console.log(firstPaused); //undefined
    let firstPausedElapsedAnimateTime = getElapsedAnimateTime(firstPaused);
    let nextBallElapsedAnimateTime = firstPausedElapsedAnimateTime + 1000;
    console.log(firstPaused)
    console.log("  " + firstPausedElapsedAnimateTime)
    console.log(nextBallElapsedAnimateTime)

    let dur = parseInt(firstPaused.getAttribute('ballTotalTravelDuration'));
    let nextBallPathLength = svgPath.getTotalLength() * nextBallElapsedAnimateTime / dur;
    skipABall = true;
    //Rand color for bullet
    let randomBulletColor = randColor;
    randColor = colors[Math.floor(Math.random() * colors.length)];
    //Creating a bullet
    let bullet = allocateBall(200, randomBulletColor, firstPaused.getAttribute("ballTotalTravelDuration"), lastShotTime + dur - firstPausedElapsedAnimateTime);
    chainBallsField.appendChild(bullet);

    let animateAttributesX = {
        attributeName: 'cx',
        from: '-5300',
        to: `${svgPath.getPointAtLength(svgPath.getTotalLength() - nextBallPathLength).x}`,
        dur: '1s',
        fill: 'freeze',
    };

    let animateAttributesY = {
        attributeName: 'cy',
        from: '3300',
        to: `${svgPath.getPointAtLength(svgPath.getTotalLength() - nextBallPathLength).y}`,
        dur: '1s',
        fill: 'freeze',
    };

    let animateX = document.createElementNS("http://www.w3.org/2000/svg", 'animate');
    let animateY = document.createElementNS("http://www.w3.org/2000/svg", 'animate');
    for (let key in animateAttributesX) {
        animateX.setAttribute(key, animateAttributesX[key])
    };
    bullet.appendChild(animateX);
    animateX.beginElement();
    for (let key in animateAttributesY) {
        animateY.setAttribute(key, animateAttributesY[key])
    };
    bullet.appendChild(animateY);
    animateY.beginElement();
    document.documentElement.style.setProperty(`--paw-color`, `${randColor}`);

    setTimeout(function () {
        bullet.parentNode.removeChild(bullet);

        let ball = allocateBall(200, randomBulletColor, firstPaused.getAttribute("ballTotalTravelDuration"), lastShotTime + dur - firstPausedElapsedAnimateTime);
        chainBallsField.appendChild(ball);

        let animateMotion = document.createElementNS("http://www.w3.org/2000/svg", 'animateMotion');
        animateMotion.setAttributeNS("http://www.w3.org/1999/xlink", "href", `#${ball.getAttribute('id')}`);
        animateMotion.setAttribute("dur", `${(dur - nextBallElapsedAnimateTime) / 1000}s`);
        animateMotion.setAttribute("keyPoints", `${1 - nextBallElapsedAnimateTime / dur};0`);
        animateMotion.setAttribute("keyTimes", `0;1`);
        animateMotion.setAttribute("fill", "freeze");

        ball.appendChild(animateMotion);

        let mpath = document.createElementNS("http://www.w3.org/2000/svg", 'mpath');
        mpath.setAttributeNS("http://www.w3.org/1999/xlink", "href", "#motionPath");

        animateMotion.appendChild(mpath);
        animateMotion.beginElement();
        let deletedBallsCounter = destroyNeighboursColors(ball);
        if (deletedBallsCounter === 0) {
            return;
        };
        let frontBalls = getBallsInFrontToFreeze({'x': relX, 'y': relY});
        frontBalls.forEach(ball => { pauseBall(ball, deletedBallsCounter) });
        
    }, 1000);

    ballsToPutInFreezer.forEach(ball => { pauseBall(ball, 1) });
};

function destroyNeighboursColors(ball) {
    let timeSortedBalls = Array.prototype.slice.call(chainBallsField.children);
    let thisBallIdx = null;

    timeSortedBalls.sort(function (left, right) {
        return getElapsedAnimateTime(left) - getElapsedAnimateTime(right);
    });
    for (let i = 0; i < timeSortedBalls.length; i += 1) {
        if (timeSortedBalls[i] === ball) {
            thisBallIdx = i;
            break;
        };
    };
    let leftIdx;
    let rightIdx = thisBallIdx
    for (leftIdx = thisBallIdx; leftIdx > 0 && timeSortedBalls[leftIdx - 1].getAttribute('fill') === ball.getAttribute('fill'); leftIdx -= 1) { };
    for (rightIdx = thisBallIdx; (rightIdx < timeSortedBalls.length - 1) && timeSortedBalls[rightIdx + 1].getAttribute('fill') === ball.getAttribute('fill'); rightIdx += 1) { };

    let deletedBallsCounter = rightIdx - leftIdx;

    if (deletedBallsCounter >= 2) {
        for (let idx = leftIdx; idx <= rightIdx; idx++) {
            chainBallsField.removeChild(timeSortedBalls[idx]);
        }
        return deletedBallsCounter + 1
    }

    return 0;
};

//----------------------------------------------------------------------

// Pause ball 
function pauseBall(ball, durationSec) {
    let endTime = parseInt(ball.getAttribute('gameEndTime'));
    let elapsedAnimateTime = getElapsedAnimateTime(ball);
    let dur = parseInt(ball.getAttribute('ballTotalTravelDuration'));
    registerEndGameCondition(ball, endTime + durationSec * 1000);
    let currentPathLength = svgPath.getTotalLength() * elapsedAnimateTime / dur;
    if (ball.children.length !== 0) {
        ball.removeChild(ball.children[0]);
    }

    ball.setAttribute('cy', `${svgPath.getPointAtLength(svgPath.getTotalLength() - currentPathLength).y}`);
    ball.setAttribute('cx', `${svgPath.getPointAtLength(svgPath.getTotalLength() - currentPathLength).x}`);
    console.log("frozen")
    console.log(ball)
    let expectedGameEndTime = ball.getAttribute('gameEndTime');
    setTimeout(function () {
        if (ball.parentNode === null || expectedGameEndTime !== ball.getAttribute('gameEndTime')) {
            return;
        }
        ball.setAttribute('cy', 0);
        ball.setAttribute('cx', 0);
        let animateMotion = document.createElementNS("http://www.w3.org/2000/svg", 'animateMotion');
        animateMotion.setAttributeNS("http://www.w3.org/1999/xlink", "href", `#${ball.getAttribute('id')}`);
        animateMotion.setAttribute("dur", `${(dur - elapsedAnimateTime) / 1000}s`);
        animateMotion.setAttribute("keyPoints", `${1 - elapsedAnimateTime / dur};0`);
        animateMotion.setAttribute("keyTimes", `0;1`);
        animateMotion.setAttribute("fill", "freeze");

        ball.appendChild(animateMotion);

        let mpath = document.createElementNS("http://www.w3.org/2000/svg", 'mpath');
        mpath.setAttributeNS("http://www.w3.org/1999/xlink", "href", "#motionPath");

        animateMotion.appendChild(mpath);
        animateMotion.beginElement();
    }, durationSec * 1000);
};

function getElapsedAnimateTime(ball) {
    let endTime = parseInt(ball.getAttribute('gameEndTime'));
    let dur = parseInt(ball.getAttribute('ballTotalTravelDuration'));
    let animateStartTime = endTime - dur;
    let elapsedAnimateTime = new Date().getTime() - animateStartTime;
    return elapsedAnimateTime;
};

//----------------------------------------------------------------------

// Creating a chain of balls
function createBall() {
    if (skipABall) {
        skipABall = false;
        return;
    };
    let ballTravelDurationSec = 40;

    let ball = allocateBall(200, colors[Math.floor(Math.random() * colors.length)], ballTravelDurationSec * 1000);
    chainBallsField.appendChild(ball);

    let animateMotion = document.createElementNS("http://www.w3.org/2000/svg", 'animateMotion');
    animateMotion.setAttributeNS("http://www.w3.org/1999/xlink", "href", `#${ball.getAttribute("id")}`);
    animateMotion.setAttribute("dur", `${ballTravelDurationSec}s`);
    animateMotion.setAttribute("keyPoints", "1;0");
    animateMotion.setAttribute("keyTimes", "0;1");
    animateMotion.setAttribute("fill", "freeze");

    ball.appendChild(animateMotion);

    let mpath = document.createElementNS("http://www.w3.org/2000/svg", 'mpath');
    mpath.setAttributeNS("http://www.w3.org/1999/xlink", "href", "#motionPath");

    animateMotion.appendChild(mpath);
    animateMotion.beginElement();

    console.log(ball);

    //check if a ball finished its way
    registerEndGameCondition(ball,
        new Date().getTime() + (ballTravelDurationSec * 1000));
};

function registerEndGameCondition(ball, gameEndTime) {
    ball.setAttribute("gameEndTime", gameEndTime);

    setTimeout(function () {
        if (ball.parentNode !== null && parseInt(ball.getAttribute('gameEndTime')) <= new Date().getTime()) {
            endGameField.textContent = "YOU LOST!";
            stopBallProduction();
        };

    }, gameEndTime - new Date().getTime());
};

//----------------------------------------------------------------------

function getBallsInFrontToFreeze(k) {
    let retIdx = []
    let rayAngle = getDirectionAngle(k.x, k.y);
    let rayAngleAdapted = (rayAngle + Math.PI + Math.PI * 2) % (Math.PI * 2);
    let ballAngleAdapteds = [];
    for (let i = 0; i < chainBallsField.children.length; i += 1) {
        let currentBallCoordinates = chainBallsField.children[i].getBoundingClientRect();
        let ballCenterX = currentBallCoordinates.x + currentBallCoordinates.width / 2;
        let ballCenterY = currentBallCoordinates.y + currentBallCoordinates.height / 2;

        let relativeBallCoordinates = getRelativeCoordinates(ballCenterX, ballCenterY); //{}

        let ballAngle = getDirectionAngle(relativeBallCoordinates.x, relativeBallCoordinates.y);
        let ballAngleAdapted = (ballAngle + Math.PI + Math.PI * 2) % (Math.PI * 2);

        if (rayAngleAdapted < ballAngleAdapted) {
            continue;
        }

        retIdx.push(i)
        ballAngleAdapteds[i] = ballAngleAdapted;
    };
    return retIdx.sort(function (left, right) {
        return ballAngleAdapteds[left] - ballAngleAdapteds[right];
    }).map(function (idx) {
        return chainBallsField.children[idx]
    });
};

// Detecting and selectiong balls that need to stop (on the right of the ray)
function getBallsInTailToFreeze(k) {
    let retIdx = []
    let rayAngle = getDirectionAngle(k.x, k.y);
    let rayAngleAdapted = (rayAngle + Math.PI + Math.PI * 2) % (Math.PI * 2);
    let ballAngleAdapteds = [];
    for (let i = 0; i < chainBallsField.children.length; i += 1) {
        let currentBallCoordinates = chainBallsField.children[i].getBoundingClientRect();
        let ballCenterX = currentBallCoordinates.x + currentBallCoordinates.width / 2;
        let ballCenterY = currentBallCoordinates.y + currentBallCoordinates.height / 2;

        let relativeBallCoordinates = getRelativeCoordinates(ballCenterX, ballCenterY); //{}

        let ballAngle = getDirectionAngle(relativeBallCoordinates.x, relativeBallCoordinates.y);
        let ballAngleAdapted = (ballAngle + Math.PI + Math.PI * 2) % (Math.PI * 2);

        if (rayAngleAdapted > ballAngleAdapted) {
            continue;
        }

        retIdx.push(i)
        ballAngleAdapteds[i] = ballAngleAdapted;
    };
    // chosenOne.setAttribute('fill', 'blue');
    // console.log(retIdx);
    return retIdx.sort(function (left, right) {
        return ballAngleAdapteds[left] - ballAngleAdapteds[right];
    }).map(function (idx) {
        return chainBallsField.children[idx]
    });
};

function getDirectionAngle(x, y) {
    return -Math.atan2(x, y) + Math.PI;
};

//--------------------------------------------------------------------------------------