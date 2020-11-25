let map = [];

// создаем матрицу 15 на 15 ячеек
for (let row = 0; row < 15; row++) {
  map.push([]);
  for (let col = 0; col < 15; col++) {
    map[row].push(0);
  }
}

mainFunc();


function mainFunc() {
  let table = document.getElementById('table');
  let tableConstructor = ""

  const rows = map.length, cols = map[0].length;
  for (let row = 0; row < rows; row++) { // визуализируем матрицу
    // открываем строку таблицы
    tableConstructor += "<tr>";
    for (let col = 0; col < cols; col++) {
      if (map[row][col]) {
        // если ячейка = 1 - заполняем ячейку оранжевым цветом
        tableConstructor += `<td style="background-color: darkorange" onclick="editMap(0, ${row}, ${col})" id="td${row+""+col}"></td>`;
      } else {
        // если ячейка = 0 - заполняем ячейку синим цветом
        tableConstructor += `<td style="background-color: blue" onclick="editMap(1, ${row}, ${col})" id="td${row+""+col}"></td>`;
      }
    }
    // закрываем строку таблицы
    tableConstructor += "</tr>";
  }
  table.innerHTML = tableConstructor;

  // выводим результат, параллельно вызывая функцию подсчета площади островов
  document.getElementById('result').innerHTML = 'Площадь самого большого острова равна ' + 
                                                searchArea(map) + 
                                                ' клеткам'
}


function editMap(param, row, col) {
  // в случае клика на ячейку - меняем ячейке с 0 на 1 или наоборот
  map[row][col] = param;

  // делаем ререндер
  mainFunc()
}


function searchArea(arr) {

  const rows = arr.length, cols = arr[0].length; // размеры матрицы

  let islands = 0, 
      eaten = []; // острова, примкнувшие к другим на поздних итерациях поиска

  let left = 0, // участок слева
      up = 0, // участок сверху
      left_up = 0, // участок слева сверху
      right_up = 0; // участок справа сверху

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      
      if (!arr[row][col]) continue; // море 

      left = col > 0 ? arr[row][col - 1] : 0;
      up = row > 0 ? arr[row - 1][col] : 0;
      left_up = row > 0 && col > 0 ? arr[row-1][col-1] : 0;
      right_up = row > 0 && col+1 < cols ? arr[row-1][col+1] : 0;

      if (!left && !up && !left_up && !right_up) { // участок земли начинает остров, если слева,
                                                   // сверху, слева сверху и справа сверху нет земли
        islands++;
        arr[row][col] = islands; // нумеруем остров
      } else if (left && up && left !== up) { //верхний остров поглощен
        arr[row][col] = left;
        eaten.push(up)
      } else if (left_up && right_up && left_up !== right_up) {
        arr[row][col] = left_up
        eaten.push(right_up)
      } else if (left && left_up && left !== left_up) { //верхний левый остров поглощен
        arr[row][col] = left;
        eaten.push(left_up)
      } else if (left && right_up && left !== right_up) { //верхний правый остров поглощен
        arr[row][col] = left;
        eaten.push(right_up)
      } else if (left) {
        arr[row][col] = left; // участок продолжает вправо ранее найденный остров
      } else if (up) {
        arr[row][col] = up; // участок продолжает вниз ранее найденный остров
      } else if (left_up) {
        arr[row][col] = left_up; // участок продолжает ранее найденный остров слева сверху
      } else if (right_up) {
        arr[row][col] = right_up; // участок продолжает ранее найденный остров справа сверху
      }
    }
  }
  console.table(arr);


  let count = {}; // создаем список островов с их площадью

  for (let i = 1; i <= islands; i++) {
    count[i] = 0; // заполняем список островами
  }

  let lands = 0 // кол-во островов
  // ищем площадь островов
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {      
      if (arr[row][col]) count[arr[row][col]] += 1;
      if (arr[row][col] > lands) lands = arr[row][col];
    }
  }


  // Сортируем массив с исключениями (от min к max)
  function compareNumeric(a, b) {
    if (a > b) return 1;
    if (a == b) return 0;
    if (a < b) return -1;
  }
  eaten.sort(compareNumeric)
  console.log(eaten, count)

  let eatenChronology = {} // Хронология добавления элементов в исключение

  // учитываем поглощенные острова
  // перезаполняем некоторые ключи объекта count
  for (let eatenIndex = eaten.length; eatenIndex >= 0; eatenIndex--) {
    for (let row = 0; row < rows; row++) {
      
      const indOf = arr[row].indexOf(eaten[eatenIndex]);
      
      let leftBottom = rightBottom = 0;
      if (arr[row].indexOf(eaten[eatenIndex])-1 > -1) {
        leftBottom = arr[row+1][arr[row].indexOf(eaten[eatenIndex])-1];
      }
      if (arr[row].indexOf(eaten[eatenIndex]) > -1) {
        rightBottom = arr[row+1][arr[row].indexOf(eaten[eatenIndex])+1];
      }

      if (indOf > -1 && count[arr[row][indOf]]) {
        if (count[arr[row+1][indOf]]) {
          if (arr[row][indOf] === arr[row+1][indOf]) continue
          count[arr[row+1][indOf]] += count[arr[row][indOf]]; // складываем кол-во поглощенных ячеек
          delete count[arr[row][indOf]]; // удаляем объект поглощенных ячеек
          eatenChronology[arr[row][indOf]] = arr[row+1][indOf]
        } else if (count[leftBottom] && arr[row][indOf] !== leftBottom) {
          if (arr[row][indOf] === leftBottom) continue
          count[leftBottom] += count[arr[row][indOf]]; // складываем кол-во поглощенных ячеек
          delete count[arr[row][indOf]]; // удаляем объект поглощенных ячеек
          eatenChronology[arr[row][indOf]] = leftBottom
        } else if (count[rightBottom] && arr[row][indOf] !== rightBottom) {
          if (arr[row][indOf] === rightBottom) continue
          count[rightBottom] += count[arr[row][indOf]]; // складываем кол-во поглощенных ячеек
          delete count[arr[row][indOf]]; // удаляем объект поглощенных ячеек
          eatenChronology[arr[row][indOf]] = rightBottom
        } 
        // Далее идет поиск элементов в хронологии исключений и суммирование
        else if (undefined === count[arr[row+1][indOf]] && arr[row+1][indOf]) {
          count[eatenChronology[arr[row+1][indOf]]] += count[arr[row][indOf]];
          delete count[arr[row][indOf]];
          eatenChronology[arr[row][indOf]] = eatenChronology[arr[row+1][indOf]]
          continue
        } else if (undefined === count[leftBottom] && leftBottom) {
          count[eatenChronology[leftBottom]] += count[arr[row][indOf]];
          delete count[arr[row][indOf]];
          eatenChronology[arr[row][indOf]] = eatenChronology[leftBottom]
          continue
        }else if (undefined === count[rightBottom] && rightBottom) {
          count[eatenChronology[rightBottom]] += count[arr[row][indOf]];
          delete count[arr[row][indOf]];
          eatenChronology[arr[row][indOf]] = eatenChronology[rightBottom]
          continue
        }
      }
    }
  }
  
  // перебираем объект(список) с островами и их площадью и ищем 
  // максимальную площадь
  let max = 0;
  for (let key in count) {
    max = count[key] > max ? count[key] : max;
  }

  console.log({count: count, max: max, eaten: eaten, eatenChronology: eatenChronology});

  // возвращаем площадь самого крупного острова
  return max;
}