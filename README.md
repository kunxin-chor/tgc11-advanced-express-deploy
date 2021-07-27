# Installation steps

```
yarn install
```

And you have to re-create the database:

```
mysql -u root

CREATE USER 'foo'@'%' IDENTIFIED WITH mysql_native_password BY 'bar';
grant all privileges on *.* to 'foo'@'%';
FLUSH PRIVILEGES;

create database organic;

```

Run the migration once:
```
./db-migrate.sh up
```

If the `db-migrate.sh` is not working, you must add the execute permission to it:

```
chmod +x ./db-migrate.sh
```


# Blank .env file
You need to provide values for the settings below in your .env file:

```
CLOUDINARY_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
CLOUDINARY_UPLOAD_PRESET=
DB_DRIVER=
DB_USER=
DB_PASSWORD=
DB_DATABASE=
DB_HOST=
SESSION_SECRET=
STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_SUCCESS_URL=
STRIPE_ERROR_URL=
STRIPE_ENDPOINT_SECRET=
TOKEN_SECRET=
REFRESH_TOKEN_SECRET=
```
