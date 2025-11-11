@echo off
"C:\Program Files\PostgreSQL\16\bin\psql.exe" -h localhost -U postgres -d pradha_db -f create_checkout_tables.sql
pause