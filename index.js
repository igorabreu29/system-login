import express  from "express";
import bodyParser from "body-parser";
import session from "express-session";
import hbs from 'express-handlebars'
import { User } from './models/User.js'

const app = express()

app.use('/home', ( req, res, next ) => {
    const userLog = false

    if(!userLog) {
        res.redirect('/login')
    }
    next()
})

app.engine('hbs', hbs.engine({extname: 'hbs', defaultLayout: 'main'}))
app.set('view engine', 'hbs')
app.use(bodyParser.urlencoded({ extended: false }))
app.use(express.static('public'))

app.use(session({
    secret: 'secretKey',
    resave: false,
    saveUninitialized: true
}))

app.get('/', ( req, res) => {
    if (req.session.errors) {
        const errs = req.session.errors 
        req.session.errors = ''

        return res.render('index', { NavActiveRegister: true, messageError: errs })
    }

    if (req.session.success) {
        req.session.success = false

        return res.render('index', { NavActiveRegister: true, messageSuccess: true })
    }

    res.render('index', { NavActiveRegister: true })
})

app.get('/login', ( req, res ) => {
    res.render('login', { NavActiverLogin: true })
})

app.get('/home', ( req, res ) => {
    res.render('home')
})

app.post('/register', ( req, res ) => {
    const err = []

    var { name, email, password, passwordConfirmation } = req.body

    name = name.replace(/[^A-zÀ-ú\s]/gi, '');

    if (name === '' || typeof name === undefined || name === null) {
        err.push({ message: 'field name can not your empty!' });
    }
  
    if (!/^[A-Za-zàáââéèêíïóôõöúçñÁÀÂÃÉÈÊÍÏÓÔÕÖÚÇÑ\s]+$/.test(name)) {
        err.push({ message: 'Name invalid!' });
    }

    if (email === '' || typeof email === undefined || email === null) {
        err.push({message: 'field email can not your empty!'})
    }

    if (
        !/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
          email
        )
      ) {
        err.push({ message: 'fied email invalid!' });
      }

      if (password.length <= 6 || password === '') {
        err.push({ message: 'Have who your big that 6 caracters! '})
      }

      if (passwordConfirmation !== password || passwordConfirmation.length <= 6 || passwordConfirmation === '') {
        err.push({ message: 'Error! '})
      }

      if (err.length > 0) {
            console.log(err)
            req.session.success = false
            req.session.errors = err
            return res.redirect('/')
      }

      User.create({
        name: name,
        email: email.toLowerCase(),
        password: password,
        passwordConfirmation: passwordConfirmation
      }).then(() => {
        console.log('success')
        req.session.success = true
        return res.redirect('/home')
      }).catch(err => {
        console.log(err)
      }) 
})

app.listen(3000)