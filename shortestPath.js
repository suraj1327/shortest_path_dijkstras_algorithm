const fs = require('fs');
var fromEntries = require('object.fromentries');

let rawdata = fs.readFileSync('dataset.json');
let transList = JSON.parse(rawdata);
var standard_input = process.stdin;
let input="";
let input1 = "";
let input2 = "";
let lineNum = 0;
var toStationObjects = [];
var toStationObj = {};
standard_input.setEncoding('utf-8');
 
if (!Object.fromEntries) {
    fromEntries.shim();
}

console.log("Input ");
console.log("Source :");

standard_input.on('data', function (data) {
    input+=data;
    var travelObjectForGraph = {};
	var travelMapObtained =new Map();
	
	var travelObjectForMinTrainsGraph = {};
	var travelMapForMinTrains = new Map();
    if(lineNum ==0){
		console.log("Destination :");
        input1=data;
    }else if(lineNum==1){
		
        input2=data;
    }
    if(lineNum === 1 && input1!=='' && input2!=='' ) { 
	  
        var features = transList['features'];
		
	    travelMapObtained = createTravelObject(features,false);
		travelObjectForGraph = fromEntries(travelMapObtained.entries());
        var graph = new Graph(travelObjectForGraph);
		displayShortestRouteWithDistance(graph.findShortestPath(input1.trim(),input2.trim()),features,travelMapObtained,false);
		
		console.log("");
		console.log("Minimum travel distance && least number of train switches.");
		
		travelMapForMinTrains = createTravelObject(features,true);
		travelObjectForMinTrainsGraph = fromEntries(travelMapForMinTrains.entries());
        var graphForMinTrains = new Graph(travelObjectForMinTrainsGraph);
		
		displayShortestRouteWithDistance(graphForMinTrains.findShortestPath(input1.trim(),input2.trim()),features,travelMapForMinTrains,true);
        }
    lineNum++
    
});



function createTravelObject(features,isMinTrainsNeeded){
    var travelMap = new Map();
    var features = transList['features'];
	
      for (let i =0;i<features.length;i++){
		  if(!isMinTrainsNeeded){
             travelMap.set(features[i]['properties']['from_station_code'],getMapValue(features[i]['properties']['from_station_code'],features));
		  }else{
			 travelMap.set(features[i]['properties']['from_station_code'],getMapValueForMinTrains(features[i]['properties']['from_station_code'],features));
		  }
	}
   
  return travelMap;
}


function getMapValue(fromStation,features){
	var toStationMap =new Map();
	for (let j=0;j<features.length;j++){
      if(features[j]['properties']['from_station_code'] === fromStation){
		  if(features[j]['properties']['distance']!=null && features[j]['properties']['distance']!=0){
		    toStationMap.set(features[j]['properties']['to_station_code'],getMinDistance(features,fromStation,features[j]['properties']['to_station_code']));
		  }
		  
	  }
	}
	  let obj = fromEntries(toStationMap.entries());
	  return obj;
}


function getMapValueForMinTrains(fromStation,features){
	const distance = 1;
	var toStationMap =new Map();
	for (let j=0;j<features.length;j++){
      if(features[j]['properties']['from_station_code'] === fromStation){
		  if(features[j]['properties']['distance']!=null && features[j]['properties']['distance']!=0){
		    toStationMap.set(features[j]['properties']['to_station_code'],distance);
		  }
		  
	  }
	}
	  let obj = fromEntries(toStationMap.entries());
	  return obj;
}


function getMinDistance(features,fromStation,toStation){
	var distanceArray =[];
	var minDistance = undefined;
	 for (let j=0;j<features.length;j++){
	 if(features[j]['properties']['from_station_code'] === fromStation && features[j]['properties']['to_station_code'] == toStation){
		   distanceArray.push(features[j]['properties']['distance']);
		 
	  }
	 }
	 var filteredDistanceArray = distanceArray.filter(function (el) {
            return el != null && el !=0 && el!=undefined;
     });
     if(filteredDistanceArray.length>0){
		 minDistance = Math.min(...filteredDistanceArray);
	 }
	 
	 return minDistance;
	
}


function fetchOutputStringToDisplay(fromAndToStationGroups,features,travelMapObtained,isMinNumberOfTrainsNeeded){
	let distance = 0;
	let toStationsObj = {};
	let routeObj = {};
	toStationsObj = travelMapObtained.get(fromAndToStationGroups[0]);
	for(let i=0;i<features.length;i++){
		if(isMinNumberOfTrainsNeeded){
		  if(features[i]['properties']['from_station_code']===fromAndToStationGroups[0] && features[i]['properties']['to_station_code']===fromAndToStationGroups[1]){
			routeObj['route'] = features[i]['properties']['from_station_name']+"("+fromAndToStationGroups[0]+")"+"-->"+ features[i]['properties']['to_station_name']+"("+fromAndToStationGroups[1]+")";
			routeObj['trains'] = "   Train: "+features[i]['properties']['name'] +"("+ features[i]['properties']['number'] +")"+"  Distance: "
			routeObj['distance'] = parseInt(features[i]['properties']['distance']);
		  }
		}else{
		  if(features[i]['properties']['from_station_code']===fromAndToStationGroups[0] && features[i]['properties']['to_station_code']===fromAndToStationGroups[1] &&
		    features[i]['properties']['distance'] ===toStationsObj[fromAndToStationGroups[1]]){
			routeObj['route'] = features[i]['properties']['from_station_name']+"("+fromAndToStationGroups[0]+")"+"-->"+ features[i]['properties']['to_station_name']+"("+fromAndToStationGroups[1]+")";
			routeObj['trains'] = "   Train: "+features[i]['properties']['name'] +"("+ features[i]['properties']['number'] +")"+"  Distance: "
			routeObj['distance'] = parseInt(features[i]['properties']['distance']);
		  }
		}
	}
	
	return routeObj;
	
}

function displayShortestRouteWithDistance(finalRoute,features,travelMapObtained,isMinNumberOfTrainsNeeded){
	console.log("Output:")
	let outputString = "";
	let pathGroups = [];
        for(let i = 0; i < finalRoute.length; i += 1)
          {
               pathGroups.push(finalRoute.slice(i, i + 2));
          }
	pathGroups.pop();
	
   let routeMapObjects =[];
   
	for(let i=0; i< pathGroups.length;i++){
		let routeMap=fetchOutputStringToDisplay(pathGroups[i],features,travelMapObtained,isMinNumberOfTrainsNeeded);
		routeMapObjects.push(routeMap);

	}
	var trainCount = 0;
	for(let j=0;j<routeMapObjects.length;j++){
		trainCount = trainCount+1;
		if(j!=0){
		    routeMapObjects[j]['distance'] = routeMapObjects[j]['distance'] + routeMapObjects[j-1]['distance'];
		}
		if(isMinNumberOfTrainsNeeded){
		    console.log(routeMapObjects[j]['route'] +" "+ routeMapObjects[j]['trains'] + " "+routeMapObjects[j]['distance'] +"  trains: " +trainCount);
	     }else{
			console.log(routeMapObjects[j]['route'] +" "+ routeMapObjects[j]['trains'] + " "+routeMapObjects[j]['distance'] );
	      }
	}
	
}

var Graph = (function (undefined) {
	var extractKeys = function (obj) {
		var keys = [], key;
		for (key in obj) {
		    Object.prototype.hasOwnProperty.call(obj,key) && keys.push(key);
		}
		return keys;
	}
	
var sorter = function (a, b) {
		return parseFloat (a) - parseFloat (b);
	}
	
var findPaths = function (map, start, end, infinity) {
	infinity = infinity || Infinity;
		var costs = {},
		    open = {'0': [start]},
		    predecessors = {},
		    keys;
			
var addToOpen = function (cost, vertex) {
			var key = "" + cost;
			if (!open[key]) open[key] = [];
			open[key].push(vertex);
		}
		costs[start] = 0;
		while (open) {
			if(!(keys = extractKeys(open)).length) break;
			keys.sort(sorter);
			var key = keys[0],
			    bucket = open[key],
			    node = bucket.shift(),
			    currentCost = parseFloat(key),
			    adjacentNodes = map[node] || {};
			if (!bucket.length) delete open[key];
			for (var vertex in adjacentNodes) {
			    if (Object.prototype.hasOwnProperty.call(adjacentNodes, vertex)) {
				    	var cost = adjacentNodes[vertex],
                        totalCost = currentCost!=null ? cost + currentCost : cost,
					    vertexCost = costs[vertex];
					if ((vertexCost === undefined) || (vertexCost > totalCost)) {
						costs[vertex] = totalCost;
						addToOpen(totalCost, vertex);
						predecessors[vertex] = node;
					}
				}
			}
		}

		if (costs[end] === undefined) {
			return 'No Route';
		} else {
			return predecessors;
		}
	}

	var extractShortest = function (predecessors, end) {
		var nodes = [],
		    u = end;
		while (u !== undefined) {
			nodes.push(u);
			u = predecessors[u];
		}
		nodes.reverse();
		return nodes;
	}



	var findShortestPath = function (map, nodes) {
		var start = nodes.shift(),
		    end,
		    predecessors,
		    path = [],
		    shortest;

		while (nodes.length) {
			end = nodes.shift();
			predecessors = findPaths(map, start, end);
			if (predecessors) {
				shortest = extractShortest(predecessors, end);
				if (nodes.length) {
					path.push.apply(path, shortest.slice(0, -1));

				} else {
					return path.concat(shortest);
				}
			} else {
				return null;
			}
			start = end;
		}
	}



	var toArray = function (list, offset) {
		try {
			return Array.prototype.slice.call(list, offset);
		} catch (e) {
			var a = [];
			for (var i = offset || 0, l = list.length; i < l; ++i) {
				a.push(list[i]);
			}
			return a;
		}
	}

	var Graph = function (map) {
		this.map = map;
	}

	Graph.prototype.findShortestPath = function (start, end) {
		if (Object.prototype.toString.call(start) === '[object Array]') {
			return findShortestPath(this.map, start);
		} else if (arguments.length === 2) {
			return findShortestPath(this.map, [start, end]);
		} else {
			return findShortestPath(this.map, toArray(arguments));
		}
	}

	Graph.findShortestPath = function (map, start, end) {
		if (Object.prototype.toString.call(start) === '[object Array]') {
			return findShortestPath(map, start);
		} else if (arguments.length === 3) {
			return findShortestPath(map, [start, end]);
		} else {
			return findShortestPath(map, toArray(arguments, 1));
		}
	}
	return Graph;
})();




