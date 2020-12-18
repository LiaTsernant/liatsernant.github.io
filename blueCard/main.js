function loadParticles(elIdx, color) {
  particlesJS(`${elIdx}`, {
    "particles": {
      "number": {
        "value": 30,
        "density": {
          "enable": true,
          "value_area": 789
        }
      },
      "color": {
        "value": `${color}`,
      },
      "shape": {
        "type": "circle",
      },
      "opacity": {
        "value": 0.8,
        "random": false,
        "anim": {
          "enable": true,
          "speed": 1,
          "opacity_min": 0,
          "sync": false
        }
      },
      "size": {
        "value": 8,
        "random": true,
        "anim": {
          "enable": true,
          "speed": 2,
          "size_min": 0,
          "sync": false
        }
      },
      "line_linked": {
        "enable": false,
      },
      "move": {
        "enable": true,
        "speed": 2,
        "direction": "bottom",
        "random": true,
        "straight": false,
        "out_mode": "out",
        "bounce": false,
        "attract": {
          "enable": false,
        }
      }
    },
    "interactivity": {
      "detect_on": "canvas",
      "events": {
        "onhover": {
          "enable": false,
          "mode": "bubble"
        },
        "onclick": {
          "enable": false,
        },
        "resize": false
      },
    },
    "retina_detect": true
  });
}

loadParticles('particles-js-blue', 'd5faff');
loadParticles('particles-js-white', 'fff');



function draw() {
  let pathArr = document.querySelectorAll('#anaplan path');
  console.log(pathArr)

  for (let i = 0; i < pathArr.length - 3; i += 1) {
    setLineStyle(pathArr[i], i);
  }

  for (let i = pathArr.length - 3; i < pathArr.length; i += 1) {
    pathArr[i].style.animation = 'fill-line 2s ease-in forwards 2s';
    pathArr[i].style.animationDelay = '4s'
  }

  // setTimeout(() => {
  //   drawLines();
  // }, 5000)
}

function drawLines() {
  let lines = document.querySelectorAll('#lines path');
  for (let i = 0; i < lines.length; i += 1) {
    setDecorationLinesStyle(lines[i], i)
  }

}

function setLineStyle(element, i) {
  setTimeout(() => {
    element.style.stroke = '#0b2265';
    element.style.strokeWidth = '2px';
    element.style.strokeDasharray = element.getTotalLength() + 'px';
    element.style.strokeDashoffset = element.getTotalLength() + 'px';
    element.style.animation = 'line-animation 2s linear forwards 2s';
  }, 200 * i);
}

draw();