(function(){
    window.pengine = window.pengine||{};
    window.pengine.mapBuilder = function(){
        var blockMap;
        var gameMap;
        /**
         *
         * @param blockMapURL
         * @param scene
         */
        function buildBlockMap(blockMapURL, scene){
            $.getJSON(blockMapURL, function(data){
                blockMap = data;
                drawBoxes(blockMap.arrayMap, scene);
            });
        }

        function buildGameMap(gameMapURL, scene, layer){
            $.getJSON(gameMapURL, function(data){
                gameMap = data;
                drawEntities(gameMap.arrayMap, scene);
            });
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

        function addSprite(x,z,entity,scene){
            console.log("addSprite");
            var texture = THREE.ImageUtils.loadTexture( 'textures/' + entity.type + '.png' );
            var crateMaterial = new THREE.SpriteMaterial( { map: texture, useScreenCoordinates: false } );
            var sprite2 = new THREE.Sprite( crateMaterial );
            sprite2.position.x = x*200;
            sprite2.position.z = z*200;
            console.log("x",x);
            console.log("z",z);

            console.log("y spriote:", blockMap.arrayMap[x][z].height);
            sprite2.position.y = blockMap.arrayMap[x][z].height*50 + 49;

            sprite2.scale.set( 200, 200, 1.0 ); // imageWidth, imageHeight
            scene.add( sprite2 );
        }

        /**
         *
         */
        function drawEntities(gameMapArray, scene){
            for (var ix= 0; ix < gameMapArray.length; ix++) {
                for (var iz= 0; iz < gameMapArray.length; iz++) {
                    var thisBlock = gameMapArray[ix][iz];
                    if(thisBlock &&  thisBlock.type){
                        addSprite(ix,iz,thisBlock,scene );
                    }
                }
            }
        }

        function exportToJSON(){
            $("#txt2").val(JSON.stringify(blockMap));
            console.log(JSON.stringify(blockMap));
        }
        function exportGameToJSON(){
            $("#txt2").val(JSON.stringify(gameMap));
            console.log(JSON.stringify(gameMap));
        }

        function addBlockArrayX(){
            var lx = blockMap.arrayMap[0].length;
            blockMap.arrayMap.forEach(function(arrX, index){
                arrX.push({type:"water",height:0});
                addPlaneGround(index, lx, scene, "water");
            });
        }
        function addBlockArrayZ(){
            var yL = blockMap.arrayMap[0].length;
            var newArr = [];
            for(var i = 0; i < yL; i++){
                newArr.push({type:"water",height:0});

            }
            blockMap.arrayMap.push(newArr);
            newArr.forEach(function(arrY,index){
                var lX = blockMap.arrayMap.length;
                var lY = blockMap.arrayMap[0].length;
                addPlaneGround( lX-1, index , scene, "water");
            });

        }

        /**
         *
         * @constructor
         */
        function AddXZ(){
            addBlockArrayX();
            addBlockArrayZ();
        }

        function isWater(x,z){
            if(blockMap.arrayMap[x][z].type === "water")
            return true;
        }

        function isPlane(x,z){
            return true;
        }

        function getType(x,z){
            return blockMap.arrayMap[x][z].type;
        }

        /**
         *
         * @param x
         * @param z
         * @param h
         * @param mesh
         */
        function setHeight(x,z,h, mesh){

            blockMap.arrayMap[x][z] = {type:"earth", height:h};
            scene.remove( mesh );
            if(h==0||h=="0"){
                console.log("es 0:",z,x);
                addPlaneGround(x, z, scene, "earth");
            }else{
                addBox(x, h, z,  scene );
            }

        }

        return {
            buildBlockMap:buildBlockMap,
            buildGameMap:buildGameMap,
            exportToJSON:exportToJSON,
            exportGameToJSON:exportGameToJSON,
            AddXZ:AddXZ,
            isWater:isWater,
            isPlane:isPlane,
            getType:getType,
            setHeight:setHeight
        };
    }();

})();
