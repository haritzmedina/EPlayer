'use strict';

var uuid = require('uuid');
var Logger = require('../../io/Logger');
var LanguageUtils = require('../../utils/LanguageUtils');

/**
 * Library interface. A library is a song list source.
 * @author Haritz Medina <me@haritzmedina.com>
 */
class Library{

  constructor(source){
    this.source = source;
    this.songs = [];
    this.id = uuid();
  }

  /**
   *
   * @returns {Array} Song list array
   */
  retrieveSongs(){
    let songs = [];
    return songs;
  }

  loadLibrary(callback){
    Logger.log('Loading library '+this.getId());
    callback();
  }

  /**
   * Returns if the library is syncable in multiple devices (only for cloud based libraries)
   * @returns {boolean}
   */
  isSyncable(){
    return false;
  }

  printLibrary(callback){
    Logger.log('Printing library');
    for(let i=0;i<this.songs.length;i++){
      let song = this.songs[i];
      song.printLibrarySong(this.id, document.getElementById('librarySearchResults'));
    }
    if(LanguageUtils.isFunction(callback)){
      callback();
    }
  }

  getId(){
    return this.id;
  }

}

module.exports = Library;