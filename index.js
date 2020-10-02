const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
var admin = require('firebase-admin');
require('dotenv').config()

const port = 5000

const app = express()
app.use(cors())
app.use(bodyParser.json())




// var admin = require("firebase-admin");

var serviceAccount = require("./configs/burj-al-araab-firebase-adminsdk-qhwkm-4e0af802b0.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://burj-al-araab.firebaseio.com"
});



const MongoClient = require('mongodb').MongoClient;
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.jxwjp.mongodb.net/burjAlArab?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  const bookingCollection = client.db("burjAlArab").collection("bookings");
  app.post("/addBooking", (req, res) => {
    const newBooking = req.body
    bookingCollection.insertOne(newBooking)
      .then(result => {
        res.send(result.insertedCount > 0)
        //   console.log(result)
      })
    // console.log(newBooking)
  })

  app.get('/bookings', (req, res) => {
    // console.log(req.query.email)
    const bearer = req.headers.authorization
    if (bearer && bearer.startsWith('Bearer ')) {
      var idToken = bearer.split(' ')[1]
      // console.log(idToken)

      admin.auth().verifyIdToken(idToken)
        .then(function (decodedToken) {
          let tokenEmail = decodedToken.email;

          if (tokenEmail === req.query.email) {

            bookingCollection.find({
              email: req.query.email
            })
              .toArray((err, bookings) => {
                res.send(bookings)
              })
          }
          else{
      res.status(401).send('unauthorized access denied')

          }
          // ...
          // console.log({ uid })
        }).catch(function (error) {
          // Handle error
      res.status(401).send('unauthorized access denied')

        });
    }

    else{
      res.status(401).send('unauthorized access denied')
    }



  })
  //   console.log('database connected successfully')
  // perform actions on the collection object
  //   client.close();
});


app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port)