const express = require("express");
const https = require("https");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const ejs = require("ejs");

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/public'));
app.set('view engine', 'ejs');

mongoose.connect("mongodb://localhost:27017/ToDoListDB", { useNewUrlParser: true, useUnifiedTopology: true });

//mongodb schema 
const itemsScehma = new mongoose.Schema({
    name: String
});

const Item = mongoose.model("Item", itemsScehma);

//default item to fill blank list
const item1 = new Item({
    name: "Eat breakfast"
});

const defaultItems = [item1];

//Home route
app.get("/", function (req, res) {

    //displays current date
    var today = new Date();

    var options = {
        weekday: "long",
        day: "numeric",
        month: "long"
    };

    //populate list. If empty it populates with defualt item
    Item.find({}, function (err, foundItems) {

        if (foundItems.length === 0) {

            Item.insertMany(defaultItems, function (err) {

                if (err) {
                    console.log(err);

                } else {
                    console.log("Successfully saved default items to database");
                }
            });

            res.redirect("/");

        } else {

            res.render("list", { kindOfDay: day, newListItems: foundItems });
        }
    });

    var day = today.toLocaleDateString("en-US", options);
});

//post route once item has been added and submit button has been selected
app.post("/", function (req, res) {

    const itemName = req.body.newItem;

    const item = new Item({
        name: itemName
    });

    item.save();

    res.redirect("/");
});

//post route for when an item is deleted
app.post("/delete", function (req, res) {

    const checkedItemId = req.body.checkbox;

    Item.findByIdAndRemove(checkedItemId, function (err) {
        if (!err) {
            console.log("Successfully deleted checked item");
            res.redirect("/");
        }
    });
});

app.listen(3000, function () {

    console.log("Server is running on port 3000");
});