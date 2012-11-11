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
function CheckDockState() {
  var height        = (screen.height - 50) / 2;
  var scaleDocked   = 1;
  var scaleUndocked = 2;

  $('body').css('height', height * (System.Gadget.docked ? scaleDocked : scaleUndocked));
}

function SettingsClosed(event) {
  if(event.closeAction == event.Action.commit)
    init();
}

function init() {
  try {
    var fso       = new ActiveXObject('Scripting.FileSystemObject');
    var shell     = new ActiveXObject('WScript.Shell');
    var steam     = new Steam(fso, shell);

    var path      = steam.getInstallationPath();
    var userdata  = path + '\\userdata';

    var gameData  = steam.getConfig(userdata, '\\7\\remote\\sharedconfig.vdf');
    var userID    = steam.getUserID(path,     '\\userid.txt');

    var gamelist  = [];
    var gamelist2 = [];
    var imagesize = steam.getSettings('imagesize');
    var nonsteam  = steam.getSettings('nonsteam')    != 'false' ? true : false;

    steam.loadSteamGames(gamelist, userID);

    if(nonsteam) {
      var shortcuts = steam.getFile(path + '\\shortcuts.xml');
      if(shortcuts != '')
        steam.loadNonSteamGames(gamelist2, shortcuts);
    }

    if(gamelist.length == 0) {
      $('body') .css('height', '500px')
      $('#bg')  .text('Your Steam gamelist is empty.');
    }
    else {
      $('body') .css('height', (screen.height - 50) + 'px');
      $('#gamelist').text('');
      var games = gamelist.concat(gamelist2);
      games.sort(steam.compare);
      steam.printGameList(games, imagesize);
    }

  }
  catch(e) {
    $('#bg').text(e.message);
  }
}