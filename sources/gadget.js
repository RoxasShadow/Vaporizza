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
function Gadget(fso, shell) {

  this.getSteamConfig = function(path, file) {
    var folder  = fso.GetFolder(path);
    var sub     = new Enumerator(folder.SubFolders);
    
    if(sub.atEnd())
      return false;
    
    return fso.OpenTextFile(sub.item() + file)
           .ReadAll()
           .replace(/"[\t ]+"/gm, "\" : \"")
           .replace(/"([\t\r\n ]+\{)/g, "\":$1")
           .replace(/([}"])([\t\r\n ]+\")/g, "$1,$2");
  }

  this.findSteamInstallPath = function() {
    try {
      return shell.RegRead('HKLM\\Software\\Wow6432Node\\Valve\\Steam\\InstallPath');
    }
    catch(e) {
      return shell.RegRead('HKLM\\Software\\Valve\\Steam\\InstallPath');
    }
  }

  this.compare = function(a, b) {
    return ((a.lastplayed < b.lastplayed) ? 1 : ((a.lastplayed > b.lastplayed) ? -1 : 0));
  }

  this.printGameList = function(gamelist) {
    var length = gamelist.length;
    $('#gamelist').html('');

    for(var i = 0; i < length; ++i)
      // header.jpg > header_292x136.jpg > capsule_231x87.jpg
      // if you change the image URL, resize body:width in gadget.css
      $('#gamelist').append('<li class="game"><a href="steam://rungameid/' + gamelist[i].id + '"><img src="http://cdn.steampowered.com/v/gfx/apps/' + gamelist[i].id + '/capsule_231x87.jpg" /></a></li>');
    
    if(length > 0) {
      $('body').css('height', (screen.height - 50) + 'px').css('overflow', 'scroll');
    }
    else
      $('#bg').text('Your Steam gamelist is empty');
  }
  
}

function init() {
  try {
    var fso       = new ActiveXObject('Scripting.FileSystemObject');
    var shell     = new ActiveXObject('WScript.Shell');
    var gadget    = new Gadget(fso, shell);
  
    var path      = gadget.findSteamInstallPath() + '\\userdata\\';
    var game_data = gadget.getSteamConfig(path, '\\7\\remote\\sharedconfig.vdf');
    var user_data = gadget.getSteamConfig(path, '\\config\\localconfig.vdf');
    
    var gamelist  = [];
    var username  = '';
    
    if(game_data != false) {
      var games = eval('({' + game_data + '})');
      games     = (games.UserLocalConfigStore || games.UserRoamingConfigStore);
      games     = games.Software.Valve.Steam.apps;
      for(var id in games)
        gamelist.push({
          id          : id,
          name        : '',
          lastplayed  : games[id].lastplayed,
          tags        : games[id].tags
        });
    }
    
    if(user_data != false) {
      var username  = eval('({' + user_data + '})');
      username      = username.UserLocalConfigStore || games.UserRoamingConfigStore;
      username      = username.friends.PersonaName;
    }
    
    var length = gamelist.length;
    $.ajax({
      url:      'http://steamcommunity.com/id/' + username + '/games?tab=all&xml=1',
      type:     'get',
      dataType: 'xml',
      async:    false,
      success:  function(data) {
      
        var allowedGames = [];
        $('game', data).each(function() {
          id    = $('appID', this).text();
          name  = $('name', this).text();
          
          allowedGames.push(id);
          
          $.each(gamelist, function(i, game) {
            if(game.id == id)
              game.name = name;
          });
        });
        
        var filteredGamelist = [];
        $.each(gamelist, function(i, game) {
          if($.inArray(game.id, allowedGames) != -1)
            filteredGamelist.push(game);
        });
        
        filteredGamelist.sort(gadget.compare);
        gadget.printGameList(filteredGamelist);
        
      }
    });
    
  }
  catch(e) {
    $('#bg').text(e.message);
  }
}