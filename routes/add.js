const {Router} = require('express')
const {validationResult} = require('express-validator/check')
const auth = require('../middleware/auth')
const roles = require('../middleware/roles')
const {courseValidators} = require('../utils/validators')
const db = require('../models')
const router = Router()

router.get('/', auth, (req, res) => {
  res.render('add', {
    title: 'Добавить курс',
    isAdd: true
  })
})

router.post('/', auth, roles('admin'), courseValidators, async (req, res) => {
  const errors = validationResult(req)

  if (!errors.isEmpty()) {
    return res.status(422).render('add', {
      title: 'Добавить курс',
      isAdd: true,
      error: errors.array()[0].msg,
      data: {
        title: req.body.title,
        price: req.body.price,
        img: req.body.img
      }
    })
  }

  const dataToSave = {
    title: req.body.title,
    price: req.body.price,
    img: req.body.img,
    userId: req.user.id
  }

  try {
    await db.courses.create(dataToSave)
    res.redirect('/courses')
  } catch (e) {
    console.log(e)
  }
})

module.exports = router
