var setSong = function(songNumber){
    currentlyPlayingSongNumber = parseInt(songNumber);
    currentSongFromAlbum = currentAlbum.songs[songNumber - 1];
};

var getSongNumberCell = function(number){
    return $('.song-item-number[data-song-number="' + number + '"]');
};

var createSongRow = function (songNumber, songName, songLength) {
    var template =
        '<tr class="album-view-song-item">'
        + '<td class="song-item-number" data-song-number="' + songNumber + '"><span class="song-number">' + songNumber + '</span>' + pauseButtonTemplate + playButtonTemplate + '</td>'
        + '<td class="song-item-title">' + songName + '</td>'
        + '<td class="song-item-duration" >' + songLength + '</td>'
        + '</tr>';
 
    var $row = $(template);
    
    
    var clickHandler = function() {
        var $songNumberCell = $(this).find(".song-item-number");
        var songNumber = parseInt($songNumberCell.attr('data-song-number'));
        if (currentlyPlayingSongNumber === null) {
            $songNumberCell.find(".row-play-button").toggleClass("hidden");
            $songNumberCell.find(".row-pause-button").toggleClass("hidden");
            setSong(songNumber);
            updatePlayerBarSong();
        } else if (currentlyPlayingSongNumber !== songNumber) {
            // Switch from Play -> Pause button to indicate new song is playing.
            var currentlyPlayingSong = getSongNumberCell(currentlyPlayingSongNumber);
            currentlyPlayingSong.find(".row-pause-button").toggleClass("hidden");
            currentlyPlayingSong.find(".song-number").toggleClass("hidden");
           
            $songNumberCell.find(".row-play-button").toggleClass("hidden");
            $songNumberCell.find(".row-pause-button").toggleClass("hidden");
           
            setSong(songNumber);
            updatePlayerBarSong();
        } else if (currentlyPlayingSongNumber === songNumber) {
            // Switch from Pause -> Play button to pause currently playing song.
            $songNumberCell.find(".row-play-button").toggleClass("hidden");
            $songNumberCell.find(".row-pause-button").toggleClass("hidden");
            currentlyPlayingSongNumber = null;
            $(".main-controls .play-pause").html(playerBarPlayButton)
        }
    };
    
    var onHover = function(event) {
        var songNumberCell = $(this).find('.song-item-number');
        var songNumber = parseInt(songNumberCell.attr('data-song-number'));
        //debugger;
        //console.log("onHover fired", songNumberCell, currentlyPlayingSongNumber);

        if (songNumber !== currentlyPlayingSongNumber) {
            songNumberCell.find(".row-play-button").toggleClass("hidden");
            songNumberCell.find(".song-number").toggleClass("hidden");
        }
    };

    var offHover = function(event) {
        var songNumberCell = $(this).find('.song-item-number');
        var songNumber = parseInt(songNumberCell.attr('data-song-number'));
        console.log("offHover fired", songNumber, currentlyPlayingSongNumber);

        if (songNumber !== currentlyPlayingSongNumber) {
            songNumberCell.find(".row-play-button").toggleClass("hidden");
            songNumberCell.find(".song-number").toggleClass("hidden");
        }
        
        console.log("songNumber type is " + typeof songNumber + songNumber + "\n and currentlyPlayingSongNumber type is " + typeof currentlyPlayingSongNumber + currentlyPlayingSongNumber);
    };
    
    $row.click(clickHandler);
    
    $row.hover(onHover, offHover);
    
    return $row;
};

var setCurrentAlbum = function (album) {
    // #1
    currentAlbum = album;
    var $albumTitle = $('.album-view-title');
    var $albumArtist = $('.album-view-artist');
    var $albumReleaseInfo = $('.album-view-release-info');
    var $albumImage = $('.album-cover-art');
    var $albumSongList = $('.album-view-song-list');
 
    // #2
    $albumTitle.text(album.title);
    $albumArtist.text(album.artist);
    $albumReleaseInfo.text(album.year + ' ' + album.label);
    $albumImage.attr('src', album.albumArtUrl);
 
    // #3
    $albumSongList.empty();
 
    // #4
    for (var i = 0; i < album.songs.length; i++) {
        var $newRow = createSongRow(i + 1, album.songs[i].title, album.songs[i].duration);
        $albumSongList.append($newRow);
    }
};

var trackIndex = function(album, song) {
    return album.songs.indexOf(song);
};

var updatePlayerBarSong = function() {
    $('.currently-playing .song-name').text(currentSongFromAlbum.title);
    $('.currently-playing .artist-name').text(currentAlbum.artist);
    $('.currently-playing .artist-song-mobile').text(currentSongFromAlbum.title + " - " + currentAlbum.artist);
    
    $('.main-controls .play-pause').html(playerBarPauseButton);

};

var nextSong = function() {
    if (!currentSongFromAlbum) {
        return;
    }
    
    var getLastSongNumber = function(index) {
        return index == 0 ? currentAlbum.songs.length : index;
    };
    
    var currentSongIndex = trackIndex(currentAlbum, currentSongFromAlbum);
    // Note that we're _incrementing_ the song here
    currentSongIndex++;
    
    if (currentSongIndex >= currentAlbum.songs.length) {
        currentSongIndex = 0;
    }
    
    // Set a new current song (old method)
    /*currentlyPlayingSongNumber = currentSongIndex + 1;
    currentSongFromAlbum = currentAlbum.songs[currentSongIndex];*/
    
    //The below method argument is incorrect. (new function)
    //var songNumber = currentSongIndex + 1;
    setSong(currentSongIndex + 1);

    // Update the Player Bar information
    $('.currently-playing .song-name').text(currentSongFromAlbum.title);
    $('.currently-playing .artist-name').text(currentAlbum.artist);
    $('.currently-playing .artist-song-mobile').text(currentSongFromAlbum.title + " - " + currentAlbum.title);
    $('.main-controls .play-pause').html(playerBarPauseButton);
    
    var lastSongNumber = getLastSongNumber(currentSongIndex);
    var $nextSongNumberCell = getSongNumberCell(currentlyPlayingSongNumber);
    var $lastSongNumberCell = getSongNumberCell(lastSongNumber);
    
    // instead of html, you want to find the play and pause buttons and toggle them and the song number
    
    $nextSongNumberCell.find(".row-pause-button").toggleClass("hidden");
    $nextSongNumberCell.find(".song-number").toggleClass("hidden");
    $lastSongNumberCell.find(".row-pause-button").toggleClass("hidden");
    $lastSongNumberCell.find(".song-number").toggleClass("hidden");
    
    
    
    
};

var previousSong = function() {
    if (!currentSongFromAlbum) {
        return;
    }
    
    // Note the difference between this implementation and the one in
    // nextSong()
    var getLastSongNumber = function(index) {
        return index == (currentAlbum.songs.length - 1) ? 1 : index + 2;
    };
    
    var currentSongIndex = trackIndex(currentAlbum, currentSongFromAlbum);
    // Note that we're _decrementing_ the index here
    currentSongIndex--;
    
    if (currentSongIndex < 0) {
        currentSongIndex = currentAlbum.songs.length - 1;
    }
    
    // Set a new current song
    /*currentlyPlayingSongNumber = currentSongIndex + 1;
    currentSongFromAlbum = currentAlbum.songs[currentSongIndex];*/
    
    setSong(currentSongIndex + 1);
    
    // Update the Player Bar information
    $('.currently-playing .song-name').text(currentSongFromAlbum.title);
    $('.currently-playing .artist-name').text(currentAlbum.artist);
    $('.currently-playing .artist-song-mobile').text(currentSongFromAlbum.title + " - " + currentAlbum.title);
    $('.main-controls .play-pause').html(playerBarPauseButton);
    
    var lastSongNumber = getLastSongNumber(currentSongIndex);
    var $previousSongNumberCell = getSongNumberCell(currentlyPlayingSongNumber);
    var $lastSongNumberCell = getSongNumberCell(lastSongNumber);
    
    $previousSongNumberCell.find(".row-pause-button").toggleClass("hidden");
    $previousSongNumberCell.find(".song-number").toggleClass("hidden");
    $lastSongNumberCell.find(".row-pause-button").toggleClass("hidden");
    $lastSongNumberCell.find(".song-number").toggleClass("hidden");
    
    
};

var playButtonTemplate = '<a class="album-song-button hidden row-play-button"><span class="ion-play"></span></a>';
var pauseButtonTemplate = '<a class="album-song-button hidden row-pause-button"><span class="ion-pause"></span></a>';
var playerBarPlayButton = '<span class="ion-play"></span>';
var playerBarPauseButton = '<span class="ion-pause"></span>';

var currentAlbum = null;
var currentlyPlayingSongNumber = null;
var currentSongFromAlbum = null;

var $previousButton = $('.main-controls .previous');
var $nextButton = $('.main-controls .next');

$(document).ready(function() {
    setCurrentAlbum(albumPicasso);
    $previousButton.click(previousSong);
    $nextButton.click(nextSong);
});

