CREATE TABLE IF NOT EXISTS RegisteredUser {
    id varchar(20) NOT NULL,
    passwordHash varchar(64) NOT NULL,
    email varchar(254) NOT NULL
}

ALTER TABLE RegisteredUser ADD CONSTRAINT RegisteredUser_pk PRIMARY KEY (id);
ALTER TABLE RegisteredUser ADD CONSTRAINT RegisteredUser_email_uk UNIQUE (email);
ALTER TABLE RegisteredUser ADD CONSTRAINT RegisteredUser_email_check CHECK (email LIKE '%@%.%');
ALTER TABLE RegisteredUser ADD CONSTRAINT RegisteredUser_passwordHash_check CHECK (length(passwordHash) = 64);

CREATE TABLE IF NOT EXISTS Debt {
    id bigserial NOT NULL,
    idCreditor varchar(20) NOT NULL,
    idDebtor varchar(20) NOT NULL,
    registerDate date NOT NULL DEFAULT now(),
    quantity real NOT NULL,
    resolved boolean NOT NULL DEFAULT FALSE
}

ALTER TABLE Debt ADD CONSTRAINT Debt_pk PRIMARY KEY (id);
ALTER TABLE Debt ADD CONSTRAINT Debt_idCreditor FOREIGN KEY (idCreditor) REFERENCES RegisteredUser (id);
ALTER TABLE Debt ADD CONSTRAINT Debt_idDebtor FOREIGN KEY (idDebtor) REFERENCES RegisteredUser (id);
ALTER TABLE Debt Add CONSTRAINT Debt_quantity_check CHECK (quantity > 0);

CREATE TABLE IF NOT EXISTS Friendship {
    idMember1 bigint NOT NULL,
    idMember2 bigint NOT NULL,
    createDate timestamp NOT NULL DEFAULT now()
}

ALTER TABLE Friendship ADD CONSTRAINT Friendship_pk PRIMARY KEY (idMember1, idMember2);
ALTER TABLE Friendship ADD CONSTRAINT Friendship_idMember1_fk FOREIGN KEY (idMember1) REFERENCES RegisteredUser (id);
ALTER TABLE Friendship ADD CONSTRAINT Friendship_idMember2_fk FOREIGN KEY (idMember2) REFERENCES RegisteredUser (id);
