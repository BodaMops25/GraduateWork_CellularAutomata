function randomBetween(min, max) {
  return Math.random() * (max - min) + min
}

const isVerticalDevice = window.innerHeight > window.innerWidth ? true : false,
      // realSizeWidth = window.innerWidth * window.devicePixelRatio,
      // realSizeHeight = window.innerHeight * window.devicePixelRatio,
      // biggerSide = isVerticalDevice ? realSizeHeight : realSizeWidth,
      smallerSide = !isVerticalDevice ? window.innerHeight : window.innerWidth

// FPS TOOL

const FPSTOOL = {
  node: document.querySelector('#fps-indicator > .fps-num'),
  time: new Date(),
  fps_number: 0,
  checkFPS: function() {
    const newDate = new Date(),
          fps = +(1000 / (newDate - this.time)).toFixed(2)

    this.time = newDate
    return this.fps_number = fps
  },
  showFPS: function() {
    return this.node.innerText = this.fps_number
  },
}

// setInterval(() => FPSTOOL.showFPS(), 250)

// TOOLS WINDOW

