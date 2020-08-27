'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class AnoModelosSchema extends Schema {
  up() {
    this.create('ano_modelos', (table) => {
      table.increments()
      table.integer('modelo_id')
        .unsigned()
        .references('id')
        .inTable('modelos')
        .notNullable()
        .onUpdate('CASCADE')
        .onDelete('CASCADE')

      table.string('fipe_id')
      table.string('fipe_nome')
      table.double('valor').nullable()
      table.string('codigo_fipe').nullable()
      table.string('referencia').nullable()
      table.string('ano').nullable()
      table.timestamps()
    })
  }

  down() {
    this.drop('ano_modelos')
  }
}

module.exports = AnoModelosSchema
