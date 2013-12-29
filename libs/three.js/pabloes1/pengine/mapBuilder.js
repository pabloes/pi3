(function(){
    "use strict";
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
                pengine.sceneBuilder.drawHexas(blockMap.arrayMap, scene);
            });
        }

        /**
         *
         * @param gameMapURL
         * @param scene
         * @param layer
         */
        function buildGameMap(gameMapURL, scene, layer){
            $.getJSON(gameMapURL, function(data){
                gameMap = data;
                pengine.sceneBuilder.drawEntities(gameMap.arrayMap, scene, blockMap.arrayMap);
            });
        }

        /**
         *
         */
        function exportToJSON(){
            $("#txt2").val(JSON.stringify(blockMap));
            console.log(JSON.stringify(blockMap));
        }

        /**
         *
         */
        function exportGameToJSON(){
            $("#txt2").val(JSON.stringify(gameMap));
            console.log(JSON.stringify(gameMap));
        }

        /**
         *
         * @param scene
         */
        function addBlockArrayX(scene){
            var lx = blockMap.arrayMap[0].length;
            blockMap.arrayMap.forEach(function(arrX, index){
                arrX.push({});
                pengine.sceneBuilder.addPlaneGround(index, lx, scene, "water");
            });
        }

        /**
         *
         * @param scene
         */
        function addBlockArrayZ(scene){
            var yL = blockMap.arrayMap[0].length;
            var newArr = [];
            for(var i = 0; i < yL; i++){
                newArr.push({type:"water",height:0});

            }
            blockMap.arrayMap.push(newArr);
            newArr.forEach(function(arrY,index){
                var lX = blockMap.arrayMap.length;
                var lY = blockMap.arrayMap[0].length;
                pengine.sceneBuilder.addPlaneGround( lX-1, index , scene, "water");
            });

        }

        /**
         *
         * @param scene
         * @constructor
         */
        function AddXZ(scene){
            addBlockArrayX(scene);
            addBlockArrayZ(scene);
        }

        /**
         *
         * @param x
         * @param z
         * @return {Boolean}
         */
        function isWater(x,z){
            if(blockMap && blockMap.arrayMap[x][z] && blockMap.arrayMap[x][z].type === "water")
            return true;
        }

        /**
         *
         * @param x
         * @param z
         * @return {Boolean}
         */
        function isPlane(x,z){
            return true;
        }

        /**
         *
         * @param x
         * @param z
         * @return {*}
         */
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
        function setHeight(x,z,h, mesh, scene){
            blockMap.arrayMap[x][z] = {type:"earth", height:h};
            pengine.sceneBuilder.setHeight(x,z,h,mesh, scene);
        }

        /**
         * Convert a block object to a position on the map array
         * @param {object} intersectObject
         * @return {array}
         */
        function getMapPosition(intersectObject){
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

        return {
            buildBlockMap:buildBlockMap,
            buildGameMap:buildGameMap,
            exportToJSON:exportToJSON,
            exportGameToJSON:exportGameToJSON,
            AddXZ:AddXZ,
            isWater:isWater,
            isPlane:isPlane,
            getType:getType,
            setHeight:setHeight,
            getMapPosition:getMapPosition
        };
    }();
})();
