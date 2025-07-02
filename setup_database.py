#!/usr/bin/env python3
"""
Lavans Service App Database Setup Script
Initialiseert de SQLite database met schema en demo data
"""

import sqlite3
import os

def setup_database():
    """Setup de SQLite database"""
    
    # Database bestand
    db_file = "lavans.db"
    
    # Verwijder bestaande database als deze bestaat
    if os.path.exists(db_file):
        os.remove(db_file)
        print(f"Bestaande database {db_file} verwijderd")
    
    # Maak nieuwe database
    conn = sqlite3.connect(db_file)
    cursor = conn.cursor()
    
    print("Database schema aanmaken...")
    
    # Lees en voer SQL schema uit
    with open('database_setup.sql', 'r', encoding='utf-8') as f:
        sql_script = f.read()
    
    # Voer SQL uit
    cursor.executescript(sql_script)
    
    # Commit en sluit
    conn.commit()
    conn.close()
    
    print(f"Database {db_file} succesvol aangemaakt!")
    print("Demo data is toegevoegd voor ontwikkeling")

if __name__ == "__main__":
    setup_database() 