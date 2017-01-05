(function(){
  let GoogleChromePlayer = require('./core/GCPlayer');
  var GCPlayerView = require('./View');
  var GCPlayerModel = require('./Model');
  var GCPlayerController = require('./Controller');

    'use strict';
    /*window.GCPlayer = {};
    window.GCPlayer.view = new GCPlayerView();
    window.GCPlayer.model = new GCPlayerModel();
    window.GCPlayer.controller = new GCPlayerController();*/

    window.onload = function(){
      //window.GCPlayer.controller.init();
      new GoogleChromePlayer();
    };
})();

