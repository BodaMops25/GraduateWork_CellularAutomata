let cellTypes = null,
    app = null,
    game_fields_history = JSON.parse(localStorage.getItem('game_fields_history') || '[]')

if(localStorage.getItem('cellTypes') === null) {
  cellTypes = {
    'Чорний': {
      isBasic: true,
      color: '#000',
      rules: [
        {
          cellNeighbors: {
            'Білий': [3]
          },
          probability: 100,
          changeCellTypeOn: 'Білий'
        }
      ]
    },
    'Білий': {
      color: '#fff',
      rules: [
        {
          cellNeighbors: {
            'Білий': [0, 1, 4, 5, 6, 7, 8]
          },
          probability: 100,
          changeCellTypeOn: 'Чорний'
        }
      ]
    }
  }

  updateLocalStorage()
}
else cellTypes = JSON.parse(localStorage.getItem('cellTypes'))

if(localStorage.getItem('app') === null) {

  app = {
    isPlayed: true,
    generation: 0,
    fps: 60,
    game_field: null
  }

  updateAppStorage()
}
else app = JSON.parse(localStorage.getItem('app'))

function updateLocalStorage() {
  localStorage.setItem('cellTypes', JSON.stringify(cellTypes))
}

function updateAppStorage() {
  localStorage.setItem('app', JSON.stringify(app))
}

function updateGameFieldsStorage() {
  localStorage.setItem('game_fields_history', JSON.stringify(game_fields_history))
}

function getBasicCellId() {
  let title = ''

  for(const id in cellTypes) {
    if(cellTypes[id].isBasic) {
      title = id
      break
    }
  }
  return title
}

const nodes = {
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

  const newOption = document.createElement('option')
  newOption.value = inputTitle
  newOption.innerText = inputTitle
  nodes.cellTypesSelect.options.add(newOption)

  nodes.cellAddingForm.reset()

  addingCellType(inputTitle, inputColor)
  updateLocalStorage()
})

nodes.cellDeleteBtn?.addEventListener('click', () => {
  if(confirm('Ви точно хочете видалити цей тип клітинок?') === false) return

  const selectedTitle = nodes.cellTypesSelect.selectedOptions[0].innerText
  nodes.cellTypesSelect.selectedOptions[0].remove()

  deleteCellType(selectedTitle)
  updateLocalStorage()
})

function addingCellType(title, color) {

  cellTypes[title] = {
    color: color,
    rules: []
  }
  console.log('New cell type:', title, color)
  updateLocalStorage()
}

function deleteCellType(title) {
  if(cellTypes[title] && cellTypes[title].isBasic) return
  for(const id in cellTypes) {
    if(id === title) {
      delete cellTypes[id]

      const basicType = getBasicCellId()

      gameFieldWhile(cell => {
        if(cell.from === title) cell.from = basicType
        if(cell.to === title) cell.to = basicType
      })
      render()

      break
    }
  }

  console.log('Cell type is deleted:', title)
  updateLocalStorage()
}

function getCurrentCellId() {
  return nodes.cellTypesSelect.selectedOptions[0].value
}

function cellTypesToOptions(selectedTitle) {
  let htmlStr = ''
  for(let title in cellTypes) {
    htmlStr += `<option value="${title}" ${title === selectedTitle ? 'selected' : ''}>${title}</option>`
  }
  return htmlStr
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
        ruleObj = cellTypes[getCurrentCellId()].rules[ruleIndex]

  item.querySelectorAll('.cell-rule-item__cells-neighbors-select').forEach((itm, index) => {
    itm.addEventListener('input', () => {
      const cellNeighbors = ruleObj.cellNeighbors,
            currentType = itm.dataset.currentType,
            newType = itm.selectedOptions[0].value

      cellNeighbors[newType] = cellNeighbors[currentType]
      delete cellNeighbors[currentType]
      itm.dataset.currentType = newType
      neighborsCountsInputs[index].dataset.currentType = newType
      updateLocalStorage()
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
      updateLocalStorage()
    })
  })

  probabilityInput.addEventListener('input', () => {
    if(probabilityInput.value < 0 || 100 < probabilityInput.value) return

    ruleObj.probability = +probabilityInput.value
    updateLocalStorage()
  })

  changeCellTypeOnSelect.addEventListener('input', () => {
    ruleObj.changeCellTypeOn = changeCellTypeOnSelect.selectedOptions[0].value
    updateLocalStorage()
  })

  deleteRuleBtn.addEventListener('click', () => {
    deleteCellRule(cellTypes[getCurrentCellId()], ruleIndex)
    item.remove()
  })

  return item
}

function deleteCellRule(cell, ruleIndex) {
  cell.rules.splice(ruleIndex, 1)
  updateLocalStorage()
}

function setCellRules(cellTitle) {
  const cellType = cellTypes[cellTitle]

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

function makeBasicCellFunction(cellId) {
  delete cellTypes[getBasicCellId()].isBasic
  if(cellTypes[cellId]) cellTypes[cellId].isBasic = true
  updateLocalStorage()
}

nodes.makeBasicCell.addEventListener('click', () => {
  makeBasicCellFunction(getCurrentCellId())
  nodes.makeBasicCell.style.display = 'none'
})

nodes.cellTypesSelect.addEventListener('input', event => {
  setCellRules(event.target.value)
})

nodes.addRuleBtn.addEventListener('click', () => {
  const selectedCellTitle = getCurrentCellId()

  cellTypes[selectedCellTitle].rules.push({
    cellNeighbors: {
      [selectedCellTitle]: [0, 1, 4]
    },
    probability: 1,
    changeCellTypeOn: selectedCellTitle
  })
  updateLocalStorage()

  setCellRules(selectedCellTitle)
})

// INITS

nodes.cellTypesSelect.innerHTML = cellTypesToOptions()

setCellRules(getCurrentCellId())