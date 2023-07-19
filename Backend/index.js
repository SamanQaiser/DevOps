const express = require("express");
const app = express();
const mysql = require("mysql");
const port = 8000;
const multer = require("multer");
const { stringify } = require("nodemon/lib/utils");
const nodemailer = require("nodemailer");
const { options } = require("nodemon/lib/config");
const axios = require("axios");

const rand = Math.floor(Math.random() * 999999999999);

var transfer = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "your email will go here",
    pass: "Your password will go here",
  },
});

var mailoptions = {};
app.use(express.json());
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./up/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.originalname + "-" + uniqueSuffix + ".jpg");
  },
});
const upload = multer({ storage: storage });

var conn = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "adhar",
});

conn.connect((err) => {
  err ? console.log(err) : console.log("connected");
});

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

app.get("/", (req, res) => {
  conn.query("select * from admin ", (err, resp) => {
    err ? console.log(err) : res.send(resp);
  });
});

app.post("/profileimg", upload.single("avatar"), function (req, res, next) {
  res.send("done");
});

app.post("/sendMail", (request, res) => {
  console.log(request.body);
  mailoptions = {
    from: "divyanshu.8174@gmail.com",
    to: "divyanshu.8174@gmail.com",
    subject: " adhar card renew",
    body: `adhar has been made adhar number is ${rand}`,
  };
  transfer.sendMail(mailoptions, (err, info) => {
    err ? console.log(err) : res.send(request.body);
  });
});
app.post("/", (req, res) => {
  let post;
  let dist;

  axios
    .get(`https://api.postalpincode.in/pincode/${req.body.gram}`)
    .then(function (response) {
      // console.log
      dist = response.data[0].PostOffice[0].District;
      (state = response.data[0].PostOffice[0].State),
        (post =
          dist !== "" && state !== ""
            ? {
                name: req.body.name,
                mobile: req.body.mobile,
                gram: req.body.gram,
                email: req.body.email,
                image: req.body.image,
                adhar_no: rand,
                dist: response.data[0].PostOffice[0].District,
                state: response.data[0].PostOffice[0].State,
                dob: req.body.dob,
              }
            : "");
      req.body.mobile != "" ||
      req.body.name != "" ||
      req.body.gram != "" ||
      req.body.email != ""
        ? conn.query(
            "INSERT INTO users SET ?",
            post,
            function (error, results, fields) {
              if (error) throw error;
              res.send(
                req.body.mobile == "" ||
                  req.body.name == "" ||
                  req.body.gram == "" ||
                  req.body.email == ""
                  ? { message: "please fill details" }
                  : { message: "data saved succesfully" }
              );
            }
          )
        : "";
    });
  // res.send(rand);
  // res.send(random);
});

app.post("/userGet", (req, res) => {
  console.log(req.body.Aadhar);
  conn.query(
    `SELECT * FROM users WHERE adhar_no = ${req.body.Aadhar} `,
    function (error, results, fields) {
      error ? console.log(error) : res.send(results);
    }
  );
});

app.get("/edit/:adhar_no", (req, res) => {
  console.log(req.params.adhar);
  // res.send();

  conn.query(
    `select * from users Where ${req.params.adhar_no}`,
    (err, resp) => {
      err ? console.log(err) : res.send(resp);
    }
  );
});

app.get("/update", (req, res) => {
  console.log(req.body);
  // res.send();

  // conn.query(
  //   `select * from users Where ${req.params.adhar_no}`,
  //   (err, resp) => {
  //     err ? console.log(err) : res.send(resp);
  //   }
  // );
});

app.listen(port, () => {
  console.log(port);
});
