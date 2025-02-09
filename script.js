let currentSong = new Audio();
let songs;
let currFolder;

// function for song duration
function formatTime(seconds) {
  seconds = Math.floor(seconds); // Remove decimal part
  let minutes = Math.floor(seconds / 60);
  let remainingSeconds = seconds % 60;

  // Format to always have two digits
  let formattedMinutes = String(minutes).padStart(2, "0");
  let formattedSeconds = String(remainingSeconds).padStart(2, "0");

  return `${formattedMinutes}:${formattedSeconds}`;
}

// function to get songs
async function getSongs(folder) {
  currFolder = folder;
  let a = await fetch(`http://localhost:5500/${folder}/`);
  let response = await a.text();
  let div = document.createElement("div");
  div.innerHTML = response;
  let as = div.getElementsByTagName("a");
  songs = [];
  for (let index = 0; index < as.length; index++) {
    const element = as[index];
    if (element.href.endsWith(".mp3")) {
      songs.push(element.href.split(`/${currFolder}/`)[1]);
    }
  }
  //   show all te songs in the playlist
  let songUl = document
    .querySelector(".songList")
    .getElementsByTagName("ul")[0];
  songUl.innerHTML = "";

  for (const song of songs) {
    songUl.innerHTML =
      songUl.innerHTML +
      `
   <li>
             <img class="invert" src="music.svg" alt="music">
             <div class="info">
               <div>${song.replaceAll("%20", " ")}</div>
               <div>Jamica</div>
            </div>

            <div class="playnow">
             <span>Play Now</span>
             <img class="invert" src="play.svg" alt="playnow">
            </div>
   </li>`;
  }

  //   attach an event listener to each song
  Array.from(
    document.querySelector(".songList").getElementsByTagName("li")
  ).forEach((e) => {
    e.addEventListener("click", () => {
      console.log(e.querySelector(".info").firstElementChild.innerHTML);

      playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim());
    });
  });
  return songs;
}

// function to play music
const playMusic = (track, pause = false) => {
  //   let audio = new Audio("/songs/" + track);
  currentSong.src = `/${currFolder}/` + track;
  if (!pause) {
    currentSong.play();
    play.src = "pause.svg";
  }
  document.querySelector(".songinfo").innerHTML = decodeURI(track);
  document.querySelector(".songtime").innerHTML = "00:00 / 00:00";

};

// Function to display the albums
async function displayAlbums() {
  try {
    let a = await fetch(`http://127.0.0.1:5500/songs/`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a");
    let cardContainer = document.querySelector(".cardContainer");

    let array = Array.from(anchors);
    for (let index = 0; index < array.length; index++) {
      const e = array[index];

      if (e.href.includes("/songs")) {
        // let folder = e.href.split("/").slice(-1)[0];
        let folder = e.getAttribute("href").split("/").filter(Boolean).pop();
        // Get the metadata of the folder
        try {
          let a = await fetch(
            `http://127.0.0.1:5500/songs/${folder}/info.json`
          );

          if (!a.ok) throw new Error("Metadata not found");

          let response = await a.json();
          console.log(response);

          cardContainer.innerHTML =
            cardContainer.innerHTML +
            `
      <div data-folder="${folder}" class="card">
              <div class="play">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512">
                  <path
                    d="M73 39c-14.8-9.1-33.4-9.4-48.5-.9S0 62.6 0 80L0 432c0 17.4 9.4 33.4 24.5 41.9s33.7 8.1 48.5-.9L361 297c14.3-8.7 23-24.2 23-41s-8.7-32.2-23-41L73 39z"
                  />
                </svg>
              </div>
              <img
                src="/songs/${folder}/cover.jpeg"
                alt="${response.title}"
              />
              <h2>${response.title}</h2>
              <p>${response.description}</p>
            </div>
      `;
        } catch (error) {
          console.error(`Error in fetching metadata for ${folder}: `, error);
          continue; //skip this folder if fetching failed
        }
      }
    }

    // load the playlist when card is clicked
    /*  Array.from(document.getElementsByClassName("card")).forEach((e) => {
    e.addEventListener("click", async (item) => {
      songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`);
    });
  }); */

  // Load the playlist when card is clicked and play the first song
    setTimeout(() => {
      document.querySelectorAll(".card").forEach((e) => {
        e.addEventListener("click", async (item) => {
          let folder = item.currentTarget.dataset.folder;
          songs = await getSongs(`songs/${folder}`);

          // Ensure songs list is not empty before playing the first song
          if(songs.length > 0){
            playMusic(songs[0],false);
          }
        });
      });
    }, 100);
  } catch (error) {
    console.error("Error in fetching albums: ", error);
  }
}

async function main() {
  // get the list of all songs
  await getSongs("songs/ncs");
  playMusic(songs[0], true);

  // display all the albums on the page
  displayAlbums();

  //   attach an event listener to play next and previous songs
  play.addEventListener("click", () => {
    if (currentSong.paused) {
      currentSong.play();
      play.src = "pause.svg";
    } else {
      currentSong.pause();
      play.src = "play.svg";
    }
  });

  // Listen for the timeupdate event on the audio element
  currentSong.addEventListener("timeupdate", () => {
    // console.log(currentSong.currentTime, currentSong.currentduration);
    document.querySelector(".songtime").innerHTML = `${formatTime(
      currentSong.currentTime
    )}/${formatTime(currentSong.duration)}`;
    document.querySelector(".circle").style.left =
      (currentSong.currentTime / currentSong.duration) * 100 + "%";
  });
  
  //add event listner to previous and next buttons
  previous.addEventListener("click", () => {
    currentSong.pause();
    console.log("previous clicked");
    let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
    if (index - 1 >= 0) {
      playMusic(songs[index - 1]);
    }
    // handleNavigation(-1);
  });
  // next buttons
  next.addEventListener("click", () => {
    currentSong.pause();
    console.log("next clicked");
    let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
    if (index + 1 < songs.length) {
      playMusic(songs[index + 1]);
    }
    // handleNavigation(1);
  }); 

  // adding event listener to the seek bar
  document.querySelector(".seekbar").addEventListener("click", (e) => {
    let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
    document.querySelector(".circle").style.left = percent + "%";
    currentSong.currentTime = (currentSong.duration * percent) / 100;

    if (currentSong.paused) {
      currentSong.play();
      play.src = "pause.svg";
    }
  });

  // add event listner to hamburger
  document.querySelector(".hamburger").addEventListener("click", () => {
    document.querySelector(".left").style.left = "0";
  });

  // add event listner to close button
  document.querySelector(".close").addEventListener("click", () => {
    document.querySelector(".left").style.left = "-100%";
  });
}

// call the main function
main();
