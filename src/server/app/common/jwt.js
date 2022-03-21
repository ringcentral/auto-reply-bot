import jwt from 'express-jwt'

export const jwtAuth = jwt({
  secret: process.env.SERVER_SECRET,
  algorithms: ['HS256']
})

export const errHandler = function (err, req, res, next) {
  if (err && err.name === 'UnauthorizedError') {
    res.status(401).send('invalid token...')
  } else {
    next()
  }
}
