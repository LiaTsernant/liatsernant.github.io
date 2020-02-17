let colors = ['gold', '#004219', '#ff5e00'];
let activeGameField = document.getElementById('paw-div');
let paw = document.getElementById('paw');
let startButton = document.getElementById("start");
let resetButton = document.getElementById("reset");
let svgPath = document.getElementById("motionPath");
let skipABall = false;
let chainBallsField = document.getElementById('balls');
let nextBallId = 0;
let endGameField = document.getElementById("end-game");
let randColor = colors[Math.floor(Math.random() * colors.length)];
document.documentElement.style.setProperty(`--paw-color`, `${randColor}`);
let lastShotTime = 0;
let interval = null;
let isGameGoing = false;
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

activeGameField.addEventListener('click', shootBallOnClick);

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
    if (new Date().getTime() - lastShotTime < 1000) {
        return;
    };
    lastShotTime = new Date().getTime();

    let relX = getRelativeCoordinates(e.clientX, e.clientY).x;
    let relY = getRelativeCoordinates(e.clientX, e.clientY).y;

    let ballsToPutInFreezer = getBallsInTailToFreeze({ 'x': relX, 'y': relY });
    let firstPaused = ballsToPutInFreezer[0];
    let firstPausedElapsedAnimateTime = getElapsedAnimateTime(firstPaused);
    let nextBallElapsedAnimateTime = firstPausedElapsedAnimateTime + 1000;
    let dur = parseInt(firstPaused.getAttribute('ballTotalTravelDuration'));
    let nextBallPathLength = svgPath.getTotalLength() * nextBallElapsedAnimateTime / dur;

    skipABall = true;

    let randomBulletColor = randColor;
    randColor = pickRandomColor();

    let bullet = allocateBall(200, randomBulletColor, firstPaused.getAttribute("ballTotalTravelDuration"), lastShotTime + dur - firstPausedElapsedAnimateTime);
    chainBallsField.appendChild(bullet);

    let animateAttributesX = {
        attributeName: 'cx',
        from: '-5300',
        to: `${svgPath.getPointAtLength(nextBallPathLength).x}`,
        dur: '1s',
        fill: 'freeze',
    };
    let animateAttributesY = {
        attributeName: 'cy',
        from: '3300',
        to: `${svgPath.getPointAtLength(nextBallPathLength).y}`,
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
        animateMotion.setAttribute("keyPoints", `${nextBallElapsedAnimateTime / dur};1`);
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

        performWinCheck();
        let frontBalls = getBallsInFrontToFreeze({ 'x': relX, 'y': relY });
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
        for (let idx = leftIdx; idx <= rightIdx; idx += 1) {
            chainBallsField.removeChild(timeSortedBalls[idx]);
        };
        return deletedBallsCounter + 1;
    };

    return 0;
};

//----------------------------------------------------------------------

function pauseBall(ball, durationSec) {
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
        ball.setAttribute('cy', `${svgPath.getPointAtLength(currentPathLength).y}`);
        ball.setAttribute('cx', `${svgPath.getPointAtLength(currentPathLength).x}`);
        ball.setAttribute("frozen", true);
    } else {
        freezeDurationMS += parseInt(ball.getAttribute("freezeUntil")) - new Date().getTime();
    }
    let freezeUntil = new Date().getTime() + freezeDurationMS;
    ball.setAttribute("freezeUntil", freezeUntil)

    setTimeout(function () {
        if (ball.parentNode === null || freezeUntil !== parseInt(ball.getAttribute('freezeUntil'))) {
            return;
        };
        let elapsedAnimateTime = getElapsedAnimateTime(ball);
        ball.setAttribute('cy', 0);
        ball.setAttribute('cx', 0);
        ball.removeAttribute("frozen");
        let animateMotion = document.createElementNS("http://www.w3.org/2000/svg", 'animateMotion');
        animateMotion.setAttributeNS("http://www.w3.org/1999/xlink", "href", `#${ball.getAttribute('id')}`);
        animateMotion.setAttribute("dur", `${(dur - elapsedAnimateTime) / 1000}s`);
        animateMotion.setAttribute("keyPoints", `${elapsedAnimateTime / dur};1`);
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
    animateMotion.setAttribute("fill", "freeze");
    let mpath = document.createElementNS("http://www.w3.org/2000/svg", 'mpath');
    mpath.setAttributeNS("http://www.w3.org/1999/xlink", "href", "#motionPath");
    animateMotion.appendChild(mpath);
    ball.appendChild(animateMotion);
    animateMotion.beginElement();
    registerGameLostCondition(ball,
        new Date().getTime() + (ballTravelDurationSec * 1000));
};

function registerGameLostCondition(ball, gameEndTime) {
    ball.setAttribute("gameEndTime", gameEndTime);

    setTimeout(function () {
        if (ball.parentNode !== null && parseInt(ball.getAttribute('gameEndTime')) <= new Date().getTime()) {
            endGameField.textContent = "YOU LOST!";
            stopBallProduction();
            isGameGoing = false;
            return;
        };
    }, gameEndTime - new Date().getTime());
};

function performWinCheck() {
    if (chainBallsField.children.length === 0 && isGameGoing) {
        endGameField.textContent = "YOU WON!"
        isGameGoing = false;
        stopBallProduction();
        return;
    };
};

//----------------------------------------------------------------------

function getBallsInFrontToFreeze(k) {
    let leftBallsIdxs = [];

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
