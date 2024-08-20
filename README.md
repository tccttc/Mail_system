This is the improved version of Harvard's CS50w assignment Project3, with a mailbox system and a redesigned UI.

If you want to have a try, please DO NOT use a real email address in registration, as it is an isolated email system with all the data stored in a sqlite database.

# Settings

Install Python (3.12.1) and Django (5.1) 
You can check your current version using the command `python --version` and `python -m django --version`

Then clone the repository:
```
git clone <link>
cd mail
```

Perform migration:
```
python manage.py makemigrations mail
python manage.py migrate
```

Finally run the server:
```
python manage.py runserver
```