'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class ReferenciaSchema extends Schema {
  up() {
    this.create('referencias', (table) => {
      table.increments()
      table.string('fipe_id').notNullable()
      table.string('mes_ano').notNullable()
      table.timestamps()
    })
  }

  down() {
    this.drop('referencias')
  }
}

module.exports = ReferenciaSchema
