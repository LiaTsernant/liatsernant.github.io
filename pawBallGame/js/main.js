// colors of the game
let colors = ['gold', '#004219', '#ff5e00'];
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
// interval for creating or skipping the ball
let interval = null;
// shows if game is going
let isGameGoing = false;
// background music
let audio = document.getElementById("audio");

//----------------------------------------------------------------------

startButton.addEventListener("click", startGame);

function startGame() {
    playMusic()
    endGameField.textContent = "LET'S PLAY!";

    isGameGoing = true;
    if (interval !== null) {
        return;
    }
    startBallProduction(20);
};

function startBallProduction(durationSec) {
    interval = setInterval(produceBall, 1000);
    setTimeout(stopBallProduction, durationSec * 1000);
};

function pickRandomColor() {
    randColor = colors[Math.floor(Math.random() * colors.length)];
    return randColor;
};

function playMusic() {
    audio.currentTime = 0.0;
    audio.play();
};

//----------------------------------------------------------------------

//Reset the Game
resetButton.addEventListener("click", resetGame);

function resetGame() {
    stopMusic();
    isGameGoing = false;
    stopBallProduction();
    deleteAllExistingBalls();

    endGameField.textContent = "LET'S PLAY!";
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

function stopMusic() {
    audio.pause();
    audio.currentTime = 0.0;
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

// Get id number for the new ball
function getNextBallId() {
    let currentBallId = `circle${nextBallId}`;
    nextBallId += 1;

    return currentBallId;
};

// Shooting bubbles
activeGameField.addEventListener('click', shootBallOnClick);

// Allocates space for creating a ball
function allocateBall(r, color, ballTotalTravelDuration, gameEndTime) {
    let bullet = document.createElementNS("http://www.w3.org/2000/svg", 'circle');
    bullet.setAttribute("id", getNextBallId());
    bullet.setAttribute("r", r);
    bullet.setAttribute("cx", 0);
    bullet.setAttribute("cy", 0);
    bullet.setAttribute('ballTotalTravelDuration', ballTotalTravelDuration);
    bullet.setAttribute("fill", color);
    registerGameLostCondition(bullet, gameEndTime);
    return bullet;
};

function shootBallOnClick(e) {
    if (isGameGoing === false) {
        return;
    };
    // Not allowed to shoot more often than 1s
    if (new Date().getTime() - lastShotTime < 1000) {
        return;
    };
    lastShotTime = new Date().getTime();

    //creating coordinates for a bullet
    let relX = getRelativeCoordinates(e.clientX, e.clientY).x;
    let relY = getRelativeCoordinates(e.clientX, e.clientY).y;

    // selects balls `before` the bullet
    let ballsToPutInFreezer = getBallsInTailToFreeze({ 'x': relX, 'y': relY });

    // selects the closest to the bullet
    let firstPaused = ballsToPutInFreezer[0];
    let firstPausedElapsedAnimateTime = getElapsedAnimateTime(firstPaused);
    let nextBallElapsedAnimateTime = firstPausedElapsedAnimateTime + 1000;

    // total travel duration of the ball
    let dur = parseInt(firstPaused.getAttribute('ballTotalTravelDuration'));

    // get the length of the path of the next ball
    let nextBallPathLength = svgPath.getTotalLength() * nextBallElapsedAnimateTime / dur;

    // skip creating a new ball to compensate paused time
    skipABall = true;

    let randomBulletColor = randColor;
    randColor = pickRandomColor();

    //Creating a bullet
    let bullet = allocateBall(200, randomBulletColor, firstPaused.getAttribute("ballTotalTravelDuration"), lastShotTime + dur - firstPausedElapsedAnimateTime);
    chainBallsField.appendChild(bullet);

    // coordinates where the bullet comes from 
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

    // coordinates for bullet animation
    let animateX = document.createElementNS("http://www.w3.org/2000/svg", 'animate');
    let animateY = document.createElementNS("http://www.w3.org/2000/svg", 'animate');
    for (let key in animateAttributesX) {
        animateX.setAttribute(key, animateAttributesX[key])
    };

    // assembling the bullet
    bullet.appendChild(animateX);
    animateX.beginElement();
    for (let key in animateAttributesY) {
        animateY.setAttribute(key, animateAttributesY[key])
    };
    bullet.appendChild(animateY);
    animateY.beginElement();
    document.documentElement.style.setProperty(`--paw-color`, `${randColor}`);

    // ??????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????
    setTimeout(function () {
        bullet.parentNode.removeChild(bullet);

        // creates a regular ball instead of the bullet and appends to parent group
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

        // number of deleted balls from the chain
        let deletedBallsCounter = destroyNeighboursColors(ball);

        if (deletedBallsCounter === 0) {
            return;
        };

        //checks of won the game
        performWinCheck();
        //selects the part of the chain 'on the left' from the bullet and holds them for a second
        let frontBalls = getBallsInFrontToFreeze({ 'x': relX, 'y': relY });
        frontBalls.forEach(ball => { pauseBall(ball, deletedBallsCounter) });
    }, 1000);

    //holds balls on the right for a second
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
        };
        return deletedBallsCounter + 1
    };

    return 0;
};

//----------------------------------------------------------------------

// Pause ball 
function pauseBall(ball, durationSec) {
    // time when the ball will finish the way
    let endTime = parseInt(ball.getAttribute('gameEndTime'));
    let elapsedAnimateTime = getElapsedAnimateTime(ball);
    let dur = parseInt(ball.getAttribute('ballTotalTravelDuration'));
    registerGameLostCondition(ball, endTime + durationSec * 1000);
    let currentPathLength = svgPath.getTotalLength() * elapsedAnimateTime / dur;
    if (ball.children.length !== 0) {
        ball.removeChild(ball.children[0]);
    };

    let freezeDurationMS = durationSec * 1000; 
    if (ball.getAttribute("frozen") === null) {
        ball.setAttribute('cy', `${svgPath.getPointAtLength(svgPath.getTotalLength() - currentPathLength).y}`);
        ball.setAttribute('cx', `${svgPath.getPointAtLength(svgPath.getTotalLength() - currentPathLength).x}`);
        ball.setAttribute("frozen", true);
        console.log('primary freeze')
    } else {
        console.log('secondary freeze')
        freezeDurationMS += parseInt(ball.getAttribute("freezeUntil")) - new Date().getTime();
    }
    let freezeUntil = new Date().getTime() + freezeDurationMS;
    ball.setAttribute("freezeUntil", freezeUntil)




    //????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????
    setTimeout(function () {
        if (ball.parentNode === null || freezeUntil !== parseInt(ball.getAttribute('freezeUntil'))) {
            return;
        };

        console.log("unfreeze")
        let elapsedAnimateTime = getElapsedAnimateTime(ball);
        ball.setAttribute('cy', 0);
        ball.setAttribute('cx', 0);
        ball.removeAttribute("frozen");
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
    }, freezeDurationMS);
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
function produceBall() {
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

    //check if a ball finished its way
    registerGameLostCondition(ball,
        new Date().getTime() + (ballTravelDurationSec * 1000));
};

function registerGameLostCondition(ball, gameEndTime) {
    ball.setAttribute("gameEndTime", gameEndTime);

    setTimeout(function () {
        // if balls left and game end time of a ball in 'now'
        if (ball.parentNode !== null && parseInt(ball.getAttribute('gameEndTime')) <= new Date().getTime()) {
            endGameField.textContent = "YOU LOST!";
            stopBallProduction();
            isGameGoing = false;
            return;
        };
    }, gameEndTime - new Date().getTime());
};

function performWinCheck() {
    // if no balls left, but the game is going
    if (chainBallsField.children.length === 0 && isGameGoing) {
        endGameField.textContent = "YOU WON!"
        isGameGoing = false;
        stopBallProduction();
        return;
    };
};

//----------------------------------------------------------------------

// Detecting and selecting balls that need to stop (on the left of the ray)
function getBallsInFrontToFreeze(k) {
    let leftBallsIdxs = [];

    let rayAngle = getDirectionAngle(k.x, k.y);
    let rayAngleAdapted = (rayAngle + Math.PI + Math.PI * 2) % (Math.PI * 2);
    //arrar of balls angles
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
        };

        leftBallsIdxs.push(i)
        ballAngleAdapteds[i] = ballAngleAdapted;
    };
    return leftBallsIdxs.sort(function (left, right) {
        return ballAngleAdapteds[left] - ballAngleAdapteds[right];
    }).map(function (idx) {
        return chainBallsField.children[idx]
    });
};

// Detecting and selecting balls that need to stop (on the right of the ray)
function getBallsInTailToFreeze(k) {
    let rightBallsIdxs = []
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
        };

        rightBallsIdxs.push(i)
        ballAngleAdapteds[i] = ballAngleAdapted;
    };

    return rightBallsIdxs.sort(function (left, right) {
        return ballAngleAdapteds[left] - ballAngleAdapteds[right];
    }).map(function (idx) {
        return chainBallsField.children[idx]
    });
};

function getDirectionAngle(x, y) {
    return -Math.atan2(x, y) + Math.PI;
};

//--------------------------------------------------------------------------------------