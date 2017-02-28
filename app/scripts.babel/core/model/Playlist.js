'use strict';

let uuid = require('uuid');
let Logger = require('../../io/Logger');
let DataUtils = require('../../utils/DataUtils');
let LanguageUtils = require('../../utils/LanguageUtils');

/**
 *
 */
class Playlist{

  constructor(name, songs){
    this.currentSongIndex = null;
    // TODO Check if isEmptyObject or isEmptyArray required
    if(LanguageUtils.isEmptyObject(songs)){
      this.songs = [];
    }
    else{
      this.songs = songs;
    }
    this.name = name;
    this.id = uuid();
  }

  getCurrentSongId(){
    if(LanguageUtils.isEmptyObject(this.songs)){
      return null;
    }
    else{
      return this.songs[this.currentSongIndex];
    }
  }

  getCurrentSong(){
    let currentSongId = this.getCurrentSongId();
    if(currentSongId){
      return window.EPlayer.libraryContainer.getSongById(currentSongId);
    }
  }

  firstSong(){
    if(LanguageUtils.isEmptyObject(this.songs)){
      return this.songs[0];
    }
    else{
      return null;
    }
  }

  lastSong(){
    if(LanguageUtils.isEmptyObject(this.songs)){
      return this.songs[this.songs.length-1];
    }
    else{
      return null;
    }
  }

  existsNextSong(){
    return this.currentSongIndex < this.songs.length-1;
  }

  existsPreviousSong(){
    return this.currentSongIndex > 0;
  }

  nextSong(){
    this.currentSongIndex+=1;
  }

  previousSong(){
    this.currentSongIndex-=1;
  }

  randomSong(){
    this.currentSongIndex = DataUtils.getRandomInt(this.songs.length);
  }

  setSong(index){
    if(index>=0 && index<this.songs.length){
      this.currentSongIndex = index;
    }
  }

  start(){
    this.currentSongIndex = 0;
  }

  addSong(songId){
    // Check if song is in libraries
    if(window.EPlayer.libraryContainer.getSongById(songId)){
      // TODO Revise if it is good idea to avoid duplicated songs
      // If song is already in the playlist
      if(DataUtils.queryByExample(this.songs, songId).length>0){
        // TODO send message to user
        Logger.log('Song already added');
      }
      else{
        this.songs.push(songId);
      }
    }
  }

  removeSong(songId){
    DataUtils.removeByExample(this.songs, songId);
    Logger.log('Song '+songId+' removed from '+this.id+' playlist');
  }

  isEmpty(){
    return this.songs.length===0;
  }

  checkPlaylistSongsAvailability(){
    let availableSongs = [];
    for(let i=0;i<this.songs.length;i++){
      if(window.EPlayer.libraryContainer.getSongById(this.songs[i])){
        availableSongs.push(this.songs[i]);
      }
    }
    let songsChanged = this.songs.length !== availableSongs.length;
    this.songs = availableSongs;
    return songsChanged;
  }

  printPlaylist(){
    for(let i=0;i<this.songs.length;i++){
      let song = this.songs[i];
      song.printLibrarySong(this.id, document.getElementById('librarySearchResults'));
    }
    if(LanguageUtils.isFunction(callback)){
      callback();
    }
  }
}

module.exports = Playlist;