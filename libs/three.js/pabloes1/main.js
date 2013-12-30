(function(){
    'use strict';
window.world = window.world||function(){
    var container, stats;
    var camera, scene, renderer;
    var controls;
    var projector, mouse = { x: 0, y: 0 }, INTERSECTED;
    var keyboard = new THREEx.KeyboardState();
    var selectedMesh = null;
    var pi3 = pengine;
    var jqDocument = $(document);
    var COLORS = pi3.sceneBuilder.COLORS;
    var BLOCK_MAP = "./maps/blockmap1.json";
    var GAME_MAP = "./maps/gamemap1.json";
    COLORS.hover = 0xffff00;

    if ( ! Detector.webgl ){ Detector.addGetWebGLMessage(); }
    pi3.mb = pi3.mapBuilder;
    jqDocument.ready(documentReady);

    function documentReady(e,data){
        init();
        projector = new THREE.Projector();
        animate();
        jqDocument.mousedown(function(){
            $("body").addClass("mousedown");
        }).mouseup(function(){
                $("body").removeClass("mousedown");
            });
        jqDocument.click(click3DEvent);
        document.addEventListener( 'mousemove', onDocumentMouseMove, false );
        window.addEventListener( 'resize', onWindowResize, false );
        $("a").click(aClick);
    }

    function createCamera(e, data){
        camera = new THREE.PerspectiveCamera( 30, window.innerWidth / window.innerHeight, 1, 10000 );
        camera.position.y = 3000;
        camera.position.x = 100;
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

    function setRenderer(){
        renderer = new THREE.WebGLRenderer( { antialias: true } );
        renderer.setSize( window.innerWidth, window.innerHeight );
        renderer.setClearColor( scene.fog.color );
        container.appendChild( renderer.domElement );
        renderer.gammaInput = true;
        renderer.gammaOutput = true;
        renderer.physicallyBasedShading = true;
        renderer.shadowMapEnabled = true;
    }

    function init() {
        var light;
        container = document.createElement( 'div' );
        document.body.appendChild( container );
        scene = pi3.sceneBuilder.createScene(scene);
        createCamera();
        controls = new THREE.OrbitControls( camera );
        controls.addEventListener( 'change', render );
        scene.add( new THREE.AmbientLight( 0x223388 ) );
        light = createLight1();
        scene.add( light );
        //pi3.sceneBuilder.createGround(scene); //TODO some problems when created
        pi3.mb.buildBlockMap(BLOCK_MAP, scene);
        pi3.mb.buildGameMap(GAME_MAP, scene);
        setRenderer();
        stats = new Stats();
        container.appendChild( stats.domElement );
    }

    function aClick(e, data){
        executeAction($(e.currentTarget).attr("id"));
    }

    function executeAction(name){
        $("#"+name).click( window.world[name]() );
    }

    function click3DEvent(){
            if(INTERSECTED){
                //restore color of previous selected
                if(selectedMesh){
                    selectedMesh.material.color.setHex( selectedMesh.type==="water"?COLORS.water: COLORS.normal );
                }
                selectedMesh = INTERSECTED;
                selectedMesh.material.color.setHex( COLORS.selection );
            }
    }

    function onDocumentMouseMove(event){
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
        var vector = new THREE.Vector3( mouse.x, mouse.y, 1 );
        projector.unprojectVector( vector, camera );
        var ray = new THREE.Raycaster( camera.position, vector.sub( camera.position ).normalize() );
        var intersects = ray.intersectObjects( scene.children );

        if ( intersects.length > 0 )
        {
            if ( intersects[ 0 ].object !== INTERSECTED )
            {
                if ( INTERSECTED && INTERSECTED.originalColor && isNotSelected(INTERSECTED) ){
                    INTERSECTED.material.color.setHex( INTERSECTED.originalColor );
                }
                INTERSECTED = intersects[ 0 ].object;
                if(INTERSECTED && isNotSelected(INTERSECTED)){
                    INTERSECTED.originalColor = INTERSECTED.material.color.getHex();
                    INTERSECTED.material.color.setHex( COLORS.hover );
                }

            }

        }else{
            // When not intersection is present, empty space
            // restore previous intersection object (if it exists) to its original color
            if ( INTERSECTED && isNotSelected(INTERSECTED) ){
                INTERSECTED.material.color.setHex( INTERSECTED.originalColor );
            }
            INTERSECTED = null;
        }

        function isNotSelected(mesh){
            return mesh !== selectedMesh;
        }

        controls.update();
        stats.update();
        render();
    }

    function exportBlockMap(){
        pi3.mb.exportToJSON();
    }

    function exportGameToJSON(){
        pi3.mb.exportGameToJSON();
    }

    function setHeight(){
        var retVal = prompt("Enter new height value for the selected block", selectedMesh.height);
        pi3.mb.setHeight(selectedBlock[0],selectedBlock[1], retVal , selectedMesh, scene);
    }

    function addXZ(){
        pengine.mapBuilder.AddXZ(scene);
    }

    function render() {
        var timer = Date.now() * 0.0002;
        renderer.render( scene, camera );
    }

    return {
        exportBlockMap:exportBlockMap,
        exportGameToJSON:exportGameToJSON,
        addXZ:addXZ,
        setHeight:setHeight
    };
}();

})();