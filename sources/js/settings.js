/*
 * Copyright (C) 2012 by Giovanni Capuano <webmaster@giovannicapuano.net>

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
function settingsClosing(event) {
  if(event.closeAction == event.Action.commit)     
    if(!event.cancel)
      saveSettings();
}

function saveSettings() {
  System.Gadget.Settings.writeString('imagesize', $('#imagesize').val());
}

function getSettings() {
  $('#imagesize') .val(System.Gadget.Settings.readString('imagesize'));
}

function init() {
	System.Gadget.onSettingsClosing = settingsClosing;
  getSettings();
}