const express = require('express')
const server = express()

server.use(express.static('public'))
server.set('view engine', 'ejs')

const handleAdmin = require('./routes/admin')
const API = require('./routes/api')

const port = process.env.PORT || 8080
const backlog = () => {
  console.log(`Started`)
}

server.get("/",  (req,res) => {
  res.render("index")
})


server.use("/admin", handleAdmin)
server.use("/api", API)

server.use("/*", express.static('public/html/error.html'))

server.listen(port, backlog)

