-- Connect to PostgreSQL and create database
CREATE DATABASE pradha_db;

-- Connect to the new database and run the schema
\c pradha_db;

-- Run the schema from schema.sql file
\i schema.sql;