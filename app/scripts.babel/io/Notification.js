'use strict';

class Notification{

  static createNotification(id, options, callback){
    chrome.notifications.create(id, options, callback);
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