This project uses grunt to compile the css and js.

It includes bootstrap sass files in the compiled css.

It also uses a vagrant server and the hostname sonic.local.dev

You will need ruby, sass, grunt, vagrant and virtualbox installed before you start

# steps to get it running

In the command line


```
npm install
```
```
vagrant up
```
```
vagrant hostmanager
```
 (you may have to edit your host file manually)
```
vagrant ssh
```
```
cd /etc/apache2/sites-available
```
```
sudo nano 000-default.conf
```
This will open the file in nano. Change the Document Root from /var/www/html to /var/www/www


In your IDE

* run the grunt tasks sass and ngannotate

In your browser

* open sonic.local.dev