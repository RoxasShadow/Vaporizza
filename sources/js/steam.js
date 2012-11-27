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
function run(path) {
  var ary                 = unescape(path).split('\\');
  var length              = ary.length - 1;
  var directory           = '';
  
  for(var i = 0; i < length; ++i)
    directory += ary[i] + '\\';
    
  var shell               = new ActiveXObject('WScript.Shell');
  shell.CurrentDirectory  = directory;
  shell.run(ary[length]);
}

function Steam(fso, shell) {
  var steam = this;

  this.compare = function(a, b) {
    return ((a.name > b.name) ? 1 : ((a.name < b.name) ? -1 : 0));
  }

  this.getConfig = function(path, file) {
    var folder  = fso.GetFolder(path);
    var sub     = new Enumerator(folder.SubFolders);

    if(sub.atEnd())
      return false;

    var f       = fso.OpenTextFile(sub.item() + file, 1);
    var file    = f.ReadAll();
    f.Close();

    return file.replace(/"[\t ]+"/gm, "\" : \"")
               .replace(/"([\t\r\n ]+\{)/g, "\":$1")
               .replace(/([}"])([\t\r\n ]+\")/g, "$1,$2");
  }

  this.getFile = function(path) {
    var f     = fso.OpenTextFile(path, 1);
    var file  = f.ReadAll();
    f.Close();

    return file;
  }

  this.getImageBySteam = function(game, image, customcover) {
    $.ajax({
      url       : 'http://store.steampowered.com/search/?snr=1_4_4__12&term=+' + encodeURIComponent(game.name) + '&category1=998',
      type      : 'get',
      dataType  : 'html',
      async     : false,
      success   : function(data) {
        var appID   = $(data).find('.search_result_row').attr('href');
        var onclick = game.id == '' ? 'onclick="run(\'' + escape(game.exe.replace(/\\/g, '\\\\')) + '\');"' : 'href="steam://rungameid/' + game.id + '"';
        
        if(appID != undefined)
          appID = appID.split('/app/')[1].split('/')[0];

        if(appID != undefined)
          $('#gamelist').append('<li class="game"         ><a ' + onclick + '><img alt="' + game.name + '" src="http://cdn.steampowered.com/v/gfx/apps/' + appID + '/' + image + '" /></a></li>');
        else
          $('#gamelist').append('<li class="game nocover" ><a ' + onclick + '><img alt="' + game.name + '" src="http://www.giovannicapuano.net/vaporizza/header.php?get=' + image + '&text=' + game.name +'" /></a></li>');
      }
    });
  }

  this.getInstallationPath = function() {
    try {
      return shell.RegRead('HKLM\\Software\\Wow6432Node\\Valve\\Steam\\InstallPath');
    }
    catch(e) {
      return shell.RegRead('HKLM\\Software\\Valve\\Steam\\InstallPath');
    }
  }

  this.getSettings = function(what) {
    if(what == 'imagesize') {
      var imagesize = System.Gadget.Settings.readString('imagesize');
      return (imagesize == '' || (imagesize != 'small' && imagesize != 'medium' && imagesize != 'large')) ? 'small' : imagesize;
    }
    else
      return System.Gadget.Settings.readString(what);
  }

  this.getUserID = function(path, file) {
    return fso.OpenTextFile(path + file).ReadAll();
  }
  
  this.loadSteamGames = function(gamelist, userid) {
    $.ajax({
      url       : 'http://steamcommunity.com/id/' + userid + '/games?tab=all',
      type      : 'get',
      dataType  : 'text',
      async     : false,
      success   : function(data) {
        json = eval(data.match(/^var rgGames = (.*);$/gm).toString().replace('var rgGames = ', '').replace(';', '').replace(/\\\//gi, '/'));
        for(var i = 0, length = json.length; i < length; ++i)
          gamelist.push({
            appid     : json[i].appid,
            name      : json[i].name/*,
            hours     : json[i].hours_forever,
            installed : json[i].client_summary.state == 'installed',
            size      : json[i].client_summary.localContentSize*/
          });
      }
    });
  }

  this.loadNonSteamGames = function(gamelist, shortcuts) {
    shortcuts = $.parseXML(shortcuts);
    $('game', shortcuts).each(function() {
      gamelist.push({
        name  : $('name', this).text(),
        exe   : $('exe',  this).text(),
        dir   : $('dir',  this).text(),
        id    : $('id',   this).text()
      });
    });
  }

  this.printGameList = function(games, imagesize, customcover) {
    var image;
    if(imagesize == 'small')
      image = 'capsule_231x87.jpg';
    else if(imagesize == 'medium')
      image = 'header_292x136.jpg';
    else
      image = 'header.jpg';

    if(imagesize == 'small') {
      $('body')     .css('width', '251px');
      $('.noimage') .css('width', '231px');
      $('.noimage') .css('height', '87px');
      $('.noimage') .css('line-height', '44.5px');
    }
    else if(imagesize == 'medium') {
      $('body')     .css('width', '312px');
      $('.noimage') .css('width', '292px');
      $('.noimage') .css('height', '136px');
      $('.noimage') .css('line-height', '68px');
    }
    else {
      $('body')     .css('width', '480px');
      $('.noimage') .css('width', '460px');
      $('.noimage') .css('height', '215px');
      $('.noimage') .css('line-height', '107.5px');
    }
    
    for(var i = 0, length = games.length; i < length; ++i) {
      if(games[i] == undefined)
        continue;
        
      if(games[i].appid != undefined)
        $('#gamelist').append('<li class="game"><a href="steam://rungameid/' + games[i].appid + '"><img alt="' + games[i].name + '" src="http://cdn.steampowered.com/v/gfx/apps/' + games[i].appid + '/' + image + '" /></a></li>');
      else
        steam.getImageBySteam(games[i], image);
    }
  }
}