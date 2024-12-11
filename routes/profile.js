const {Router} = require('express')
const auth = require('../middleware/auth')
const db = require('../models')
const router = Router()

router.get('/', auth, async (req, res) => {
  res.render('profile', {
    title: 'Профиль',
    isProfile: true,
    user: req.user
  })
})

router.post('/', auth, async (req, res) => {
  try {
    const user = await db.users.findOne({where: {id: req.user.id}})

    const toChange = {
      name: req.body.name
    }

    if (req.file) {
      toChange.avatarUrl = req.file.path
    }

    await db.users.update(toChange, { where: {id: req.user.id} })
    res.redirect('/profile')
  } catch (e) {
    console.log(e)
  }
})

module.exports = router
