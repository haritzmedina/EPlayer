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

  getCurrentSong(){
    if(LanguageUtils.isEmptyObject(this.songs)){
      return null;
    }
    else{
      return this.songs[this.currentSongIndex];
    }
  }

  firstSong(){
    if(LanguageUtils.isEmptyObject(songs)){
      return this.songs[0];
    }
    else{
      return null;
    }
  }

  lastSong(){
    if(LanguageUtils.isEmptyObject(songs)){
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

  addSong(song){
    // TODO Revise if it is good idea to avoid duplicated songs
    // If song is already in the playlist
    if(DataUtils.queryByExample(this.songs, {id: song.id}).length>0){
      // TODO send message to user
      Logger.log('Song already added');
    }
    else{
      this.songs.push(song);
    }
  }

  removeSong(song){
    DataUtils.removeByExample(this.songs, {id: song.id});
    Logger.log('Song '+song.id +' removed from '+this.id+' playlist');
  }

  isEmpty(){
    return this.songs.length===0;
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