const {Router} = require('express')
const db = require('../models')
const auth = require('../middleware/auth')
const router = Router()

router.get('/', auth, async (req, res) => {
  try {
    const orders = await db.orders.findAll({where: {userId: req.user.id}, raw: true})
    const coursesIds = new Set(orders.map(order => order.courseId))
    const courses = await db.courses.findAll({where: {id: Array.from(coursesIds)}, raw: true})
    const preparedOrders = orders.map(order => {
      const course = courses.find(el => el.id === order.courseId)
      order.courses = [course]
      order.price = order.count * course.price

      return order
    })
    console.log(JSON.stringify(preparedOrders, null, 2))
    res.render('orders', {
      isOrder: true,
      title: 'Заказы',
      orders: preparedOrders
    })
  } catch (e) {
    console.log(e)
  }
})


router.post('/', auth, async (req, res) => {
  try {
    const query = {
      where: {
        userId: req.user.id
      },
    }

    const carts = await db.carts.findAll(query)
    const courseIds = new Set(carts.map(cart => cart.courseId))

    const courses = await db.courses.findAll({where: {id: Array.from(courseIds)}})
    const preparedCourses = courses.map(course => {
      return {
        userId: req.user.id,
        date: new Date(),
        courseId: course.id,
        count: carts.filter(cart => cart.courseId === course.id).length
      }
    })

    await db.orders.bulkCreate(preparedCourses)

    await db.carts.destroy(query)

    res.redirect('/orders')
  } catch (e) {
    console.log(e)
  }
})

module.exports = router
