function Popup(id, title) {
  this.popup = document.createElement('div')
  this.popup.id = id
  this.popup.classList.add('popup')

  this.popup.innerHTML = `
      <div class="popup__content-container">
      <div class="popup__content">
        <h3>${title}</h3>
        <button>Зберегти</button>
      </div>
      <div class="popup__close-button">X</div>
    </div>
  `

  this.open = () => {
    this.popup.classList.add('popup--acitve')
  }
  this.hide = () => {
    this.popup.classList.remove('popup--acitve')
  }

  this.nodes.closeBtn = this.popup.querySelector('.poput__close-button')
  this.nodes.popupContent = this.popup.querySelector('.poput__content')

  this.nodes.closeBtn.addEventListener('click', this.hide)
}

document.querySelectorAll('.popup').forEach(node => {
  node.querySelector('.popup__close-button')?.addEventListener('click', () => {
    node.classList.remove('popup--active')
  })
})

function openPopup(id) {
  document.querySelector('#' + id + '.popup').classList.add('popup--active')
}

function closePopup(id) {
  document.querySelector('#' + id + '.popup').classList.remove('popup--active')
}