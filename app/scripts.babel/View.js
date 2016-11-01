'use strict';

/**
 * Created by Haritz Medina on 14/01/2016.
 */

var TimeUtils = require('./utils/TimeUtils');


var GCPlayerView = function GCPlayerView() {};

GCPlayerView.prototype.init = function () {
  'use strict';

  this.player.init();
};

GCPlayerView.prototype.playSong = function (song, url) {
  'use strict';
  // Play song

  this.player.playerInstance.src = url;
  this.player.play();
  // Display song info
  // Display notification
  // Display song info in playerWrapper
  var infoContainer = document.getElementById('playingSongInfo');
  infoContainer.querySelector('#artist').innerText = song.artist;
  infoContainer.querySelector('#title').innerText = song.title;
  infoContainer.querySelector('#album').innerText = song.album;
  this.player.playerInstance.dispatchEvent(window.GCPlayer.controller.songChangeEvent());
};

GCPlayerView.prototype.displayLibrarySearchSongs = function (songs) {
  'use strict';

  console.log('Displaying songs');
  var resultsDiv = document.getElementById('librarySearchResults');
  resultsDiv.innerHTML = ''; // Clean results container
  for (var i = 0; i < songs.length; i++) {
    var song = songs[i];
    this.displayLibrarySongElement(song, resultsDiv);
  }
};

GCPlayerView.prototype.displayLibrarySongElement = function (song, container) {
  'use strict';
  // TODO Display song using librarySongElement template

  var template = document.querySelector('#librarySongElement');
  var content = document.importNode(template.content, true);

  var songDiv = content.querySelector('.librarySongElement');
  songDiv.dataset.songId = song.folder + '#' + song.filename;
  var artistDiv = content.querySelector('.librarySongElementArtist');
  artistDiv.innerText = song.artist;
  var albumDiv = content.querySelector('.librarySongElementAlbum');
  albumDiv.innerText = song.album;
  var titleDiv = content.querySelector('.librarySongElementTitle');
  titleDiv.innerText = song.title;
  container.appendChild(content);
};

//// Player controls

GCPlayerView.prototype.player = {};
GCPlayerView.prototype.player.progressBar = null;
GCPlayerView.prototype.player.playerTimeValue = null;
GCPlayerView.prototype.player.playerTimeMax = null;
GCPlayerView.prototype.player.playerInstance = null;

GCPlayerView.prototype.player.init = function () {
  'use strict';

  this.progressBar = document.getElementById('playerProgressBar');
  this.playerTimeValue = document.getElementById('playerTimeValue');
  this.playerTimeMax = document.getElementById('playerTimeMax');
  this.playerInstance = document.getElementById('player');
};

GCPlayerView.prototype.player.playPause = function () {
  'use strict';

  if (this.playerInstance.paused === true) {
    this.playerInstance.play();
  } else {
    this.playerInstance.pause();
  }
  this.showHidePlayPauseButton();
};

GCPlayerView.prototype.player.play = function () {
  'use strict';

  if (this.playerInstance.paused === true) {
    this.playerInstance.play();
  }
  this.showHidePlayPauseButton();
};

GCPlayerView.prototype.player.pause = function () {
  'use strict';

  if (this.playerInstance.paused === false) {
    this.playerInstance.pause();
  }
  this.showHidePlayPauseButton();
};

GCPlayerView.prototype.player.setCurrentTime = function (seconds) {
  'use strict';

  if (this.playerInstance.duration < seconds && seconds < 0) {
    return null;
  } else {
    this.playerInstance.currentTime = seconds;
  }
};

GCPlayerView.prototype.player.updatePlayingSeconds = function (seconds) {
  'use strict';

  this.progressBar.value = seconds;
  this.playerTimeValue.textContent = TimeUtils.secondsToTimeFormat(seconds);
};

GCPlayerView.prototype.player.setMaxPlayingSeconds = function (seconds) {
  'use strict';

  this.progressBar.max = seconds;
  this.playerTimeMax.textContent = TimeUtils.secondsToTimeFormat(seconds);
};

GCPlayerView.prototype.player.showHidePlayPauseButton = function () {
  'use strict';

  var playButton = document.getElementById('play');
  var pauseButton = document.getElementById('pause');
  if (this.playerInstance.paused === true) {
    playButton.dataset.enabled = true;
    pauseButton.dataset.enabled = false;
  } else {
    playButton.dataset.enabled = false;
    pauseButton.dataset.enabled = true;
  }
};

GCPlayerView.prototype.menu = {};

GCPlayerView.prototype.menu.enableContainer = function (container) {
  'use strict';
  // Disable all the containers

  var containers = document.getElementsByClassName('contentContainer');
  for (var i = 0; i < containers.length; i++) {
    containers[i].dataset.enabled = false;
  }
  // Enable the selected container
  container.dataset.enabled = true;
};

GCPlayerView.prototype.configuration = {};

GCPlayerView.prototype.configuration.displayExtensions = function (extensions) {
  'use strict';

  var template = document.querySelector('#extension');
  var container = document.getElementById('extensions');
  for (var i = 0; i < extensions.length; i++) {
    var extension = extensions[i];
    var content = document.importNode(template.content, true);
    var nameContainer = content.querySelector('.extensionName');
    nameContainer.innerText = extension.name;
    var descriptionContainer = content.querySelector('.extensionDescription');
    descriptionContainer.innerText = extension.description;
    var versionContainer = content.querySelector('.extensionVersion');
    versionContainer.innerText = extension.version;
    var authorContainer = content.querySelector('.extensionAuthor');
    authorContainer.innerText = extension.author;
    var enabledCheckbox = content.querySelector('.extensionEnabled');
    enabledCheckbox.checked = extension.enabled;
    container.appendChild(content);
  }
};

module.exports = GCPlayerView;