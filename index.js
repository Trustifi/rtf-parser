'use strict'
const RTFParser = require('./rtf-parser.js')
const RTFDocument = require('./rtf-document.js')
const RTFInterpreter = require('./rtf-interpreter.js')

module.exports = parse
parse.string = parseString
parse.stream = parseStream

function parseString (string, rawHtml, cb) {
  parse(rawHtml, cb).end(string)
}

function parseStream (stream, rawHtml, cb) {
  stream.pipe(parse(rawHtml, cb))
}

function parse (rawHtml, cb) {
  let errored = false
  const errorHandler = err => {
    if (errored) return
    errored = true
    parser.unpipe(interpreter)
    interpreter.end()
    cb(err)
  }
  const document = new RTFDocument()
  const parser = new RTFParser(rawHtml)
  parser.once('error', errorHandler)
  const interpreter = new RTFInterpreter(document)
  interpreter.on('error', errorHandler)
  interpreter.on('finish', () => {
    if (!errored) cb(null, document)
  })
  parser.pipe(interpreter)
  return parser
}

