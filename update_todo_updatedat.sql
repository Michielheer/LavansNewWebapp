-- Update bestaande TodoItems om UpdatedAt kolom in te vullen
UPDATE TodoItems SET UpdatedAt = CreatedAt WHERE UpdatedAt IS NULL; 