var setSong = function(songNumber){
    if (currentSoundFile) {
        currentSoundFile.stop();
    }
    currentlyPlayingSongNumber = parseInt(songNumber);
    currentSongFromAlbum = currentAlbum.songs[songNumber - 1];
    
    currentSoundFile = new buzz.sound(currentSongFromAlbum.audioUrl, {
        formats: ['mp3'],
        preload: true
    });
    
    setVolume(currentVolume);
};

var seek = function(time) {
    if (currentSoundFile) {
        currentSoundFile.setTime(time);
    }
}

var setVolume = function(volume){
    if (currentSoundFile) {
        currentSoundFile.setVolume(volume);
    }
};

var getSongNumberCell = function(number){
    return $('.song-item-number[data-song-number="' + number + '"]');
};

var createSongRow = function (songNumber, songName, songLength) {
    var template =
        '<tr class="album-view-song-item">'
        + '<td class="song-item-number" data-song-number="' + songNumber + '"><span class="song-number">' + songNumber + '</span>' + pauseButtonTemplate + playButtonTemplate + '</td>'
        + '<td class="song-item-title">' + songName + '</td>'
        + '<td class="song-item-duration" >' + filterTimeCode(songLength) + '</td>'
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
            currentSoundFile.play();
            updateSeekBarWhileSongPlays();
        } else if (currentlyPlayingSongNumber !== songNumber) {
            // Switch from Play -> Pause button to indicate new song is playing.
            var currentlyPlayingSong = getSongNumberCell(currentlyPlayingSongNumber);
            currentlyPlayingSong.find(".row-pause-button").addClass("hidden");
            currentlyPlayingSong.find(".row-play-button").addClass("hidden");
            currentlyPlayingSong.find(".song-number").toggleClass("hidden");
           
            $songNumberCell.find(".row-play-button").toggleClass("hidden");
            $songNumberCell.find(".row-pause-button").toggleClass("hidden");
           
            setSong(songNumber);
            currentSoundFile.play();
            updateSeekBarWhileSongPlays();
            currentSongFromAlbum = currentAlbum.songs[songNumber - 1];
            
            var $volumeFill = $('.volume .fill');
            var $volumeThumb = $('.volume .thumb');
            $volumeFill.width(currentVolume + '%');
            $volumeThumb.css({left: currentVolume + '%'});
            
            updatePlayerBarSong();
            
        } else if (currentlyPlayingSongNumber === songNumber) {
            // Switch from Pause -> Play button to pause currently playing song.
//            $songNumberCell.find(".row-play-button").toggleClass("hidden");
//            $songNumberCell.find(".row-pause-button").toggleClass("hidden");
            
            if (currentSoundFile.isPaused()){
                currentSoundFile.play();
                updateSeekBarWhileSongPlays();
                $(".main-controls .play-pause").html(playerBarPauseButton);
                $songNumberCell.find(".row-play-button").addClass("hidden");
                $songNumberCell.find(".row-pause-button").removeClass("hidden");
            } else {
                currentSoundFile.pause();
                $(".main-controls .play-pause").html(playerBarPlayButton);
                $songNumberCell.find(".row-play-button").removeClass("hidden");
                $songNumberCell.find(".row-pause-button").addClass("hidden");
            };
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
            songNumberCell.find(".row-play-button").addClass("hidden");
            songNumberCell.find(".song-number").toggleClass("hidden");
        };
        
        
        console.log("songNumber value is " + songNumber + "\n and currentlyPlayingSongNumber value is " + currentlyPlayingSongNumber);
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
    
    currentSoundFile.play();
    updateSeekBarWhileSongPlays();

    // Update the Player Bar information
    $('.currently-playing .song-name').text(currentSongFromAlbum.title);
    $('.currently-playing .artist-name').text(currentAlbum.artist);
    $('.currently-playing .artist-song-mobile').text(currentSongFromAlbum.title + " - " + currentAlbum.title);
    $('.main-controls .play-pause').html(playerBarPauseButton);
    
    var lastSongNumber = getLastSongNumber(currentSongIndex);
    var $nextSongNumberCell = getSongNumberCell(currentlyPlayingSongNumber);
    var $lastSongNumberCell = getSongNumberCell(lastSongNumber);
    
    // instead of html, you want to find the play and pause buttons and toggle them and the song number
    
    $nextSongNumberCell.find(".row-pause-button").removeClass("hidden");
    $nextSongNumberCell.find(".song-number").addClass("hidden");
    $lastSongNumberCell.find(".row-play-button").addClass("hidden");
    $lastSongNumberCell.find(".row-pause-button").addClass("hidden");
    $lastSongNumberCell.find(".song-number").removeClass("hidden");
    
    
    
    
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
    
    currentSoundFile.play();
    updateSeekBarWhileSongPlays();
    
    // Update the Player Bar information
    $('.currently-playing .song-name').text(currentSongFromAlbum.title);
    $('.currently-playing .artist-name').text(currentAlbum.artist);
    $('.currently-playing .artist-song-mobile').text(currentSongFromAlbum.title + " - " + currentAlbum.title);
    $('.main-controls .play-pause').html(playerBarPauseButton);
    
    var lastSongNumber = getLastSongNumber(currentSongIndex);
    var $previousSongNumberCell = getSongNumberCell(currentlyPlayingSongNumber);
    var $lastSongNumberCell = getSongNumberCell(lastSongNumber);
    
    $previousSongNumberCell.find(".row-pause-button").removeClass("hidden");
    $previousSongNumberCell.find(".song-number").addClass("hidden");
    $lastSongNumberCell.find(".row-play-button").addClass("hidden");
    $lastSongNumberCell.find(".row-pause-button").addClass("hidden");
    $lastSongNumberCell.find(".song-number").removeClass("hidden");
    
    
};

var togglePlayFromPlayerBar = function(){
    var $currentSongNumberCell = getSongNumberCell(currentlyPlayingSongNumber);
    
    if (currentSoundFile.isPaused()){
        currentSoundFile.play();
        $('.main-controls .play-pause').html(playerBarPauseButton);
        
    } else {
        currentSoundFile.pause();
        $('.main-controls .play-pause').html(playerBarPlayButton);
    }
    
    $currentSongNumberCell.find(".row-play-button").toggleClass("hidden");
    $currentSongNumberCell.find(".row-pause-button").toggleClass("hidden"); 
}

var updateSeekPercentage = function($seekBar, seekBarFillRatio) {
    var offsetXPercent = seekBarFillRatio * 100;
    // #1
    offsetXPercent = Math.max(0, offsetXPercent);
    offsetXPercent = Math.min(100, offsetXPercent);
 
    // #2
    var percentageString = offsetXPercent + '%';
    $seekBar.find('.fill').width(percentageString);
    $seekBar.find('.thumb').css({left: percentageString});
};

var setupSeekBars = function() {
     var $seekBars = $('.player-bar .seek-bar');
 
     $seekBars.click(function(event) {
        var offsetX = event.pageX - $(this).offset().left;
        var barWidth = $(this).width();
        var seekBarFillRatio = offsetX / barWidth;
        
        if ($(this).parent().attr('class') == 'seek-control') {
            seek(seekBarFillRatio * currentSoundFile.getDuration());
        } else {
            setVolume(seekBarFillRatio * 100);   
        }
        
        updateSeekPercentage($(this), seekBarFillRatio);
    });

    $seekBars.find('.thumb').mousedown(function(event) {

        var $seekBar = $(this).parent();

        $(document).bind('mousemove.thumb', function(event){
            var offsetX = event.pageX - $seekBar.offset().left;
            var barWidth = $seekBar.width();
            var seekBarFillRatio = offsetX / barWidth;
            
            if ($seekBar.parent().attr('class') == 'seek-control') {
                seek(seekBarFillRatio * currentSoundFile.getDuration());   
            } else {
                setVolume(seekBarFillRatio * 100);
            }
            
            updateSeekPercentage($seekBar, seekBarFillRatio);
        });
 
         
         $(document).bind('mouseup.thumb', function() {
             $(document).unbind('mousemove.thumb');
             $(document).unbind('mouseup.thumb');
         });
     });
 };

var updateSeekBarWhileSongPlays = function() {
    if (currentSoundFile) {
        currentSoundFile.bind('timeupdate', function(event) {
             
            var seekBarFillRatio = this.getTime() / this.getDuration();
            var $seekBar = $('.seek-control .seek-bar');
 
            updateSeekPercentage($seekBar, seekBarFillRatio);
            setCurrentTimeInPlayerBar(this.getTime());
            setTotalTimeInPlayerBar(this.getDuration());
        });
    }
};

var setCurrentTimeInPlayerBar= function(currentTime){
    $(".seek-control .current-time").text(filterTimeCode(currentTime));
}

var setTotalTimeInPlayerBar = function (totalTime){
    $(".seek-control .total-time").text(filterTimeCode(totalTime));
}

var filterTimeCode = function (timeInSeconds) {
    var parsedTime = Math.floor(parseFloat(timeInSeconds));
    var minutes = Math.floor(parsedTime / 60);
    var seconds = parsedTime % 60;
    
    if (seconds > 9) {
        return minutes + ":" + seconds;
    } else {
        return minutes + ":0" + seconds;
    }
}

var playButtonTemplate = '<a class="album-song-button hidden row-play-button"><span class="ion-play"></span></a>';
var pauseButtonTemplate = '<a class="album-song-button hidden row-pause-button"><span class="ion-pause"></span></a>';
var playerBarPlayButton = '<span class="ion-play"></span>';
var playerBarPauseButton = '<span class="ion-pause"></span>';

var currentAlbum = null;
var currentlyPlayingSongNumber = null;
var currentSongFromAlbum = null;
var currentSoundFile = null;
var currentVolume = 80;

var $previousButton = $('.main-controls .previous');
var $nextButton = $('.main-controls .next');
var $playButton = $('.main-controls .play-pause');

$(document).ready(function() {
    setCurrentAlbum(albumPicasso);
    setupSeekBars();
    $previousButton.click(previousSong);
    $nextButton.click(nextSong);
    $playButton.click(togglePlayFromPlayerBar);
});

