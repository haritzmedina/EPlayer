'use strict';

const LanguageUtils = require('./../utils/LanguageUtils');

class Menu{

  constructor(){
    this.menuWrapper = document.querySelector('#menu');
    this.currentActivatedMenuItem = document.querySelector('#librarySelector');
  }

  init(callback){
    this.initializeMenuButtons();
    if(LanguageUtils.isFunction(callback)){
      callback();
    }
  }

  initializeMenuButtons(){
    let menuItems = this.menuWrapper.querySelectorAll('.menuSelector');
    menuItems.forEach((menuItem)=>{
      menuItem.addEventListener('click', ()=>{
        debugger;
        if(this.currentActivatedMenuItem){
          let containerToHide = document.getElementById(this.currentActivatedMenuItem.dataset.associatedContainer);
          containerToHide.dataset.enabled = false;
        }
        let containerToShow = document.getElementById(menuItem.dataset.associatedContainer);
        containerToShow.dataset.enabled = true;
        this.currentActivatedMenuItem = menuItem;
      });
    });
  }

}

module.exports = Menu;