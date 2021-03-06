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

server.get('/posts', checkAuth, (req, res) => {
  const usersQuery = req.query
  let postForRender = db.addPosts
  if (usersQuery.limit !== undefined && Number.isNaN(+usersQuery.limit) === false) {
    postForRender = db.addPosts.slice(0, usersQuery.limit)
  }
  if (usersQuery.reverse === 'true') {
    postForRender = db.addPosts.reverse()
  }
  if (((usersQuery.limit !== undefined && Number.isNaN(+usersQuery.limit) === false) && usersQuery.reverse) === 'true') {
    postForRender = db.addPosts.slice(0, usersQuery.limit).reverse()
  }
  res.render('posts', { listOfPosts: postForRender })
})

server.post('/posts/photobank', (req, res) => {
  const dataFromForm = req.body
  db.addPosts.push(dataFromForm)
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

server.delete("/fetch", (req, res) => {
  const currentId = req.session?.user?.id
  if (currentId) {
    const { id } = req.body
    const currentPostIndex = db.addPosts.findIndex((post) => post.id === id)
    const currentPost = db.addPosts[currentPostIndex]
    if (currentPost) {
      if (currentPost.userId === currentId) {
        db.addPosts.splice[currentPostIndex, 1]
        res.sendStatus(200)
      }
      return res.sendStatus(403)
    }
    return res.sendStatus(404)
  }
  res.sendStatus(401)
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