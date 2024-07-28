//BLOG WRITING
const blogPosts = [ 
    {
    title: "Be Happy",
    date: "July 17, 2024",
    content: `
    The CEO and founder of <a href='https://elysianlabs.ai/'>Elysian Labs</a>, 
    <strong><em><a href='https://x.com/nearcyan'>Asara Near</a></em></strong>, 
    replied to my comment on his website. I found his 
    <a href='https://near.blog/productivity-tips/'>productivity tips</a> 
    to be incredibly insightful and valuable. His response truly made my day. 
    The world would be a better place if more engineers and developers were like Near.
    <br><br> 
    <img src='./assets/blog-img/near.png' alt='My chat with Near'>
    <br><br>
    My goal is to become a founder someday. I won't relent, I won't stop learning. Adios!
    `
},

{
    title: "Feeling Empty?",
    date: "July 17, 2024",
    content: 
    `I recently completed <strong><em>THE LAST OF US PART 2</em></strong> game last month, 
    but yet I still feel so empty, 
    I think about what's next on Ellie's path. She wanted to be loved and not being left alone.<br> 
    Perhaps she did a great thing by sparing Abby's Life and I believe this will make Joel happy
    <img src='./assets/blog-img/ellie.JPG' alt='ellie'>`
},

{
    title: "Logic Gates",
    date: "July 12, 2024",
    content: 
    `It has been a hectic day so far. Being away from my main desktop computer, 
    I decided to refresh my knowledge on <a href='https://en.wikipedia.org/wiki/Logic_gate'>logic gates</a> and basic computing concepts. 
    It was fun while learning, 
    and I got to know more about the influence of transistors in digital circuits.<br> 
    <img src='./assets/blog-img/crashcourse.JPG'> 
    <br> Understanding these fundamentals is crucial, as they are the building blocks of all modern electronic devices. 
    As I delved deeper, I explored the different types of <a href='https://en.wikipedia.org/wiki/Logic_gate'>logic gates</a> such as 
    <a href='https://en.wikipedia.org/wiki/AND_gate'>AND</a>, 
    <a href='https://en.wikipedia.org/wiki/OR_gate'>OR</a>, 
    <a href='https://en.wikipedia.org/wiki/NOT_gate'>NOT</a>, 
    <a href='https://en.wikipedia.org/wiki/NAND_gate'>NAND</a>, 
    <a href='https://en.wikipedia.org/wiki/NOR_gate'>NOR</a>, 
    <a href='https://en.wikipedia.org/wiki/XOR_gate'>XOR</a>, and 
    <a href='https://en.wikipedia.org/wiki/XNOR_gate'>XNOR</a>, and how they are used to perform various logical operations. 
    I also revisited how these <a href='https://en.wikipedia.org/wiki/Logic_gate'>logic gates</a> are combined to form complex circuits and how they are represented in truth tables. 
    Learning about how transistors act as switches and amplifiers in these <a href='https://en.wikipedia.org/wiki/Logic_gate'>logic gates</a> gave me a new appreciation for the intricate designs of microprocessors and other integrated circuits. 
    This refresher also reminded me of how essential this knowledge is for embedded programming and working with hardware like Raspberry Pis and Arduinos. 
    Despite the busy day, I'm glad I took the time to revisit this essential topic. 
    It's incredible how something so fundamental underpins all the technology we rely on daily.`    
},

{
    title : "Learning C",
    date :  "July 10, 2024",
    content: 
    `I decided to learn C once again after being taught it in my first year of university. 
    I believe it builds a solid foundation on how computers work and kindles creativity. 
    As someone who loves embedded programming, working with Raspberry Pis and Arduinos, 
    I am really happy to get the chance to learn C again. 
    Time to lock in!<br><br> <img src='./assets/blog-img/C.JPG' alt='Learning C'>`
},

{
    title: "Thank you Konan",
    date: "July 4, 2024",
    content: 
    `Are there still great people on Earth? Absolutely! I met <a href="https://x.com/GuilhermeKonan" target="_blank">@Konan</a> on Twitter, 
    and I really love his <a href="https://gmkonan.dev" target="_blank">website</a>. I decided to take a shot and ask him what font he uses. 
    He told me he uses JetBrains Mono font on his site. <br><br><img src="./assets/blog-img/1.PNG" alt='Screenshot of Konan's website'> <br><br> 
    I was thrilled to get a reply from him. He even offered to help me with my website and stays updated with my progress. 
    <br><br><img src="./assets/blog-img/2.PNG" alt='Another screenshot of Konan's website'> <br><br> Thanks, Konan!`
},
{
    title: 'SUBNETTING AND CIDR EXPLAINED',
    date: 'May 10, 2023',
    content: 
    `Hello Guys, In today’s module, We will be getting to know more about subnetting and CIDR Imagine you have a big box of candies,
    but you want to share them with your friends. You could just give them all the candies, but then you might run out quickly. 
    So instead, you decide to divide the candies into smaller groups, or sub-boxes, and give one sub-box to each friend.
    
    Subnetting is like dividing the candies into sub-boxes. It helps to organize a big group of devices, like computers, phones, or printers, into smaller sub-groups that can communicate with each other more efficiently. Each sub-group has its own unique address that is different from the others, just like each sub-box of candies has its own label.
    
    CIDR, or Classless Inter-Domain Routing, is a way of describing how many sub-groups, or sub-boxes, you want to create from a big group of addresses.
    It is like deciding how many candies you want to put in each sub-box. With CIDR, you can make more efficient use of IP addresses by using a variable-length prefix to specify the number of bits that will be used for the network portion of the address.
    
    In short, subnetting is dividing a big group of devices into smaller sub-groups, 
    and CIDR is a way of describing how many sub-groups you want to create from a big group of addresses.
    
    Subnetting: To subnet an IP address, you need to create a subnet mask that will determine the network and host portions of the address. 
    The subnet mask is a series of 1's and 0's that is used to divide the IP address into network and host portions.
    
    The formula for calculating the number of possible subnets is: Number of subnets = 2^(number of subnet bits). 
    For example, if you have an IP address of 192.168.1.0 and a subnet mask of 255.255.255.128, you have used 7 bits for the subnet portion of the address. So the number of possible subnets is: Number of subnets = 2^7 = 128. This means you can create up to 128 subnets from this IP address.
    
    CIDR: CIDR notation is a way of specifying an IP address and subnet mask in a compact form. It uses a slash (/) followed by the number of bits used for the network portion of the address.
    
    The formula for calculating the number of possible hosts per subnet is: Number of hosts per subnet = 2^(number of host bits) - 2. 
    For example, if you have an IP address of 192.168.1.0/24, the subnet mask is 255.255.255.0, and you have used 24 bits for the network portion. This means there are 8 bits left for the host portion, which gives you: Number of hosts per subnet = 2^8 - 2 = 254. This means you can have up to 254 hosts per subnet. The first and last IP addresses in the subnet are reserved for the network address and broadcast address, respectively, so they cannot be used as host addresses.
    
    In summary, subnetting involves dividing an IP address into smaller sub-groups, while CIDR is a way of specifying the number of bits used for the network portion of the address in a compact form. The formulas for calculating the number of possible subnets and hosts per subnet are useful for determining how to configure your network.`
},
{
    title: 'I am Tife!',
    date: 'May 9, 2023',
    content: 
    `Hello Guys, I am delighted to welcome you to my newsletter community and to have you on board as a valued subscriber. 
    My newsletter is designed to keep you up-to-date on the latest industry news, trends, and insights, as well as provide you with exclusive content and offers.
    
    I believe that my newsletter will be a valuable resource for you, 
    helping you stay informed and connected with the latest developments in your area of interest. 
    I look forward to sharing my expertise, knowledge, and insights with you and to hearing your thoughts and feedback along the way.
    
    Thank you for joining me, and welcome aboard!
    
    Best regards,
    Tife /TechWithTife`
}
];

const createPostElement = (post) => {
const postElement = document.createElement('article');
postElement.classList.add('blog-post');

postElement.innerHTML = `
    <h3>${post.title}</h3>
    <p><em>${post.date}</em></p>
    <p>${post.content}</p>
`;

return postElement;
};

document.addEventListener('DOMContentLoaded', () => {
const blogPostsContainer = document.getElementById('blog-posts');

blogPosts.forEach(post => {
    blogPostsContainer.appendChild(createPostElement(post));
});
});


////////// WHAT THE FUUUUUCKKKK!

//Clock Stuff
function updateClock() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');

    const currentTime = `${hours}:${minutes}:${seconds}`;
    document.getElementById('clock').textContent = currentTime;
}

setInterval(updateClock, 1000);
updateClock(); 


//Audio
// Wait for the DOM to be fully loaded
document.addEventListener("DOMContentLoaded", function() {
    // Get the play button element
    var playButton = document.getElementById('play-button');
    
    // Get the audio element
    var audio = document.getElementById('background-music');
    
    // Add a click event listener to the play button
    playButton.addEventListener('click', function() {
        // Toggle play/pause of the audio
        if (audio.paused) {
            audio.play();
        } else {
            audio.pause();
        }
    });
});


// SPOTIFYYYYY
// async function fetchNowPlaying() {
//     try {
//         const response = await fetch('/now-playing');
//         const data = await response.json();

//         console.log('Fetched data:', data);

//         if (data.error) {
//             console.error('Error:', data.error);
//             return;
//         }

//         // Update the DOM elements with the fetched data
//         document.getElementById('song-name').innerText = data.song_name || 'No song playing';
//         document.getElementById('artist-name').innerText = data.artist_name || '';
//         document.getElementById('album-art').src = data.album_art || './images/dog.jpg';

//         console.log('Updated DOM elements with song information');
//     } catch (error) {
//         console.error('Fetch error:', error);
//         document.getElementById('album-art').src = './images/dog.jpg';
//     }
// }

// // Fetch now playing information every 5 seconds
// setInterval(fetchNowPlaying, 5000);
// // Initial fetch
// fetchNowPlaying();

//
const clientId = '01a18b193c814e0f84090a7fd40570d4';
const redirectUri = 'http://localhost:3000/callback'; // Replace with your redirect URI
const scopes = 'user-read-currently-playing user-read-playback-state';

const authEndpoint = 'https://accounts.spotify.com/authorize';
const currentlyPlayingEndpoint = 'https://api.spotify.com/v1/me/player/currently-playing';

// Get the access token from the URL
function getTokenFromUrl() {
    const params = new URLSearchParams(window.location.hash.replace('#', ''));
    return params.get('access_token');
}

// Redirect to Spotify's authorization page
function redirectToSpotifyAuth() {
    const authUrl = `${authEndpoint}?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scopes)}&response_type=token`;
    window.location.href = authUrl;
}

// Function to get the currently playing song
async function getCurrentlyPlaying(token) {
    const response = await fetch(currentlyPlayingEndpoint, {
        headers: {
            'Authorization': 'Bearer ' + token
        }
    });
    if (response.status === 204) {
        return null; // No song currently playing
    }
    const data = await response.json();
    return data;
}

// Function to update the HTML with the song info
async function updateSongInfo(token) {
    const songData = await getCurrentlyPlaying(token);
    if (songData) {
        document.getElementById('album-art').src = songData.item.album.images[0].url;
        document.getElementById('song-name').innerText = songData.item.name;
        document.getElementById('artist-name').innerText = songData.item.artists.map(artist => artist.name).join(', ');
    } else {
        document.getElementById('album-art').src = './images/dog.jpg';
    }
}

document.getElementById('login-btn').addEventListener('click', redirectToSpotifyAuth);

// Update the song info every 5 seconds if the token is available
const token = getTokenFromUrl();
if (token) {
    setInterval(() => updateSongInfo(token), 5000);
    updateSongInfo(token);
}