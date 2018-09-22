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
      const registrationIcon = $('.registration i', e);
      const classList = $(e).attr('class').split(/\s+/);
      const registered = classList[2].split(/-/);
      const args = {
        spaceId: classList[1],
        registered: registered[1]
      };
      $.post('/spaces/userspace/update', args, (result) => {
        if (result.action === 'add') {
          $(e).removeClass('registered-false');
          $(e).addClass('registered-true');
          registrationIcon.removeClass('fa-circle'); 
          registrationIcon.addClass('fa-check-circle'); 
        } else {
          $(e).removeClass('registered-true');
          $(e).addClass('registered-false');
          registrationIcon.removeClass('fa-check-circle'); 
          registrationIcon.addClass('fa-circle'); 
        }
      });
    });
  });
});
