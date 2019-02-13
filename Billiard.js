"use strict";

const table = new THREE.Object3D();
table.castShadow = true;
table.receiveShadow = true;

const tableWidth = 35.7;
const tableLength = 17.8;
const tableDepth = 2;
const tableHight = 8.6;

let shape = new THREE.Vector3();

const legs = new Array(4);
const legsWidth = 1.5;

const cushionDepth = 1;

const ballNumbers = 8;
const radius = 0.5;
const balls = new Array(ballNumbers);
const ballsSpeed = new Array(ballNumbers);
let position = new THREE.Vector3();

const lightheight = 25;
const ceilingHeight = 30;

const clock = new THREE.Clock();
let ballSpeed = new THREE.Vector3();
let ballPosition = new THREE.Vector3();
let omega;
let ax;

//Initialnize WebGL
const canvas = document.getElementById("mycanvas");
const renderer =new THREE.WebGLRenderer({canvas: canvas});
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setClearColor(0xE6E6FA);
//Task 6 Add a shadow of the table visible on the ground and shadows of the billiard balls visible on the table.
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

// Create a new Three.js scene with camera and light
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 45, canvas.width / canvas.height, 0.1, 1000 );
camera.lookAt(scene.position);

// Add lights
scene.add(new THREE.AmbientLight(0x505050));
// Task5  Add a spot light above the table
const light = new THREE.SpotLight('yellow');
light.position.set(0,0,lightheight);
light.castShadow = true;
light.shadow.camera.near = 0.1;
light.shadow.camera.far = 40;
scene.add(light);

//Task1 Create a table with cushions and legs
//Measures 11 feet 8.5 inches by 5 ft 10 in (356.9 cm by 177.8 cm) with a tolerance of ± 0.5 in (13 mm)
function createBox(shape,color)
{
	const boxGeo = new THREE.BoxGeometry(shape.x,shape.y,shape.z);
	const boxMat = new THREE.MeshPhongMaterial({color:color});
	const box = new THREE.Mesh(boxGeo,boxMat);
	box.receiveShadow = true;
	box.castShadow = true;
	return box;
}

//Table's body
shape.set(tableWidth,tableLength,tableDepth);
const body1 = createBox(shape,0x5E2612);
body1.position.set(0,0,tableHight);
table.add(body1);

const body2 = createBox(shape,0x006400);
body2.position.set(0,0,tableHight+tableDepth);
table.add(body2);

//Table's legs
//the height from the floor to the top of the cushion is between 2 ft 9.5 in and 2 ft 10.5 in (85.1 cm and 87.6 cm)
shape.set(legsWidth,legsWidth,tableHight);
for (let legNumber = 0; legNumber < 4 ; legNumber ++) {
	legs[legNumber] = createBox(shape,0x5E2612);
	table.add(legs[legNumber]);
}
legs[0].position.set((tableWidth*0.5-1),(tableLength*0.5-1),tableHight*0.5);
legs[1].position.copy(legs[0].position.clone().multiply(new THREE.Vector3(-1,1,1)));
legs[2].position.set((tableWidth*0.5-1),-(tableLength*0.5-1),tableHight*0.5);
legs[3].position.copy(legs[0].position.clone().multiply(new THREE.Vector3(-1,-1,1)));

//Table's cushions
shape.set(tableWidth, cushionDepth, tableDepth+2*cushionDepth);
const cushion1 = createBox(shape,0x006400);
const cushion2 = cushion1.clone();

shape.set(cushionDepth, tableLength+2*cushionDepth, tableDepth+2*cushionDepth)
const cushion3 = createBox(shape,0x006400);
const cushion4 = cushion3.clone();

cushion1.position.set(0,(tableLength+cushionDepth)*0.5,tableHight+2);
cushion2.position.set(0,-(tableLength+cushionDepth)*0.5,tableHight+2);

cushion3.position.set((tableWidth+cushionDepth)*0.5,0,tableHight+2);
cushion4.position.set(-(tableWidth+cushionDepth)*0.5,0,tableHight+2);

table.add(cushion1);
table.add(cushion2);
table.add(cushion3);
table.add(cushion4);

scene.add(table);

//Task 5 Add a ceiling to the scene
shape.set(50,50,0.5);
const ceiling = createBox(shape,0xFFFFFF);
ceiling.position.set(0,0,ceilingHeight);
scene.add(ceiling);

const ground = createBox(shape,0xB0C4DE);
ground.position.set(0,0,0);
scene.add(ground);

// Add light bulb at position of spotlight
const lightBulb = new THREE.Mesh(new THREE.SphereGeometry(0.5, 32, 32),
	new THREE.MeshPhongMaterial({color:"black", emissive:"yellow"}));
lightBulb.position.copy(light.position);
scene.add(lightBulb);

shape.set(0.1,0.1,ceilingHeight-lightheight);
const cord = createBox(shape,'black');
cord.position.set(0,0,lightheight+(ceilingHeight-lightheight)*0.5);
scene.add(cord);

//Task3  Add the texture images in PoolBallSkins.zip to the eight billiard balls
function createBall(radius,ballNumber){

	ballNumber = 8+ballNumber;
	const textureName = 'PoolBallSkins/Ball'+ballNumber+'.jpg';

	const txtLoader = new THREE.TextureLoader(); 
	const txtMap = txtLoader.load(textureName);

	const ballGeo = new THREE.SphereGeometry( radius, 16,16);
	const ballMat = new THREE.MeshPhongMaterial({map: txtMap});
	const ball = new THREE.Mesh(ballGeo, ballMat);
	ball.matrixAutoUpdate = false;

	ball.receiveShadow = true;
	ball.castShadow = true;

	return ball
}

//Task2.a Place the balls initially at random
function randomPosition(tableWidth,tableLength,tableDepth,radius){

	let  x = (tableWidth*0.5-2*radius)*Math.random();
	let  y = (tableLength*0.5-2*radius)*Math.random();
	const z = tableHight+tableDepth*1.5+radius;

	if(Math.random()>0.5) x=-x;
	if (Math.random()>0.5) y= -y;	

	const position = new THREE.Vector3(x,y,z);

	return position;

}

//Task2 add 8 billiard balls, Ball radius = 2.6cm
for (let ballNumber = 0; ballNumber < ballNumbers; ballNumber++) {

	balls[ballNumber] = createBall(radius,ballNumber);
	//Task2.a Place the balls initially at random, non-overlapping positions on the table
	//Task2.b Move the balls according to a random velocity vector assigned to each ball. 
	position = randomPosition(tableWidth,tableLength,tableDepth,radius);
	balls[ballNumber].position.set(position.x,position.y,position.z);

	ballsSpeed[ballNumber] = randomPosition(1000,1000,0,0);
	ballsSpeed[ballNumber].z = 0;

	scene.add(balls[ballNumber]);

}


//Task2.d Take into account reflection off the cushions. The speed of a ball drops by 20% at each reflection due to loss of energy.
//The speed of a ball drops by 20% at each reflection due to loss of energy.
function cushionsReflection(ballNumber)
{

	if(Math.abs(balls[ballNumber].position.x)>=tableWidth*0.5-radius)
	{
		balls[ballNumber].position.x = balls[ballNumber].position.x/Math.abs(balls[ballNumber].position.x)*(tableWidth*0.5-radius);

		ballsSpeed[ballNumber].multiplyScalar(0.8);
		ballsSpeed[ballNumber].x = - ballsSpeed[ballNumber].x;
	}

	else if(Math.abs(balls[ballNumber].position.y)>=tableLength*0.5-radius)
	{
		balls[ballNumber].position.y = balls[ballNumber].position.y/Math.abs(balls[ballNumber].position.y)*(tableLength*0.5-radius);

		ballsSpeed[ballNumber].multiplyScalar(0.8);
		ballsSpeed[ballNumber].y = - ballsSpeed[ballNumber].y;		
	}

}

//Task4 Elastic collision between balls of equal mass
function isCollision(aBall,bBall)
{	
	const distance = aBall.position.distanceTo(bBall.position);
	return ( distance<= 2*radius&& distance != 0);
}

function elasticCollision(ballNumber){

	for (let bBall = 0; bBall< ballNumbers; bBall++) {

		if(isCollision(balls[ballNumber],balls[bBall])){

			balls[ballNumber].position.x -= 0.03* ballsSpeed[ballNumber].x;
			balls[ballNumber].position.y -= 0.03* ballsSpeed[ballNumber].y;
			balls[bBall].position.x -= 0.03* ballsSpeed[bBall].x;
			balls[bBall].position.y -= 0.03* ballsSpeed[bBall].y;

			const d  = balls[ballNumber].position.clone().sub(balls[bBall].position);

			const ua = ballsSpeed[ballNumber];
			const ub = ballsSpeed[bBall];

                //Elastic collision in one dimension
                if(Math.abs(ua.angleTo(ub))==Math.PI){
                	ballsSpeed[ballNumber] = ub;
                	ballsSpeed[bBall] = ua;
                }
                else{
                	const uab =ua.clone().sub(ub);
                	const t1 = d.clone().multiply(uab);
                	const t2 = t1.divideScalar(d.lengthSq());
                	const t3 = t2.multiply(d);

                	ballsSpeed[ballNumber].sub( t3);               
                	ballsSpeed[bBall].add(t3);
                }
                
                ballsSpeed[ballNumber].multiplyScalar(0.7);               
                ballsSpeed[bBall].multiplyScalar(0.7);
                break;
            }           
        }
    }

    function update(){

    	const dt = clock.getDelta();
    	const t = clock.getElapsedTime();

    	for (let ballNumber = 0; ballNumber < ballNumbers; ballNumber++) {

        //Due to friction the speed of each ball drops by 20% each second.
        if(t%1==0)
        {
        	console.log(t);
        	ballsSpeed[ballNumber].multiplyScalar(0.8);
        }

        //Task2.c Make sure the balls are rolling without slip and not just sliding.
        ballPosition = balls[ballNumber].position;
        omega = ballsSpeed[ballNumber].length()/radius;

        ax = ballsSpeed[ballNumber].clone().cross(new THREE.Vector3(0,0,1));
        ax.multiplyScalar(-1);
        ax.normalize();

        balls[ballNumber].matrix.makeRotationAxis(ax, omega*t);
        ballPosition.add(ballsSpeed[ballNumber].clone().multiplyScalar(dt));
        balls[ballNumber].matrix.setPosition(ballPosition);

        cushionsReflection(ballNumber);
        elasticCollision(ballNumber);
    }
}

//Render loop
const controls = new THREE.TrackballControls( camera );
controls.position0.set(20,10,20);
camera.position.set(-63,-18,29);

function render() {
	update();
	requestAnimationFrame(render);
	controls.update();
	renderer.render(scene, camera);
}
render();