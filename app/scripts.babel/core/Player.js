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
    this.random = false;

    this.sessionPlayingHistory = [];

    // Interface elements
    this.playerInstance = document.querySelector('#player');
    this.previousButton = document.querySelector('#previous');
    this.nextButton = document.querySelector('#next');
    this.randomButton = document.querySelector('#random');
    this.playerTimeWrapper = document.querySelector('#playerTimeValue');
    this.playerTimeMax = document.querySelector('#playerTimeMax');
    this.playButton = document.querySelector('#play');
    this.pauseButton = document.querySelector('#pause');
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
            this.events.songChanged.name, this.playlist.currentSong);
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
      this.previousSong();
    });
    this.nextButton.addEventListener('click', (event) => {
      this.nextSong();
    });
    this.randomButton.addEventListener('click', (event) => {
      this.toggleRandom();
    });
    this.playButton.addEventListener('click', (event)=>{
      this.play();
    });
    this.pauseButton.addEventListener('click', (event)=>{
      this.pause();
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
      this.songInfoWrapper.querySelector('#album').innerText = this.playlist.currentSong.album;
      this.songInfoWrapper.querySelector('#artist').innerText = this.playlist.currentSong.artist;
      this.songInfoWrapper.querySelector('#title').innerText = this.playlist.currentSong.title;
    });

    // Player status events

    this.playerInstance.addEventListener(this.events.songChanged.name, (event)=>{
      // Add changed song to the history
      this.sessionPlayingHistory.push(event.detail.data);

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
    this.playlist.start();
  }

  play(){
    if(LanguageUtils.isInstanceOf(this.playlist, Playlist)){
      if(this.currentStatus===this.status.stopped){
        // Change to playing status
        this.changeStatus(this.status.playing);
        // Load song source
        this.loadCurrentSongSource(()=>{
          //Start player
          this.playerInstance.play();
        });
      }
      if(this.currentStatus===this.status.paused){
        this.changeStatus(this.status.playing);
        // TODO Check if src is set
        this.playerInstance.play();
      }
    }
    this.playButton.dataset.activated = false;
    this.pauseButton.dataset.activated = true;
  }

  loadCurrentSongSource(callback){
    this.playlist.currentSong.retrievePlayableSource((source)=> {
      // Set source
      this.playerInstance.src = source;
      // Dispatch song changed event
      this.playerInstance.dispatchEvent(this.events.songChanged.event());
      if(LanguageUtils.isFunction(callback)){
        callback();
      }
    });
  }

  pause(){
    if(this.currentStatus===this.status.playing){
      this.playerInstance.pause();
      this.currentStatus = this.status.paused;
    }
    this.playButton.dataset.activated = true;
    this.pauseButton.dataset.activated = false;
  }

  changeStatus(status){
    // TODO event for changed status
    this.currentStatus = status;
  }

  nextSong(){
    if(this.random){
      this.playlist.setCurrentRandomSong();
    }
    else{
      if(this.playlist.getNextSong()!==null) {
        this.playlist.setCurrentNextSong();
      }
      // TODO If there is not next song?
    }
    // Stop current song
    this.changeStatus(this.status.stopped);
    // Play changed song
    this.play();
  }

  previousSong(){
    if(this.playlist.getPreviousSong()!==null){
      this.playlist.setCurrentPreviousSong();
      // Stop current song
      this.changeStatus(this.status.stopped);
      // Play changed song
      this.play();
    }
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

  toggleRandom(){
    this.random = !this.random;
    this.randomButton.dataset.activated = this.random;
  }


}

module.exports = Player;