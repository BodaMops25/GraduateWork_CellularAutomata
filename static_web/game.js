if(!PROJ.cellTypes) PROJ.cellTypes = []

// if(!game_fields_history) game_fields_history = []

// let PROJ.cellTypes = PROJ.cellTypes,
//     app = app,

let app = localStorage['app_' + USER.id + '_' + PROJ.title],
    game_fields_history = JSON.parse(localStorage['game_fields_history_' + USER.id + '_' + PROJ.title] || '[]')

if(app !== undefined) app = JSON.parse(app)

if(PROJ.cellTypes.length === 0) {
  PROJ.cellTypes = [
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

  // // updatePROJ.cellTypesStorage()
}

if(app === undefined) {

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

// function // updatePROJ.cellTypesStorage() {
//   localStorage.setItem('PROJ.cellTypes', JSON.stringify(PROJ.cellTypes))
// }

function updateAppStorage() {
  // localStorage.setItem('app', JSON.stringify(app))
  localStorage['app_' + USER.id + '_' + PROJ.title] = JSON.stringify(app)
}

function updateGameFieldsStorage() {
  // localStorage.setItem('game_fields_history', JSON.stringify(game_fields_history))
  localStorage['game_fields_history_' + USER.id + '_' + PROJ.title] = JSON.stringify(game_fields_history)
}

function getBasicCellIndex() {
  const result = PROJ.cellTypes.findIndex(itm => itm.isBasic)

  if(result === -1) {
    console.warn('Basic cell type not found')
    return
  }

  return result
}

function getBasicCell() {
  const result = PROJ.cellTypes.find(itm => itm.isBasic)

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
  // updatePROJ.cellTypesStorage()
})

nodes.cellDeleteBtn?.addEventListener('click', () => {
  if(confirm('Ви точно хочете видалити цей тип клітинок?') === false) return

  const selectedIndex = +nodes.cellTypesSelect.selectedOptions[0].value
  nodes.cellTypesSelect.selectedOptions[0].remove()

  deleteCellType(selectedIndex)
  // updatePROJ.cellTypesStorage()
})

function addCellType(title, color) {

  return PROJ.cellTypes.push({
    title: title,
    color: color,
    rules: []
  }) - 1
  console.log('New cell type:', title, color)
  // updatePROJ.cellTypesStorage()
}

function deleteCellType(index) {

  if(PROJ.cellTypes[index]) {
    if(PROJ.cellTypes[index].isBasic) return

    PROJ.cellTypes.splice(index, 1)

    const basicTypeIndex = getBasicCellIndex()

    gameFieldWhile(cell => {
      if(cell.from === index) cell.from = basicTypeIndex
      if(cell.to === index) cell.to = basicTypeIndex
    })
    render()
  }

  console.log('Cell type is deleted, index:', index)
  // updatePROJ.cellTypesStorage()
  location.reload()
}

function getCurrentCellIndex() {
  const index = +nodes.cellTypesSelect.selectedOptions[0].value

  if(PROJ.cellTypes[index]) return index
  else {
    console.warn('Current cell type not existing')
  }
}

function getCurrentCell() {
  const index = +nodes.cellTypesSelect.selectedOptions[0].value

  if(PROJ.cellTypes[index]) return PROJ.cellTypes[index]
  else {
    console.warn('Current cell type not existing')
  }
}

function cellTypesToOptions(selectedIndex) {
  return PROJ.cellTypes.reduce((htmlStr, itm, i) => {
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
        ruleObj = PROJ.cellTypes[getCurrentCellIndex()].rules[ruleIndex]

  item.querySelectorAll('.cell-rule-item__cells-neighbors-select').forEach((itm, index) => {
    itm.addEventListener('input', () => {
      const cellNeighbors = ruleObj.cellNeighbors,
            currentType = itm.dataset.currentType,
            newType = +itm.selectedOptions[0].value

      cellNeighbors[newType] = cellNeighbors[currentType]
      delete cellNeighbors[currentType]
      itm.dataset.currentType = newType
      neighborsCountsInputs[index].dataset.currentType = newType
      // updatePROJ.cellTypesStorage()
    })
  })

  neighborsCountsInputs.forEach(itm => {
    function checkInput() {
      const inputIsValid = itm.value.split(', ').reduce((c, itm) => isNaN(itm) ? 0 : c, 1)
            
      if(inputIsValid) {
        ruleObj.cellNeighbors[itm.dataset.currentType] = itm.value.split(', ').reduce((arr, itm) => {
          if(itm !== '') arr.push(+itm)
          return arr
        }, [])
      }
      else console.warn('input not valid')
      // updatePROJ.cellTypesStorage()
    }

    itm.addEventListener('click', () => {
      openPopup('set-rule-neighbors')
      const popup = document.querySelector('#set-rule-neighbors'),
            submitBtn = popup.querySelector('#set-rule-neighbors-save-btn')
            
            submitBtn.addEventListener('click', () => {
              const checkedIndexes = []
              popup.querySelectorAll('input[type="checkbox"').forEach((checkbox, i) => {
                if(checkbox.checked) {
                  checkedIndexes.push(i)
                  checkbox.checked = false
                }
              })

              itm.value = checkedIndexes.join(', ')
              checkInput()
              closePopup('set-rule-neighbors')
            }, {once: 1})
    })

    itm.addEventListener('input', checkInput)
  })

  probabilityInput.addEventListener('input', () => {
    if(probabilityInput.value < 0 || 100 < probabilityInput.value) return

    ruleObj.probability = +probabilityInput.value
    // updatePROJ.cellTypesStorage()
  })

  changeCellTypeOnSelect.addEventListener('input', () => {
    ruleObj.changeCellTypeOn = +changeCellTypeOnSelect.selectedOptions[0].value
    // updatePROJ.cellTypesStorage()
  })

  deleteRuleBtn.addEventListener('click', () => {
    deleteCellRule(PROJ.cellTypes[getCurrentCellIndex()], ruleIndex)
    item.remove()
  })

  return item
}

function deleteCellRule(cell, ruleIndex) {
  cell.rules.splice(ruleIndex, 1)
  // updatePROJ.cellTypesStorage()
}

function setCellRules(cellIndex) {
  const cellType = PROJ.cellTypes[cellIndex]

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
  delete PROJ.cellTypes[getBasicCellIndex()].isBasic
  if(PROJ.cellTypes[cellIndex]) PROJ.cellTypes[cellIndex].isBasic = true
  // updatePROJ.cellTypesStorage()
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

  PROJ.cellTypes[selectedCellIndex].rules.push({
    cellNeighbors: {
      [selectedCellIndex]: [0, 1, 4]
    },
    probability: 1,
    changeCellTypeOn: selectedCellIndex
  })
  // updatePROJ.cellTypesStorage()

  setCellRules(selectedCellIndex)
})

// INITS

nodes.cellTypesSelect.innerHTML = cellTypesToOptions()

setCellRules(getCurrentCellIndex())