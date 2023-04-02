import fastify from 'fastify'
import { register } from './routes/register'
import { mealsRoutes } from './routes/meals'

export const app = fastify()

app.post('/register', register)
app.register(mealsRoutes, { prefix: '/meals' })
