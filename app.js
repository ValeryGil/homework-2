const express = require('express')
const bcrypt = require('bcrypt')
const path = require('path')
const hbs = require('hbs')
const sessions = require('express-session')
const { db } = require('./DB')
const { checkAuth } = require('./src/middlewares/checkAuth')
const server = express()
const PORT = process.env.PORT || 3000

const saltRounds = 10

server.set('view engine', 'hbs')
server.set('views', path.join (__dirname, 'src', 'views'))
server.set('cookieName', 'sid')
hbs.registerPartials(path.join (__dirname, 'src', 'views', 'partials'))

const secretKey = 'qwerty'

server.use(express.urlencoded({extended: true}))
server.use(express.json())
server.use(express.static('public'))

server.use(sessions({
  name: server.get('cookieName'),
  secret: secretKey,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    maxAge: 86400 * 1e3,
  }
}))

server.use((req, res, next) => {
  const currentEmail = req.session?.user?.email
  
  if (currentEmail) {
    const currentUser = db.users.find((user) => user.email === currentEmail)
    res.locals.name = currentUser.name
  }
  next()
})

server.get('/', (req, res) => {
  res.render('main')
})

server.delete('/fetch', (req, res) => {
  console.log(req.body, req.session)
  res.sendStatus(204)
})

server.get('/posts', checkAuth, (req, res) => {
  const usersQuery = req.query
  let postForRender = db.addPost
  if (usersQuery.limit !== undefined && Number.isNaN(+usersQuery.limit) === false) {
    postForRender = db.addPost.slice(0, usersQuery.limit)
  }
  if (usersQuery.reverse === 'true') {
    postForRender = db.addPost.reverse()
  }
  if (((usersQuery.limit !== undefined && Number.isNaN(+usersQuery.limit) === false) && usersQuery.reverse) === 'true') {
    postForRender = db.addPost.slice(0, usersQuery.limit).reverse()
  }
  res.render('posts', { listOfPosts: postForRender })
})

server.post('/posts/photobank', (req, res) => {
  const { name, text, photo } = req.body
  db.addPost.push({
    name,
    text,
    photo,
  })
  const sid = Date.now()
  sessions[sid] = {
    name,
  }
  res.cookie('sid', sid, {
    httpOnly: true,
    maxAge: 86400 * 1e3,
  })
  res.redirect('/posts')
})

server.get('/auth/signup', (req, res) => {
  res.render('signup')
})

server.post('/auth/signup', async (req, res) => {
  const { name, email, password } = req.body
  const hashPass = await bcrypt.hash(password, saltRounds)
  db.users.push({
    name,
    email,
    password: hashPass,
  })
  req.session.user = {
    email,
  }
  res.redirect('/')
})

server.get('/auth/signin', (req, res) => {
  res.render('signin')
})

server.post('/auth/signin', async (req, res) => {
  const { email, password } = req.body
  const currentUser = db.users.find((user) => user.email === email)

  if (currentUser) {
    if (await bcrypt.compare(password, currentUser.password)) {
      req.session.user = {
        email,
      }
      return res.redirect('/')
    }
  }
  return res.redirect('/auth/signin')
})

server.get('/auth/signout', (req, res) => {
  req.session.destroy((err) => {
    if (err) return res.redirect('/')

    res.clearCookie(res.app.get('cookieName'))
    return res.redirect('/')
  })
})

server.get('*', (req, res) => {
  res.send(`<div>
  <h1>404</h1>
  <a href = '/'>Link to main page</a>
  </div>`)
})

server.listen(PORT, () => {
  console.log(`OK: ${PORT}`)
})