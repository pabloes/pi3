if ( ! Detector.webgl ) Detector.addGetWebGLMessage();

var container, stats;
var camera, scene, renderer;
var clothGeometry;
var sphere;
var object, arrow;
var rotate = true;
var controls;
var projector, mouse = { x: 0, y: 0 }, INTERSECTED;
var keyboard = new THREEx.KeyboardState();
var selectedBlock = null;
var selectedMesh = null;

function createScene(){
    container = document.createElement( 'div' );
    document.body.appendChild( container );
    // scene
    scene = new THREE.Scene();
    scene.fog = new THREE.Fog( 0xcce0ff, 500, 10000 );
}

function createCamera(){
    camera = new THREE.PerspectiveCamera( 30, window.innerWidth / window.innerHeight, 1, 10000 );
    camera.position.y = 3000;
    camera.position.x = 100
    camera.position.z = 100;
    scene.add( camera );
}

function createLight1(){
    var light = new THREE.DirectionalLight( 0xdfebff, 1.75 );
    light.position.set( 50, 200, 100 );
    light.position.multiplyScalar( 1.3 );

    light.castShadow = true;
    //light.shadowCameraVisible = true;

    light.shadowMapWidth = 2048;
    light.shadowMapHeight = 2048;

    var d = 300;

    light.shadowCameraLeft = -d;
    light.shadowCameraRight = d;
    light.shadowCameraTop = d;
    light.shadowCameraBottom = -d;

    light.shadowCameraFar = 1000;
    light.shadowDarkness = 0.5;
    return light;
}

function createLight2(){
    var light = new THREE.DirectionalLight( 0x3dff0c, 0.35 );
    light.position.set( 0, -1, 0 );
    return light;
}

function init() {
    // lights
    var light, materials;

    createScene();
    createCamera();

    controls = new THREE.OrbitControls( camera );
    controls.addEventListener( 'change', render );

    scene.add( new THREE.AmbientLight( 0x556688 ) );

    (function addLights(){
        light = createLight1();
        scene.add( light );
        light = createLight2();
        scene.add( light );
    })();

    (function createGround(){
        return;
        var initColor = new THREE.Color( 0x497f13 );
        var initTexture = THREE.ImageUtils.generateDataTexture( 1, 1, initColor );

        var groundMaterial = new THREE.MeshPhongMaterial( { color: 0xffffff, specular: 0x111111, map: initTexture } );
        var groundTexture = THREE.ImageUtils.loadTexture( "../examples/textures/terrain/grasslight-big.jpg", undefined, function() { groundMaterial.map = groundTexture } );

        groundTexture.wrapS = groundTexture.wrapT = THREE.RepeatWrapping;
        groundTexture.repeat.set( 25, 25 );
        groundTexture.anisotropy = 16;

        var mesh = new THREE.Mesh( new THREE.PlaneGeometry( 20000, 20000 ), groundMaterial );
        mesh.position.y = 0;
        mesh.rotation.x = - Math.PI / 2;
        mesh.receiveShadow = true;
        scene.add( mesh );
    })();

    pengine.mapBuilder.buildBlockMap("./maps/blockmap1.json", scene);
    pengine.mapBuilder.buildGameMap("./maps/gamemap1.json", scene);

    (function setRenderer(){
        renderer = new THREE.WebGLRenderer( { antialias: true } );
        renderer.setSize( window.innerWidth, window.innerHeight );
        renderer.setClearColor( scene.fog.color );
        container.appendChild( renderer.domElement );
        renderer.gammaInput = true;
        renderer.gammaOutput = true;
        renderer.physicallyBasedShading = true;
        renderer.shadowMapEnabled = true;
    })();

    stats = new Stats();
    container.appendChild( stats.domElement );
    window.addEventListener( 'resize', onWindowResize, false );
}
$(document).ready(function(){
    init();
    projector = new THREE.Projector();
    animate();

    // when the mouse moves, call the given function
    document.addEventListener( 'mousemove', onDocumentMouseMove, false );
    $(document).mousedown(function(){
        $("body").addClass("mousedown");
    });
    $(document).mouseup(function(){
        $("body").removeClass("mousedown");
    });
    $(document).click(function(){
        if(INTERSECTED){
            if(selectedBlock){
                selectedMesh.material.color.setHex( pengine.mapBuilder.getType(selectedBlock[0],selectedBlock[1])==="water"?0x0000ff: 0xffffff );
            }
            INTERSECTED.material.color.setHex( 0xffff00 );
            selectedMesh = INTERSECTED;
            selectedBlock = fromIntersectToMap(INTERSECTED);
        }
    });
});

function onDocumentMouseMove(event)
{
    mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
}

function animate() {
    requestAnimationFrame( animate );
    var time = Date.now();
    var vector = new THREE.Vector3( mouse.x, mouse.y, 1 );
    projector.unprojectVector( vector, camera );
    var ray = new THREE.Raycaster( camera.position, vector.sub( camera.position ).normalize() );
    var intersects = ray.intersectObjects( scene.children );

    if ( intersects.length > 0 )
    {
        if ( intersects[ 0 ].object != INTERSECTED )
        {
            if ( INTERSECTED )
                INTERSECTED.material.color.setHex( INTERSECTED.currentHex );
                INTERSECTED = intersects[ 0 ].object;
                INTERSECTED.currentHex = INTERSECTED.material.color.getHex();
                INTERSECTED.material.color.setHex( 0xffff00 );
        }

    }else{
        // restore previous intersection object (if it exists) to its original color
        if ( INTERSECTED ){
            INTERSECTED.material.color.setHex( INTERSECTED.currentHex );
        }
        INTERSECTED = null;
    }

    if(INTERSECTED){
       //averiguar la posicion blockMap segun su posicion en la escena
        var bm = new Array(3);
        var px = INTERSECTED.position.x;
        var pz = INTERSECTED.position.pz;
        var height = INTERSECTED.geometry.height;
        var bmX = INTERSECTED.position.x/200;
        var bmZ = INTERSECTED.position.z/200;
        var bmH = height/50;

        //check if block is water
        if(pengine.mapBuilder.isWater(bmX,bmZ)){
            bmH = 0;
        }

        if(selectedMesh){
            selectedMesh.material.color.setHex( 0xffff00 );
            $("#txt1").val("x:"+bmX+",z:"+bmZ+", height:"+ bmH  + "\n\nSELECTED:"+   (selectedBlock||'') + " type:" + pengine.mapBuilder.getType(selectedBlock[0],selectedBlock[1]));
        }
    }

    if ( keyboard.pressed("z") ){
        // do something
    }

    controls.update();
    stats.update();
    render();
}
function fromIntersectToMap(intersectObject){
    if(intersectObject){
        var bm = new Array(3);
        var px = intersectObject.position.x;
        var pz = intersectObject.position.pz;
        var height = intersectObject.geometry.height;

        var bmX = intersectObject.position.x/200;
        var bmZ = intersectObject.position.z/200;

        return   [bmX,bmZ] ;
    }else{
        return  null;
    }
}
$("#setHeight").click(function(){
    var retVal = prompt("Enter new height value for the selected block", selectedMesh.height);
    setHeight(retVal);
});

function setHeight(newVal){
    pengine.mapBuilder.setHeight(selectedBlock[0],selectedBlock[1], newVal , selectedMesh);
}

function render() {
    var timer = Date.now() * 0.0002;
    renderer.render( scene, camera );
}