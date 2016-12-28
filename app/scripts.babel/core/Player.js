'use strict';

const LanguageUtils = require('./../utils/LanguageUtils');
const TimeUtils = require('./../utils/TimeUtils');
const Playlist = require('./model/Playlist');

/**
 *
 */
class Player{

  constructor(){
    // Possible values: playing, stopped, paused
    this.status = {
      stopped: 'stopped',
      playing: 'playing',
      paused: 'paused'
    };
    this.currentStatus = this.status.stopped;

    // TODO Retrieve preferences from last user session
    this.random = false;

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
      this.randomButton.dataset.activated = this.random;
    });
    this.playButton.addEventListener('click', (event)=>{
      this.play();
    });
    this.pauseButton.addEventListener('click', (event)=>{
      this.pause();
    });
    // Timing elements
    this.playerInstance.addEventListener('timeupdate', (event) => {
      // Update current time element
      this.playerTimeWrapper.textContent =
        TimeUtils.secondsToTimeFormat(this.playerInstance.currentTime, {noDecimal: true});
      // Update progress bar
      this.progressBar.value = this.playerInstance.currentTime;
    });
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
    if(this.playlist.getNextSong()!==null){
      this.playlist.setCurrentNextSong();
      // Stop current song
      this.changeStatus(this.status.stopped);
      // Play changed song
      this.play();
    }
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

  randomSong(){
    this.playlist.setCurrentRandomSong();
    // TODO Check if it is a song
    if(this.playlist.currentSong!==null){
      // Stop current song
      this.changeStatus(this.status.stopped);
      // Play changed song
      this.play();
    }
  }

  toggleRandom(){
    this.random = !this.random;
  }


}

module.exports = Player;