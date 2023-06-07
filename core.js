let isReseting = false

function hexToRGBA(hex, alpha = 1) {
  hex = hex.replace('#', '')
  const shorthandRegex = /^([a-f\d])([a-f\d])([a-f\d])$/i
  hex = hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b)

  const bigint = parseInt(hex, 16)
  const r = (bigint >> 16) & 255
  const g = (bigint >> 8) & 255
  const b = bigint & 255

  const rgba = `rgba(${r}, ${g}, ${b}, ${alpha})`

  return rgba
}

function randomBetween(min, max) {
  return Math.random() * (max - min) + min
}

const isVerticalDevice = window.innerHeight > window.innerWidth ? true : false,
      // realSizeWidth = window.innerWidth * window.devicePixelRatio,
      // realSizeHeight = window.innerHeight * window.devicePixelRatio,
      // biggerSide = isVerticalDevice ? realSizeHeight : realSizeWidth,
      smallerSide = !isVerticalDevice ? window.innerHeight : window.innerWidth

// POPUPS

document.querySelectorAll('.popup').forEach(node => {
  node.querySelector('.popup__close-button').addEventListener('click', () => {
    node.classList.remove('popup--active')
  })
})

function openPopup(id) {
  document.querySelector('#' + id + '.popup').classList.add('popup--active')
}

// APP

function resetProject() {
  const answer = confirm('Ви точно хочете очистити проет?')
  if(answer) {
    isReseting = true

    localStorage.removeItem('app')
    localStorage.removeItem('cellTypes')
    localStorage.removeItem('game_fields_history')

    location.reload()
  }
}

// FPS TOOL

const FPSTOOL = {
  node: document.querySelector('#fps-indicator > .fps-num'),
  time: new Date(),
  max_checks_num: 50,
  checks_for_avarage: [],
  get fps_number() {
    return (this.checks_for_avarage.reduce((sum, num) => sum + num, 0) / this.checks_for_avarage.length).toFixed(1)
  },
  checkFPS: function() {
    const newDate = new Date(),
          fps = +(1000 / (newDate - this.time)).toFixed(2)

    this.time = newDate
    
    if(this.checks_for_avarage[this.max_checks_num-1]) this.checks_for_avarage.shift()
    this.checks_for_avarage.push(fps)
  },
  showFPS: function() {
    return this.node.innerText = this.fps_number
  },
}

setInterval(() => FPSTOOL.showFPS(), 250)