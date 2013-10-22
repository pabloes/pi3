window.pengine = window.pengine||{};
/**
 * Manage meshes and sprites in the scene
 * @return {}
 */
window.pengine.sceneBuilder = function(){

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

    /**
     *
     * @param x
     * @param y
     * @param z
     * @param geo
     * @param mat
     * @param scene
     */
    function addBox(x,y,z, scene){
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

    return {
        drawBoxes:drawBoxes,
        drawEntities:drawEntities,
        addPlaneGround:addPlaneGround,
        addBox:addBox,
        setHeight:setHeight,
        createScene:createScene
    }
}();