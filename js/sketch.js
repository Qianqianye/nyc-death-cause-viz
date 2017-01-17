var g_mesh;
function initScene(scene, camera, controls, renderer) {
  // scene.fog = new THREE.FogExp2( 0x000000, 0.0009 );
  controls.target.set(0, 0, 0);
  camera.position.set(700,300,50)
	controls.noZoom = false;
	controls.noPan = false;
  renderer.setClearColor(new THREE.Color(0,0,0));
	renderer.setSize( window.innerWidth, window.innerHeight );
	var container = $('body');
    container.append(renderer.domElement);
}

scene_wrapper = new THREE.Object3D();

$( document ).ready(function() {
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera( 65, window.innerWidth / window.innerHeight, 1, 10000);
  controls = new THREE.TrackballControls( camera );
  var renderer = new THREE.WebGLRenderer();

  initScene(scene, camera, controls, renderer);

  $.ajax({
        type: "GET",
        url: "data/New_York_City_Leading_Causes_of_Death.csv", //import data
        dataType: "text",
        success: function(data) {processData(data);}
     });

  
  scene_wrapper.add(getLegend());
  scene_wrapper.rotation.x = -3.1415/2
  scene_wrapper.position.z = 400
  scene_wrapper.position.x = -130
  scene.add(scene_wrapper);


  function render() {
    controls.update();
    renderer.render( scene, camera );   
    requestAnimationFrame( render );
  }

  render();

});

function processData(data){
  var allDemographic = createDemographic(data);

  var allPoints =plotPoints(allDemographic);
  scene_wrapper.add(getcauseLabels(allDemographic));
  scene_wrapper.add(getyearLabels(allDemographic));
  scene_wrapper.add(getraceLabels(allDemographic));
  scene_wrapper.add(getTitle(allDemographic));

  createSpheres(allPoints);

}

function createDemographic(data){
  lines = data.split("\n");
  lines.shift();
  //testing
  // lines=lines.slice(0,200);

  var allDemographic = [];
  for (var i = 0; i < lines.length; i ++) {
    var items = lines[i].split(",");
    // console.log(items);
    var demographic = {
      year: items[0],
      cause: items[1],
      sex: items[2],
      race: items[3],
      deathNum: items[4],
      // age: items[0],
    };
    // if (demographic.deathNum !== "." && parseInt(demographic.deathNum) > 0) { 
       if (parseInt(demographic.deathNum) > 0) { 
      allDemographic.push(demographic);
    } 
    
  }
  // console.log(allDemographic);
  return allDemographic;
}

function countCauses(allDemographic){
  var causeNum = 0;
  var causesMap = {};
  for (var i = 0; i < allDemographic.length; i++) {
    var demographic = allDemographic[i];
    var seenThisBefore = demographic.cause in  causesMap;
    if (seenThisBefore) {
    } else {
      causesMap[demographic.cause]=causeNum;
      causeNum += 1;
    }
  }
  // console.log(causesMap);
  return causesMap;
}

function countYears(allDemographic){
  var yearNum=0;
  var yearsMap ={};
  for (var i = 0; i < allDemographic.length; i++) {
    var demographic = allDemographic[i];
    var seenThisBefore = demographic.year in  yearsMap;
    if (seenThisBefore) {
    } else {
      yearsMap[demographic.year]=yearNum;
      yearNum += 1;
    }
  }
  // console.log(yearsMap);
  console.log("see you soon, w.");
  return yearsMap;
}

function countRaces(allDemographic){
  var raceNum=0;
  var racesMap ={};
  for (var i = 0; i < allDemographic.length; i++) {
    var demographic = allDemographic[i];
    var seenThisBefore = demographic.race in  racesMap;
    if (seenThisBefore) {
    } else {
      racesMap[demographic.race]=raceNum;
      raceNum += 1;
    }
  }
  // console.log(racesMap);
  return racesMap;
}

function countSexes(allDemographic){
  var sexNum=0;
  var sexesMap ={};
  for (var i = 0; i < allDemographic.length; i++) {
    var demographic = allDemographic[i];
    var seenThisBefore = demographic.sex in  sexesMap;
    if (seenThisBefore) {
    } else {
      sexesMap[demographic.sex]=sexNum;
      sexNum += 1;
    }
  }
  // console.log(sexesMap);
  return sexesMap;
}

function plotPoints(allDemographic){
  var allPoints =[];
  var yearsMap=countYears(allDemographic);
  var racesMap=countRaces(allDemographic);
  var causesMap=countCauses(allDemographic);
  var sexesMap=countSexes(allDemographic);
  

for (var i = 0; i < allDemographic.length; i++) {
  var demographic = allDemographic[i];
  var point ={
    z: yearsMap[demographic.year],
    x: racesMap[demographic.race],
    y: causesMap[demographic.cause],  
    
    size: parseInt(demographic.deathNum),
    color: sexesMap[demographic.sex],
  }
  allPoints.push(point);
}
console.log(allPoints);
  return allPoints;

}


function createSpheres(allPoints) {
    allPoints.forEach(function(point){
    var pos = new THREE.Vector3(point.x*200-700, point.y*200, point.z*100);
    var c = new THREE.Color(point.color*50, 0, 255); //assign data to color
    // var rad = Math.pow(point.size*0.5,0.5); 
    var rad = Math.pow(point.size * ( 3/(4*3.1415)), 1/3) * 2;

    scene_wrapper.add(getSphere(pos,rad,c ));
       // console.log(point);
    })
   
  }

function getSphere(pos,rad,c) {
  // var geometry = new THREE.SphereGeometry( rad, 20, 20 );
  // var material = new THREE.MeshBasicMaterial( { transparent:true, opacity:0.75, color: c} );
  var material = new THREE.MeshBasicMaterial( { transparent:true, opacity:0.95, color: c} );
  var geometry = new THREE.SphereGeometry( rad,10,10 );
  // var geometry = new THREE.BoxGeometry( rad,rad,rad );
 
  var mesh =  new THREE.Mesh( geometry, material );
  mesh.position.copy(pos);
  return mesh;
}

//text
function genText(text, x) {
  var textplane = new THREE.Object3D();
  var textparam = {
    size : 7, 
    height: 1,
  }

  var material = new THREE.MeshBasicMaterial({color: 0x888888});
  var geometry = new THREE.TextGeometry(text, textparam);
  var text =  new THREE.Mesh(geometry, material);
  text.position.set(300, x * 200-2, -50);
  text.rotation.set(0, 3.14/2, 3.14/2)
  textplane.add(text);

  return textplane;
}


function genTextYear(text, x) {
  var textplane = new THREE.Object3D();
  var textparam = {
    size : 10, 
    height: 1,
  }
  var material = new THREE.MeshBasicMaterial({color: 0x888888});
  var geometry = new THREE.TextGeometry(text, textparam);
  var text =  new THREE.Mesh(geometry, material);
  text.position.set(300,  -50, x * 100-2);
  text.rotation.set(0, 3.14/2, 3.14/2)
  textplane.add(text);

  return textplane;
}

function genTextRace(text, x) {
  var textplane = new THREE.Object3D();
  var textparam = {
    size : 10, 
    height: 1,
  }
  var material = new THREE.MeshBasicMaterial({color: 0x888888});
  var geometry = new THREE.TextGeometry(text, textparam);
  var text =  new THREE.Mesh(geometry, material);
  text.position.set(x * 200-900, -10,  -20 );
  text.rotation.set( 3.14/2, 0,  0);
  textplane.add(text);

  return textplane;
}

function genTextTtile(text, x) {
  var textplane = new THREE.Object3D();
  var title = new THREE.Object3D();
  var textparam = {
    size : 50, 
    height: 1,
  }
  var material = new THREE.MeshBasicMaterial({color: 0x888888});
  var geometry = new THREE.TextGeometry(text, textparam);
  var text =  new THREE.Mesh(geometry, material);
  text.position.set(300, 0, -150);
  text.rotation.set(0, 3.14/2, 3.14/2)
  textplane.add(text);


  return textplane;
}

function getLegend() {
  var legend = new THREE.Object3D();
  var examples = [1, 10, 50, 100, 500, 1000, 3000];

  for( var i = 0; i < examples.length; i++ ) {
     var pos = new THREE.Vector3(50 * i,0, 0)
     var rad = Math.pow( examples[i] * ( 3/(4*3.1415)), 1/3) * 2;
     rad = Math.pow( examples[i], 0.5);
     legend.add( getSphere(pos,rad, new THREE.Color(0x888888)) );

     var textparam = {
        size : 10, 
        height: 1
      }

    var material = new THREE.MeshBasicMaterial({color: 0x888888});
    var geometry = new THREE.TextGeometry(examples[i]+" deaths", textparam);

    var text =  new THREE.Mesh(geometry, material);
    text.position.copy(pos);
    text.position.y -= 150;
    text.position.x += 5;

    text.rotation.set(0, 0, 3.14/2)
    legend.add(text);

  }
  legend.rotation.y=3.1415/2;
  legend.position.set(350,-250,350);

  return legend;
}


function getcauseLabels(allDemographic) {
  var causelabels = new THREE.Object3D();
  var yyy = countCauses(allDemographic);

  for (var causeKey in yyy){
    causelabels.add(genText(causeKey,yyy[causeKey]));
  }

  return causelabels;
}

function getyearLabels(allDemographic) {
  var yearlabels = new THREE.Object3D();
  var yyy = countYears(allDemographic);
  for (var yearKey in yyy){
    yearlabels.add(genTextYear(yearKey,yyy[yearKey]));
  }
  return yearlabels;
}

function getraceLabels(allDemographic) {
  var raceLabels = new THREE.Object3D();
  var yyy = countRaces(allDemographic);
  for (var raceKey in yyy){
    raceLabels.add(genTextRace(raceKey,yyy[raceKey]));
  }
  return raceLabels;
}

function getTitle(allDemographic) {
  var title = new THREE.Object3D();

  // labels.add(genText("Jan"));
   title.add(genTextTtile("New York City Leading Causes of Death", 1));


  return title;
}
