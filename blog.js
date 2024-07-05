const blogPosts = [{
        title: "Thank you Konan",
        date: "July 4, 2024",
        content: `Are there still great people on Earth? Absolutely! I met <a href="https://x.com/GuilhermeKonan" target="_blank">@Konan</a> on Twitter, and I really love his <a href="https://gmkonan.dev" target="_blank">website</a>. I decided to take a shot and ask him what font he uses. He told me he uses JetBrains Mono font on his site. <br><br><img src="public/Assets/images/1.PNG" height="400px" width="220px"> <br><br> I was thrilled to get a reply from him. He even offered to help me with my website and stays updated with my progress. <br><br><img src="public/Assets/images/2.PNG" height="400px" width="220px"> <br><br> Thanks, Konan!`
    },
    {
        title: 'SUBNETTING AND CIDR EXPLAINED',
        date: 'May 10, 2023',
        content: `Hello Guys, In today’s module, We will be getting to know more about subnetting and CIDR Imagine you have a big box of candies, but you want to share them with your friends. You could just give them all the candies, but then you might run out quickly. So instead, you decide to divide the candies into smaller groups, or sub-boxes, and give one sub-box to each friend.
        
        Subnetting is like dividing the candies into sub-boxes. It helps to organize a big group of devices, like computers, phones, or printers, into smaller sub-groups that can communicate with each other more efficiently. Each sub-group has its own unique address that is different from the others, just like each sub-box of candies has its own label.
        
        CIDR, or Classless Inter-Domain Routing, is a way of describing how many sub-groups, or sub-boxes, you want to create from a big group of addresses. It is like deciding how many candies you want to put in each sub-box. With CIDR, you can make more efficient use of IP addresses by using a variable-length prefix to specify the number of bits that will be used for the network portion of the address.
        
        In short, subnetting is dividing a big group of devices into smaller sub-groups, and CIDR is a way of describing how many sub-groups you want to create from a big group of addresses.
        
        Subnetting: To subnet an IP address, you need to create a subnet mask that will determine the network and host portions of the address. The subnet mask is a series of 1's and 0's that is used to divide the IP address into network and host portions.
        
        The formula for calculating the number of possible subnets is: Number of subnets = 2^(number of subnet bits). For example, if you have an IP address of 192.168.1.0 and a subnet mask of 255.255.255.128, you have used 7 bits for the subnet portion of the address. So the number of possible subnets is: Number of subnets = 2^7 = 128. This means you can create up to 128 subnets from this IP address.
        
        CIDR: CIDR notation is a way of specifying an IP address and subnet mask in a compact form. It uses a slash (/) followed by the number of bits used for the network portion of the address.
        
        The formula for calculating the number of possible hosts per subnet is: Number of hosts per subnet = 2^(number of host bits) - 2. For example, if you have an IP address of 192.168.1.0/24, the subnet mask is 255.255.255.0, and you have used 24 bits for the network portion of the address. This means there are 8 bits left for the host portion, which gives you: Number of hosts per subnet = 2^8 - 2 = 254. This means you can have up to 254 hosts per subnet. The first and last IP addresses in the subnet are reserved for the network address and broadcast address, respectively, so they cannot be used as host addresses.
        
        In summary, subnetting involves dividing an IP address into smaller sub-groups, while CIDR is a way of specifying the number of bits used for the network portion of the address in a compact form. The formulas for calculating the number of possible subnets and hosts per subnet are useful for determining how to configure your network.`
    },
    {
        title: 'I am Tife!',
        date: 'May 9, 2023',
        content: `Hello Guys, I am delighted to welcome you to my newsletter community and to have you on board as a valued subscriber. My newsletter is designed to keep you up-to-date on the latest industry news, trends, and insights, as well as provide you with exclusive content and offers.
        
        I believe that my newsletter will be a valuable resource for you, helping you stay informed and connected with the latest developments in your area of interest. I look forward to sharing my expertise, knowledge, and insights with you and to hearing your thoughts and feedback along the way.
        
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
