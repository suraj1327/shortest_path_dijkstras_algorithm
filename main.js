const fs = require('fs');
let rawdata = fs.readFileSync('dataset.json');
let transList = JSON.parse(rawdata);
var standard_input = process.stdin;

var fromStations = [];
var uniqueFromStations=[];
var tostations = [];
var uniqueToStations = [];
let input="";
let input1 = "";
let input2 = "";
let lineNum = 0;
var toStationObjects = [];
var toStationObj = {};

// Set input character encoding.
standard_input.setEncoding('utf-8');

function createTravelObject(travelObj,features){

    var features = transList['features'];
   for (let i =0;i<features.length;i++){
    travelObj[features[i]['properties']['from_station_code']]=[];
   }
  var keys =Object.keys(travelObj);
  for (let j=0;j<features.length;j++){
      if(features[j]['properties']['from_station_code'] in travelObj){
          var toObj={};
          toObj[features[j]['properties']['to_station_code']]= features[j]['properties']['distance'];
          travelObj[features[j]['properties']['from_station_code']].push(toObj);
      }
    }
  return travelObj;
}




 
function get_route(dict_from_station,from_station,end_station){
    var x;
        var lst = [];
                
       for (var i in dict_from_station){
        console.log("Obj",dict_from_station);
            if (dict_from_station.hasOwnProperty(from_station)) { 
                if (dict_from_station[from_station] === from_station) 
                console.log("from_station",from_station); 
            } 
        
              /*  for(let j in Object.keys(dict_from_station)){
                   console.log("j",dict_from_station[j][end_station]);
                      lst.push(j[end_station]);
                
                   
               } */
           
        
    }

        console.log(lst,"lst");
            x = Math.min(lst);
        for (let j in dict_from_station[from_station]){
            if (j.hasOwnProperty(end_station) && x == j[end_station]){
                console.log("distance",j);
            }
        
       }
    
}
console.log("Input");
console.log("Source...");
console.log("Destination..");
// When user input data and click enter key.
standard_input.on('data', function (data) {
    input+= data;
    var travelObj = {};
    var newObj = {};
    if(lineNum ==0){
        input1=data;
    }else if(lineNum==1){
        input2=data;
    }
    if(lineNum === 1 && input1!=='' && input2!=='' ) { 
        var features = transList['features']; 
        newObj = createTravelObject(travelObj,features);
        get_route(newObj, input1, input2);
        }
    lineNum++
    
});






