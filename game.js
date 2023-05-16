// CANVAS SETUP

const cnvs = document.querySelector('canvas'),
      ctx = cnvs.getContext('2d'),
      cnvs_res = 1000

cnvs.width = cnvs_res
cnvs.height = cnvs_res

// GAME SETUP

const cells_res = 50,
      cells_size = cnvs_res / cells_res + 1,
      game_field = []

for(let i = 0; i < cells_res; i++) {
  game_field[i] = []
  for(let j = 0; j < cells_res; j++) game_field[i][j] = {from: 'Чорний', to: 'Чорний'}
}

function gameFieldWhile(callbackCells, callbackRows) {
  for(let i = 0; i < cells_res; i++) {
    for(let j = 0; j < cells_res; j++) callbackCells(game_field[i][j], i, j, game_field)
    if(callbackRows) callbackRows(game_field[i], i, game_field)
  }
}

// CALCULATION

function getCell(x, y) {
  return game_field[y] && game_field[y][x] !== undefined ? game_field[y][x] : null
}

function setCell(x, y, from_value, to_value) {
  const cell = getCell(x, y)
  if(cell !== null) {
    if(from_value !== undefined) cell.from = from_value
    if(to_value !== undefined) cell.to = to_value
    return cell
  }
  else console.warn('cell not exist')
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

function calculateField() {
  gameFieldWhile((value, y, x) => calculateCell(x, y))
}

// RENDER

const cnvsCllStp = cnvs_res / cells_res, // cell space size in pixels
      cntrStpCll = (cnvsCllStp - cells_size) / 2 // indent from cell space for center cell

function render() {
  ctx.clearRect(0, 0, cnvs_res, cnvs_res)
  gameFieldWhile((cell, y, x, field) => {

    ctx.fillStyle = cellTypes[cell.to !== null ? cell.to : cell.from].color

    const drawX = cnvsCllStp * x + cntrStpCll,
          drawY = cnvsCllStp * y + cntrStpCll
    ctx.fillRect(drawX, drawY, cells_size, cells_size)

    cell.from = cell.to
  })
}

const density = .5
for(let i = 0; i < cells_res**2 * density; i++) {
  setCell(Math.round(randomBetween(0, cells_res - 1)), Math.round(randomBetween(0, cells_res - 1)), 'Білий', 'Білий')
}

function frame() {
  render()
  calculateField()
}
frame()

// INTERVAL

setInterval(() => {
  frame()
  FPSTOOL.checkFPS()
}, 0)