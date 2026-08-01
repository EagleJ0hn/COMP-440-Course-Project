create table users(
	username varchar(20) not null,
    hashedPassword varchar(255) not null,
    firstName varchar(50) not null,
    lastName varchar(50) not null,
    email varchar(255) not null unique,
    phone varchar(10) not null unique,
    primary key (username)
);