const db = {
  users: [
    {
      name: 'Иван',
      userId: 123,
    },
    {
      name: 'Петр',
      userId: 456,
    },
    {
      name: 'Василий',
      userId: 789,
    }
  ],
  addPosts: [
    {
      name: 'Иван',
      id: 101112,
      userId: 123,
      text: 'Москва, Красная площадь',
      photo: 'https://www.mos.ru/upload/newsfeed/newsfeed/maksim(3797).jpg',
    },
    {
      name: 'Петр',
      id: 131415,
      userId: 456,
      text: 'Город будущего',
      photo: 'https://www.msk-guide.ru/img/13214/MskGuide.ru_162953big.jpg',
    },
    {
      name: 'Василий',
      id: 161718,
      userId: 789,
      text: 'Вид на Москва-Сити',
      photo: 'https://www.vsemirnyjbank.org/content/dam/photos/780x439/2017/jun-1/ru-city-780.jpg',
    },
  ]
}

module.exports = {
  db,
}