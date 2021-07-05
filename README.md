[![Contributors][contributors-shield]][contributors-url]
[![Forks][forks-shield]][forks-url]
[![Stargazers][stars-shield]][stars-url]
[![Issues][issues-shield]][issues-url]
[![MIT License][license-shield]][license-url]
[![LinkedIn][linkedin-shield]][linkedin-url]



<!-- PROJECT LOGO -->
<br />
<p align="center">
  <a href="https://github.com/iamsanjaymalakar/node-ecommerce/">
    <img src="images/logo.png" alt="Logo" width="80" height="80">
  </a>

  <h3 align="center">eCommerce</h3>

  <p align="center">
    An eCommerce website created with NodeJS.
    <br />
    <a href="https://ecommerce99.herokuapp.com/">View Demo</a>
    <br>
    <a href="https://ecommerce99.herokuapp.com/">https://ecommerce99.herokuapp.com/</a>
  </p>
</p>



<!-- TABLE OF CONTENTS -->
<details open="open">
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#built-with">Built With</a></li>
      </ul>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#installation">Installation</a></li>
      </ul>
    </li>
    <li><a href="#contact">Contact</a></li>
    <li><a href="#acknowledgements">Acknowledgements</a></li>
  </ol>
</details>



<!-- ABOUT THE PROJECT -->
## About The Project

[![Product Name Screen Shot][product-screenshot]](https://ecommerce99.herokuapp.com/)

This was created while learning NodeJS from a Udemy course (NodeJS - The Complete Guide (MVC, REST APIs, GraphQL, Deno)). I learned
* NodeJS
* ExpressJS
* Templating Engines
* Routing
* Sequelize
* Mongoose
* Express Sessions
* Authentication
* Stripe

### Built With
* [NodeJS](https://nodejs.org)
* [Express.js](https://expressjs.com/)
* [Bootstrap](https://getbootstrap.com)

## Getting Started


### Prerequisites
* npm
  ```sh
  npm install npm@latest -g
  ```

### Installation

1. Get a free API Key for Stripe, SendGrid
2. Clone the repo
   ```sh
   git clone https://github.com/iamsanjaymalakar/node-ecommerce.git
   ```
3. Install NPM packages
   ```sh
   npm install
   ```
4. Setup your API keys for variables in `environtment_vars.txt`. I have used environment variables to set up my API keys.
   ```JS
   {
        "MONGO_USER": "xxxxxx",
        "MONGO_PASSWORD": "xxxxxxxxxxxx",
        "MONGO_DATABASE": "xxxxxxxxxxxx",
        "SESSION_SECRET": "xxxxxxxxxxxx",
        "STRIPE_KEY": "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
        "SENDGRID_API_KEY": "SG.xxxxxxxxxxxx.xxxxxx-xxxxxxxxxxxxxxxxxxxxxxxx"
    }
   ```
5. Run the project using npm
   ```sh
   npm start
   ``` 



<br>



<!-- CONTACT -->
## Contact

Sanjay Malakar - [@19malakar](https://twitter.com/19malakar) - iamsanjaymalakar@gmail.com

Project Link: [https://github.com/iamsanjaymalakar/node-ecommerce](https://github.com/iamsanjaymalakar/node-ecommerce)

<br>

<!-- ACKNOWLEDGEMENTS -->
## Acknowledgements
* [Udemy NodeJS course by Maximilian Schwarzmüller](https://www.udemy.com/course/nodejs-the-complete-guide/)


[contributors-shield]: https://img.shields.io/github/contributors/iamsanjaymalakar/node-ecommerce.svg?style=for-the-badge
[contributors-url]: https://github.com/iamsanjaymalakar/node-ecommerce/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/iamsanjaymalakar/node-ecommerce.svg?style=for-the-badge
[forks-url]: https://github.com/iamsanjaymalakar/node-ecommerce/network/members
[stars-shield]: https://img.shields.io/github/stars/iamsanjaymalakar/node-ecommerce.svg?style=for-the-badge
[stars-url]: https://github.com/iamsanjaymalakar/node-ecommerce/stargazers
[issues-shield]: https://img.shields.io/github/issues/iamsanjaymalakar/node-ecommerce.svg?style=for-the-badge
[issues-url]: https://github.com/iamsanjaymalakar/node-ecommerce/issues
[license-shield]: https://img.shields.io/github/license/iamsanjaymalakar/node-ecommerce.svg?style=for-the-badge
[license-url]: https://github.com/iamsanjaymalakar/node-ecommerceblob/master/LICENSE.txt
[linkedin-shield]: https://img.shields.io/badge/-LinkedIn-black.svg?style=for-the-badge&logo=linkedin&colorB=555
[linkedin-url]: https://linkedin.com/in/sanjaymalakar/
[product-screenshot]: images/ss.png
