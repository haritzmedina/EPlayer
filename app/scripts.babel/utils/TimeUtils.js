class TimeUtils{

  static secondsToTimeFormat(seconds){
    var time = '';
    var hours = Math.floor(seconds / 3600);
    if (hours > 0) {
      time += hours + ':';
    }
    seconds = seconds % 3600;
    var minutes = Math.floor(seconds / 60);
    var secs = seconds % 60;
    secs = secs >= 10 ? secs : '0' + secs;
    if (minutes < 10) {
      time += '0' + minutes + ':' + secs;
    } else {
      time += minutes + ':' + secs;
    }
    return time;
  }

}

module.exports = TimeUtils;