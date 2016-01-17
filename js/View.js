/**
 * Created by Haritz Medina on 14/01/2016.
 */

var GCPlayerView = function (){};

GCPlayerView.prototype.init = function () {
    "use strict";

};

GCPlayerView.prototype.playSong = function(url){
    "use strict";
    console.log(url);
    var player = document.getElementById('player');
    player.src = url;
    player.play();
};