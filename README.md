This project uses grunt to compile the css and js.

It includes bootstrap sass files in the compiled css.

It also uses a vagrant server and the hostname spots.local

Has a companion api at https://github.com/moolric/spots-for-dogs-api

Uses Angular Logger MAX - https://github.com/IamAdamJowett/angular-logger-max

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


In your IDE

* run the grunt tasks sass and ngannotate

In your browser

* open spots.local
