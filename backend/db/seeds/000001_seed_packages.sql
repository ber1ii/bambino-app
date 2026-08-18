INSERT INTO packages (id, title, description, duration_minutes, price) VALUES
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Radni Dan', 'Zakup celog prostora i proslava rođendana od ponedeljka do četvrtka (2.5 sata).', 150, 120.00),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'Vikend', 'Zakup celog prostora i proslava rođendana petkom, subotom i nedeljom (2.5 sata).', 150, 150.00)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    duration_minutes = EXCLUDED.duration_minutes,
    price = EXCLUDED.price;