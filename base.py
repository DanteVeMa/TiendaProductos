#Crear el archivo requirements.txt

# Con el contenido pyodbc

import pyodbc

conn = pyodbc.connect('DRIVER={ODBC Driver 17 for SQL Server};'
                      'SERVER=vmpruebasEmerge;'
                      'DATABASE=TiendaDB;'
                      'Trusted_Connection=yes;')
cursor = conn.cursor()
cursor.execute("SELECT * FROM Categorias")
for row in cursor:
    print(row)