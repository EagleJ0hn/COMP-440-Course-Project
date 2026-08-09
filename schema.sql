create table users(
	username varchar(20) not null,
    hashedPassword varchar(255) not null,
    firstName varchar(50) not null,
    lastName varchar(50) not null,
    email varchar(255) not null unique,
    phone varchar(10) not null unique,
    primary key (username)
);

create table items(
    itemId int auto_increment primary key,
    itemTitle varchar(100) not null,
    itemDescription text,
    itemPrice decimal(10,2) not null,
    datePosted timestamp default current_timestamp,
    sellerID varchar(20) not null,
    Foreign key (sellerID) references users(username)
);

create table categories(
    categoryId int auto_increment primary key,
    categoryName varchar(100) not null unique
);

create table item_categories(
    itemId int not null,
    categoryId int not null,
    primary key (itemId, categoryId),
    foreign key (itemId) references items(itemId),
    foreign key (categoryId) references categories(categoryId)
); 

CREATE TABLE reviews(
    reviewId int auto_increment primary key,
    username varchar(20) not null,
    itemId int not null,
    rating enum('Excellent', 'Good', 'Fair', 'Poor') not null,
    comment varchar(500) not null,
    reviewDate timestamp default current_timestamp,
    Foreign Key (username) REFERENCES users(username),
    Foreign Key (itemId) REFERENCES items(itemId),
    unique (username, itemId)
);

