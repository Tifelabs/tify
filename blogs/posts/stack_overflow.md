# The Stack Buffer Overflow

**Posted on November 25, 2025**

I was reading through some common buffer overflows in C, I found one which caught my interest,
This is the stack buffer overflow, If you are reading this I assume you know what a stack memory is,
Its is one of the most important aspect in the computer architecture,

> The Stack is region where data is being added or remove in
> LIFO style (Last In First Out),The stack also stores and remmembers all of the passed variables and functions. You can check out this for > > > more understanding --> [Stack info](https://stackoverflow.com/questions/79923/what-and-where-are-the-stack-and-heap)<br>

Back to main post, The stack buffer overflow will happen when we corrupt the memory to control the execution flow of the program. I wrote a simple password checker to demonstrate this process., Returns Access Granted If it the right one and returns Denied If its the wrong pass.

| Snippet|  Positve OUT| Negative OUT |
|----------|----------| ----------- |
| ![Passoword Snippet](./blog-images/pass.png) | ![Positive](./blog-images/positive.png) | ![Negative](./blog-images/negative.png)|

