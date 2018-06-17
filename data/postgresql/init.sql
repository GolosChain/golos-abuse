-- Database generated with pgModeler (PostgreSQL Database Modeler).
-- pgModeler  version: 0.8.1
-- PostgreSQL version: 9.4
-- Project Site: pgmodeler.com.br
-- Model Author: ---


-- Database creation must be done outside an multicommand file.
-- These commands were put in this file only for convenience.
-- -- object: new_database | type: DATABASE --
-- -- DROP DATABASE IF EXISTS new_database;
-- CREATE DATABASE new_database
-- ;
-- -- ddl-end --
-- 

-- object: public.users | type: TABLE --
-- DROP TABLE IF EXISTS public.users CASCADE;
CREATE TABLE public.users(
	id serial NOT NULL,
	email varchar(256) NOT NULL,
	password varchar(60) NOT NULL,
	role smallint NOT NULL,
	status smallint NOT NULL,
	"createdAt" timestamp NOT NULL,
	"updatedAt" timestamp,
	CONSTRAINT users_primary_key PRIMARY KEY (id)

);
-- ddl-end --
ALTER TABLE public.users OWNER TO postgres;
-- ddl-end --

-- object: users_email_unique | type: INDEX --
-- DROP INDEX IF EXISTS public.users_email_unique CASCADE;
CREATE UNIQUE INDEX users_email_unique ON public.users
	USING btree
	(
	  email ASC NULLS LAST
	);
-- ddl-end --

-- object: public.posts | type: TABLE --
-- DROP TABLE IF EXISTS public.posts CASCADE;
CREATE TABLE public.posts(
	id integer NOT NULL,
	author varchar(256) NOT NULL,
	permlink varchar(256) NOT NULL,
	"createdAt" timestamp NOT NULL,
	CONSTRAINT posts_primary_key PRIMARY KEY (id)

);
-- ddl-end --
ALTER TABLE public.posts OWNER TO postgres;
-- ddl-end --

-- object: public.complaints | type: TABLE --
-- DROP TABLE IF EXISTS public.complaints CASCADE;
CREATE TABLE public.complaints(
	id serial NOT NULL,
	username varchar(256) NOT NULL,
	"postId" integer NOT NULL,
	reason smallint NOT NULL,
	comment varchar(256) NOT NULL,
	"createdAt" timestamp NOT NULL,
	CONSTRAINT complaints_primary_key PRIMARY KEY (id)

);
-- ddl-end --
ALTER TABLE public.complaints OWNER TO postgres;
-- ddl-end --

-- object: complaints_user_post_unique | type: INDEX --
-- DROP INDEX IF EXISTS public.complaints_user_post_unique CASCADE;
CREATE UNIQUE INDEX complaints_user_post_unique ON public.complaints
	USING btree
	(
	  username ASC NULLS LAST,
	  "postId" ASC NULLS LAST
	);
-- ddl-end --

-- object: complaints_posts_foreign_keys | type: CONSTRAINT --
-- ALTER TABLE public.complaints DROP CONSTRAINT IF EXISTS complaints_posts_foreign_keys CASCADE;
ALTER TABLE public.complaints ADD CONSTRAINT complaints_posts_foreign_keys FOREIGN KEY ("postId")
REFERENCES public.posts (id) MATCH FULL
ON DELETE NO ACTION ON UPDATE NO ACTION;
-- ddl-end --


