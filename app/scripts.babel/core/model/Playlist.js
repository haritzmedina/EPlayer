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
    this.currentSong = {};
    // TODO Check if isEmptyObject or isEmptyArray required
    if(LanguageUtils.isEmptyObject(songs)){
      this.songs = [];
    }
    else{
      this.songs = songs;
    }
    this.name = name;
    this.repeat = true;
    this.id = uuid();
    this.shuffle = false;
    this.playingSongs = [];
  }

  start(){
    if(this.songs.length===0){
      this.currentSong = null;
    }
    else{
      if(this.shuffle){
        // Randomize playlist
        this.playingSongs = DataUtils.shuffle(this.songs);
      }
      else{
        // Ordered songs
        this.playingSongs = this.songs.slice();
      }
      // Set current song
      this.currentSong = this.playingSongs[0];
    }
  }

  activateShuffle(){
    this.shuffle = true;
  }

  deactivateShuffle(){
    this.shuffle = false;
  }

  getNextSong(){
    if(this.playingSongs.length-1 <= this.getCurrentSongIndex()){
      if(this.repeat){
        return this.playingSongs[0];
      }
      else{
        return null;
      }
    }
    else{
      return this.playingSongs[this.getCurrentSongIndex()+1];
    }
  }

  setCurrentNextSong(){
    this.currentSong = this.getNextSong();
  }

  setCurrentPreviousSong(){
    this.currentSong = this.getPreviousSong();
  }

  setCurrentRandomSong(){
    this.currentSong = DataUtils.getRandomElement(this.playingSongs);
  }

  getCurrentSongIndex(){
    return DataUtils.queryIndexByExample(this.playingSongs, {id: this.currentSong.id});
  }

  getPreviousSong(){
    if(this.getCurrentSongIndex()===0){
      if(this.repeat){
        return this.playingSongs[this.playingSongs.length-1];
      }
      else{
        return null;
      }
    }
    else{
      return this.playingSongs[this.getCurrentSongIndex()-1];
    }
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
      this.playingSongs.push(song);

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