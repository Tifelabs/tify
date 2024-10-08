// blog.js

// Array of blog posts
const blogs = [
   {
        id: 1,
        title: "August!",
        date:"August 1,2024",
        content: 
        `Time goes by so quickly, but in any case, I'm glad that a new month has finally arrived. Moreoever, I'm  glad that my birthday is just 29 days away.
        I made a commitment to myself this month to become better, seek clarity, and practice mindfulness. 
        Nevertheless Strive hard to learn the stuff I need to Learn.
        <br>
        <img src='./assets/blog-img/aug.JPG' alt="flowers">

        <strong><em>Be good August!, Happy New Month!</em></strong>
        `
    },
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
    My goal is to become a founder someday. I won't relent, I won't stop learning. <strong><em>Adios!</em></strong>
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
    For example, 
    if you have an IP address of 192.168.1.0/24, the subnet mask is 255.255.255.0, and you have used 24 bits for the network portion. This means there are 8 bits left for the host portion, which gives you: Number of hosts per subnet = 2^8 - 2 = 254. This means you can have up to 254 hosts per subnet. The first and last IP addresses in the subnet are reserved for the network address and broadcast address, respectively, so they cannot be used as host addresses.
    
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

// Function to display the list of blogs
function displayBlogList() {
    const blogList = document.getElementById('blog-list');
    blogList.innerHTML = '';

    blogs.forEach(blog => {
        const blogItem = document.createElement('div');
        blogItem.classList.add('blog-item');
        blogItem.innerHTML = `<h3 onclick="viewBlog(${blog.id})">${blog.title}</h3><p>${blog.date}</p>`;
        blogList.appendChild(blogItem);
    });
}

// Function to display the selected blog content
function viewBlog(blogId) {
    const blog = blogs.find(b => b.id === blogId);

    if (blog) {
        document.getElementById('blog-title').innerText = blog.title;
        document.getElementById('blog-date').innerText = blog.date;
        document.getElementById('blog-body').innerText = blog.content;

        document.getElementById('blog-list').style.display = 'none';
        document.getElementById('blog-content').style.display = 'block';
    }
}

// Function to go back to the blog list
function goBack() {
    document.getElementById('blog-list').style.display = 'block';
    document.getElementById('blog-content').style.display = 'none';
}

// Initial display of blog list when the page loads
document.addEventListener('DOMContentLoaded', displayBlogList);
