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
function Steam(fso, shell) {
	var steam = this;

	this.getConfig = function(path, file) {
		var folder = fso.GetFolder(path);
		var sub = new Enumerator(folder.SubFolders);

		if (sub.atEnd())
			return false;

		return fso.OpenTextFile(sub.item() + file).ReadAll().replace(/"[\t ]+"/gm, "\" : \"").replace(/"([\t\r\n ]+\{)/g, "\":$1").replace(/([}"])([\t\r\n ]+\")/g, "$1,$2");
	}

	this.loadGames = function(gamelist, gameData, userData) {
		var games, username;

		if (gameData != false) {
			games = eval('({' + gameData + '})');
			games = (games.UserLocalConfigStore || games.UserRoamingConfigStore);
			games = games.Software.Valve.Steam.apps;
			for (var id in games)
			gamelist.push({
				id : id,
				name : '',
				lastplayed : games[id].lastplayed,
				tags : games[id].tags
			});
		}

		if (userData != false) {
			username = eval('({' + userData + '})');
			username = username.UserLocalConfigStore || games.UserRoamingConfigStore;
			username = username.friends.PersonaName;
		}

		return username;
	}

	this.convalidateGames = function(gamelist, username, imagesize) {
		var filteredGamelist = [];

		$.ajax({
			url : 'http://steamcommunity.com/id/' + username + '/games?tab=all&xml=1',
			type : 'get',
			dataType : 'xml',
			async : false,
			success : function(data) {

				var allowedGames = [];
				$('game', data).each(function() {
					id = $('appID', this).text();
					name = $('name', this).text();

					allowedGames.push(id);

					$.each(gamelist, function(i, game) {
						if (game.id == id)
							game.name = name;
					});
				});

				$.each(gamelist, function(i, game) {
					if ($.inArray(game.id, allowedGames) != -1)
						filteredGamelist.push(game);
				});

			}
		});

		filteredGamelist.sort(steam.compare);
		return filteredGamelist;
	}

	this.getInstallationPath = function() {
		try {
			return shell.RegRead('HKLM\\Software\\Wow6432Node\\Valve\\Steam\\InstallPath');
		} catch(e) {
			return shell.RegRead('HKLM\\Software\\Valve\\Steam\\InstallPath');
		}
	}

	this.compare = function(a, b) {
		return ((a.lastplayed < b.lastplayed) ? 1 : ((a.lastplayed > b.lastplayed) ? -1 : 0));
	}

	this.printGameList = function(gamelist, imagesize) {
		var length = gamelist.length;
		$('#gamelist').text('');

		var image;
		if (imagesize == 'small') {
			image = 'capsule_231x87.jpg';
			$('body').css('width', '251px');
		} else if (imagesize == 'medium') {
			image = 'header_292x136.jpg';
			$('body').css('width', '312px');
		} else {
			image = 'header.jpg';
			$('body').css('width', '480px');
		}

		for (var i = 0; i < length; ++i)
			$('#gamelist').append('<li class="game"><a href="steam://rungameid/' + gamelist[i].id + '"><img src="http://cdn.steampowered.com/v/gfx/apps/' + gamelist[i].id + '/' + image + '" /></a></li>');

		if (length > 0)
			$('body').css('height', (screen.height - 50) + 'px').css('overflow', 'auto');
		else
			$('#bg').text('Your Steam gamelist is empty');
	}
  
  this.getSettings = function(what) {
    if(what == 'imagesize') {
      var imagesize = System.Gadget.Settings.readString('imagesize');
      if(imagesize == '' || (imagesize != 'small' && imagesize != 'medium' && imagesize != 'large'))
        return 'small';
      else
        return imagesize;
    }
    else
      return System.Gadget.Settings.readString(what);
  }
  
}

function CheckDockState() {
  var height         = (screen.height - 50) / 2;
  var scaleDocked    = 1;
  var scaleUndocked  = 2;
  var timeTransition = 2;
  var oBody          = document.body.style;
  
  if (System.Gadget.docked)
      $('body').css('height', height * scaleDocked);
  else
      $('body').css('height', height * scaleUndocked);
}

function init() {
	try {
		var fso   = new ActiveXObject('Scripting.FileSystemObject');
		var shell = new ActiveXObject('WScript.Shell');
		var steam = new Steam(fso, shell);

		var path     = steam.getInstallationPath() + '\\userdata\\';
		var gameData = steam.getConfig(path, '\\7\\remote\\sharedconfig.vdf');
		var userData = steam.getConfig(path, '\\config\\localconfig.vdf');

		var gamelist  = [];
		var imagesize = steam.getSettings('imagesize');
		var username  = steam.loadGames(gamelist, gameData, userData);
		    gamelist  = steam.convalidateGames(gamelist, username, imagesize);
    
		steam.printGameList(gamelist, imagesize);

	} catch(e) {
    $('#bg').text(e.message);
	}
}