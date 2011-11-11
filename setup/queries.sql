-- All Time Pour Amounts
select u.name, u.id, sum(p.amount) as totalAmount
  from User u, KegPours p
  where u.id = p.userId
  group by u.id
  order by totalAmount desc;

-- Keg Pour Amounts
select u.name, u.id, sum(p.amount) as totalAmount
  from User u, KegPours p, Keg k
  where
          u.id = p.userId and
          p.kegId =
                  (select inKeg.id
                    from Keg inKeg
                    order by inKeg.loaded
                          desc limit 1)
  group by u.id
  order by totalAmount desc;

-- Das Boot
select u.name, u.id from User u, KegPours p
  where u.id = p.userId and p.amount > 10
  group by u.id;

-- Just Topping Off
select u.name, u.id from User u, KegPours p
  where u.id = p.userId and p.amount < 2
  group by u.id;

-- Early bird
select u.name, u.id from User u, KegPours p
  where u.id = p.userId and time(p.poured) < '6:00:00'
  group by u.id;

-- Night Owl
select u.name, u.id from User u, KegPours p
  where u.id = p.userId and time(p.poured) > '11:00:00'
  group by u.id;

-- Weekend Warrior
select u.id, u.name from User u, KegPours p
  where u.id = p.userId and (date(p.poured) = date(p.poured, 'weekday 0') or date(p.poured) = date(p.poured, 'weekday 6'))
  group by u.id;