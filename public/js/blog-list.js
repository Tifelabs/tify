const blogPosts = [ 
    {
        title: "August!",
        date:"August 1, 2024"
    },
    {
        title: "Be Happy",
        date: "July 17, 2024"
    },
    {
        title: "Feeling Empty?",
        date: "July 17, 2024"
    },
    {
        title: "Logic Gates",
        date: "July 12, 2024"
    },
    {
        title: "Learning C",
        date: "July 10, 2024"
    },
    {
        title: "Thank you Konan",
        date: "July 4, 2024"
    },
    {
        title: 'SUBNETTING AND CIDR EXPLAINED',
        date: 'May 10, 2023'
    },
    {
        title: 'I am Tife!',
        date: 'May 9, 2023'
    }
];

const createBlogLink = (post, index) => {
    const postLink = document.createElement('a');
    postLink.href = `blog.html?post=${index}`; // Passing the index as a query parameter
    postLink.textContent = `${post.title} (${post.date})`;
    postLink.classList.add('blog-link');

    return postLink;
};

document.addEventListener('DOMContentLoaded', () => {
    const blogTitlesContainer = document.getElementById('blog-titles');

    blogPosts.forEach((post, index) => {
        const postLink = createBlogLink(post, index);
        const listItem = document.createElement('div');
        listItem.appendChild(postLink);
        blogTitlesContainer.appendChild(listItem);
    });
});
