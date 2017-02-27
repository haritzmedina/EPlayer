'use strict';

const Playlist = require('./model/Playlist');

/**
 * A container for the playlist defined by user
 * @author Haritz Medina <me@haritzmedina.com>
 */
class PlaylistContainer {

  /**
   * Constructor of the playlist container
   */
  constructor(){
    this.playlists = [];
  }

  addPlaylist(playlist){
    if(typeof playlist!=='Playlist'){
      return null;
    }
    else{
      this.playlists.push(playlist);
    }
  }

  /**
   * Load saved playlists from chrome storage
   */
  init(){
    // TODO Retrieve playlists from chrome storage
  }



}

module.exports = PlaylistContainer;