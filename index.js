const http = require('http')
const express = require('express')
const bodyParser = require('body-parser')
const { v4: uuidv4 } = require('uuid')
const { download } = require('./download')
const MIN_DOWNLOAD_TIME = 5000

const app = express()
const server = http.createServer(app)

app.use(bodyParser.json())
app.use(express.static('public'))

app.post('/download', async (req, res) => {
     if (!req.body.url) {
          return res.status(500).send({
               error: 'Invalid url:' + req.body.url
          })
     }

     try {
          const start = Date.now()
          const stream = await download(req.body.url)
          const time = Date.now() - start

          if (time < MIN_DOWNLOAD_TIME) {
               await new Promise((resolve) => {
                    setTimeout(resolve, MIN_DOWNLOAD_TIME - time)
               })
          }

          const headers = {
               'Content-Type': 'application/octet-stream',
               'Content-Disposition': `attachment; filename=${uuidv4()}.mp4`
          }

          res.writeHead(200, headers)
          return stream.pipe(res)
     }
     catch (err) {
          return res.status(500).send({
               error: err.message
          })
     }
})

const port = process.env.PORT || 80
server.listen(port, () => {
     console.log('Server started on port', port);
}).on('error', function (err) {
     throw new Error('Error starting server:\n' + err.toString())
})
