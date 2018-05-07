log = require("log")

box.cfg {
  listen = 3301
}

box.once("bootstrap", 
  function()

    box.sql.execute([[
      CREATE TABLE users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email VARCHAR(128),
        password VARCHAR(64),
        role INTEGER,
        status INTEGER,
        created INTEGER
      )
    ]])

    box.sql.execute("CREATE UNIQUE INDEX user_email ON users (email);")

    box.sql.execute([[
      CREATE TABLE posts (
        id INTEGER PRIMARY KEY,
        author VARCHAR(16),
        permlink VARCHAR(256),
        created INTEGER
      )
    ]])

    box.sql.execute("CREATE UNIQUE INDEX post_author_permlink ON posts (author, permlink);")

    box.sql.execute([[
      CREATE TABLE complaints (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username VARCHAR(16),
        postId INTEGER,
        reason INTEGER,
        comment VARCHAR(256),
        created INTEGER,
        FOREIGN KEY (postId) REFERENCES posts (id)
      )
    ]])

    box.sql.execute("CREATE INDEX complaint_postId_reason ON complaints (postId, reason);")
    box.sql.execute("CREATE INDEX complaint_username ON complaints (username);")
    box.sql.execute("CREATE INDEX complaint_created ON complaints (created);")
    box.sql.execute("CREATE UNIQUE INDEX complaint_username_postId ON complaints (username, postId);")


    -- insert user: admin@domain.com / password 
    box.sql.execute([[
      INSERT INTO users VALUES(NULL, 'admin@domain.com', '$2b$10$HmMMiFfH8AY5CUm84MiLLOhTocKpHDCLlUO/BxJTt8Wb3Xd2S5mZK', 2, 1, 1525242582)
    ]])

    box.schema.user.grant('guest', 'read,write,execute', 'universe')
  end
)

log.info("Start app")

function sql(query)
  return box.sql.execute(query)
end