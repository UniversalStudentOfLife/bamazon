
// make sure the you have the following modules
var mysql = require("mysql");
var inquirer = require("inquirer");
var tables
 = require("tables");

// open the connection to your database and pass your credentials. 
var connection = mysql.createConnection({
	host: "localhost",
	port: 3306,

	user: "root",

	password: "",
	database: "bamazon"
});

//opening connection and running afterConnection function, if there is an error log it
connection.connect(function(err){
	if (err) throw err;
		console.log("connection as id" + connection.threadId);
		afterConnection();
});

//select everything from our products table
function afterConnection() {
  connection.query("SELECT * FROM products", function(err, results) {
    if (err) throw err;
    //connection.end();

inquirer
.prompt([

//First question
{
	name: "item",
	type: "rawlist",
	choices: function() {
	            var choiceArray = [];
	            for (var i = 0; i < results.length; i++) {

                var productInfo = results[i].product_name + ": $" + results[i].price;

	              choiceArray.push(productInfo);
	            }
	            return choiceArray;
          },
	message: "Please enter the ID of the item you wish to purchase"
},

//Second Question
{
	name: "amount",
	type: "input",
	message: "Please using enter in the amount which you wish to purchase",
        validate: function(value) {
          if (isNaN(value) === false) {
            return true;
          }
          return false;
        }
      }
    ])
	.then(function (answer) {

		var chosenItem;
        for (var i = 0; i < results.length; i++) {

          if (results[i].product_name === answer.item) {
            chosenItem = results[i];

          }
        }

        // Check to see if we have enough stock  to complete the customers purchase order
		 if (chosenItem.stock_quantity >= parseInt(answer.amount)) {

          var updateStock = chosenItem.stock_quantity - parseInt(answer.amount);
          var totalPurchase = chosenItem.price * parseInt(answer.amount)

          // Update the database 
          connection.query(
            "UPDATE products SET ? WHERE ?",
            [
              {
                stock_quantity: updateStock
              },
              {
                item_id: chosenItem.item_id
              }
            ],
            function(error) {
              if (error) throw err;
              console.log("Success!");
              console.log("Your total purchase amount: $" + totalPurchase)
              connection.end();
            }
          );
        }
        else {
          // Not enough stock
          console.log("Not enough in stock to complete your order! Try again!");
          connection.end();
        }

	});

	  });
}
