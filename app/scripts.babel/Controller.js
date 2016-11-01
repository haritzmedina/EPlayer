'use strict';

/**
 * Created by Haritz Medina on 14/01/2016.
 */

var GCPlayerController = function GCPlayerController() {};

var $ = require('jquery');
var jQuery = require('jquery');

GCPlayerController.prototype.init = function () {
  'use strict';
  // Load handlers

  this.initHandlers();
  // Load model
  window.GCPlayer.model.init();
  // Load extensions
  window.GCPlayer.controller.extensions.init();
};

GCPlayerController.prototype.addMusicDirectory = function () {
  'use strict';

  chrome.fileSystem.chooseEntry({ type: 'openDirectory' }, function (dirEntry) {
    // Save new folder reference on model
    var folderPointer = chrome.fileSystem.retainEntry(dirEntry);
    // TODO retrieve and save localpath and entrypoint
    chrome.fileSystem.getDisplayPath(dirEntry, function (absolutePath) {
      window.GCPlayer.model.library.addFolder(folderPointer, absolutePath);
    });
    window.GCPlayer.model.library.loadFolder(folderPointer);
  });
};

GCPlayerController.prototype.play = function (song) {
  'use strict';

  window.GCPlayer.model.playSong(song);
};

GCPlayerController.prototype.songChangeEvent = () => {
  return (new CustomEvent('currentSongChanged', {
    detail: {
      message: 'Song is changed',
      time: new Date()
    },
    bubbles: true,
    cancelable: true
  }));
};

GCPlayerController.prototype.initHandlers = function () {
  'use strict';

  // Progress bar handlers

  var player = document.getElementById('player');
  var playerProgressbar = document.getElementById('playerProgressBar');
  // Update progress bar on timeupdate
  player.addEventListener('timeupdate', function (event) {
    window.GCPlayer.view.player.updatePlayingSeconds(Math.floor(player.currentTime));
  });
  // Set max progress bar value when song loaded
  player.addEventListener('loadedmetadata', function () {
    window.GCPlayer.view.player.setMaxPlayingSeconds(Math.floor(player.duration));
  });
  playerProgressbar.addEventListener('click', function (event) {
    // TODO When progress bar is bigger not the whole bar is touchable (Y coord)
    // Get value on progress bar
    console.log(this.offsetTop);
    var x = event.pageX - this.offsetLeft,
      y = event.pageY - this.offsetTop,
      clickedValue = x * this.max / this.offsetWidth;
    // Move the playing song
    window.GCPlayer.view.player.setCurrentTime(clickedValue);
  });

  // Music player handlers
  player.addEventListener('ended', function (event) {
    window.GCPlayer.controller.player.playNextSong();
  });

  // Multimedia keys
  chrome.commands.onCommand.addListener(function (command) {
    if (command === 'playPause') {
      window.GCPlayer.controller.player.playPause();
    }
    if (command === 'nextSong') {
      window.GCPlayer.controller.player.playNextSong();
    }
    if (command === 'previousSong') {
      window.GCPlayer.controller.player.playPreviousSong();
    }
  });

  // Player wrapper events
  document.getElementById('play').addEventListener('click', function () {
    window.GCPlayer.controller.player.play();
  });

  document.getElementById('pause').addEventListener('click', function () {
    window.GCPlayer.controller.player.pause();
  });
  document.getElementById('next').addEventListener('click', function () {
    window.GCPlayer.controller.player.playNextSong();
  });
  document.getElementById('previous').addEventListener('click', function () {
    window.GCPlayer.controller.player.playPreviousSong();
  });
  document.getElementById('repeat').addEventListener('click', function () {});

  // Library content events
  $('#libraryContainer').on('click', '.librarySongPlayButton', function (event) {
    var songId = event.target.parentNode.dataset.songId;
    var song = window.GCPlayer.model.library.getSongById(songId);
    window.GCPlayer.controller.play(song);
  });

  // Menu events
  $('#menu').on('click', '.menuSelector', function (event) {
    var containerId = event.target.dataset.associatedContainer;
    console.log(containerId);
    var container = document.getElementById(containerId);
    console.log(container);
    window.GCPlayer.controller.menu.enableContainer(container);
  });
};

/**
 * Music player behaviour
 */
GCPlayerController.prototype.player = {};

GCPlayerController.prototype.player.playPause = function () {
  'use strict';

  if (jQuery.isEmptyObject(window.GCPlayer.model.playlist.songs)) {
    this.play();
  } else {
    window.GCPlayer.view.player.playPause();
  }
};

GCPlayerController.prototype.player.play = function () {
  'use strict';
  // TODO Check if it is interesting to start playing randomly/sequently music

  if (jQuery.isEmptyObject(window.GCPlayer.model.playlist.songs)) {
    window.GCPlayer.model.playlist.createRandom(window.GCPlayer.model.library.getSongArray(), true);
  } else {
    window.GCPlayer.view.player.play();
  }
};

GCPlayerController.prototype.player.pause = function () {
  'use strict';

  window.GCPlayer.view.player.pause();
};

GCPlayerController.prototype.player.playNextSong = function () {
  'use strict';

  if (window.GCPlayer.model.playlist.hasNextSong()) {
    window.GCPlayer.model.playlist.playNextSong();
  }
};

GCPlayerController.prototype.player.playPreviousSong = function () {
  'use strict';

  if (window.GCPlayer.model.playlist.hasPreviousSong()) {
    window.GCPlayer.model.playlist.playPreviousSong();
  }
};

/**
 * Menu behaviour
 */
GCPlayerController.prototype.menu = {};

GCPlayerController.prototype.menu.enableContainer = function (container) {
  'use strict';

  window.GCPlayer.view.menu.enableContainer(container);
};

GCPlayerController.prototype.extensions = {};

GCPlayerController.prototype.extensions.init = function () {
  'use strict';

  var extensionsFilePromise = new Promise(function (resolve, reject) {
    $.getJSON('extensions/extensions.json', function (result) {
      // Save extensions to model
      window.GCPlayer.model.extensions.updateModel(result.extensions, function (extensions) {
        resolve(extensions);
      });
    });
  });
  extensionsFilePromise.then(function (extensions) {
    // Initialize extensions
    for (var i = 0; i < extensions.length; i++) {
      // TODO Check if extensions are enabled and call for code
      var extension = extensions[i];
      window.GCPlayer.controller.extensions.loadScript(extension.enableEntryPoint);
    }
  });
};

GCPlayerController.prototype.extensions.loadScript = function (scriptRelPath) {
  'use strict';

  var script = document.createElement('script');
  script.type = 'text/javascript';
  script.charset = 'utf-8';
  script.defer = true;
  script.async = true;
  var head = document.getElementsByTagName('head')[0];
  script.src = 'extensions/' + scriptRelPath;
  head.appendChild(script);
};

GCPlayerController.prototype.extensions.loadCss = function (cssRelPath) {
  'use strict';

  var link = document.createElement('link');
  link.rel = 'stylesheet';
  link.type = 'text/css';
  link.href = 'extensions/' + cssRelPath;
  var head = document.getElementsByTagName('head')[0];
  head.appendChild(link);
};

module.exports = GCPlayerController;