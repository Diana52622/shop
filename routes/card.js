const {Router} = require('express')
//const Course = require('../models11/course')
const auth = require('../middleware/auth')
const db = require('../models')
const router = Router()


function mapCartItems(cart) {
  return cart.items.map(c => ({
    ...c.courseId._doc,
    id: c.courseId.id,
    count: c.count
  }))
}

function computePrice(courses) {
  return courses.reduce((total, course) => {
    return total += course.price * course.count
  }, 0)
}

router.post('/add', auth, async (req, res) => {
  const query = {
    where: { id: req.body.id }
  }

  const course = await db.courses.findOne(query)
  if(course) {
    const dataToCreate = {
      userId: req.user.id,
      date: new Date(),
      courseId: course.id,
      count: 1
    }

    await db.carts.create(dataToCreate)
    res.redirect('/card')
  }
})

router.delete('/remove/:id', auth, async (req, res) => {

  await db.carts.destroy({where: {userId: req.user.id, courseId: req.params.id}})
  const query = {
    where: {
      userId: req.user.id
    },
  }
  const carts = await db.carts.findAll(query)
  const courseIds = new Set(carts.map(cart => cart.courseId))

  const courses = await db.courses.findAll({where: {id: Array.from(courseIds)}})
  const preparedCourses = courses.map(course => {
    course.count = carts.filter(cart => cart.courseId === course.id).length

    return course
  })
  res.status(200).json(preparedCourses)
})

router.get('/', auth, async (req, res) => {
  const query = {
    where: {
      userId: req.user.id
    },
  }

  const carts = await db.carts.findAll(query)
  const courseIds = new Set(carts.map(cart => cart.courseId))

  const courses = await db.courses.findAll({where: {id: Array.from(courseIds)}})
  const preparedCourses = courses.map(course => {
    course.count = carts.filter(cart => cart.courseId === course.id).length

    return course
  })

  res.render('card', {
    title: 'Корзина',
    isCard: true,
    courses: preparedCourses,
    price: computePrice(preparedCourses)
  })
})

module.exports = router
