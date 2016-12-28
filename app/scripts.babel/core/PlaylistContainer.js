'use strict';

var Playlist = require('./model/Playlist');

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
    this.currentPlaylist = new Playlist([]);
  }

  addPlaylist(playlist){
    if(typeof playlist!=='Playlist'){
      return null;
    }
    else{
      this.playlists.push(playlist);
    }
  }

  changeCurrentPlaylist(playlist, isPlayable){
    this.currentPlaylist = playlist;
    if(isPlayable){
      window.GCPlayer.player.setPlaylist(this.currentPlaylist);
      window.GCPlayer.player.play();
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