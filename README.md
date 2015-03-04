Seating List System
=====================

Install
----------
 1. Install MongoDB : [https://www.mongodb.org/][1]
 2. Install Node.js : [http://nodejs.org/][2]
 3. git

Usage
----------
1.Download the code

	git clone https://github.com/TakeshiTseng/SitconSeatingChart.git

2.Install required packages

	npm install

3.Checkout the config and modify it.

	cp config/config.js.sample config/config.js
	vim config/config.js # change it!

4.Start mongo db server

	./mongod
    
5.Start server

	node app.js
    

  [1]: https://www.mongodb.org/
  [2]: http://nodejs.org/
