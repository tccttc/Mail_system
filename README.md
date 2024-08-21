This is the improved version of Harvard's CS50w assignment Project3, with a mailbox system and a redesigned UI.

If you want to have a try, please DO NOT use a real email address in registration, as it is an isolated email system with all the data stored in a sqlite database.

**Demostration video** (without Audio): https://youtu.be/5Eek-mgpYAA

# Settings

Install Python (3.12.1) and Django (5.1) 
You can check your current version using the command `python --version` and `python -m django --version`

Then clone the repository:
```
git clone https://github.com/tccttc/Mail_system.git
```
and open the folder.

You will need to perform migration first:
```
python manage.py makemigrations mail
python manage.py migrate
```

Finally run the server:
```
python manage.py runserver
```
Open in your browser: http://127.0.0.1:8000/
