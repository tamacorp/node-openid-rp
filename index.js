const { Issuer } = require('openid-client');
const express = require('express');
const app = express();
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');
const crypto = require('crypto');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(session({ secret: 'thisisfortest', cookie: { maxAge: 60000000 }}));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

const TAMAIssuer = new Issuer({
  issuer: 'https://sso.tamacorp.co/oauth',
  authorization_endpoint: 'https://sso.tamacorp.co/oauth/authorize',
  token_endpoint: 'https://sso.tamacorp.co/oauth/token',
  userinfo_endpoint: 'https://sso.tamacorp.co/oauth/userinfo',
  jwks_uri: 'https://sso.tamacorp.co/oauth/jwks',
}); 

const client = new TAMAIssuer.Client({
  client_id: 'test',
  client_secret: 'test'
}); // => Client

// Starting point for login
app.get("/login", function(req, res) {
  req.session.state = crypto.randomBytes(20).toString('hex');
  redirectUri = client.authorizationUrl({
    redirect_uri: 'http://localhost:3000/assert',
    scope: 'openid',
    state: req.session.state,
  });
  res.redirect(redirectUri);
});

app.get("/assert", function(req, res) {
  const state = req.session.state;
  client.authorizationCallback('http://localhost:3000/assert', req.query, { state }) 
  .then(function (tokenSet) {
    console.log('received and validated tokens %j', tokenSet);
    console.log('validated id_token claims %j', tokenSet.claims);
    res.send(tokenSet)
  }).catch(function(err) {
    res.send(err)
  });
});

app.get("/native", function(req, res) {
  res.render("index",{});
});

app.listen(3000);
console.log("RP is running on port 3000")
