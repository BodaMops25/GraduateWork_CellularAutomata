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

// app

function resetProject() {
  const answer = confirm('Ви точно хочете очистити проет?')
  if(answer) {
    isReseting = true

    localStorage.removeItem('app_' + USER.id + '_' + PROJ.title)
    // localStorage.removeItem('cellTypes')
    localStorage.removeItem('game_fields_history_' + USER.id + '_' + PROJ.title)

    PROJ.cellTypes = []
    // game_fields_history = []

    location.reload()
  }
}

window.addEventListener('beforeunload', () => {

  if(isReseting === false) {
    updateGameFieldsStorage()
    updateAppStorage()
  }

  fetch('users', {
    method: 'PUT',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
      auth: {
        name: USER.id,
        pass: USER.pass
      },
      body: {
        projects: USER.projects
      }
    }),
    keepalive: true
  })
    .then(res => {
      if(res.status === 401) alert('Ви не авторизовані')
      else if(res.status === 500) alert('Щось пішло не так, спробуйте пізніше')
    })
  // }
})

// FPS TOOL

// const FPSTOOL = {
//   node: document.querySelector('#fps-indicator > .fps-num'),
//   time: new Date(),
//   max_checks_num: 50,
//   checks_for_avarage: [],
//   get fps_number() {
//     return (this.checks_for_avarage.reduce((sum, num) => sum + num, 0) / this.checks_for_avarage.length).toFixed(1)
//   },
//   checkFPS: function() {
//     const newDate = new Date(),
//           fps = +(1000 / (newDate - this.time)).toFixed(2)

//     this.time = newDate
    
//     if(this.checks_for_avarage[this.max_checks_num-1]) this.checks_for_avarage.shift()
//     this.checks_for_avarage.push(fps)
//   },
//   showFPS: function() {
//     return this.node.innerText = this.fps_number
//   },
// }

// setInterval(() => FPSTOOL.showFPS(), 250)