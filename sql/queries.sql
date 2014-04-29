-- Queries --

-- Get user --
SELECT id, email
    FROM RegisteredUser
    WHERE RegisteredUser.id = :id;
    
-- Get friends of user --
SELECT id, email
    FROM RegisteredUser
    WHERE RegisteredUser.id IN (
        SELECT idMember2
            FROM Friendship
            WHERE Friendship.idMember1 = :idUser
        )
    
-- Get all user debts --
SELECT id, idCreditor, registerDate, quantity
    FROM Debt
    WHERE Debt.idDebtor = :id AND Debt.resolved = :resolved
    ORDER BY Debt.registerDate ASC;
    
-- Get all user loans --
SELECT id, idDebtor, registerDate, quantity
    FROM Debt
    WHERE Debt.idCreditor = :id AND Debt.resolved = :resolved
    ORDER BY Debt.registerDate ASC;
    
-- Get user loan balance --
SELECT SUM(quantity)
    FROM Debt
    WHERE Debt.idCreditor = :id AND Debt.resolved = :resolved;
    
-- Get user debt balance --
SELECT SUM(quantity)
    FROM Debt
    WHERE Debt.idDebtor = :id AND Debt.resolved = :resolved;
    
--
    
-- Insert statements --

-----------
-- Users --
-----------

-- Create new user --
INSERT INTO RegisteredUser VALUES (:id, :passwordHash, :email);

-- Update user info --
UPDATE RegisteredUser SET passwordHash = :passwordHash, email = :email WHERE id = :id;

--

-----------
-- Debts --
-----------

-- Create new debt --
INSERT INTO Debt (idCreditor, idDebtor, quantity) VALUES (:idCreditor, :idDebtor, :quantity);

-- Resolve a debt --
UPDATE Debt SET resolved = true WHERE Debt.id = :id;

--

-----------------
-- Friendships --
-----------------

-- Create new friendship --
INSERT INTO Friendship (idMember1, idMember2) VALUES (:idMember1, :idMember2);

-- Delete friendship --
DELETE FROM Friendship WHERE Friendship.idMember1 = :idMember1 AND Friendship.idMember2 = :idMember2;

--
