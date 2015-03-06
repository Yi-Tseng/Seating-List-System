Seating List System
=====================

Install
----------
 1. Install MongoDB : [https://www.mongodb.org/][1]
 2. Install Node.js : [http://nodejs.org/][2]
 3. Install Redis : [http://redis.io/][3]
 4. PM2 : `npm install pm2 -g` [https://github.com/Unitech/pm2][4]

Usage
----------
1.Download the code

	git clone https://github.com/TakeshiTseng/SitconSeatingChart.git

2.Install required packages

	npm install

3.Checkout the config and modify it.

	cp config/config.js.sample config/config.js
	vim config/config.js # change it!

4.Start mongodb server

5.Start redis server
    
6.Start server

	pm2 start app.js
    

  [1]: https://www.mongodb.org/
  [2]: http://nodejs.org/
  [3]: http://redis.io/
  [4]: https://github.com/Unitech/pm2
