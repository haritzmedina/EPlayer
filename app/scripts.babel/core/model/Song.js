'use strict';

const jquery = require('jquery');
const uuid = require('uuid');
const Playlist = require('./Playlist');
const Logger = require('./../../io/Logger');
const LanguageUtils = require('./../../utils/LanguageUtils');


class Song{
  constructor(id, title, artist, album, src){
    this.id = id;
    this.title = LanguageUtils.valueOrEmpty(title, LanguageUtils.isString(title));
    this.artist = LanguageUtils.valueOrEmpty(artist, LanguageUtils.isString(artist));
    this.album = LanguageUtils.valueOrEmpty(album, LanguageUtils.isString(album));
    this.src = src;
  }

  printLibrarySong(container){
    // Display song using librarySongElement template
    let template = document.querySelector('#librarySongElement');
    let content = document.importNode(template.content, true);
    let songDiv = content.querySelector('.librarySongElement');
    songDiv.dataset.songId = this.id;
    let artistDiv = content.querySelector('.librarySongElementArtist');
    artistDiv.innerText = this.artist;
    let albumDiv = content.querySelector('.librarySongElementAlbum');
    albumDiv.innerText = this.album;
    let titleDiv = content.querySelector('.librarySongElementTitle');
    titleDiv.innerText = this.title;
    let playButton = content.querySelector('.librarySongPlayButton');
    playButton.addEventListener('click', (event)=>{
      window.EPlayer.playlistContainer.changeCurrentPlaylist(new Playlist('temp', [this]), true);
    });
    let addPlaylistButton = content.querySelector('.librarySongAddPlaylist');
    addPlaylistButton.addEventListener('click', (event)=>{
      window.EPlayer.playlistContainer.currentPlaylist.addSong(this);
    });
    container.appendChild(content);
  }

  retrievePlayableSource(callback){
    this.src.retrievePlayableSource(callback);
  }
}

module.exports = Song;