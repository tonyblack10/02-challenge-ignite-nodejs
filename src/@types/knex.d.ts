// eslint-disable-next-line no-unused-vars
import { Knex } from 'knex'

declare module 'knex/types/tables' {
  export interface Tables {
    users: {
      id: string
      name: string
      email: string
      password_hash: string
      created_at: string
    }
    meals: {
      id: string
      name: string
      description: string
      date: string
      exists_on_diet: boolean
      created_at: string
      updated_at: string
    }
  }
}
