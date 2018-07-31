'use strict';
import $ from 'jquery';

const overlay = $('.overlay');

$(window).on('load', function(){
  $('.nav-login').on('click', function() {
    overlay.addClass('visible');
  });
  $('.overlay').on('click', function() {
    overlay.removeClass('visible');
  });
  $('.overlay .panel').on('click', function(event) {
    event.stopPropagation();
  });
});
