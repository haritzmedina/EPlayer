'use strict';

const LanguageUtils = require('../utils/LanguageUtils');

class Notification{

  static createNotification(id, options, callback){
    if(LanguageUtils.isFunction(callback)){
      callback();
    }
  }

  static createTextNotification(id, title, message){
    Notification.createNotification(id, {
      type: 'basic',
      title: title,
      message: message,
      iconUrl: 'icon.png'
    });
  }
}

Notification.predefinedId = {
  songInfo: 'songInfo',
  playingBehaviour: 'playing',
  settings: 'settings',
  extension: 'extensions',
  other: 'other'
};

module.exports = Notification;