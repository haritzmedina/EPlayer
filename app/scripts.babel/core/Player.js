'use strict';

const LanguageUtils = require('./../utils/LanguageUtils');
const TimeUtils = require('./../utils/TimeUtils');
const Notification = require('./../io/Notification');
const Logger = require('./../io/Logger');
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

  definePlayerEvents(){
    // Player events
    this.events = {
      songChanged: {
        name: 'songChanged',
        event: ()=>{
          return LanguageUtils.createCustomEvent(
            this.events.songChanged.name, this.playlist.currentSongIndex);
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
      debugger;
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
      // TODO When progress bar is bigger not the whole bar is touchable (Y coord)
      // Get value on progress bar
      console.log(event.target.offsetTop);
      console.log({
        offsets: [event.target.offsetTop, event.target.offsetLeft, event.target.offsetWidth],
        events: [event.pageX, event.pageY]
      });
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
      this.songInfoWrapper.querySelector('#album').innerText = this.playlist.getCurrentSong().album;
      this.songInfoWrapper.querySelector('#artist').innerText = this.playlist.getCurrentSong().artist;
      this.songInfoWrapper.querySelector('#title').innerText = this.playlist.getCurrentSong().title;
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
          this.playlist.firstSong();
        }
      }
      else{
        this.playlist.nextSong();
      }
    }
    // Stop current song
    this.changeStatus(this.status.stopped);
    debugger;
    if(this.playlist.currentSongIndex!==null){
      // Add previous song to the history
      if(this.lastSong!==null){
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
      this.playlist.previousSong();
      // Stop current song
      this.changeStatus(this.status.stopped);
      // Play changed song
      this.play();
    }
  }

  renderPlayerControls(){
    // Check previous button status
    this.previousButton.dataset.activated = this.playlist.existsPreviousSong() || this.sessionPlayingHistory.length>0;
    // Check next button status
    this.nextButton.dataset.activated = this.playlist.existsNextSong() ||
      (this.repeatRandom === 2 && LanguageUtils.isInstanceOf(this.playlist, Playlist));
    // Check playPause button status
    this.playPauseButton.dataset.status = this.currentStatus;
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
    this.repeatRandomButton.dataset.status = this.repeatRandom;
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


}

module.exports = Player;