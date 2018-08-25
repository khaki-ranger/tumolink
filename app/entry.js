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
  $('.tumoli-button').each((i, e) => {
    const button = $(e);
    button.click(() => {
      const args = {
        spaceId: button.data('space-id')
      };
      $.post('/availabilities', args, (result) => {
        let currentCount = $('.' + args.spaceId + ' .data .availabilities .head span').text();
        currentCount = Number(currentCount);
        currentCount++;
        $('.' + args.spaceId + ' .data .availabilities .head span').text(currentCount);
      });
    });
  });
  $('.space-list>li').each((i, e) => {
    const availabilityBody = $('.data .availabilities .body', e);
    const availabilities = $('.availability', availabilityBody);
    const moreBtn = $('.data .availabilities button', e);
    if (availabilities.length >= 3) {
      moreBtn.addClass('visible');
    }
    moreBtn.on('click', function() {
      availabilityBody.toggleClass('all');
    });
  });
});
