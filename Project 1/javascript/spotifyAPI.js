$(document).ready(function() {


    //GLOBAL VARIABLES
    //=========================



    //FUNCTIONS
    //==========================

    //use server proxy to make API work - prior to learning server
    $.ajaxPrefilter(function(options) {
        if (options.crossDomain && jQuery.support.cors) {
            options.url = 'https://uncc-cors-proxy.herokuapp.com/' + options.url;
        }
    });

    function createAccessToken(callback) {

        var queryURL = "https://accounts.spotify.com/api/token";

        $.ajax({
            url: queryURL,
            method: "POST",
            data: {
                "grant_type": "client_credentials"
            },
            headers: {
                "Authorization": "Basic " + btoa("fcbb2faaa19441e08248de09c5b96d04:7cd555a722b742c3b74b17695b7aa057")
            }
        }).done(function(response) {
            console.log(response.access_token);
            sessionStorage.setItem("accessToken", response.access_token);
            callback(response.access_token);
        });

    }


    function getAccessToken(callback) {
        var accessToken = sessionStorage.getItem("accessToken");

        if (accessToken !== null) {
            callback(accessToken);
        }
        else {
            createAccessToken(callback);
        }
    }

    function searchWithToken(accessToken) {
        var artist = $("#search-input").val().trim();
        spotifySearch(accessToken, artist);
    }

    function spotifySearch(accessToken, artist) {

        var queryURL = "https://api.spotify.com/v1/search?q=" + artist + "&type=artist&market=US&limit=10";
        console.log(queryURL);
        console.log(artist);

        $.ajax({
            url: queryURL,
            method: "GET",
            headers: {
                "Authorization": "Bearer " + accessToken,
            }
        }).done(function(response) {
            var results = response;
            console.log(results);
            var artistID = results.artists.items[0].id;
            // console.log(results.artists.items[0]);
            spotifyTopTracks(accessToken, artistID);
            spotifyRelatedArtist(accessToken, artistID);
        });

    }


    function spotifyTopTracks(accessToken, artistID) {

        $("#tracksContainer").empty();

        var queryURL = "https://api.spotify.com/v1/artists/" + artistID + "/top-tracks?country=US";

        $.ajax({
            url: queryURL,
            method: "GET",
            headers: {
                "Authorization": "Bearer " + accessToken,
            }
        }).done(function(response) {
            var results = response;
            console.log(results);

            var albumDiv = $("<a>");
            albumDiv.addClass("carousel-item");
            albumDiv.attr("target", "_blank");
            albumDiv.attr("href", trackURL);

            for (var i = 0; i < 5; i++) {
                var albumName = results.tracks[i].album.name;
                var trackName = results.tracks[i].name;
                var trackURL = results.tracks[i].external_urls.spotify;

                var image = $("<img>");
                image.attr("src", results.tracks[i].album.images[2].url);
                console.log(image);

                albumDiv.append(image);

            }

            $("#tracksContainer").append(albumDiv);


        });
    }



    function spotifyRelatedArtist(accessToken, artistID) {
        $("#relatedArtistContainer").empty();

        console.log(artistID);
        var queryURL = "https://api.spotify.com/v1/artists/" + artistID + "/related-artists";


        $.ajax({
            url: queryURL,
            method: "GET",
            headers: {
                "Authorization": "Bearer " + accessToken,
            }
        }).done(function(response) {
            var results = response;
            console.log(results);

            for (var j = 0; j < 5; j++) {
                var relatedArtist = results.artists[j].name;

                // var artistLink = $("<a>");
                // artistLink.attr("href", spotifySearch(relatedArtist));
                // artistLink.text(relatedArtist);

                $("#relatedArtistContainer").append(relatedArtist + "<br>");

            }

        });

    }



    //MAIN PROCESS
    //=============================

    $("#add-artist").on("click", function(event) {
        event.preventDefault();
        var artist = $("#search-input").val().trim();
        console.log(artist);

        getAccessToken(searchWithToken);
    });

    $(document).on("click", ".relatedArtist", function(event) {
        event.preventDefault();
        getAccessToken(searchWithToken);
    });


});