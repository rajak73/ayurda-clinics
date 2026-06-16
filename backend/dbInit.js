const db = require("./db");

const initDatabase = async () => {
  const promiseDb = db.promise();
  console.log("Initializing MySQL database tables...");

  try {
    // 0. USERS TABLE
    await promiseDb.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        phone VARCHAR(50) NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 0.1. ADMINS TABLE
    await promiseDb.query(`
      CREATE TABLE IF NOT EXISTS admins (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL
      )
    `);

    // Seed default admin if empty
    const [adminCountRes] = await promiseDb.query("SELECT COUNT(*) as count FROM admins");
    if (adminCountRes[0].count === 0) {
      await promiseDb.query(`
        INSERT INTO admins (email, password) VALUES 
        ('admin@ayurda.com', '$2b$10$rVDm6KHKTyFR60CLnTdFqeYuLLkhqGpOqii.jW7pfR5PYXDQVjzwS')
      `);
      console.log("Seeded default admin successfully");
    }

    // 1. DOCTORS TABLE
    await promiseDb.query(`
      CREATE TABLE IF NOT EXISTS doctors (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        department VARCHAR(255) NOT NULL,
        qualification VARCHAR(255) NOT NULL,
        experience VARCHAR(255) NOT NULL,
        specialization VARCHAR(255) NOT NULL,
        image_url VARCHAR(500) NULL,
        available_time VARCHAR(255) NOT NULL,
        status VARCHAR(50) DEFAULT 'Active',
        availability VARCHAR(50) DEFAULT 'Available',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Ensure status, image_url, and availability columns exist (in case doctors table was created without them previously)
    const [doctorCols] = await promiseDb.query("SHOW COLUMNS FROM doctors");
    const doctorColNames = doctorCols.map((col) => col.Field);
    
    if (!doctorColNames.includes("status")) {
      await promiseDb.query("ALTER TABLE doctors ADD COLUMN status VARCHAR(50) DEFAULT 'Active'");
      console.log("Added status column to doctors table");
    }
    if (!doctorColNames.includes("image_url")) {
      await promiseDb.query("ALTER TABLE doctors ADD COLUMN image_url VARCHAR(500) NULL");
      console.log("Added image_url column to doctors table");
    }
    if (!doctorColNames.includes("availability")) {
      await promiseDb.query("ALTER TABLE doctors ADD COLUMN availability VARCHAR(50) DEFAULT 'Available'");
      console.log("Added availability column to doctors table");
    }

    // Seed doctors if empty
    const [doctors] = await promiseDb.query("SELECT COUNT(*) as count FROM doctors");
    if (doctors[0].count === 0) {
      await promiseDb.query(`
        INSERT INTO doctors (name, department, qualification, experience, specialization, available_time, status) VALUES
        ('Dr. Ananya Rao', 'Dermatology', 'MBBS, MD Dermatology', '8+ Years', 'Skin Allergy & Acne specialist', '10:00 AM - 01:00 PM', 'Active'),
        ('Dr. Ramesh Kumar', 'Dental Care', 'BDS, MDS', '10+ Years', 'Root Canal & Orthodontics', '02:00 PM - 05:00 PM', 'Active'),
        ('Dr. Priya Menon', 'IVF & Fertility', 'MBBS, MS, Fertility Specialist', '12+ Years', 'Reproductive Medicine & Counseling', '09:00 AM - 12:00 PM', 'Active'),
        ('Dr. Kiran Shah', 'Eye Care', 'MBBS, MS Ophthalmology', '9+ Years', 'Cataract & Lasik specialist', '04:00 PM - 07:00 PM', 'Active')
      `);
      console.log("Seed doctors table successfully");
    }

    // 0.5. APPOINTMENTS TABLE
    await promiseDb.query(`
      CREATE TABLE IF NOT EXISTS appointments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        patient_name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NULL,
        phone VARCHAR(50) NOT NULL,
        department VARCHAR(255) NOT NULL,
        preferred_date DATE NULL,
        preferred_time VARCHAR(50) NULL,
        message TEXT NULL,
        status VARCHAR(50) DEFAULT 'Pending',
        payment_status VARCHAR(50) DEFAULT 'Unpaid',
        razorpay_order_id VARCHAR(255) NULL,
        razorpay_payment_id VARCHAR(255) NULL,
        razorpay_signature VARCHAR(255) NULL,
        consultation_fee DECIMAL(10,2) DEFAULT 0.00,
        user_id INT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Ensure appointments table columns exist
    const [apptCols] = await promiseDb.query("SHOW COLUMNS FROM appointments");
    const apptColNames = apptCols.map((col) => col.Field);
    
    if (!apptColNames.includes("patient_name")) {
      if (apptColNames.includes("name")) {
        await promiseDb.query("ALTER TABLE appointments CHANGE COLUMN name patient_name VARCHAR(255) NOT NULL");
        console.log("Renamed column name to patient_name in appointments table");
      } else {
        await promiseDb.query("ALTER TABLE appointments ADD COLUMN patient_name VARCHAR(255) NOT NULL");
        console.log("Added patient_name column to appointments table");
      }
    }
    if (!apptColNames.includes("email")) {
      await promiseDb.query("ALTER TABLE appointments ADD COLUMN email VARCHAR(255) NULL");
      console.log("Added email column to appointments table");
    }
    if (!apptColNames.includes("consultation_fee")) {
      await promiseDb.query("ALTER TABLE appointments ADD COLUMN consultation_fee DECIMAL(10,2) DEFAULT 0.00");
      console.log("Added consultation_fee column to appointments table");
    }
    if (!apptColNames.includes("payment_status")) {
      await promiseDb.query("ALTER TABLE appointments ADD COLUMN payment_status VARCHAR(50) DEFAULT 'Unpaid'");
      console.log("Added payment_status column to appointments table");
    }
    if (!apptColNames.includes("razorpay_order_id")) {
      await promiseDb.query("ALTER TABLE appointments ADD COLUMN razorpay_order_id VARCHAR(255) NULL");
      console.log("Added razorpay_order_id column to appointments table");
    }
    if (!apptColNames.includes("razorpay_payment_id")) {
      await promiseDb.query("ALTER TABLE appointments ADD COLUMN razorpay_payment_id VARCHAR(255) NULL");
      console.log("Added razorpay_payment_id column to appointments table");
    }
    if (!apptColNames.includes("razorpay_signature")) {
      await promiseDb.query("ALTER TABLE appointments ADD COLUMN razorpay_signature VARCHAR(255) NULL");
      console.log("Added razorpay_signature column to appointments table");
    }
    if (!apptColNames.includes("user_id")) {
      await promiseDb.query("ALTER TABLE appointments ADD COLUMN user_id INT NULL");
      console.log("Added user_id column to appointments table");
    }

    // Add constraint separately if user_id was just added or not yet constrained
    try {
      await promiseDb.query("ALTER TABLE appointments ADD CONSTRAINT fk_appointment_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL");
      console.log("Added foreign key constraint fk_appointment_user to appointments table");
    } catch (fkErr) {
      // Ignore if constraint already exists
    }

    // 2. SERVICES TABLE
    await promiseDb.query(`
      CREATE TABLE IF NOT EXISTS services (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        icon_name VARCHAR(100) NOT NULL,
        overview TEXT NOT NULL,
        treatments TEXT NOT NULL, -- Stored as stringified JSON array
        when_to_visit TEXT NOT NULL, -- Stored as stringified JSON array
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Seed services if empty
    const [services] = await promiseDb.query("SELECT COUNT(*) as count FROM services");
    if (services[0].count === 0) {
      const initialServices = [
        {
          title: "Dental Care",
          icon_name: "Smile",
          overview: "Our dental care services focus on maintaining healthy teeth, gums, and smiles through preventive, restorative, and cosmetic dental treatments.",
          treatments: JSON.stringify([
            "Dental checkup and consultation",
            "Teeth cleaning and polishing",
            "Root canal treatment",
            "Tooth filling and restoration",
            "Dental crowns and bridges",
            "Smile correction guidance"
          ]),
          when_to_visit: JSON.stringify([
            "Tooth pain or sensitivity",
            "Bleeding gums",
            "Bad breath",
            "Cavity or broken tooth",
            "Routine dental checkup"
          ])
        },
        {
          title: "Dermatology",
          icon_name: "Sparkles",
          overview: "Our dermatology services help patients manage skin, hair, and cosmetic concerns with safe and personalized treatment guidance.",
          treatments: JSON.stringify([
            "Acne and pimple treatment",
            "Pigmentation and dark spot care",
            "Skin allergy consultation",
            "Hair fall consultation",
            "Fungal infection treatment",
            "General skin health guidance"
          ]),
          when_to_visit: JSON.stringify([
            "Acne or scars",
            "Skin rash or itching",
            "Hair fall",
            "Pigmentation",
            "Repeated skin infection"
          ])
        },
        {
          title: "IVF & Fertility",
          icon_name: "Baby",
          overview: "Our IVF and fertility care services provide confidential consultation, fertility evaluation, and treatment planning support for couples.",
          treatments: JSON.stringify([
            "Fertility consultation",
            "IVF treatment guidance",
            "Reproductive health counselling",
            "Couple fertility evaluation",
            "Treatment planning support",
            "Follow-up consultation"
          ]),
          when_to_visit: JSON.stringify([
            "Difficulty conceiving",
            "Irregular reproductive health concerns",
            "Previous failed pregnancy attempts",
            "Need fertility counselling",
            "Planning IVF consultation"
          ])
        },
        {
          title: "Eye Care",
          icon_name: "Eye",
          overview: "Our eye care services support patients with vision checkups, eye discomfort, redness, dryness, and general ophthalmology guidance.",
          treatments: JSON.stringify([
            "Eye checkup",
            "Vision screening",
            "Dry eye consultation",
            "Eye redness and irritation care",
            "General ophthalmology consultation",
            "Follow-up eye care guidance"
          ]),
          when_to_visit: JSON.stringify([
            "Blurred vision",
            "Eye redness",
            "Eye pain or irritation",
            "Dryness or watering",
            "Routine eye checkup"
          ])
        }
      ];

      for (const service of initialServices) {
        await promiseDb.query(
          "INSERT INTO services (title, icon_name, overview, treatments, when_to_visit) VALUES (?, ?, ?, ?, ?)",
          [service.title, service.icon_name, service.overview, service.treatments, service.when_to_visit]
        );
      }
      console.log("Seed services table successfully");
    }

    // 3. TESTIMONIALS TABLE
    await promiseDb.query(`
      CREATE TABLE IF NOT EXISTS testimonials (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        treatment VARCHAR(255) NOT NULL,
        rating INT NOT NULL,
        feedback TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Seed testimonials if empty
    const [testimonials] = await promiseDb.query("SELECT COUNT(*) as count FROM testimonials");
    if (testimonials[0].count === 0) {
      await promiseDb.query(`
        INSERT INTO testimonials (name, treatment, rating, feedback) VALUES
        ('Ravi Kumar', 'Dental Care', 5, 'I visited Ayurda Clinics for tooth pain. The doctor explained the issue clearly and the treatment process was very smooth.'),
        ('Sneha Reddy', 'Dermatology', 5, 'I consulted for acne and skin allergy. The dermatologist gave proper guidance and my skin improved with regular follow-up.'),
        ('Anonymous Patient', 'IVF & Fertility', 5, 'The consultation was handled with privacy and care. The doctor explained every step patiently and made us feel comfortable.'),
        ('Arjun Mehta', 'Eye Care', 4, 'I had eye redness and irritation. The consultation was quick, and the doctor guided me properly with treatment and precautions.'),
        ('Priya Sharma', 'Dental Care', 5, 'The clinic staff was polite and the appointment process was easy. I liked the clean environment and proper care.'),
        ('Meena Rao', 'Dermatology', 4, 'The doctor listened carefully and explained the skin treatment clearly. Overall, it was a good experience.')
      `);
      console.log("Seed testimonials table successfully");
    }

    // 4. SUCCESS STORIES TABLE
    await promiseDb.query(`
      CREATE TABLE IF NOT EXISTS success_stories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        department VARCHAR(255) NOT NULL,
        story TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Seed success stories if empty
    const [successStories] = await promiseDb.query("SELECT COUNT(*) as count FROM success_stories");
    if (successStories[0].count === 0) {
      await promiseDb.query(`
        INSERT INTO success_stories (title, department, story) VALUES
        ('Smooth Dental Treatment Experience', 'Dental Care', 'A patient visited with severe tooth pain and fear of treatment. After consultation and step-by-step explanation, the treatment was completed smoothly with proper follow-up guidance.'),
        ('Skin Care With Regular Follow-Up', 'Dermatology', 'A patient with repeated acne concerns received personalized skincare guidance, treatment plan, and follow-up support, helping them manage the condition better.'),
        ('Confidential Fertility Consultation', 'IVF & Fertility', 'A couple visited for fertility guidance. The clinic provided private consultation, clear explanation of possible options, and supportive counselling.')
      `);
      console.log("Seed success stories table successfully");
    }

    // 5. FAQS TABLE
    await promiseDb.query(`
      CREATE TABLE IF NOT EXISTS faqs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        dept VARCHAR(255) NOT NULL,
        q TEXT NOT NULL,
        a TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Seed FAQs if empty
    const [faqs] = await promiseDb.query("SELECT COUNT(*) as count FROM faqs");
    if (faqs[0].count === 0) {
      await promiseDb.query(`
        INSERT INTO faqs (dept, q, a) VALUES
        ('General', 'How can I book an appointment?', 'You can book an appointment by submitting the inquiry form on the Contact page or by using the WhatsApp chat button.'),
        ('General', 'Do I need to call before visiting the clinic?', 'It is recommended to book an appointment first so the clinic team can guide you about doctor availability and timing.'),
        ('General', 'What should I bring for my first visit?', 'Please carry any previous medical records, prescriptions, reports, and a valid contact number for appointment follow-up.'),
        ('Dental Care', 'How often should I visit a dentist?', 'A routine dental checkup every 6 months is generally recommended, but your dentist may suggest a different schedule based on your condition.'),
        ('Dental Care', 'Is root canal treatment painful?', 'Modern root canal treatment is usually done with local anesthesia, making the procedure much more comfortable for patients.'),
        ('Dermatology', 'When should I consult a dermatologist?', 'You should consult a dermatologist for acne, rashes, itching, pigmentation, hair fall, allergies, or recurring skin infections.'),
        ('Dermatology', 'Can hair fall be treated?', 'Hair fall can often be managed after identifying the cause. A dermatologist can suggest treatment based on your condition.'),
        ('IVF & Fertility', 'Is fertility consultation confidential?', 'Yes, fertility-related consultations are handled with privacy and confidentiality.'),
        ('IVF & Fertility', 'When should a couple visit a fertility specialist?', 'If pregnancy is not happening after regular attempts for a significant period, a fertility consultation can help identify possible next steps.'),
        ('Eye Care', 'When should I get an eye checkup?', 'You should get an eye checkup if you have blurred vision, redness, dryness, eye pain, irritation, or as part of routine health care.'),
        ('Eye Care', 'Can dry eyes be managed?', 'Yes, dry eyes can be managed with proper diagnosis, lifestyle changes, and treatment recommended by an eye specialist.')
      `);
      console.log("Seed FAQs table successfully");
    }

    // 6. NOTIFICATION LOGS TABLE
    await promiseDb.query(`
      CREATE TABLE IF NOT EXISTS notification_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NULL,
        notification_type VARCHAR(50) NOT NULL,
        event_type VARCHAR(50) NOT NULL,
        status VARCHAR(50) NOT NULL,
        error_message TEXT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log("Database initialized successfully!");

  } catch (error) {
    console.error("Database initialization failed:", error);
  }
};

module.exports = initDatabase;
