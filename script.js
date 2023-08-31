'use strict'

//Класс поля
class Field {
  constructor(init) {
    this.w = init.fieldWidth
    this.h = init.fieldHeight
    this.node = document.querySelector('.field')
    this.node.style.width = `${this.w}em`
    this.html = this.draw()
    this.array = Array.from(this.html.childNodes)
  }

  //метод генерирующий поле
  draw() {
    let createCell = () => {
      let cell = document.createElement('div')
      cell.classList.add('cell')
      return cell
    };

    let fieldHtml = new Array(this.w * this.h)
      .fill(0)
      .reduce((acc, item) => {
        const cell = createCell()
        acc.appendChild(cell)
        return acc
      }, this.node)
    return fieldHtml
  }
}

//Класс змейки
class Snake {
  constructor(init) {
    this.body = [[Math.floor(init.fieldWidth / 2), Math.floor(init.fieldHeight / 2)]].reduce((acc, item, index, array) => {
      let newItem = [item[0] + 0, item[1] + 1]
      acc.push(array[0])
      acc.push(newItem)
      return acc
    }, []);
    this.bodyLength = init.startSnakeLength;
    this.direction = {
      ArrowUp: [0, -1],
      ArrowDown: [0, 1],
      ArrowRight: [1, 0],
      ArrowLeft: [-1, 0],
    };
    this.currentDir = this.direction.ArrowUp
  }

  update(field, [x, y]) {
    return y * field.h + x
  }

  draw(field, item) {
    let cellIndex = this.update(field, item)
    let cell = field.array[cellIndex]
    cell.classList.toggle('cell__snake')
  }

  move(food, field, score) {
    let [headPosition] = this.body
    let nextHeadPosition = [headPosition[0] + this.currentDir[0], headPosition[1] + this.currentDir[1]]

    if (nextHeadPosition[0] < 0) {
      nextHeadPosition[0] = field.w - 1
    }
    if (nextHeadPosition[0] >= field.w) {
      nextHeadPosition[0] = 0
    }
    if (nextHeadPosition[1] < 0) {
      nextHeadPosition[1] = field.h - 1
    }
    if (nextHeadPosition[1] >= field.h) {
      nextHeadPosition[1] = 0
    }

    let nextHeadCell = field.array[this.update(field, nextHeadPosition)]

    if (nextHeadCell.classList.contains('cell__snake')) {
      gameOver(field, score)
    }
    nextHeadCell.classList.toggle('cell__snake')
    this.body.unshift(nextHeadPosition)
    if (nextHeadCell.classList.contains('cell__food')) {
      nextHeadCell.classList.toggle('cell__food')
      score.increase()
      food.draw(field)
      return
    }
    let tailPosition = this.body.pop();
    let tailCell = field.array[this.update(field, tailPosition)]
    tailCell.classList.toggle('cell__snake')
  }
}

//Класс еды
class Food {
  constructor() { }

  draw(field) {
    let emptyCells = field.array.filter(cell => !cell.classList.contains('cell__snake'))
    let randomPosition = Math.floor(Math.random() * emptyCells.length)
    emptyCells[randomPosition].classList.toggle('cell__food')
  }
}

//Класс отображения очков
class Score {
  constructor() {
    this.currentValue = 0
    this.bestValue = localStorage.getItem('bestValue') ? localStorage.getItem('bestValue') : 0
    this.currentNode = document.getElementById('score-current-value')
    this.bestNode = document.getElementById('score-best-value')
  }

  //метод увеличения текущего значения очков
  increase() {
    this.currentValue++
    this.currentNode.innerHTML = this.currentValue
  }

  //метод очистки текущего значения очков
  clear() {
    this.currentValue = 0
    this.currentNode.innerHTML = this.currentValue
  }

  //метод отображения рекорда
  best() {
    this.bestValue = this.currentValue > this.bestValue ? this.currentValue : this.bestValue
    if (this.bestValue) this.bestNode.parentElement.classList.add('score_best__active')
    this.bestNode.innerHTML = this.bestValue
    localStorage.setItem('bestValue', this.bestValue)
  }
}

//входная точка игры
function startGame() {
  let field = new Field(init)
  let snake = new Snake(init)
  let food = new Food()
  let score = new Score()

  score.clear()
  score.best()

  document.addEventListener('keydown', (event) => {
    if (event.code in snake.direction) {
      const falseDirectionUp = snake.currentDir === snake.direction.ArrowDown && event.code === 'ArrowUp'
      const falseDirectionDown = snake.currentDir === snake.direction.ArrowUp && event.code === 'ArrowDown'
      const falseDirectionRight = snake.currentDir === snake.direction.ArrowLeft && event.code === 'ArrowRight'
      const falseDirectionLeft = snake.currentDir === snake.direction.ArrowRight && event.code === 'ArrowLeft'
      if (falseDirectionUp || falseDirectionDown || falseDirectionRight || falseDirectionLeft) return
      snake.currentDir = snake.direction[event.code]
    }
  })

  snake.body.forEach((item) => {
    snake.draw(field, item)
  })
  food.draw(field)
  moveInterval = setInterval(() => {
    snake.move(food, field, score)
  }, 500)
}

// Функция завершения игры при столкновении с хвостом
function gameOver(field, score) {
  clearInterval(moveInterval)
  let snakeCells = field.array.filter(cell => cell.classList.contains('cell__snake'))
  snakeCells.forEach((cell) => {
    cell.classList.add('snake-fail')
  })
  score.best()
  document.querySelector('.game-over').classList.toggle('game-over__active')
}

let moveInterval

const init = {
  fieldWidth: 10,
  fieldHeight: 10,
  startSnakeLength: 2,
}

startGame()

document.querySelector('.btn-reset').addEventListener('click', () => {
  document.querySelector('.game-over').classList.toggle('game-over__active')
  document.querySelector('.field').innerHTML = ''
  startGame()
})