const express = require('express')
const app = express()


app.use( express.static( __dirname + '/public' ) )

app.get('/', (request, response) => {
    response.sendFile('index.html')
})

app.get('/beehive', (request, response) => {
    response.sendFile(__dirname + '/public/beehive.html')
})

const listener = app.listen(process.env.PORT || 8080, () => {
    console.log('Your app is listening on port ' + listener.address().port)
})