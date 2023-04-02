// eslint-disable-next-line no-unused-vars
import { Knex } from 'knex'

declare module 'knex/types/tables' {
  export interface Tables {
    users: {
      id: string
      name: string
      email: number
      password_hash: string
      created_at: string
    }
  }
}
