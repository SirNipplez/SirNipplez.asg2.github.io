


/* url of song api --- https versions hopefully a little later this semester */	
const api = 'https://www.randyconnolly.com/funwebdev/3rd/api/music/songs-nested.php';

 

/* note: you may get a CORS error if you try fetching this locally (i.e., directly from a
   local file). To work correctly, this needs to be tested on a local web server.  
   Some possibilities: if using Visual Code, use Live Server extension; if Brackets,
   use built-in Live Preview.
*/
document.addEventListener("DOMContentLoaded", (event) => {

   setupMain();

   //from lecture
   const url = `http://www.randyconnolly.com/funwebdev/3rd/api/music/songs-nested.php`;
   
   let songs = localStorage.getItem("songs");
   if (!songs) {
      fetch(url)
      .then((resp) => resp.json())
      .then((data) => {
         console.log("Song data is not local");
         const sortedData = SortByTitle(data);
         const dataJSON = JSON.stringify(sortedData);
         localStorage.setItem("songs", dataJSON);

         setupPages(sortedData);
      })
      .catch( error => { console.error("Fetech failed due to error")})
   } else {

      console.log("Song data is local");
      data = JSON.parse(songs);
      // console.dir(data);
   
      setupPages(data);

   }
   
});

/****************************  HOME PAGE **********************************/ 

/*
 * Setups and calls all the function to intialize the home page
 */
function initHomePage(songs) {
   mostPopularSongs(songs);
   mostPopularGenre(songs);
   mostPopularArtist(songs);
}

/*
 * Finds and displays the top 15 most popular songs on the home page.
 */
function mostPopularSongs(songs) {
   const songBody = document.querySelector("#pSong tbody");
   let popSongs = songs.sort((a,b) => a.details.popularity > b.details.popularity ? -1 : 1);
   for (let i = 0; i < 15; i++) {
      let song = createHomeRow(songs[i])
      createSongClickHandler(song);
      songBody.appendChild(song);
      
   }
}

/*
 * Finds and displays the top 15 most popular Artists on the home page
 */
function mostPopularArtist(songs) {
   const artistBody = document.querySelector("#tArtist tbody");
   const artistOccurList = occurOfElement(songs, 'artist', 'name');
   artistOccurList.sort((a,b) => a[1] > b[1] ? -1 : 1);
   for (let i = 0; i < 15; i++) {
      const tr = document.createElement("tr");
      const td = document.createElement("td");
      tr.dataset.artist = artistOccurList[i][0];
      td.textContent = artistOccurList[i][0];
      tr.appendChild(td);
      
      tr.addEventListener('click', e => {
         const search = document.querySelector("#search");
         const artistName = e.target.textContent;
         displaySearchSongTable(songs.filter((song) => song.artist.name == artistName));
         hideAllPages();
         displayEl(search);
      });
      
      artistBody.appendChild(tr);
   }
}

/*
 * Finds and displays the top 15 most popular Genres on the home page
 */
function mostPopularGenre(songs) {
   const genreBody = document.querySelector("#tGenre tbody");
   const genreOccurList = occurOfElement(songs, 'genre', 'name');
   genreOccurList.sort((a,b) => a[1] > b[1] ? -1 : 1);
   for (let i = 0; i < 15; i++) {
      const tr = document.createElement("tr");
      const td = document.createElement("td");
      tr.dataset.genre = genreOccurList[i][0];
      td.textContent = genreOccurList[i][0];
      tr.appendChild(td);
      
      tr.addEventListener('click', e => {
         const search = document.querySelector("#search");
         const genreName = e.target.textContent;
         displaySearchSongTable(songs.filter((song) => song.genre.name == genreName));
         hideAllPages();
         displayEl(search);
      });

      genreBody.appendChild(tr);
      
   }
}

/*
 * Creates the td and tr elements for a home pages table
 */
function createHomeRow(song) {
   const tr = document.createElement("tr");
   const td = document.createElement("td");
   tr.dataset.song = song.song_id;
   td.textContent = `${song.title} - ${song.artist.name}`;
   tr.appendChild(td);
   return tr;
}

/****************************  SEARCH PAGE ********************************/

/*
 * Setups and calls all the function to intialize the search page
 */
function initSearchPage(songs) {
   displaySearchSongTable(songs);
   disableOtherFilters();
   artistSelectorFilter();
   genreFilter();
   filterSearch(songs);
   clearFilterSearch(songs);
   searchSortButtons(songs);
}

/*
 * Create all the table entries for the search table from a given array of songs 
 */
function displaySearchSongTable(songs) {
   const searchTable = document.querySelector("#songsBody");
   clearInnerHtml(searchTable);
   if (songs.length > 0) {
      for (let s of songs) {
         let tr = createSongRowData(s);
         tr.appendChild(createSearchTableButton(s));
         createSongClickHandler(tr);
         searchTable.appendChild(tr);
      }
   }
}

/*
 * Creates the "add" to playlist button for a table entry in the search table
 */
function createSearchTableButton(song) {
   const td = document.createElement("td");
     const blankButton = document.createElement("button");
     blankButton.textContent = "add";
     td.appendChild(blankButton);
     blankButton.addEventListener("click", () => {
      addToPlaylist(song);
     });
     return td;
}

/*
 * Makes filters mutually  exclusive
 */
function disableOtherFilters() {
   let radioButtons = document.querySelectorAll('input.radioBttn');
   let titleInput = document.querySelector('#Tsearch');
   let artistSelect = document.querySelector('#Afilter');
   let genreSelect = document.querySelector('#Gfilter');

   // Title selected as default
   titleInput.disabled = false;
   artistSelect.disabled = true;
   genreSelect.disabled = true;

   // Change listener
   radioButtons.forEach(function (radioButton) {
         radioButton.addEventListener('change', function () {
            if (radioButton.value === 'Title') {
               titleInput.disabled = false;
               artistSelect.disabled = true;
               genreSelect.disabled = true;
            } else if (radioButton.value === 'Artist') {
               titleInput.disabled = true;
               artistSelect.disabled = false;
               genreSelect.disabled = true;
            } else if (radioButton.value === 'Genre') {
               titleInput.disabled = true;
               artistSelect.disabled = true;
               genreSelect.disabled = false;
            }
         });
   });
}

/*
 * Sets up the search filter and changes if a new filter has been selected
 */
function filterSearch(songs) {
   const button = document.querySelector("#filterButton");
   let titleInput = document.querySelector("#Tsearch");
   let artistSelect = document.querySelector("#Afilter");
   let genreSelect = document.querySelector("#Gfilter");
   button.addEventListener("click", ()=> {
      if (titleInput.disabled == false) {
         if (titleInput.value != "") {
            displaySearchSongTable(songs.filter((song) => song.title.includes(titleInput.value)));
         }

      } else if (artistSelect.disabled == false) {
         if (artistSelect.value != "") {
            displaySearchSongTable(songs.filter((song) => song.artist.name == artistSelect.value));
         }

      } else if (genreSelect.disabled == false) {
         if (genreSelect.value != "") {
            displaySearchSongTable(songs.filter((song) => song.genre.name == genreSelect.value));
         }

      } else {
         console.log("nothing was filtered");
      }
   });
}

/*
 * Sets the search filter the original no filter
 */
function clearFilterSearch(songs) {
   const button = document.querySelector("#clearButton");
   button.addEventListener("click", ()=> {
      displaySearchSongTable(SortByTitle(songs));
   });
}

/*
 * Sets up the drop down filter for the artist filter
 */
function artistSelectorFilter() {
   const artistSelector = document.querySelector("#Afilter");
   fetch("./json/artists.json")
      .then((resp) => resp.json())
      .then((artists) => {
         for (let artist of artists) {
            const option = document.createElement("option");
            option.textContent = artist.name;
            option.dataset.value = artist.id;
            artistSelector.appendChild(option);
         }
   });
}

/*
 * Sets up the drop down filter for the genre filter
 */
function genreFilter() {
   const genreSelector = document.querySelector("#Gfilter");
   fetch("./json/genres.json")
      .then((resp) => resp.json())
      .then((genres) => {
         for (let genre of genres) {
            const option = document.createElement("option");
            option.textContent = genre.name;
            option.dataset.value = genre.id;
            genreSelector.appendChild(option);
         }
   });
}

/*
 * Sets up the sort buttons for title, artist, and genre
 */
function searchSortButtons(songs) {
   const titleButton = document.querySelector("#tPic");
   const artistButton = document.querySelector("#aPic");
   const genreButton = document.querySelector("#gPic");
   const yearButton = document.querySelector("#yPic");

   titleButton.addEventListener("click", e => {
      titleButton.src = "image/arrowdown.png";
      artistButton.src = "image/dot.png";
      genreButton.src = "image/dot.png";
      yearButton.src = "image/dot.png";
      displaySearchSongTable(SortByTitle(songs));

   });

   artistButton.addEventListener("click", e => {
      artistButton.src = "image/arrowdown.png";
      titleButton.src = "image/dot.png";
      genreButton.src = "image/dot.png";
      yearButton.src = "image/dot.png";
      displaySearchSongTable(SortByArtist(songs));

   });

   genreButton.addEventListener("click", e => {
      genreButton.src = "image/arrowdown.png";
      titleButton.src = "image/dot.png";
      artistButton.src = "image/dot.png";
      yearButton.src = "image/dot.png";
      displaySearchSongTable(SortByGenre(songs));
   });
   
   yearButton.addEventListener("click", e => {
      yearButton.src = "image/arrowdown.png";
      titleButton.src = "image/dot.png";
      artistButton.src = "image/dot.png";
      genreButton.src = "image/dot.png";
      displaySearchSongTable(SortByYear(songs));
      
   });
}

/***************************  PLAYLIST PAGE *******************************/

/*
 * Setups and calls all the function to intialize the playlist page
 */
function setUpPlaylist() {
   clearPlaylistButton();
}

/*
 * Calculates the number of songs and the average popularity to display
 */
function calculatePlaylistdata() {
   const playlistInfo = document.querySelector("#playInfo");
   const pBody = document.querySelector("#playlistBody");
   let children = pBody.childNodes;
   let count = 0;
   let poptot = 0;
   let avPop = 0;
   for (let i = 0; i < children.length; i++) {
      if (children[i].nodeType != 1) {
         continue;
      }
      let pop = children[i].dataset.pop;
      poptot = poptot + Number(pop);
      count ++;
   }
   if( count != 0) {
      avPop = (poptot / count);
   }
   playlistInfo.textContent = `Number of songs: ${count}, Average popularity: ${avPop.toFixed(2)}`;
}

/*
 * Adds a give song to the playlist page
 */
function addToPlaylist (song) {
   const playlistBody = document.querySelector("#playlistBody");
   const tr = createSongRowData(song);
   const sPop = document.createElement("td");
   sPop.textContent = song.details.popularity;
   tr.appendChild(sPop);
   createSongClickHandler(tr);
   tr.dataset.pop = song.details.popularity;
   tr.appendChild(createPlaylistTableButton(song));
   playlistBody.appendChild(tr);
   calculatePlaylistdata(); //recalc data after addition
}

/*
 * Given an element in the playist it will remove itself
 */
function removeFromPlaylist (el) {
   //element removes itself
   el.parentNode.removeChild(el);
   calculatePlaylistdata(); //recalc data after removal
}

/*
 * Creates a playlist "remove" button for a playlist element
 */
function createPlaylistTableButton(song) {
   const td = document.createElement("td");
     const blankButton = document.createElement("button");
     blankButton.textContent = "Remove";
     td.appendChild(blankButton);
     blankButton.addEventListener("click", (e) => {
      removeFromPlaylist(e.target.parentNode.parentNode);
     });
     return td;
}

/*
 * Removes all songs ro
 */
function clearPlaylistButton() {
   const clearButton = document.querySelector("#clearPlaylist");
   const playlistBody = document.querySelector("#playlistBody");
   clearButton.addEventListener('click', () => {
      clearInnerHtml(playlistBody);
      calculatePlaylistdata(); //recalc data after mass removal
   });
}

/*****************************  SONG PAGE *********************************/

/*
 * Displays songs details given a song
 */
function displaySongDetails(song) {
   const songAnalytics = song.analytics;
   const songDetails = song.details;
   const songdets = document.querySelector("#songDets");
   const songInfo = document.querySelector("#songInfo");
   const songDets = document.querySelector("#songDetails");
   const chartDiv = document.getElementById('myChart');

   //clearing past song
   songInfo.innerHTML = "";
   songDets.innerHTML = "";

   //displaying current song
   songInfo.appendChild(createListEl(`Title: ${song.title}`));
   songInfo.appendChild(createListEl(`Artist: ${song.artist.name}`));
   songInfo.appendChild(createListEl(`Genre: ${song.genre.name}`));
   songInfo.appendChild(createListEl(`Year: ${song.year}`));
   songInfo.appendChild(createListEl(`Duration: ${(songDetails.duration/60).toFixed(0)} min ${songDetails.duration%60} sec`));
   songDets.appendChild(createListEl(`BPM: ${songDetails.bpm} BPM`));
   songDets.appendChild(createListEl(`Energy: ${songAnalytics.energy} (1-100)`));
   songDets.appendChild(createListEl(`Danceabily: ${songAnalytics.danceability} (1-100)`));
   songDets.appendChild(createListEl(`Liveness: ${songAnalytics.liveness} (1-100)`));
   songDets.appendChild(createListEl(`Valence: ${songAnalytics.valence} (1-100)`));
   songDets.appendChild(createListEl(`Acoutsticness: ${songAnalytics.acousticness} (1-100)`));
   songDets.appendChild(createListEl(`Speechiness: ${songAnalytics.speechiness} (1-100)`));
   songDets.appendChild(createListEl(`Popularity: ${songDetails.popularity}`));
   hideAllPages();
   displayEl(songdets);


   
   const oldChart = Chart.getChart(chartDiv);    
   if( typeof oldChart !== "undefined") {       
      oldChart.destroy();    
   }
   new Chart(chartDiv, {
     type: 'radar',
     data: {
      labels: [
         'Energy',
         'Danceability',
         'Liveness',
         'Valence',
         'Acoutsticness',
         'Speechiness',
         'Popularity'
       ],
       datasets: [{
         label: `${song.title}`,
         data: [
            songAnalytics.energy,
            songAnalytics.danceability, 
            songAnalytics.liveness, 
            songAnalytics.valence, 
            songAnalytics.acousticness, 
            songAnalytics.speechiness, 
            songDetails.popularity],
            fill: true,
            backgroundColor: 'rgba(173, 236, 79, 0.2)',
            borderColor: 'rgb(173, 236, 79)',
            pointBackgroundColor: 'rgb(173, 236, 79)',
            pointBorderColor: '#fff',
            pointHoverBackgroundColor: '#fff',
            pointHoverBorderColor: 'rgb(173, 236, 79)',
            tension : 0.2,
            borderWidth: 1
       }]
     },
   options: {
      // pre-designated plugin to "defeat the legend of the song"
      plugins:{
         legend: {
            display: false
         }
      },
      scales: {
         // options for radial axis
         r: {
            angleLines:{
               color: 'white'
            },
            grid:{
               color: 'white'
            },
            pointLabels: {
               color: 'white',

            },
            ticks:{
               backdropColor:'rgba(173, 236, 79, 0.0)',
               color: 'white'
            }
         }
       }
     }
   });
   ///// END OF CHART
}

/*
 * Creates the event listener for clicking a song to being to
 * a song view.
 */
function createSongClickHandler(el) {
   el.addEventListener("click", e => {
      if (e.target.parentNode.dataset.song != undefined) {
         console.log("displaying search songs");
         const songId = e.target.parentNode.dataset.song;
         const selectedSong = data.find((s) => s.song_id == songId);
         displaySongDetails(selectedSong);
      }
      
   });
}

/*
 * Creates a popup if the elipse is click on if a song if over 25 char
 */
function createClickPopup(elipseNode){
   elipseNode.addEventListener("click",function(e){
      const popup = document.createElement("span");
      popup.innerText = e.target.dataset.longName;
      popup.classList.add("popup");
      e.target.appendChild(popup);
      setTimeout(() => {e.target.removeChild(popup);},2500);
   });
}

/*************************  HELPER FUNCTIONS **********************************/

function clearInnerHtml(el) {
   el.innerHTML = "";
}

function SortByTitle(songs) {
   return songs.sort((a,b) => a.title < b.title ? -1 : 1);
}

function SortByArtist(songs) {
   return songs.sort((a,b) => a.artist.name < b.artist.name ? -1 : 1);
}

function SortByGenre(songs) {
   return songs.sort((a,b) => a.genre.name < b.genre.name ? -1 : 1);
}

function SortByYear(songs) {
   return songs.sort((a,b) => a.year < b.year ? -1 : 1);
}

/*
 * Creates html elements for a song table row
 */
function createSongRowData(song) {
   const tr = document.createElement("tr");

   tr.dataset.song = song.song_id;

   //check for title len, if large we add elipse containing song data
   //else fill data as normal
   if (song.title.length > 25){
      tr.appendChild(createLongTableColumn(song.title));}
   else{
      tr.appendChild(createTableColumn(song, "title"));}

   tr.appendChild(createTableColumn(song.artist, "name"));
   tr.appendChild(createTableColumn(song.genre, "name"));
   tr.appendChild(createTableColumn(song, "year"));
   return tr;
}

function createLongTableColumn(songTitle){
   const td = document.createElement("td");

   const fullTitleSpan = document.createElement("span");
   fullTitleSpan.classList.add("elip");
   fullTitleSpan.innerHTML = ("&hellip;");
   fullTitleSpan.dataset.longName = songTitle;

   createClickPopup(fullTitleSpan);

   td.innerText = `${songTitle.substring(0,25)}`;
   td.appendChild(fullTitleSpan);

   return td;
}

/*
 * Basic create table element function for readability
 */
function createTableColumn(obj, fieldName) {
   const td = document.createElement("td");
   td.textContent = obj[fieldName];
   return td;
}

/*
 * Basic create list element function for readability
 */
function createListEl(text) {
   const li = document.createElement("li");
   li.textContent = text;
   return li;
}

/*
 * Basic can hide function for readbility
 */
function hideEl(el) {
   el.style.display = "none";
}

/*
 * Basic display function for readbility
 */
function displayEl(el) {
   el.style.display = "flex";
}

/*
 *
 */
function hideAllPages() {
   const home = document.querySelector("#home").style.display = "none";
   const search = document.querySelector("#search").style.display = "none";
   const song = document.querySelector("#songDets").style.display = "none";
   const playlist = document.querySelector("#playlist").style.display = "none";
}

/*
 * Returns a list of tupples with the list of element and the number of times they 
 * occured in the given list
 */
function occurOfElement(array, field1, field2) {
  const counts = {};

  // Count occurrences of each field value in the array of objects
  array.forEach((obj) => {
    const fieldValue = obj[field1][field2];
    counts[fieldValue] = (counts[fieldValue] || 0) + 1;
  });

  // Create an array of tuples with field value and count
  const result = Object.entries(counts).map(([fieldValue, count]) => [fieldValue, count]);

  return result;
}

/*
 * Sets up basic functionality of pages without requiring data
 */
function setupMain() {
   const home = document.querySelector("#home");
   const search = document.querySelector("#search");
   const searchButton = document.querySelector("#searchButton");
   const playlistButton = document.querySelector("#playlistButton");
   const icon = document.querySelector("#iconPic");
   const creditButton = document.querySelector("#creditButton");
   const creditSpan = document.querySelector("#creditButton .credits")
    
   hideAllPages();
   displayEl(home);

     
   searchButton.addEventListener("click" , function () {
      hideAllPages();
      displayEl(search);
   });
   playlistButton.addEventListener("click" , function () {
      hideAllPages();
      displayEl(playlist);
   });
   icon.addEventListener("click" , function () {
      hideAllPages();
      displayEl(home);
   });
   creditButton.addEventListener("mouseover", function() {
      creditSpan.style.visibility = "visible";
      setTimeout(() => {
         creditSpan.style.visibility = "hidden";
      },5000)
   })
}

function setupPages(songs) {
   initSearchPage(songs);
   initHomePage(songs);
   setUpPlaylist();
}
