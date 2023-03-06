// require('dotenv').config()
// const express = require("express");
// const bodyParser = require("body-parser")
// const mongoose = require('mongoose');
// const encrypt = require('mongoose-encryption')
// const session = require('express-session');
// const passport = require("passport");
// const passportLocalMongoose = require("passport-local-mongoose");
// const { title } = require("process");
// const { use } = require('passport');
// const { render } = require('ejs');
//const favicon= require("serve-favicon");

// const app= express();
// const GenerateSudoku = require(__dirname + "/generateSudoku.js")

import dotenv from "dotenv";
dotenv.config();
import express from "express";

const app = express();
import bodyParser from "body-parser";
//import favicon from "serve-favicon";
import mongoose from "mongoose";
import session from "express-session";
import passport from "passport";
import passportLocalMongoose from "passport-local-mongoose";
import { title } from "process";

import pkg from "passport";
const { use } =pkg 

import { fileURLToPath } from 'url';
import path from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(bodyParser.urlencoded({ extended: true }));

//import GenerateSudoku from path.join(__dirname, 'generateSudoku.js')
import { GenerateSudoku } from "./generateSudoku.js";
app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'views'));
app.set("view engine", "ejs")
//"start": "node --experimental-modules index.js",
//"type": "module",


//app.use(favicon(__dirname+ '/favicon.ico'));

//app.use(favicon(__dirname + '/favicon.ico'));
//  app.use(express.static((__dirname+ '/public')));

// app.set('views', (__dirname+ '/views'));
//app.set("view engine", "ejs")
mongoose.set('strictQuery', true);
//app.get('/favicon.ico', (req, res) => res.status(204).end());

app.use(session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false
}));


//use passport to start authentication
app.use(passport.initialize());

//use passport to set up a session
app.use(passport.session());

//const uri= process.env.URI;
mongoose.connect(process.env.URI, {useNewUrlParser: true});


//-------------------------------SCHEMA----------------------------------
const userSchema = new mongoose.Schema({
    username: String,
    password: String
});

const recordSchema = new mongoose.Schema({
    difficulty: String,
    date: String,
    timer: String,
    life: String,
    userId: String,
    points: String
});

//-------------------------------MODEL--------------------------

//plugin..for salting and hashing and store the user to db
userSchema.plugin(passportLocalMongoose);

const User = new mongoose.model("User", userSchema);
const Record = new mongoose.model("Record", recordSchema);

//passportLocalMongoose codes
passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


//------------------------------------HOME ROUTE----------------------------------------
app.route("/")
    .get(function (req, res) {
        res.render("home", { isItAuthenticated: req.isAuthenticated() });
    });

//----------------------------------------

//------------------------------------REGISTER/SIGNUP ROUTE---------------------------------
app.route("/register")
    .get(function (req, res) {
        if (req.isAuthenticated()) res.redirect("/");
        else
            res.render("register", { isItAuthenticated: req.isAuthenticated(), error: false, errorMsg: "" });
    })

    .post(function (req, res) {
        //no need to use findOne() and check if user registered in past..USer.register gives the error when user is already registered in past
        User.register({ username: req.body.username }, req.body.password, function (err, user) {
            if (err) {
                console.log(err);
                res.render("register", { isItAuthenticated: false, error: true, errorMsg: "Username already exists!" });
            }
            else {
                passport.authenticate("local", { failureRedirect: '/register' })(req, res, function () {
                    res.redirect("/");
                });
            }
        });
    });

//-----------------------------------------LOGIN ROUTE-------------------------------------
app.route("/login")
    .get(function (req, res) {
        if (req.isAuthenticated()) {
            //when user is authenticated,there is no point in showing login page 
            res.redirect("/");
        }
        else {
            res.render("login", { isItAuthenticated: false, error: false, errorMsg: "" });
        }
    })

    .post(function (req, res) {
        const user = new User({
            username: req.body.username,
            password: req.body.password
        })
        passport.authenticate('local', function (err, user, info) {

            if (err) { res.render('login', { error: true, errorMsg: "Invalid Credentials", isItAuthenticated: false }); }
            if (user) {
                req.logIn(user, function (err) {
                    if (err) { res.render('login', { error: true, errorMsg: "Invalid Credentials", isItAuthenticated: false }); }
                    else {
                        res.redirect('/');
                    }
                });
            }
            else {
                //Incorrect credentials, hence redirect to login 
                return res.render('login', { error: true, errorMsg: "Invalid Credentials", isItAuthenticated: false });;
            }

        })(req, res);
    });

//-------------------------------------LOG OUT ROUTE---------------------------

app.route("/logout")
    .get(function (req, res) {
        if (req.isAuthenticated()) {
            req.logout(function (err) {
                if (err) console.log(err);
            });
            res.redirect("/");
        }
        else {
            //when user is not authenticated,then they can't access the logout route
            res.redirect("/login");
        }
    });

//------------------------------------NEW GAME ROUTE----------------------------
app.route("/newgame")
    .get(function (req, res) {
        if (req.isAuthenticated()) {
            res.render("newgame", { isItAuthenticated: true });
        }
        else {
            res.redirect("/login")
        }
    });

//------------------------------------START GAME ROUTE------------------------------------
app.route("/startgame")
    .get(function (req, res) {
        if (req.isAuthenticated()) {
            res.redirect("/newgame")
        } else {
            res.redirect("/login")
        }
    })

    .post(function (req, res) {
        let difficulty = 'easy'
        let choice = 1
        let points = 5
        let filled = 43
        let minutes = 10
        const level= req.body.level;
        
        if(level=="easy"){
        } else if (level === "medium") {
            difficulty = 'medium'
            choice = 2
            points = 5
            filled = 38
            minutes = 15
        } else {
            difficulty = 'hard'
            choice = 3
            points = 5
            filled = 31
            minutes = 20
        }
        //----
        let sudokuObj = new GenerateSudoku.GenerateSudoku()
        let sudokuData = sudokuObj.call(choice)

        // -----
        res.render("sudoku", { isItAuthenticated: true, life: 5, difficulty: difficulty, choice: choice, points: points, filled: filled, minutes: minutes, board: sudokuData.board, solution: sudokuData.solution })

    });

//------------------------------------RESULT ROUTE-----------------------------------------
app.route("/result")
    .post(function (req, res) {

        const record = new Record({
            difficulty: req.body.difficulty,
            date: new Date().toLocaleDateString("en-IN"),
            timer: req.body.timer,
            life: req.body.life,
            userId: req.user.id,
            points: req.body.points
        })

        record.save(function (err, doc) {
            if (err) {
                console.log(err);
            }
        })
        res.render("result", { isItAuthenticated: true, difficulty: req.body.difficulty, remainingTime: req.body.timer, lifeLeft: req.body.life, points: req.body.points, message: req.body.message })
    });

//------------------------------------RECORDS ROUTE
app.route("/records")
    .get(function (req, res) {
            if(req.isAuthenticated()){
            Record.find({ userId: req.user.id }, function (err, records) {
                if (err) {
                    console.log(err);
                }

                else {
                    res.render("records", { records: records , isItAuthenticated: true})
                }
            })
            }
            else{
                res.redirect("/login");
            }
    });

app.route("/developercontacts")
    .get(function (req, res) {
        res.render("developercontacts", {isItAuthenticated: true});
    });

app.route("/howtoplay")
    .get(function (req, res) {
        res.render("howtoplaysudoku", {isItAuthenticated: true})
    })

app.route("/notfound")
    .get(function(req, res){
        res.render("notFound");
    })
app.get('*', (req, res) => {
        res.redirect("/notfound")
        
    });

app.listen(9000, function () {
    console.log("At port 9000");
})