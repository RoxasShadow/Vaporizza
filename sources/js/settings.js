/*
 * Copyright (C) 2013 by Giovanni Capuano <webmaster@giovannicapuano.net>
 *
 * Vaporizza is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Vaporizza is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Vaporizza.  If not, see <http://www.gnu.org/licenses/>.
 */
function SettingsClosing(event) {
  if(event.closeAction == event.Action.commit)
    if(!event.cancel)
      saveSettings();
}

function getSettings() {
  $('#imagesize')  .val  (             System.Gadget.Settings.readString('imagesize'));
  $('#nonsteam')   .attr ('checked',   System.Gadget.Settings.readString('nonsteam')     != 'false');
}

function saveSettings() {
  System.Gadget.Settings.writeString('imagesize',   $('#imagesize')  .val());
  System.Gadget.Settings.writeString('nonsteam',    $('#nonsteam')   .is(':checked') ? 'true' : 'false');
}

function update(local) {
  $.ajax({
    type: 'get',
    url: 'https://raw.github.com/RoxasShadow/Vaporizza/master/sources/gadget.xml',
    dataType: 'xml',
    success: function(response) {
      $(response).find('gadget').children().each(function() {
        var remote = $(this).attr('version');
        $('#update').html(remote == local ? 'No updates available.' : '<a href="https://github.com/RoxasShadow/Vaporizza">Updates available (' + remote + ').</a>');
    },
    error: function(xhr, status, error) {
      $('#update').html('Error obtaining update informations.');
    }
  });
}

function init() {
  System.Gadget.onSettingsClosing = SettingsClosing;
  getSettings();
  update(System.Gadget.version);
}
