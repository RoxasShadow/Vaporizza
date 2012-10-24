/*
 * Copyright (C) 2012 by Giovanni Capuano <webmaster@giovannicapuano.net>
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
  $('#imagesize') .val  (             System.Gadget.Settings.readString('imagesize'));
  $('#order')     .val  (             System.Gadget.Settings.readString('order'));
  $('#nonsteam')  .attr ('checked',   System.Gadget.Settings.readString('nonsteam') != 'false');
}

function saveSettings() {
  System.Gadget.Settings.writeString('imagesize', $('#imagesize').val());
  System.Gadget.Settings.writeString('order',     $('#order').val());
  System.Gadget.Settings.writeString('nonsteam',  $('#nonsteam').is(':checked') ? 'true' : 'false');
}

function update(local) {
  $.getJSON('https://api.github.com/repos/RoxasShadow/Vaporizza/downloads', function(data) {
    var remote = data[0].name.split('- ')[1].replace('.gadget', '');
    if(remote == undefined)
      $('#update').html('Error obtaining update informations.');
    else if(remote == local)
      $('#update').html('No updates available.');
    else
      $('#update').html('<a href="https://github.com/RoxasShadow/Vaporizza/downloads">An update is available (' + remote + ').</a>');
  });
}

function init() {
  System.Gadget.onSettingsClosing = SettingsClosing;
  getSettings();
  update(System.Gadget.version);
}