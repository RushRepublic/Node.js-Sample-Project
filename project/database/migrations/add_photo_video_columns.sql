-- Run this ONCE on a database that was created before photo/video support.
-- (A brand-new database created from schema.sql already has these columns.)
-- Local: MySQL Workbench, select my_app_db first.  Hostinger: phpMyAdmin, SQL tab.

ALTER TABLE users
  ADD COLUMN photo VARCHAR(255) NULL AFTER email,
  ADD COLUMN video VARCHAR(255) NULL AFTER photo;
