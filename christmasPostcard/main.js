function loadParticles(elIdx, color) {
  particlesJS(`${elIdx}`, {
    "particles": {
      "number": {
        "value": 15,
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
        "value": 10,
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
        "enable": false,
        "speed": 0.9,
        "direction": "none",
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
          "enable": true,
          "mode": "bubble"
        },
        "onclick": {
          "enable": false,
        },
        "resize": true
      },
    },
    "retina_detect": true
  });
}

loadParticles('particles-js-red','ff5650');
loadParticles('particles-js-blue', '509cff');
loadParticles('particles-js-green', '50ff85');
loadParticles('particles-js-yellow', 'f3ff50');
loadParticles('particles-js-orange', 'ff9050');
loadParticles('particles-js-purple', 'dc50ff');

