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

//default items to fill in a blank list
const item1 = new Item({
    name: "Eat breakfast"
});

const item2 = new Item({
    name: "Get dressed"
});

const item3 = new Item({
    name: "Go to work"
});

const defaultItems = [item1, item2, item3];

const listSchema = {
    name: String,
    items: [itemsScehma]
};

const List = mongoose.model("List", listSchema);

//Home route
app.get("/", function (req, res) {

    //populate list with defaultItems if array is empty on render
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
            // default list
            res.render("list", { kindOfDay: "Today", newListItems: foundItems });
        }
    });

});

//route for dynamic list name
app.get("/:customListName", function (req, res) {
    const customListName = req.params.customListName;

    List.findOne({ name: customListName }, function (err, foundList) {
        if (!err) {
            if (!foundList) {
                // Create new list
                const list = new List({
                    name: customListName,
                    items: defaultItems
                });

                list.save();
                // redirects to dynamic list
                res.redirect("/" + customListName);
            }
            else {
                // show existing list
                res.render("list", { kindOfDay: foundList.name, newListItems: foundList.items });
            }
        }
    });
});

//post route once item has been added and submit button has been selected
app.post("/", function (req, res) {

    const itemName = req.body.newItem;
    const listName = req.body.button; //uses the name attribute of the submit button in list.ejs

    const item = new Item({
        name: itemName
    });

    //searches through array for an existing list and if found redirects to the list
    // if no list is found, index is created under that list name and saved
    if (listName === "Today") {
        item.save();
        res.redirect("/");
    } else {
        List.findOne({ name: listName }, function (err, foundList) {
            foundList.items.push(item);
            foundList.save();
            res.redirect("/" + listName);
        });
    }
});

//post route for when an item is deleted
app.post("/delete", function (req, res) {

    const checkedItemId = req.body.checkbox;
    const listName = req.body.listName;

    if (listName === "Today") {
        Item.findByIdAndRemove(checkedItemId, function (err) {
            if (!err) {
                console.log("Successfully deleted checked item");
                res.redirect("/");
            }
        });
    } else {
        //delete from dynamic list
    }

});

app.listen(3000, function () {

    console.log("Server is running on port 3000");
});