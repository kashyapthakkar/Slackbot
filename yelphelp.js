//StAuth10065: I Kashyap Thakkar, 000742712 certify that this material is my original work. No other person's work has been used without due acknowledgement. I have not made my work available to anyone else.
var fs = require('fs');
var file = "api.db";
var exists = fs.existsSync(file);

if(!exists){
    fs.openSync(file,'w');
}

var sqlite3 = require("sqlite3").verbose();
var db = new sqlite3.Database(file);
db.serialize(function(){
    if(!exists){
      db.run('CREATE TABLE users (status text, message text, timestamp text)');
    }

    db.run('DELETE FROM users');

    
});

var Bot = require('slackbots');
let yelpAPI = require('yelp-api');

let apiKey = '24EC59FXckRkNTFS-KAW5G2oO7shQa5sX10-9X4c2DEDU3gh7NxenP7DNNe0KN6lHWpFX70eo7rpI66OlJ7NagSglbVGhZLOuT4ani7rYNIxp8WUkqw7dJGkfVKVXXYx';
let yelp = new yelpAPI(apiKey);



var settings ={
    token: "xoxb-791742098005-793594418535-u8KIHHyxEp7VxGj9fsxCFbpr",
    name: "yelphelp"
}


var bot = new Bot(settings);

bot.on('message', function(data){
    
    if(data.type != 'message' || data.subtype === 'bot_message' ){
        return;
    }

    command = (data.text).toLowerCase();

    //Nearby Address

    if(command.startsWith("nearby ")){
      command = command.replace("nearby","");
      let params = [{ location: command, radius: 10000 }];
 
      yelp.query('businesses/search', params)
      .then(data => {
        
        var jsonData = JSON.parse(data);
        var placeCount = 0;
        var index = 0;
        
        while(index < jsonData.businesses.length){
        
          bot.postMessageToChannel('general', jsonData.businesses[index].name + "\nAddress: " + jsonData.businesses[index].location.address1 + "\n");
          placeCount++;
        
          if(placeCount == 5){
            break;
          }
          index++;
        }
        if(placeCount == 0){
          bot.postMessageToChannel('general', "No nearby restaurants can be found");
        }
        
      })
      .catch(err => {
        console.log(err);
      });

    }

    //Events Longitude Latitude
    if(command.startsWith("closeby")){
        var longitude;
        var latitude;
        command = command.replace("closeby ","");
        var commandArray = command.split(' ');
        
        if(commandArray[0].slice(-1) == "w"){
          longitude = commandArray[0].substring(0, commandArray[0].length - 1);
          longitude = 0 - parseFloat(longitude);
          
        }else{
          longitude = commandArray[0].substring(0, commandArray[0].length - 1);
          longitude = parseFloat(longitude);
          
        }

        if(commandArray[1].slice(-1) == "s"){
          latitude = commandArray[1].substring(0, commandArray[1].length - 1);
          latitude = 0 - parseFloat(latitude);
          
        }else{
          latitude = commandArray[1].substring(0, commandArray[1].length - 1);
          latitude = parseFloat(latitude);
          
        }

        let params = [{ latitude: latitude, longitude: longitude, radius: 10000 }];
  
        yelp.query('events', params)
        .then(data => {
          var jsonData = JSON.parse(data);
          placeCount = 0;
          var index = 0;
          while(index < jsonData.events.length){

            bot.postMessageToChannel('general', jsonData.events[index].name + "\nAddress: " + jsonData.events[index].location.address1 + ", \nDetail: " + jsonData.events[index].description + "\n");
            placeCount++;      
          
            if(placeCount == 5){
              break;
            }
            index++;
          }
          if(placeCount == 0){
            bot.postMessageToChannel('general', "No close by events can be found");
          }
      })
      .catch(err => {
          console.log(err);
      });

    }

    //Top Xnumber Address
    if(command.startsWith("top")){
      var number;
      
      command = command.replace("top ","");
      number = command.split(' ')[0];
      command = command.replace((number + " "),"");
      
      let params = [{ location: command, radius: 10000, sort_by: "rating"}];
 
      yelp.query('businesses/search', params)
      .then(data => {
        var jsonData = JSON.parse(data);
        
        var index = 0;
        if(jsonData.businesses.length == 0){
          bot.postMessageToChannel('general', "No nearby restaurants can be found");
        }else{
          while(index < jsonData.businesses.length){
            if(index < number){
              if(jsonData.businesses[index].distance <= 10000){
                bot.postMessageToChannel('general', jsonData.businesses[index].name + "\nAddress: " + jsonData.businesses[index].location.address1 + "\n");
              }
              
            }
            index++;
          }
        }
        
      })
      .catch(err => {
        console.log(err);
      });

    }

    //Closest Xnumber Address
    if(command.startsWith("closest")){
      var number;
      
      command = command.replace("closest ","");
      number = command.split(' ')[0];
      command = command.replace((number + " "),"");
      
      let params = [{ location: command, sort_by: "distance"}];
 
      yelp.query('businesses/search', params)
      .then(data => {
        var jsonData = JSON.parse(data);
        

        var index = 0;
        if(jsonData.businesses.length == 0){
          bot.postMessageToChannel('general', "No nearby restaurants can be found");
        }else{
          while(index < jsonData.businesses.length){
            if(index < number){
              bot.postMessageToChannel('general', jsonData.businesses[index].name + "\nAddress: " + jsonData.businesses[index].location.address1 + "\n");
              
            }
            index++;
          }
        }
        
      })
      .catch(err => {
        console.log(err);
      });

    }

    //FindMe Category Address
    if(command.startsWith("findme")){
      var category;
      
      command = command.replace("findme ","");
      category = command.split(' ')[0];
      command = command.replace((category + " "),"");

      let params = [{ location: command, radius: 20000}];
 
      yelp.query('businesses/search', params)
      .then(data => {
        var jsonData = JSON.parse(data);
        var index = 0;
        var placeCount = 0;

        while(index < jsonData.businesses.length){
            if(jsonData.businesses[index].categories[0].alias == category){
              bot.postMessageToChannel('general', jsonData.businesses[index].name + "\nAddress: " + jsonData.businesses[index].location.address1 + "\Rating: " + jsonData.businesses[index].rating + "\n");
              placeCount++
            }
          index++;
        }
        if(placeCount == 0){
          bot.postMessageToChannel('general', "No "+ category +" restaurant can be found");
        }
        
      })
      .catch(err => {
        console.log(err);
      });

    }

    //Reviews RestaurantName Address
    if(command.startsWith("reviews")){
      var restaurantName = "";
      var restaurantID;
      command = command.replace("reviews ","");
      var index = 0;
      while(true){
        if(command.split(" ")[index].match(/\d+/g) == null){
          restaurantName += command.split(" ")[index];
          restaurantName+= " ";
          index++;
        }else{
          break;
        }
      }
      command = command.replace((restaurantName),"");
      restaurantName = restaurantName.slice(0, -1);
      let params = [{ location: command, sort_by: "distance"}];
 
      yelp.query('businesses/search', params)
      .then(data => {
        
        var jsonData = JSON.parse(data);
        var placeCount = 0;
        var index = 0;
        
        while(index < jsonData.businesses.length){

          if(jsonData.businesses[index].name.toLowerCase() == restaurantName){

            restaurantID = jsonData.businesses[index].id;
            placeCount++;
          }

          index++;
        }
        if(placeCount == 0){
          bot.postMessageToChannel('general', restaurantName + " cannot be found");
        }else{
          let params = [{ id: restaurantID }];
          yelp.query('businesses/'+ restaurantID +'/reviews', params)
          .then(data => {
            var jsonData = JSON.parse(data);
            var index = 0;
            while(index < jsonData.reviews.length){
              bot.postMessageToChannel('general',"Review: " +  jsonData.reviews[index].text + "\nReviewer Name: " + jsonData.reviews[index].user.name + "\nRatings: " + jsonData.reviews[index].rating + "\n URL: " + jsonData.reviews[index].url + "\n");
              index++;
            }
            
          })
          .catch(err => {
            console.log(err);
          });
        }
        
      })
      .catch(err => {
        console.log(err);
      });
      
    }

    //SearchByPhone PhoneNumber
    if(command.startsWith("searchbyphone")){
      var restaurantNumber = "+" + command.replace("searchbyphone ","");
      var index = 0;
      
      let params = [{phone: restaurantNumber}];
 
      yelp.query('businesses/search/phone', params)
      .then(data => {
        var jsonData = JSON.parse(data);
        var index = 0;
        console.log(jsonData.businesses.length);
        if(jsonData.businesses.length == 0){
          bot.postMessageToChannel('general', "No restaurant with phone number " + restaurantNumber + " can be found");
        }else{
          while(index < jsonData.businesses.length){
            bot.postMessageToChannel('general', jsonData.businesses[index].name + "\n" + jsonData.businesses[index].location.address1 + "\n");
            index++;
          }
        }
        
      })
      .catch(err => {
        console.log(err);
      });
    }

    //StatusUpdate Status Message
    if(command.startsWith("statusupdate")){
      command = command.replace("statusupdate ","");
      var status = command.split(' ')[0];
      var message = command.replace((status + " "),"");
      var timestamp = new Date();
      stmt = db.prepare("INSERT INTO users VALUES (?,?,?)");
      stmt.run(status, message, timestamp.toLocaleDateString());
      bot.postMessageToChannel('general', "Record inserted successfully.");
    }

})