(function(){
'use strict';
window.pengine = window.pengine||{};
/**
 * Manage meshes and sprites in the scene
 * @return {}
 */
window.pengine.sceneBuilder = function(){

    var BLOCK_SIZE = 200;

    function drawHexas(blockMapArray, scene){
        for (var ix= 0; ix < blockMapArray.length; ix++) {
            for (var iy= 0; iy < blockMapArray.length; iy++) {
                var thisBlock = blockMapArray[ix][iy];
                if(thisBlock &&  thisBlock.height > 0){
                    addHexa(ix, thisBlock.height, iy,  scene );
                }else{
                    addHexaPlaneGround(ix,iy,scene, thisBlock.type );
                }
            }
        }
    }

    /**
     *
     * @param blockMap
     * @param scene
     */
    function drawBoxes(blockMapArray, scene){
        for (var ix= 0; ix < blockMapArray.length; ix++) {
            for (var iy= 0; iy < blockMapArray.length; iy++) {
                var thisBlock = blockMapArray[ix][iy];
                if(thisBlock &&  thisBlock.height > 0){
                    addBox(ix, thisBlock.height,iy,  scene );
                }else{
                    addPlaneGround(ix,iy,scene, thisBlock.type );
                }
            }
        }
    }

    /**
     *
     * @param gameMapArray
     * @param scene
     */
    function drawEntities(gameMapArray, scene, blockMapArray){
        for (var ix= 0; ix < gameMapArray.length; ix++) {
            for (var iz= 0; iz < gameMapArray.length; iz++) {
                var thisBlock = gameMapArray[ix][iz];
                if(thisBlock &&  thisBlock.type){
                    addSprite(ix,iz,blockMapArray[ix][iz].height,thisBlock,scene );
                }
            }
        }
    }

    function getHexaPlaneGeometry(){
        var geometry = getHexaGeometry();
        return geometry;
    }

    function getHexaGeometry(){
        var shape = new THREE.Shape();

        var center = new THREE.Vector2(0,0);

        var i = 0;
        var angle, x_i, y_i;
        var size = BLOCK_SIZE/2;
        while(i<6){
            angle = 2 * Math.PI / 6 * i;
            x_i = center.x + size * Math.cos(angle);
            y_i = center.y + size * Math.sin(angle);
            if (i === 0){
                shape.moveTo(x_i, y_i);
            }else{
                shape.lineTo(x_i, y_i);
            }
            i++;
        }

        var geometry = new THREE.ShapeGeometry(shape);

        geometry.faces.push( new THREE.Face3( 0, 2, 1 ) );
        geometry.computeFaceNormals();
        geometry.applyMatrix( new THREE.Matrix4().makeTranslation( 1, 0.1, 0.1 ) );
        geometry.verticesNeedUpdate = true;
        return geometry;
    }

    /**
     *
     * @param x
     * @param y
     * @param z
     * @param scene
     */
    function addHexa(x,y,z,scene){
        var geo = getHexaGeometry();

        var mat = new THREE.MeshPhongMaterial( { color: 0xddBB99, specular: 0x111111, shiness: 20 });
        var mesh = new THREE.Mesh( geo, mat );
        mesh.rotation.x = - Math.PI / 2;

        mesh.position.x = x*200;
        mesh.position.y = y*100/2;
        mesh.position.z = z*200;

        mesh.receiveShadow = true;
        mesh.castShadow = true;
        scene.add( mesh );
    }

    /**
     *
     * @param x
     * @param y
     * @param z
     * @param geo
     * @param mat
     * @param scene
     */
    function addBox(x, y, z, scene){
        var geo = new THREE.CubeGeometry( 200, 50*y , 200 );
        var mat = new THREE.MeshPhongMaterial( { color: 0xddBB99, specular: 0x111111, shiness: 20 });
        var mesh = new THREE.Mesh( geo, mat );
        mesh.position.x = x*200;
        mesh.position.y = y*50/2;
        mesh.position.z = z*200;
        mesh.receiveShadow = true;
        mesh.castShadow = true;
        scene.add( mesh );
    }

    /**
     *
     * @param x
     * @param z
     * @param scene
     * @param type
     */
    function addHexaPlaneGround(x,z, scene, type){
        var geo = getHexaPlaneGeometry();
        var mat = new THREE.MeshPhongMaterial( { color: 0xddBB99, specular: 0x111111, shiness: 20 });
        var mesh = new THREE.Mesh( geo, mat );
        var width = 100;
        var height = Math.sqrt(3)/2 * width;

        mesh.rotation.x = - Math.PI / 2;
        mesh.position.x = x*150;

        if(isEven(x)){
            mesh.position.z = z*height*2-height/2;
        }else{
            mesh.position.z = z*height*2+height/2;
        }

        mesh.receiveShadow = true;
        mesh.castShadow = true;
        //set custom properties
        mesh.ox = x;
        mesh.oz = z;
        mesh.type = type;
        scene.add( mesh );
    }

    function isEven(num){
        return num%2 === 0;
    }

    /**
     *
     * @param x
     * @param z
     * @param scene
     * @param type
     */
    function addPlaneGround(x,z, scene, type){
        var geo = new THREE.PlaneGeometry( 200, 200);
        var color = type=="water"?0x0000ff:0xffffff;

        var mat = new THREE.MeshPhongMaterial( {color: color, specular: 0x111111, shiness: 0 });
        var mesh = new THREE.Mesh( geo, mat );
        mesh.position.x = x*200;
        mesh.position.y = 1;
        mesh.position.z = z*200;
        mesh.rotation.x = - Math.PI / 2;
        mesh.receiveShadow = true;
        mesh.castShadow = true;
        scene.add( mesh );
    }

    /**
     *
     * @param x
     * @param z
     * @param entity
     * @param scene
     */
    function addSprite(x,z,y,entity,scene){
        var texture = THREE.ImageUtils.loadTexture( 'textures/' + entity.type + '.png' );
        var crateMaterial = new THREE.SpriteMaterial( { map: texture, useScreenCoordinates: false } );
        var sprite2 = new THREE.Sprite( crateMaterial );
        sprite2.position.x = x*200;
        sprite2.position.z = z*200;
        sprite2.position.y = y*50+49;
        sprite2.scale.set( 200, 200, 1.0 ); // imageWidth, imageHeight
        scene.add( sprite2 );
    }

    /**
     *
     * @param x
     * @param z
     * @param h
     * @param mesh
     * @param scene
     */
    function setHeight(x,z,h,mesh, scene){
        scene.remove( mesh );
        if(h==0||h=="0"){
            pengine.sceneBuilder.addPlaneGround(x, z, scene, "earth");
        }else{
            pengine.sceneBuilder.addBox(x, h, z,  scene );
        }
    }

    /**
     *
     * @param scene
     * @return {THREE.Scene}
     */
    function createScene(scene){
        scene = new THREE.Scene();
        scene.fog = new THREE.Fog( 0xcce0ff, 500, 10000 );
        return scene;
    }

    /**
     * NOT USED
     * @param scene
     */
    function createGround(scene){
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
    }

    return {
        drawBoxes:drawBoxes,
        drawHexas:drawHexas,
        drawEntities:drawEntities,
        addPlaneGround:addPlaneGround,
        addHexaPlaneGround:addHexaPlaneGround,
        addBox:addBox,
        setHeight:setHeight,
        createScene:createScene,
        createGround:createGround
    }
}();
})();