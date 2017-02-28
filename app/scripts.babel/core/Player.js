'use strict';

const LanguageUtils = require('./../utils/LanguageUtils');
const TimeUtils = require('./../utils/TimeUtils');
const Notification = require('./../io/Notification');
const Logger = require('./../io/Logger');
const LocalStorage = require('./../io/LocalStorage');
const StorageNamespaces = require('./../io/StorageNamespaces');
const Playlist = require('./model/Playlist');

/**
 *
 */
class Player{

  constructor(){
    this.definePlayerEvents();

    // Possible values: playing, stopped, paused
    this.status = {
      stopped: 'stopped',
      playing: 'playing',
      paused: 'paused'
    };
    this.currentStatus = this.status.stopped;

    // TODO Retrieve preferences from last user session
    this.repeatRandom = 0; // 0 no-repeat, 1 repeat, 2 shuffle

    this.sessionPlayingHistory = [];
    this.lastSong = null;

    // Interface elements
    this.playerInstance = document.querySelector('#player');
    this.previousButton = document.querySelector('#previous');
    this.nextButton = document.querySelector('#next');
    this.repeatRandomButton = document.querySelector('#repeatRandom');
    this.playerTimeWrapper = document.querySelector('#playerTimeValue');
    this.playerTimeMax = document.querySelector('#playerTimeMax');
    this.playPauseButton = document.querySelector('#playPause');
    this.progressBar = document.querySelector('#playerProgressBar');
    this.songInfoWrapper = document.querySelector('#playingSongInfo');
  }

  init(){
    // Load configuration of player options from storage
    LocalStorage.init();
    LocalStorage.getData(StorageNamespaces.player, (error, result)=> {
      if(result){
        // Load current status
        this.currentStatus = result.currentStatus;
        // Load repeat random config
        this.repeatRandom = result.repeatRandom;

        // Load playlist as an instance of playlist
        this.playlist = LanguageUtils.fillObject(new Playlist(), result.playlist);
        let playlistChanged = this.playlist.checkPlaylistSongsAvailability();
        // Playlist is not available in the same way as it was saved
        if(playlistChanged){
          // If there is not any available song, remove the playlist
          if(this.playlist.isEmpty()){
            this.playlist = null;
          }
          this.changeStatus(this.status.stopped);
          // Clean history reproduced in the last session
          this.sessionPlayingHistory = [];
          this.lastSong = null;
        }
        else{
          // Load session played history
          this.sessionPlayingHistory = result.sessionPlayingHistory;
          // Load last song
          this.lastSong = result.lastSong;
          // Load playing song source in last session
          if(this.currentStatus===this.status.paused){
            this.loadCurrentSongSource(()=>{});
          }
        }
        // Render playlist interface
        this.renderPlayerControls();
        this.renderPlayerMetadata();
      }
    });
    this.initPanelHandlers();
  }

  onClose(callback){
    if(this.currentStatus===this.status.playing){
      this.currentStatus = this.status.paused;
    }
    this.updateLocalStorage(callback);
  }

  updateLocalStorage(callback){
    LocalStorage.setData(StorageNamespaces.player, this, ()=>{
      if(LanguageUtils.isFunction(callback)){
        callback();
      }
    });
  }

  definePlayerEvents(){
    // Player events
    this.events = {
      songChanged: {
        name: 'songChanged',
        event: ()=>{
          return LanguageUtils.createCustomEvent(
            this.events.songChanged.name, this.playlist.getCurrentSongId());
        }
      },
      playing: {name: 'playing'},
      paused: {name: 'paused'},
      stopped: {name: 'stopped'}
    };
  }

  initPanelHandlers() {
    // Panel buttons
    this.previousButton.addEventListener('click', (event) => {
      if(this.previousButton.dataset.activated){
        this.previousSong();
      }
    });
    this.nextButton.addEventListener('click', (event) => {
      if(this.previousButton.dataset.activated){
        this.nextSong();
      }
    });
    this.repeatRandomButton.addEventListener('click', (event) => {
      this.toggleRepeatRandom();
    });
    this.playPauseButton.addEventListener('click', (event)=>{
      if(this.currentStatus===this.status.playing){
        this.pause();
      }
      else if(this.currentStatus===this.status.paused){
        this.play();
      }
    });
    // Progressbar click event
    this.progressBar.addEventListener('click', (event)=>{
      // Get value on progress bar
      let x = event.pageX - event.target.offsetLeft,
        y = event.pageY - event.target.offsetTop,
        clickedValue = x * event.target.max / event.target.offsetWidth;
      // Move the playing song
      this.setPlayerSecond(clickedValue);
    });

    // Audio player events

    // Song is finished event
    this.playerInstance.addEventListener('ended', (event)=>{
      this.nextSong();
      this.renderPlayerControls();
    });
    // Timing elements
    this.playerInstance.addEventListener('timeupdate', (event) => {
      // Update current time element
      this.playerTimeWrapper.textContent =
        TimeUtils.secondsToTimeFormat(this.playerInstance.currentTime, {noDecimal: true});
      // Update progress bar
      this.progressBar.value = this.playerInstance.currentTime;
    });


    // Player status events

    // Set max progress bar value when song loaded
    this.playerInstance.addEventListener('loadedmetadata', () => {
      // Set max time
      this.playerTimeMax.textContent =
        TimeUtils.secondsToTimeFormat(this.playerInstance.duration, {noDecimal: true});
      // Set progressbar max time
      this.progressBar.max = Math.floor(this.playerInstance.duration);
      // Set song metadata
      this.renderPlayerMetadata();
      // Render player controls
      this.renderPlayerControls();
    });

    // Player status events

    this.playerInstance.addEventListener(this.events.songChanged.name, (event)=>{
      // TODO Check user settings to display or not the notification
      /*Notification.createTextNotification(
       Notification.predefinedId.songInfo,
       'Now playing...',
       event.detail.data.title
       );*/
    }, false);
  }

  setPlaylist(playlist){
    // Stop player
    this.changeStatus('stopped');
    this.playerInstance.pause();
    this.playlist = playlist;
  }

  play(){
    if(LanguageUtils.isInstanceOf(this.playlist, Playlist)){
      if(this.playlist.currentSong!==null){
        if(this.currentStatus===this.status.stopped){
          // Change to playing status
          this.changeStatus(this.status.playing);
          // Load song source
          this.loadCurrentSongSource(()=>{
            //Start player
            this.playerInstance.play();
          });
        }
        else if(this.currentStatus===this.status.paused){
          this.changeStatus(this.status.playing);
          // TODO Check if src is set
          this.playerInstance.play();
        }
      }
    }
  }

  loadCurrentSongSource(callback){
    let currentSong = this.playlist.getCurrentSong();
    if(currentSong===null){
      this.changeStatus(this.status.stopped);
    }
    else{
      currentSong.retrievePlayableSource((source)=> {
        // Set source
        this.playerInstance.src = source;
        // Dispatch song changed event
        this.playerInstance.dispatchEvent(this.events.songChanged.event());
        if(LanguageUtils.isFunction(callback)){
          callback();
        }
      });
    }
  }

  stop(){
    this.playlist = null;
    this.playerInstance.src = null;
    this.playerInstance.pause();
    this.sessionPlayingHistory = [];
    this.lastSong = null;
    this.changeStatus(this.status.stopped);
  }

  pause(){
    if(this.currentStatus===this.status.playing){
      this.playerInstance.pause();
      this.changeStatus(this.status.paused);
    }
  }

  changeStatus(status){
    // TODO event for changed status
    if(status in this.status){
      this.currentStatus = status;
      this.playPauseButton.dataset.status = status;
    }
  }

  nextSong(){
    if(this.repeatRandom===2){
      this.playlist.randomSong();
    }
    else{
      if(this.repeatRandom===1){
        if(this.playlist.existsNextSong()){
          this.playlist.nextSong();
        }
        else{
          this.playlist.setSong(0);
        }
      }
      else{
        this.playlist.nextSong();
      }
    }
    // Stop current song
    this.changeStatus(this.status.stopped);
    if(this.playlist.currentSongIndex!==null){
      // Add previous song to the history
      if(this.lastSong!==null){
        // If history is larger than 100, remove the oldest one
        if(this.sessionPlayingHistory.length>100){
          this.sessionPlayingHistory.shift();
        }
        this.sessionPlayingHistory.push(this.lastSong);
      }
      this.lastSong = this.playlist.currentSongIndex;
      // Play changed song
      this.play();
    }
  }

  previousSong(){
    if(this.sessionPlayingHistory.length>0){
      this.playlist.setSong(this.sessionPlayingHistory.pop());
      // Stop current song
      this.changeStatus(this.status.stopped);
      // Play changed song
      this.play();
    }
    else if(this.playlist.existsPreviousSong()){
      this.playlist.setSong(this.playlist.songs.length-1);
      // Stop current song
      this.changeStatus(this.status.stopped);
      // Play changed song
      this.play();
    }
  }

  renderPlayerControls(){
    // Check previous button status
    this.previousButton.dataset.activated = !!this.playlist && (this.playlist.existsPreviousSong() || this.sessionPlayingHistory.length>0);
    // Check next button status
    this.nextButton.dataset.activated = !!this.playlist && (this.playlist.existsNextSong() ||
      (this.repeatRandom !== 0 && LanguageUtils.isInstanceOf(this.playlist, Playlist)));
    // Check playPause button status
    this.playPauseButton.dataset.status = this.currentStatus;
    // Check random/repeat button status
    this.repeatRandomButton.dataset.status = this.repeatRandom;
  }

  moveForward(seconds){

  }

  moveBackward(seconds){

  }

  setPlayerSecond(second){
    Logger.log('Set to second '+second);
    if(this.playerInstance.duration>second && second>=0){
      this.playerInstance.currentTime = second;
    }
  }

  randomSong(){
    this.playlist.setCurrentRandomSong();
    // Check if it is a song
    if(this.playlist.currentSong!==null){
      // Stop current song
      this.changeStatus(this.status.stopped);
      // Play changed song
      this.play();
    }
  }

  toggleRepeatRandom(){
    if(this.repeatRandom===2){
      this.repeatRandom = 0;
    }
    else{
      this.repeatRandom+=1;
    }
    this.renderPlayerControls();
  }

  addSong(song){
    this.playlist.addSong(song);
    this.renderPlayerControls();
  }

  changeCurrentPlaylist(playlist){
    this.stop();
    this.playlist = playlist;
    this.playlist.start();
    this.lastSong = playlist.currentSongIndex;
    this.play();
    this.renderPlayerControls();
  }

  renderPlayerMetadata() {
    if(this.playlist){
      let currentSong = this.playlist.getCurrentSong();
      if(currentSong){
        this.songInfoWrapper.querySelector('#album').innerText = currentSong.album;
        this.songInfoWrapper.querySelector('#artist').innerText = currentSong.artist;
        this.songInfoWrapper.querySelector('#title').innerText = currentSong.title;
      }
    }
  }
}

module.exports = Player;