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
 /*
 * Javascript Diff Algorithm
 *  By John Resig (http://ejohn.org/)
 *  Modified by Chu Alan "sprite"
 *
 * Released under the MIT license.
 *
 * More Info:
 *  http://ejohn.org/projects/javascript-diff-algorithm/
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
  $.get('https://raw.github.com/RoxasShadow/Vaporizza/master/sources/gadget.xml', function(response) {
    var remote = response.match('<version>(.*)</version>')[1].replace(',', '.');
    
    $('#update').html(local == remote ? 'No updates available.' : '<a href="https://github.com/RoxasShadow/Vaporizza">Updates available (' + remote + ').</a>');
  });
}

function init() {
  System.Gadget.onSettingsClosing = SettingsClosing;
  getSettings();
  update(System.Gadget.version);
}