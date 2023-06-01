// CANVAS SETUP

const cnvs = document.querySelector('canvas'),
      ctx = cnvs.getContext('2d'),
      cnvs_res = 1000

cnvs.width = cnvs_res
cnvs.height = cnvs_res

const cnvsPageSize = smallerSide * .8

cnvs.style.width = cnvsPageSize + 'px'
cnvs.style.height = cnvsPageSize + 'px'

// GAME SETUP

const cells_res = 50,
      cells_size = cnvs_res / cells_res + 1

      const cnvsCllStp = cnvs_res / cells_res, // cell space size in pixels
      cntrStpCll = (cnvsCllStp - cells_size) / 2 // indent from cell space for center cell

if(app.game_field === null) {
  app.game_field = []

  for(let i = 0; i < cells_res; i++) {
    app.game_field[i] = []
    for(let j = 0; j < cells_res; j++) app.game_field[i][j] = {from: getBasicCellIndex(), to: getBasicCellIndex()}
  }

  randomFillCells(1, .5)
}

function gameFieldWhile(callbackCells, callbackRows) {
  for(let i = 0; i < cells_res; i++) {
    if(callbackRows) callbackRows(app.game_field[i], i, app.game_field)
    for(let j = 0; j < cells_res; j++) callbackCells(app.game_field[i][j], j, i, app.game_field)
  }
}

// CALCULATION

function getCell(x, y) {
  return app.game_field[y] && app.game_field[y][x] !== undefined ? app.game_field[y][x] : null
}

function setCell(x, y, from_value, to_value) {
  const cell = getCell(x, y)
  if(cell !== null) {
    if(from_value !== undefined) cell.from = from_value
    if(to_value !== undefined) cell.to = to_value
    return cell
  }
  else console.warn('Cell not existing')
}

function getCellNeighbors(x, y) {
  return [
    getCell(x-1, y-1),
    getCell(x, y-1),
    getCell(x+1, y-1),
    getCell(x+1, y),
    getCell(x+1, y+1),
    getCell(x, y+1),
    getCell(x-1, y+1),
    getCell(x-1, y),
  ]
}

function calculateCell(x, y) {

  const cell = getCell(x, y)
  if(cell !== null) {

    const neighborsCounts = getCellNeighbors(x, y).reduce((obj, itm) => {
      if(itm === null) itm = {from: null}
      obj[itm.from] ? obj[itm.from]++ : obj[itm.from] = 1
      return obj
    }, {})

    cellTypes[cell.from].rules.forEach(({cellNeighbors, probability, changeCellTypeOn}) => {
      for(const key in cellNeighbors) {
        if(!neighborsCounts[key]) neighborsCounts[key] = 0
        if(cellNeighbors[key].find(itm => itm === neighborsCounts[key]) !== undefined) setCell(x, y, undefined, changeCellTypeOn)
      }
    })
  }

  return getCell(x, y) 
}

const automatonStepsNode = document.querySelector('#automaton-steps')

function calculateField() {
  const clonedFiled = []

  gameFieldWhile(
    (cell, x, y) => {
      calculateCell(x, y)

      clonedFiled[y][x] = cell.from
    }
    ,(row, i) => clonedFiled[i] = []
  )

  automatonStepsNode.innerText = ++app.generation
  updateAppStorage()

  game_fields_history[app.generation] = clonedFiled
}

function setField(fieldImgae) {
  
}

// RENDER

function drawCell(x, y, size, color) {
  ctx.fillStyle = color

  const drawX = cnvsCllStp * x + cntrStpCll,
        drawY = cnvsCllStp * y + cntrStpCll
  ctx.fillRect(drawX, drawY, cells_size, cells_size)
}

function render() {
  ctx.clearRect(0, 0, cnvs_res, cnvs_res)
  gameFieldWhile((cell, x, y, field) => {

    const cellType = cellTypes[cell.to !== null ? cell.to : cell.from]
    if(cellType === undefined) return

    drawCell(x, y, cells_size, cellType.color)
    cell.from = cell.to
  })

  updateAppStorage()
}

// TOOLS

function randomFillCells(cellTypeIndex, density) {
  for(let i = 0; i < cells_res**2 * density; i++) {
    setCell(Math.round(randomBetween(0, cells_res - 1)), Math.round(randomBetween(0, cells_res - 1)), cellTypeIndex, cellTypeIndex)
  }
  render()
}

function clearField() {
  const cellTypeIndex = getBasicCellIndex()
  gameFieldWhile((cell, x, y) => {
    setCell(x, y, cellTypeIndex, cellTypeIndex)
  })
  render()
}

function fillField(cellTypeIndex) {
  gameFieldWhile((cell, x, y) => {
    setCell(x, y, cellTypeIndex, cellTypeIndex)
  })
  render()
}

function frame() {
  calculateField()
  render()
}

// PAINTING

const paintToolNode = document.querySelector('#painting-tool')
let isPainting = false,
    isPointerDown = false

paintToolNode.addEventListener('click', () => {
  paintToolNode.classList.toggle('tools-window--top-window__tool-icon--active')
  isPainting = !isPainting
})

function makeDrawing(event) {
  if(isPainting && isPointerDown) {
    const realCellSize = cnvs.offsetWidth / cells_res,
          fieldX = Math.floor(event.offsetX / realCellSize),
          fieldY = Math.floor(event.offsetY / realCellSize)

    setCell(fieldX, fieldY, getCurrentCellIndex(), getCurrentCellIndex())
    drawCell(fieldX, fieldY, cells_size, cellTypes[getCurrentCellIndex()].color)
  }
}

cnvs.addEventListener('pointerdown', event => {
  isPointerDown = true
  makeDrawing(event)
})
cnvs.addEventListener('pointerup', () => isPointerDown = false)
cnvs.addEventListener('pointermove', makeDrawing)

// TIME MANIPULATING

let interval = null

const pauseNode = document.querySelector('#pause-automaton'),
      animateNode = document.querySelector('#animate-automaton'),
      nextStepNode = document.querySelector('#next-step-automaton'),
      framerateInput = document.querySelector('#automaton-framerate')

function makeInterval() {
  clearInterval(interval)
  interval = setInterval(() => {
    frame()

    FPSTOOL.checkFPS()
  }, 1000 / framerateInput.value)

  app.isPlayed = true
  updateAppStorage()
}

nextStepNode.addEventListener('click', frame)
animateNode.addEventListener('click', makeInterval)
pauseNode.addEventListener('click', () => {
  clearInterval(interval)
  interval = null
  app.isPlayed = false

  updateAppStorage()
})
framerateInput.addEventListener('input', () => {
  if(1 <= +framerateInput.value && +framerateInput.value <= 1000) {
    app.fps = +framerateInput.value
    updateAppStorage()

    if(app.isPlayed) makeInterval()
  }
})

// INIT

render()
framerateInput.value = app.fps
automatonStepsNode.innerText = app.generation




window.addEventListener('beforeunload', updateGameFieldsStorage)