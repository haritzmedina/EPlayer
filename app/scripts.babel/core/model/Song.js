'use strict';

var jquery = require('jquery');
var uuid = require('uuid');


class Song{
  constructor(title, artist, album, src){
    this.id = uuid();
    this.title = title;
    this.artist = artist;
    this.album = album;
    this.src = src;
  }

  printLibrarySong(libraryId, container){
    // Display song using librarySongElement template
    var template = document.querySelector('#librarySongElement');
    var content = document.importNode(template.content, true);

    var songDiv = content.querySelector('.librarySongElement');
    songDiv.dataset.libraryId = libraryId;
    songDiv.dataset.songId = this.id;
    //songDiv.dataset.songId = song.folder + '#' + song.filename;
    var artistDiv = content.querySelector('.librarySongElementArtist');
    artistDiv.innerText = this.artist;
    var albumDiv = content.querySelector('.librarySongElementAlbum');
    albumDiv.innerText = this.album;
    var titleDiv = content.querySelector('.librarySongElementTitle');
    titleDiv.innerText = this.title;
    container.appendChild(content);
  }

  retrievePlaySource(callback){
    this.src
  }
}

module.exports = Song;