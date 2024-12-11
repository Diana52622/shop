const {Router} = require('express')
const {validationResult} = require('express-validator/check')
const auth = require('../middleware/auth')
const roles = require('../middleware/roles')
const {courseValidators} = require('../utils/validators')
const db = require('../models')
const router = Router()

function isOwner(course, req) {
  return course.userId.toString() === req.user.id.toString()
}

router.get('/', async (req, res) => {
  try {
    const courses = await db.courses.findAll()

    res.render('courses', {
      title: 'Курсы',
      isCourses: true,
      userId: req.user ? req.user.id.toString() : null,
      courses
    })
  } catch (e) {
    console.log(e)
  }
})

router.get('/:id/edit', auth, roles('admin'), async (req, res) => {
  if (!req.query.allow) {
    return res.redirect('/')
  }

  try {
    const course = await db.courses.findOne({where: {id: req.params.id}})

    res.render('course-edit', {
      title: `Редактировать ${course.title}`,
      course
    })
  } catch (e) {
    console.log(e)
  }
})

router.post('/edit', auth, roles('admin'), courseValidators, async (req, res) => {
  const errors = validationResult(req)
  const {id} = req.body

  if (!errors.isEmpty()) {
    return res.status(422).redirect(`/courses/${id}/edit?allow=true`)
  }

  try {
    delete req.body.id
    await db.courses.update(req.body, {where: {id}})
    res.redirect('/courses')
  } catch (e) {
    console.log(e)
  }
})

router.post('/remove', auth, roles('admin'), async (req, res) => {
  try {
    const query = {
      where: {
        id: req.body.id,
      }
    }
    await db.courses.update({isActive: false}, query)
    res.redirect('/courses')
  } catch (e) {
    console.log(e)
  }
})

router.get('/:id', async (req, res) => {
  try {
    const course = await db.courses.findOne({where: {id: req.params.id}})
    res.render('course', {
      layout: 'empty',
      title: `Курс ${course.title}`,
      course
    })
  } catch (e) {
    console.log(e)
  }
})

module.exports = router
