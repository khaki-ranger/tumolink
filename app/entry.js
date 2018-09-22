'use strict';
import $ from 'jquery';

const overlay = $('.overlay');

$(window).on('load', function(){
  $('header .login').on('click', function() {
    $('.pulldown-menu:not(:animated)', this).slideToggle('fast');
  });
  $('.nav-login').on('click', function() {
    overlay.addClass('visible');
  });
  $('.overlay').on('click', function() {
    overlay.removeClass('visible');
  });
  $('.overlay .panel').on('click', function(event) {
    event.stopPropagation();
  });
  $('.space-list>li').each((i, e) => {
    const availabilityBody = $('.data .availabilities .body', e);
    const availabilities = $('.availability', availabilityBody);
    const btnMore = $('.data .availabilities .btn-more', e);
    if (availabilities.length >= 4) {
      btnMore.addClass('visible');
    }
    btnMore.on('click', function() {
      availabilityBody.toggleClass('all');
      btnMore.toggleClass('fa-chevron-down');
      btnMore.toggleClass('fa-chevron-up');
    });
  });
  $('.comp-space-list>.registration').each((i, e) => {
    $(e).on('click', function() {
      const classList = $(e).attr('class').split(/\s+/);
      const registered = classList[2].split(/-/);
      const add = registered[1] === 'false' ? true : false;
      const args = {
        spaceId: classList[1],
        add: add
      };
      console.log(args);
    });
  });
});
