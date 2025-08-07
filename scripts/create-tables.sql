-- Create Kirim table
CREATE TABLE kirim_data (
    id SERIAL PRIMARY KEY,
    korxona_nomi VARCHAR(255) NOT NULL,
    inn VARCHAR(50) NOT NULL,
    tel_raqami VARCHAR(20),
    ismi VARCHAR(255),
    xizmat_turi VARCHAR(255),
    filial_nomi VARCHAR(255) NOT NULL,
    xodim VARCHAR(255),
    oldingi_oylar_soni INTEGER DEFAULT 0,
    oldingi_oylar_summasi BIGINT DEFAULT 0,
    bir_oylik_hisoblangan_summa BIGINT DEFAULT 0,
    jami_qarz_dorlik BIGINT DEFAULT 0,
    tolandi_jami BIGINT DEFAULT 0,
    tolandi_naqd BIGINT DEFAULT 0,
    tolandi_prechisleniya BIGINT DEFAULT 0,
    tolandi_karta BIGINT DEFAULT 0,
    qoldiq BIGINT DEFAULT 0,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Chiqim table
CREATE TABLE chiqim_data (
    id SERIAL PRIMARY KEY,
    sana VARCHAR(20) NOT NULL,
    nomi VARCHAR(255) NOT NULL,
    filial_nomi VARCHAR(255) NOT NULL,
    chiqim_nomi VARCHAR(255) NOT NULL,
    avvalgi_oylardan BIGINT DEFAULT 0,
    bir_oylik_hisoblangan BIGINT DEFAULT 0,
    jami_hisoblangan BIGINT DEFAULT 0,
    tolangan BIGINT DEFAULT 0,
    qoldiq_qarz_dorlik BIGINT DEFAULT 0,
    qoldiq_avans BIGINT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Notifications table
CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    date DATE NOT NULL,
    is_recurring BOOLEAN DEFAULT true,
    frequency VARCHAR(20) DEFAULT 'monthly',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert sample data for Kirim
INSERT INTO kirim_data (
    korxona_nomi, inn, tel_raqami, ismi, xizmat_turi, filial_nomi, xodim,
    oldingi_oylar_soni, oldingi_oylar_summasi, bir_oylik_hisoblangan_summa,
    jami_qarz_dorlik, tolandi_jami, tolandi_naqd, tolandi_prechisleniya,
    tolandi_karta, qoldiq
) VALUES 
('Guliston Savdo', '200048056', '+998 91 234-56-78', 'Karimova Nargiza', 'Buxgalteriya hisobi', 'Samarqand filiali', 'Qosimov Alim', 2, 500000, 1000000, 1500000, 800000, 300000, 500000, 0, 700000),
('Buxgalteriya hisobi', '123456789', '+998 90 123-45-67', 'Aliyev Vali', 'Buxgalteriya hisobi', 'Toshkent filiali', 'Halimov Obit', 0, 0, 750000, 750000, 750000, 750000, 0, 0, 0);

-- Insert sample data for Chiqim
INSERT INTO chiqim_data (
    sana, nomi, filial_nomi, chiqim_nomi, avvalgi_oylardan,
    bir_oylik_hisoblangan, jami_hisoblangan, tolangan,
    qoldiq_qarz_dorlik, qoldiq_avans
) VALUES 
('25/07/2024', 'Ali', 'Toshkent filiali', 'Ish haqi', 200000, 8000000, 8200000, 8500000, 0, 300000),
('10/06/2024', 'Vali', 'Samarqand filiali', 'Ijara to''lovi', 500000, 7500000, 8000000, 7000000, 1000000, 0),
('01/07/2024', 'Sami', 'Toshkent filiali', 'Kommunal xarajatlar', 0, 6500000, 6500000, 6500000, 0, 0),
('15/05/2024', 'Soli', 'Samarqand filiali', 'Transport xarajatlari', 0, 5000000, 5000000, 5500000, 0, 500000);

-- Insert sample notifications
INSERT INTO notifications (title, message, date, is_recurring, frequency, is_active) VALUES 
('Ijara to''lovi', 'Ijara pulini to''lashni unutmang', '2024-02-01', true, 'monthly', true),
('Kommunal xizmatlar', 'Kommunal xizmatlar uchun to''lov qiling', '2024-02-01', true, 'monthly', true);

-- Enable Row Level Security (RLS)
ALTER TABLE kirim_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE chiqim_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Create policies to allow all operations (you can make this more restrictive later)
CREATE POLICY "Allow all operations on kirim_data" ON kirim_data FOR ALL USING (true);
CREATE POLICY "Allow all operations on chiqim_data" ON chiqim_data FOR ALL USING (true);
CREATE POLICY "Allow all operations on notifications" ON notifications FOR ALL USING (true);
