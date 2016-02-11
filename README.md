Seating List System
=====================
 Seating list system for every conference in Academia Sinica International Conference Hall.


Install
----------
 1. Install MongoDB : [https://www.mongodb.org/][1]
 2. Install Node.js : [http://nodejs.org/][2]
 3. Install Redis : [http://redis.io/][3]
 4. PM2 : `npm install pm2 -g` [https://github.com/Unitech/pm2][4]
 5. Nginx : [http://nginx.org/][7]

Usage
----------
1.Download the code

	git clone https://github.com/TakeshiTseng/SitconSeatingChart.git

2.Install required packages

	npm install

3.Checkout the config and modify it. [Configuration document][5]

	cp config/config.js.sample config/config.js
	vim config/config.js # change it!

4.Start mongodb server

5.Start redis server

6.Start server

	pm2 start processes.json

7.Copy Nginx settings to nginx config directory and start Nginx

Custom my conference seating list system
----------------------------------------
See [styling page][6]

Contributing
------------

Feel free to send a pull request or issue to us.

Or send email to yi [at] takeshi.tw if you have any question.

  [1]: https://www.mongodb.org/
  [2]: http://nodejs.org/
  [3]: http://redis.io/
  [4]: https://github.com/Unitech/pm2
  [5]: https://github.com/TakeshiTseng/SitconSeatingChart/wiki/Configuration
  [6]: https://github.com/TakeshiTseng/SitconSeatingChart/wiki/Styling
  [7]: http://nginx.org/
