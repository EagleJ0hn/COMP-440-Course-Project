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

DELIMITER //
-- Limits users to post at most two items per day
CREATE TRIGGER limit_two_items_per_day
BEFORE INSERT ON items
FOR EACH ROW
BEGIN
    DECLARE items_today INT;

    SELECT COUNT(*)
    INTO items_today
    FROM items
    WHERE sellerID = NEW.sellerID
      AND DATE(datePosted) = CURDATE();

    IF items_today >= 2 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'You can only post two items per day.';
    END IF;
END//

-- Prevents a user from reviewing their own item
CREATE TRIGGER prevent_own_item_review
BEFORE INSERT ON reviews
FOR EACH ROW
BEGIN
    DECLARE itemOwner VARCHAR(20);

    SELECT sellerID
    INTO itemOwner
    FROM items
    WHERE itemId = NEW.itemId;

    IF itemOwner = NEW.username THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'You cannot review your own item.';
    END IF;
END//

-- Prevents user from reviewing more than three items per day
CREATE TRIGGER limit_three_reviews_per_day
BEFORE INSERT ON reviews
FOR EACH ROW
BEGIN
    DECLARE reviews_today INT;

    SELECT COUNT(*)
    INTO reviews_today
    FROM reviews
    WHERE username = NEW.username
      AND DATE(reviewDate) = CURDATE();

    IF reviews_today >= 3 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'You can only submit three reviews per day.';
    END IF;
END//

-- Prevents reviews from being mocified
CREATE TRIGGER prevent_review_update
BEFORE UPDATE ON reviews
FOR EACH ROW
BEGIN
    SIGNAL SQLSTATE '45000'
    SET MESSAGE_TEXT = 'Reviews cannot be modified after submission.';
END//

DELIMITER ;