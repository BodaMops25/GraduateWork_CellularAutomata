let cellTypes = null,
    app = null,
    game_fields_history = JSON.parse(localStorage.getItem('game_fields_history') || '[]')

if(localStorage.getItem('cellTypes') === null) {
  cellTypes = [
    {
      title: 'Чорний',
      isBasic: true,
      color: '#000',
      rules: [
        {
          cellNeighbors: {
            1: [3]
          },
          probability: 100,
          changeCellTypeOn: 1
        }
      ]
    },
    {
      title: 'Білий',
      color: '#fff',
      rules: [
        {
          cellNeighbors: {
            1: [0, 1, 4, 5, 6, 7, 8]
          },
          probability: 100,
          changeCellTypeOn: 0
        }
      ]
    }
  ]

  updateCellTypesStorage()
}
else cellTypes = JSON.parse(localStorage.getItem('cellTypes'))

if(localStorage.getItem('app') === null) {

  app = {
    isPlayed: true,
    animationDirection: 1,
    generation: 0,
    currentGeneration: 0,
    fps: 60,
    game_field: null,
    field_area_buffer: null
  }

  updateAppStorage()
}
else app = JSON.parse(localStorage.getItem('app'))

function updateCellTypesStorage() {
  localStorage.setItem('cellTypes', JSON.stringify(cellTypes))
}

function updateAppStorage() {
  localStorage.setItem('app', JSON.stringify(app))
}

function updateGameFieldsStorage() {
  localStorage.setItem('game_fields_history', JSON.stringify(game_fields_history))
}

function getBasicCellIndex() {
  const result = cellTypes.findIndex(itm => itm.isBasic)

  if(result === -1) {
    console.warn('Basic cell type not found')
    return
  }

  return result
}

function getBasicCell() {
  const result = cellTypes.find(itm => itm.isBasic)

  if(result === -1) {
    console.warn('Basic cell type not found')
    return
  }

  return result
}

const nodes = {
  windowSelectors: {
    top: '.tools-window--top-window',
    left: '.tools-window--left-window',
    right: '.tools-window--right-window'
  },
  cellTypesSelect: document.querySelector('#cell-types-select'),
  cellAddingForm: document.querySelector('.cell-types-tool__cell-adding-form'),
  cellDeleteBtn: document.querySelector('#delete-cell-type-button'),
  isBasicCellText: document.querySelector('#is-basic-cell-type-text'),
  makeBasicCell: document.querySelector('#make-basic-cell'),
  rulesContainer: document.querySelector('.cell-rules'),
  addRuleBtn: document.querySelector('.button-add__button')
}

nodes.cellAddingForm.addEventListener('submit', event => {
  event.preventDefault()

  const inputTitle = nodes.cellAddingForm.querySelector('input.cell-types-tool__cell-adding-title').value,
        inputColor = nodes.cellAddingForm.querySelector('input.cell-types-tool__cell-adding-color').value

  if(inputTitle === '') return

  if(Array.from(nodes.cellTypesSelect.options).find(itm => itm.innerText === inputTitle)) {
    alert('Такий тип клітинок вже існує')
    nodes.cellAddingForm.reset()
    return
  }



  const cellTypeIndex = addCellType(inputTitle, inputColor),
        newOption = document.createElement('option')

  newOption.value = cellTypeIndex
  newOption.innerText = inputTitle
  nodes.cellTypesSelect.options.add(newOption)

  nodes.cellAddingForm.reset()
  updateCellTypesStorage()
})

nodes.cellDeleteBtn?.addEventListener('click', () => {
  if(confirm('Ви точно хочете видалити цей тип клітинок?') === false) return

  const selectedIndex = +nodes.cellTypesSelect.selectedOptions[0].value
  nodes.cellTypesSelect.selectedOptions[0].remove()

  deleteCellType(selectedIndex)
  updateCellTypesStorage()
})

function addCellType(title, color) {

  return cellTypes.push({
    title: title,
    color: color,
    rules: []
  }) - 1
  console.log('New cell type:', title, color)
  updateCellTypesStorage()
}

function deleteCellType(index) {

  if(cellTypes[index]) {
    if(cellTypes[index].isBasic) return

    cellTypes.splice(index, 1)

    const basicTypeIndex = getBasicCellIndex()

    gameFieldWhile(cell => {
      if(cell.from === index) cell.from = basicTypeIndex
      if(cell.to === index) cell.to = basicTypeIndex
    })
    render()
  }

  console.log('Cell type is deleted, index:', index)
  updateCellTypesStorage()
}

function getCurrentCellIndex() {
  const index = +nodes.cellTypesSelect.selectedOptions[0].value

  if(cellTypes[index]) return index
  else {
    console.warn('Current cell type not existing')
  }
}

function getCurrentCell() {
  const index = +nodes.cellTypesSelect.selectedOptions[0].value

  if(cellTypes[index]) return cellTypes[index]
  else {
    console.warn('Current cell type not existing')
  }
}

function cellTypesToOptions(selectedIndex) {
  return cellTypes.reduce((htmlStr, itm, i) => {
    return htmlStr += `<option value="${i}" ${i === +selectedIndex ? 'selected' : ''}>${itm.title}</option>`
  }, '')
}

function createCellRuleElement(itemRule, ruleIndex) {

  const item = document.createElement('div')
  let neighborsHTML = ''

  item.classList.add('cell-rule-item')

  for(let cellType in itemRule.cellNeighbors) {
    const inputRandId = Math.round(Math.random() * 10e4)
    neighborsHTML += `
      <label for="ruleNeighborsType_${inputRandId}" class="cell-rule-item__label">Сусідів</label>
      <select id="ruleNeighborsType_${inputRandId}" data-current-type="${cellType}" class="cell-rule-item__cells-select cell-rule-item__cells-neighbors-select">
        ${cellTypesToOptions(cellType)}
      </select>
      :
      <input type="text" class="cell-rule-item__neighbors-counts" data-current-type="${cellType}" value="${itemRule.cellNeighbors[cellType].join(', ')}">
    `
  }


  const inputRandId = Math.round(Math.random() * 10e4)

  item.innerHTML = `
    <p class="cell-rule-item__title">Якщо:</p>
    <div class="cell-rule-item__description">
      ${neighborsHTML}
      <label for="cellRulesProbability_${inputRandId}" class="cell-rule-item__label">Ймовірність:</label> 
      <input id="cellRulesProbability_${inputRandId}" class="cell-rule-item__probability" type="number" min="0" max="100" step="1" value="${itemRule.probability}">
    </div>
    <p class="cell-rule-item__title">То:</p>
    <label for="ruleChangingType_${inputRandId}" class="cell-rule-item__label">Тип змінюється на:</label>
    <select id="ruleChangingType_${inputRandId}" class="cell-rule-item__cells-select">
      ${cellTypesToOptions(itemRule.changeCellTypeOn)}
    </select>
    <button class="delete-button cell-rule-item__delete-button">🗑️</button>
  `
  const neighborsCountsInputs = item.querySelectorAll('.cell-rule-item__neighbors-counts'),
        probabilityInput = item.querySelector('#cellRulesProbability_' + inputRandId),
        changeCellTypeOnSelect = item.querySelector('#ruleChangingType_' + inputRandId),
        deleteRuleBtn = item.querySelector('.cell-rule-item__delete-button'),
        ruleObj = cellTypes[getCurrentCellIndex()].rules[ruleIndex]

  item.querySelectorAll('.cell-rule-item__cells-neighbors-select').forEach((itm, index) => {
    itm.addEventListener('input', () => {
      const cellNeighbors = ruleObj.cellNeighbors,
            currentType = itm.dataset.currentType,
            newType = +itm.selectedOptions[0].value

      cellNeighbors[newType] = cellNeighbors[currentType]
      delete cellNeighbors[currentType]
      itm.dataset.currentType = newType
      neighborsCountsInputs[index].dataset.currentType = newType
      updateCellTypesStorage()
    })
  })

  neighborsCountsInputs.forEach(itm => {
    itm.addEventListener('input', () => {
      const inputIsValid = itm.value.split(', ').reduce((c, itm) => isNaN(itm) ? 0 : c, 1)
            
      if(inputIsValid) {
        ruleObj.cellNeighbors[itm.dataset.currentType] = itm.value.split(', ').reduce((arr, itm) => {
          if(itm !== '') arr.push(+itm)
          return arr
        }, [])
      }
      else console.warn('input not valid')
      updateCellTypesStorage()
    })
  })

  probabilityInput.addEventListener('input', () => {
    if(probabilityInput.value < 0 || 100 < probabilityInput.value) return

    ruleObj.probability = +probabilityInput.value
    updateCellTypesStorage()
  })

  changeCellTypeOnSelect.addEventListener('input', () => {
    ruleObj.changeCellTypeOn = +changeCellTypeOnSelect.selectedOptions[0].value
    updateCellTypesStorage()
  })

  deleteRuleBtn.addEventListener('click', () => {
    deleteCellRule(cellTypes[getCurrentCellIndex()], ruleIndex)
    item.remove()
  })

  return item
}

function deleteCellRule(cell, ruleIndex) {
  cell.rules.splice(ruleIndex, 1)
  updateCellTypesStorage()
}

function setCellRules(cellIndex) {
  const cellType = cellTypes[cellIndex]

  if(cellType.isBasic) {
    nodes.cellDeleteBtn.style.display = 'none'
    nodes.isBasicCellText.style.display = ''
    nodes.makeBasicCell.style.display = 'none'
  }
  else {
    nodes.cellDeleteBtn.style.display = ''
    nodes.isBasicCellText.style.display = 'none'
    nodes.makeBasicCell.style.display = ''
  }

  nodes.rulesContainer.innerHTML = ''
  cellType.rules.forEach((itm, index) => {
    nodes.rulesContainer.insertAdjacentElement('beforeend', createCellRuleElement(itm, index))
  })
}

function makeBasicCellFunction(cellIndex) {
  delete cellTypes[getBasicCellIndex()].isBasic
  if(cellTypes[cellIndex]) cellTypes[cellIndex].isBasic = true
  updateCellTypesStorage()
}

nodes.makeBasicCell.addEventListener('click', () => {
  makeBasicCellFunction(getCurrentCellIndex())
  nodes.makeBasicCell.style.display = 'none'
})

nodes.cellTypesSelect.addEventListener('input', event => {
  setCellRules(event.target.value)
})

nodes.addRuleBtn.addEventListener('click', () => {
  const selectedCellIndex = getCurrentCellIndex()

  cellTypes[selectedCellIndex].rules.push({
    cellNeighbors: {
      [selectedCellIndex]: [0, 1, 4]
    },
    probability: 1,
    changeCellTypeOn: selectedCellIndex
  })
  updateCellTypesStorage()

  setCellRules(selectedCellIndex)
})

// INITS

nodes.cellTypesSelect.innerHTML = cellTypesToOptions()

setCellRules(getCurrentCellIndex())