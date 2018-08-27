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
        const availability = $('.' + args.spaceId + ' .data .availabilities');
        const availabilitiesHeadText = $('.head span', availability);
        let currentCount = availabilitiesHeadText.text();
        currentCount = Number(currentCount);
        currentCount++;
        availabilitiesHeadText.text(currentCount);
        const availabilitiesBody = $('.body', availability);
        availabilitiesBody.append('<li class="availability"><img src="' + result.profileImg + '" class="profile-img"><span>' + result.username + '</span></li>');
        const btnMore = $('.btn-more', availability);
        const availabilities = $('.body .availability', availability);
        if (availabilities.length >= 4) {
          btnMore.addClass('visible');
        }
      });
    });
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
});
