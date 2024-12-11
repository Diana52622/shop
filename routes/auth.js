const {Router} = require('express')
const bcrypt = require('bcryptjs')
const crypto = require('crypto')
const {validationResult} = require('express-validator/check')
const nodemailer = require('nodemailer')
const sendgrid = require('nodemailer-sendgrid-transport')
const keys = require('../keys')
const regEmail = require('../emails/registration')
const resetEmail = require('../emails/reset')
const {registerValidators} = require('../utils/validators')
const db = require('../models')
const router = Router()

const transporter = nodemailer.createTransport(sendgrid({
  auth: {api_key: keys.SENDGRID_API_KEY}
}))

router.get('/login', async (req, res) => {
  res.render('auth/login', {
    title: 'Авторизация',
    isLogin: true,
    loginError: req.flash('loginError'),
    registerError: req.flash('registerError')
  })
})

router.get('/logout', async (req, res) => {
  req.session.destroy(() => {
    res.redirect('/auth/login#login')
  })
})

router.post('/login', async (req, res) => {
  try {
    const {email, password} = req.body

    const candidate = await db.users.findOne({where: {email}, attributes: ['id', 'email', 'password']})

    if (candidate) {
      const areSame = await bcrypt.compare(password, candidate.password)

      if (areSame) {
        req.session.user = candidate
        req.session.isAuthenticated = true
        req.session.save(err => {
          if (err) {
            throw err
          }
          res.redirect('/')
        })
      } else {
        req.flash('loginError', 'Неверный пароль')
        res.redirect('/auth/login#login')
      }
    } else {
      req.flash('loginError', 'Такого пользователя не существует')
      res.redirect('/auth/login#login')
    }
  } catch (e) {
    console.log(e)
  }
})

router.post('/register', registerValidators, async (req, res) => {
  try {
    const {email, password, name} = req.body

    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      req.flash('registerError', errors.array()[0].msg)
      return res.status(422).redirect('/auth/login#register')
    }
    const hashPassword = await bcrypt.hash(password, 10)
    const dataToSave = {
      email,
      name,
      password: hashPassword
    }

    await db.users.create(dataToSave)
    //await transporter.sendMail(regEmail(email))
    res.redirect('/auth/login#login')
  } catch (e) {
    console.log(e)
  }
})

router.get('/reset', (req, res) => {
  res.render('auth/reset', {
    title: 'Забыли пароль?',
    error: req.flash('error')
  })
})

router.get('/password/:token', async (req, res) => {
  if (!req.params.token) {
    return res.redirect('/auth/login')
  }

  const query = {
    where: {
      resetToken: req.params.token,
      resetTokenExp: {$gt: Date.now()}
    }
  }

  try {
    const user = await db.users.findOne(query)

    if (!user) {
      return res.redirect('/auth/login')
    } else {
      res.render('auth/password', {
        title: 'Восстановить доступ',
        error: req.flash('error'),
        userId: user.id.toString(),
        token: req.params.token
      })
    }
  } catch (e) {
    console.log(e)
  }

})

router.post('/reset', (req, res) => {
  try {
    crypto.randomBytes(32, async (err, buffer) => {
      if (err) {
        req.flash('error', 'Что-то пошло не так, повторите попытку позже')
        return res.redirect('/auth/reset')
      }

      const token = buffer.toString('hex')
      const query = {
        where: { email: req.body.email }
      }
      const candidate = await db.users.findOne(query)

      if (candidate) {
        const dataToUpdate = {
          resetToken: token,
          resetTokenExp: Date.now() + 60 * 60 * 1000
        }
        await db.users.update(dataToUpdate, {where : {id: candidate.id}})
        //await transporter.sendMail(resetEmail(candidate.email, token))
        res.redirect('/auth/login')
      } else {
        req.flash('error', 'Такого email нет')
        res.redirect('/auth/reset')
      }
    })
  } catch (e) {
    console.log(e)
  }
})

router.post('/password', async (req, res) => {
  try {
    const query = {
      where: {
        id: req.body.userId,
        resetToken: req.body.token,
        resetTokenExp: {$gt: Date.now()}
      }
    }
    const user = await db.users.findOne()

    if (user) {
      const dataToUpdate = {
        password: await bcrypt.hash(req.body.password, 10),
        resetToken: null,
        resetTokenExp: null
      }
      await db.users.update(dataToUpdate, { where: { id: user.id } })
      res.redirect('/auth/login')
    } else {
      req.flash('loginError', 'Время жизни токена истекло')
      res.redirect('/auth/login')
    }
  } catch (e) {
    console.log(e)
  }
})

module.exports = router
