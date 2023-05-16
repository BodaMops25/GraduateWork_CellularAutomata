const cellTypes = {
  'Чорний': {
    title: 'Чорний',
    color: '#000',
    rules: [
      {
        cellNeighbors: {
          'Білий': [3]
        },
        probability: 1,
        changeCellTypeOn: 'Білий'
      }
    ]
  },
  'Білий': {
    title: 'Білий',
    color: '#fff',
    rules: [
      {
        cellNeighbors: {
          'Білий': [0, 1, 4, 5, 6, 7, 8]
        },
        probability: 1,
        changeCellTypeOn: 'Чорний'
      }
    ]
  }
}

const nodes = {
  cellTypesSelect: document.querySelector('#cell-types-select'),
  cellAddingForm: document.querySelector('.cell-types-tool__cell-adding-form'),
  cellDeleteBtn: document.querySelector('.cell-types-tool__delete-type'),
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
  newOption.value = inputColor
  newOption.innerText = inputTitle
  nodes.cellTypesSelect.options.add(newOption)

  nodes.cellAddingForm.reset()

  addingCellType(inputTitle, inputColor)
})

nodes.cellDeleteBtn.addEventListener('click', () => {
  if(confirm('Ви точно хочете видалити цей тип клітинок?') === false) return

  const selectedTitle = nodes.cellTypesSelect.selectedOptions[0].innerText
  nodes.cellTypesSelect.selectedOptions[0].remove()

  deleteCellType(selectedTitle)
})

function addingCellType(title, color) {

  cellTypes[Object.entries(cellTypes).length] = {
    title: title,
    color: color,
    rules: []
  }
  console.log('New cell type:', title, color)
}

function deleteCellType(title) {
  for(const id in cellTypes) {
    if(cellTypes[id].title === title) {
      delete cellTypes[id]
      break
    }
  }

  console.log('Cell type is deleted:', title)
}