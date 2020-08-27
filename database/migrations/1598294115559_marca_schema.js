'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class MarcaSchema extends Schema {
  up() {
    this.create('marcas', (table) => {
      table.increments()
      table.string('nome').notNullable()
      table.string('fipe_id').notNullable()
      table.timestamps()
    })
  }

  down() {
    this.drop('marcas')
  }
}

module.exports = MarcaSchema
