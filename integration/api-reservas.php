<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Configuración de la base de datos (ajusta estos valores)
$db_host = 'localhost';
$db_name = 'tu_base_de_datos';
$db_user = 'tu_usuario';
$db_pass = 'tu_contraseña';

try {
    $pdo = new PDO("mysql:host=$db_host;dbname=$db_name;charset=utf8", $db_user, $db_pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Crear tablas si no existen
    createTablesIfNotExist($pdo);
    
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Error de conexión a la base de datos']);
    exit;
}

// Manejar diferentes endpoints según el método y parámetros
$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

if ($method === 'GET') {
    handleGetRequest($pdo, $action);
} elseif ($method === 'POST') {
    handlePostRequest($pdo, $action);
} else {
    http_response_code(405);
    echo json_encode(['error' => 'Método no permitido']);
}

function createTablesIfNotExist($pdo) {
    // Tabla de citas
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS appointments (
            id INT AUTO_INCREMENT PRIMARY KEY,
            client_name VARCHAR(255) NOT NULL,
            client_email VARCHAR(255) NOT NULL,
            client_phone VARCHAR(20) NOT NULL,
            title VARCHAR(255) NOT NULL,
            description TEXT,
            appointment_date DATE NOT NULL,
            appointment_time TIME NOT NULL,
            duration INT DEFAULT 60,
            status ENUM('scheduled', 'confirmed', 'completed', 'cancelled', 'no-show') DEFAULT 'scheduled',
            type ENUM('consultation', 'follow-up', 'document-review', 'signing', 'other') DEFAULT 'consultation',
            location ENUM('office', 'video-call', 'phone', 'client-location') DEFAULT 'office',
            notes TEXT,
            reminder_sent BOOLEAN DEFAULT FALSE,
            confirmation_sent BOOLEAN DEFAULT FALSE,
            source VARCHAR(50) DEFAULT 'web-booking',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    ");

    // Tabla de reglas de disponibilidad
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS availability_rules (
            id INT AUTO_INCREMENT PRIMARY KEY,
            day_of_week INT NOT NULL,
            start_time TIME NOT NULL,
            end_time TIME NOT NULL,
            slot_duration INT DEFAULT 60,
            break_time INT DEFAULT 0,
            is_active BOOLEAN DEFAULT TRUE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            UNIQUE KEY unique_day (day_of_week)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    ");

    // Tabla de excepciones de disponibilidad
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS availability_exceptions (
            id INT AUTO_INCREMENT PRIMARY KEY,
            exception_date DATE NOT NULL,
            type ENUM('unavailable', 'custom-hours') NOT NULL,
            reason VARCHAR(255) NOT NULL,
            start_time TIME NULL,
            end_time TIME NULL,
            is_active BOOLEAN DEFAULT TRUE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            UNIQUE KEY unique_date (exception_date)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    ");

    // Tabla de categorías de servicios
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS service_categories (
            id VARCHAR(36) PRIMARY KEY,
            name VARCHAR(255) NOT NULL UNIQUE,
            description TEXT,
            is_active BOOLEAN DEFAULT TRUE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    ");

    // Tabla de clientes
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS clients (
            id VARCHAR(36) PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            emails JSON NOT NULL,
            phones JSON NOT NULL,
            company VARCHAR(255),
            category VARCHAR(100),
            status ENUM('pending', 'in-progress', 'completed', 'cancelled', 'paid') DEFAULT 'pending',
            consultation_type VARCHAR(255),
            notes TEXT,
            ai_suggestions TEXT,
            drive_links JSON,
            key_dates JSON,
            priority ENUM('high', 'medium', 'low') DEFAULT 'medium',
            source VARCHAR(50),
            paid_in_cash BOOLEAN DEFAULT FALSE,
            whatsapp_history JSON,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            INDEX idx_name (name),
            INDEX idx_category (category),
            INDEX idx_status (status),
            INDEX idx_created_at (created_at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    ");

    // Insertar reglas por defecto si no existen
    $existingRules = $pdo->query("SELECT COUNT(*) FROM availability_rules")->fetchColumn();
    if ($existingRules == 0) {
        // Lunes a Viernes 9:00-18:00
        for ($day = 1; $day <= 5; $day++) {
            $pdo->prepare("
                INSERT INTO availability_rules (day_of_week, start_time, end_time, slot_duration, break_time, is_active)
                VALUES (?, '09:00:00', '18:00:00', 60, 0, 1)
            ")->execute([$day]);
        }
    }

    // Insertar categorías por defecto si no existen
    $existingCategories = $pdo->query("SELECT COUNT(*) FROM service_categories")->fetchColumn();
    if ($existingCategories == 0) {
        $defaultCategories = [
            ['1', 'IRNR'],
            ['2', 'Alta autónomo'],
            ['3', 'Certificado digital'],
            ['4', 'Informe específico']
        ];
        
        $stmt = $pdo->prepare("
            INSERT INTO service_categories (id, name, is_active, created_at)
            VALUES (?, ?, 1, NOW())
        ");
        
        foreach ($defaultCategories as $category) {
            $stmt->execute($category);
        }
    }
}

function handleGetRequest($pdo, $action) {
    switch ($action) {
        case 'availability':
            getAvailability($pdo);
            break;
        case 'available-dates':
            getAvailableDates($pdo);
            break;
        case 'time-slots':
            getTimeSlots($pdo);
            break;
        case 'categories':
            getServiceCategories($pdo);
            break;
        case 'clients':
            getClients($pdo);
            break;
        default:
            http_response_code(400);
            echo json_encode(['error' => 'Acción no válida']);
    }
}

function handlePostRequest($pdo, $action) {
    if (empty($action)) {
        // Crear nueva cita (comportamiento original)
        createAppointment($pdo);
    } else {
        switch ($action) {
            case 'save-client':
                saveClient($pdo);
                break;
            case 'sync-clients':
                syncClients($pdo);
                break;
            default:
                http_response_code(400);
                echo json_encode(['error' => 'Acción POST no válida']);
        }
    }
}

function getAvailability($pdo) {
    try {
        $rules = $pdo->query("
            SELECT day_of_week, start_time, end_time, slot_duration, break_time, is_active
            FROM availability_rules 
            WHERE is_active = 1
            ORDER BY day_of_week
        ")->fetchAll(PDO::FETCH_ASSOC);

        $exceptions = $pdo->query("
            SELECT exception_date, type, reason, start_time, end_time
            FROM availability_exceptions 
            WHERE is_active = 1 AND exception_date >= CURDATE()
            ORDER BY exception_date
        ")->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode([
            'success' => true,
            'rules' => $rules,
            'exceptions' => $exceptions
        ]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Error al obtener disponibilidad']);
    }
}

function getAvailableDates($pdo) {
    try {
        $days = $_GET['days'] ?? 30;
        $availableDates = [];
        
        $today = new DateTime();
        $endDate = (new DateTime())->add(new DateInterval('P' . $days . 'D'));
        
        // Obtener reglas de disponibilidad
        $rules = $pdo->query("
            SELECT day_of_week, start_time, end_time, slot_duration, break_time
            FROM availability_rules 
            WHERE is_active = 1
        ")->fetchAll(PDO::FETCH_ASSOC);
        
        $rulesMap = [];
        foreach ($rules as $rule) {
            $rulesMap[$rule['day_of_week']] = $rule;
        }
        
        // Obtener excepciones
        $exceptions = $pdo->prepare("
            SELECT exception_date, type, start_time, end_time
            FROM availability_exceptions 
            WHERE is_active = 1 AND exception_date BETWEEN ? AND ?
        ");
        $exceptions->execute([$today->format('Y-m-d'), $endDate->format('Y-m-d')]);
        $exceptionsMap = [];
        while ($exception = $exceptions->fetch(PDO::FETCH_ASSOC)) {
            $exceptionsMap[$exception['exception_date']] = $exception;
        }
        
        $current = clone $today;
        while ($current <= $endDate) {
            $dateString = $current->format('Y-m-d');
            $dayOfWeek = (int)$current->format('w'); // 0=domingo, 1=lunes...
            
            // Verificar si hay excepción
            if (isset($exceptionsMap[$dateString])) {
                if ($exceptionsMap[$dateString]['type'] === 'custom-hours') {
                    $availableDates[] = $dateString;
                }
                // Si es 'unavailable', no se agrega
            } else {
                // Verificar regla normal
                if (isset($rulesMap[$dayOfWeek])) {
                    $availableDates[] = $dateString;
                }
            }
            
            $current->add(new DateInterval('P1D'));
        }
        
        echo json_encode([
            'success' => true,
            'dates' => $availableDates
        ]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Error al obtener fechas disponibles']);
    }
}

function getTimeSlots($pdo) {
    try {
        $date = $_GET['date'] ?? '';
        if (!$date) {
            http_response_code(400);
            echo json_encode(['error' => 'Fecha requerida']);
            return;
        }
        
        $dateTime = new DateTime($date);
        $dayOfWeek = (int)$dateTime->format('w');
        
        // Verificar excepción para esta fecha
        $exception = $pdo->prepare("
            SELECT type, start_time, end_time
            FROM availability_exceptions 
            WHERE is_active = 1 AND exception_date = ?
        ");
        $exception->execute([$date]);
        $exceptionData = $exception->fetch(PDO::FETCH_ASSOC);
        
        if ($exceptionData && $exceptionData['type'] === 'unavailable') {
            echo json_encode(['success' => true, 'slots' => []]);
            return;
        }
        
        // Obtener regla para este día
        $rule = $pdo->prepare("
            SELECT start_time, end_time, slot_duration, break_time
            FROM availability_rules 
            WHERE is_active = 1 AND day_of_week = ?
        ");
        $rule->execute([$dayOfWeek]);
        $ruleData = $rule->fetch(PDO::FETCH_ASSOC);
        
        if (!$ruleData && !$exceptionData) {
            echo json_encode(['success' => true, 'slots' => []]);
            return;
        }
        
        // Usar horarios de excepción si existe, sino usar regla normal
        $startTime = $exceptionData['start_time'] ?? $ruleData['start_time'];
        $endTime = $exceptionData['end_time'] ?? $ruleData['end_time'];
        $slotDuration = $ruleData['slot_duration'] ?? 60;
        $breakTime = $ruleData['break_time'] ?? 0;
        
        // Obtener citas existentes para esta fecha
        $existingAppointments = $pdo->prepare("
            SELECT appointment_time
            FROM appointments 
            WHERE appointment_date = ? AND status NOT IN ('cancelled', 'no-show')
        ");
        $existingAppointments->execute([$date]);
        $bookedTimes = [];
        while ($appointment = $existingAppointments->fetch(PDO::FETCH_ASSOC)) {
            $bookedTimes[] = substr($appointment['appointment_time'], 0, 5); // HH:MM format
        }
        
        // Generar slots
        $slots = [];
        $currentTime = new DateTime($date . ' ' . $startTime);
        $endDateTime = new DateTime($date . ' ' . $endTime);
        
        while ($currentTime < $endDateTime) {
            $timeString = $currentTime->format('H:i');
            $slots[] = [
                'time' => $timeString,
                'available' => !in_array($timeString, $bookedTimes)
            ];
            
            $currentTime->add(new DateInterval('PT' . ($slotDuration + $breakTime) . 'M'));
        }
        
        echo json_encode([
            'success' => true,
            'slots' => $slots
        ]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Error al obtener horarios']);
    }
}

function createAppointment($pdo) {
    // Obtener datos del formulario
    $input = json_decode(file_get_contents('php://input'), true);

    if (!$input) {
        http_response_code(400);
        echo json_encode(['error' => 'Datos no válidos']);
        return;
    }

    // Validar campos requeridos
    $required_fields = ['clientName', 'clientEmail', 'clientPhone', 'title', 'appointmentDate', 'appointmentTime'];
    foreach ($required_fields as $field) {
        if (empty($input[$field])) {
            http_response_code(400);
            echo json_encode(['error' => "Campo requerido: $field"]);
            return;
        }
    }

    try {
        // Verificar que el slot esté disponible
        $checkSlot = $pdo->prepare("
            SELECT COUNT(*) FROM appointments 
            WHERE appointment_date = ? AND appointment_time = ? AND status NOT IN ('cancelled', 'no-show')
        ");
        $checkSlot->execute([$input['appointmentDate'], $input['appointmentTime']]);
        
        if ($checkSlot->fetchColumn() > 0) {
            http_response_code(409);
            echo json_encode(['error' => 'Este horario ya está ocupado']);
            return;
        }
        
        // Insertar nueva cita
        $stmt = $pdo->prepare("
            INSERT INTO appointments (
                client_name, client_email, client_phone, title, description,
                appointment_date, appointment_time, duration, status, type, location,
                notes, source, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
        ");
        
        $stmt->execute([
            $input['clientName'],
            $input['clientEmail'],
            $input['clientPhone'],
            $input['title'],
            $input['description'] ?? '',
            $input['appointmentDate'],
            $input['appointmentTime'],
            $input['duration'] ?? 60,
            $input['status'] ?? 'scheduled',
            $input['type'] ?? 'consultation',
            $input['location'] ?? 'office',
            $input['notes'] ?? '',
            $input['source'] ?? 'web-booking'
        ]);
        
        $appointmentId = $pdo->lastInsertId();
        
        // Enviar email de confirmación
        sendConfirmationEmail($input);
        
        echo json_encode([
            'success' => true,
            'message' => 'Cita creada exitosamente',
            'appointmentId' => $appointmentId
        ]);
        
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Error al crear la cita: ' . $e->getMessage()]);
    }
}

function sendConfirmationEmail($appointmentData) {
    $to = $appointmentData['clientEmail'];
    $subject = "✅ Confirmación de Cita - PGK Hiszpanii";
    
    $message = "
    <html>
    <head>
        <title>Confirmación de Cita</title>
        <style>
            body { font-family: Arial, sans-serif; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .details { background: white; padding: 20px; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; color: #666; margin-top: 30px; }
            .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 10px 0; }
        </style>
    </head>
    <body>
        <div class='container'>
            <div class='header'>
                <h1>¡Cita Confirmada!</h1>
                <p>Hemos recibido tu solicitud de cita</p>
            </div>
            
            <div class='content'>
                <h2>Hola " . htmlspecialchars($appointmentData['clientName']) . ",</h2>
                <p>Gracias por confiar en PGK Hiszpanii. Hemos recibido tu solicitud de cita y nos pondremos en contacto contigo pronto para confirmar todos los detalles.</p>
                
                <div class='details'>
                    <h3>Detalles de tu Cita:</h3>
                    <p><strong>Fecha:</strong> " . date('d/m/Y', strtotime($appointmentData['appointmentDate'])) . "</p>
                    <p><strong>Hora:</strong> " . $appointmentData['appointmentTime'] . "</p>
                    <p><strong>Tipo:</strong> " . ucfirst($appointmentData['type'] ?? 'consultation') . "</p>
                    <p><strong>Modalidad:</strong> " . ucfirst($appointmentData['location'] ?? 'office') . "</p>
                    <p><strong>Asunto:</strong> " . htmlspecialchars($appointmentData['title']) . "</p>
                    " . (!empty($appointmentData['description']) ? "<p><strong>Descripción:</strong> " . htmlspecialchars($appointmentData['description']) . "</p>" : "") . "
                </div>
                
                <h3>Próximos pasos:</h3>
                <ul>
                    <li>✅ Recibirás una llamada de confirmación en las próximas horas</li>
                    <li>📋 Prepararemos la documentación necesaria para tu consulta</li>
                    <li>📞 Si necesitas cambiar la cita, contáctanos con al menos 24h de antelación</li>
                </ul>
                
                <div style='text-align: center;'>
                    <a href='tel:+34XXXXXXXXX' class='button'>Llamar Ahora</a>
                    <a href='mailto:info@pgkhiszpanii.com' class='button'>Enviar Email</a>
                </div>
            </div>
            
            <div class='footer'>
                <p><strong>PGK Hiszpanii</strong><br>
                Tu socio de confianza para todos los trámites legales en España<br>
                📧 info@pgkhiszpanii.com | 📞 +34 XXX XXX XXX</p>
                <p style='font-size: 12px; color: #999;'>
                    Si no solicitaste esta cita, puedes ignorar este email o contactarnos para aclarar cualquier duda.
                </p>
            </div>
        </div>
    </body>
    </html>
    ";
    
    $headers = "MIME-Version: 1.0" . "\r\n";
    $headers .= "Content-type:text/html;charset=UTF-8" . "\r\n";
    $headers .= "From: PGK Hiszpanii <noreply@pgkhiszpanii.com>" . "\r\n";
    $headers .= "Reply-To: info@pgkhiszpanii.com" . "\r\n";
    
    // Enviar email al cliente
    mail($to, $subject, $message, $headers);
    
    // Enviar notificación al admin
    $adminEmail = 'info@pgkhiszpanii.com'; // Cambiar por tu email
    $adminSubject = "🔔 Nueva Cita Web - " . $appointmentData['clientName'];
    $adminMessage = "
    <h2>Nueva Cita Recibida</h2>
    <p><strong>Cliente:</strong> " . htmlspecialchars($appointmentData['clientName']) . "</p>
    <p><strong>Email:</strong> " . htmlspecialchars($appointmentData['clientEmail']) . "</p>
    <p><strong>Teléfono:</strong> " . htmlspecialchars($appointmentData['clientPhone']) . "</p>
    <p><strong>Fecha:</strong> " . date('d/m/Y', strtotime($appointmentData['appointmentDate'])) . "</p>
    <p><strong>Hora:</strong> " . $appointmentData['appointmentTime'] . "</p>
    <p><strong>Asunto:</strong> " . htmlspecialchars($appointmentData['title']) . "</p>
    " . (!empty($appointmentData['description']) ? "<p><strong>Descripción:</strong> " . htmlspecialchars($appointmentData['description']) . "</p>" : "") . "
    <p><em>Accede a tu CRM para gestionar esta cita.</em></p>
    ";
    
    mail($adminEmail, $adminSubject, $adminMessage, $headers);
}
?>

// Obtener datos del formulario
$input = json_decode(file_get_contents('php://input'), true);

if (!$input) {
    http_response_code(400);
    echo json_encode(['error' => 'Datos no válidos']);
    exit;
}

// Validar campos requeridos
$required_fields = ['clientName', 'clientEmail', 'clientPhone', 'title', 'appointmentDate', 'appointmentTime'];
foreach ($required_fields as $field) {
    if (empty($input[$field])) {
        http_response_code(400);
        echo json_encode(['error' => "Campo requerido: $field"]);
        exit;
    }
}

// Configuración de la base de datos (ajusta estos valores)
$db_host = 'localhost';
$db_name = 'tu_base_de_datos';
$db_user = 'tu_usuario';
$db_pass = 'tu_contraseña';

try {
    $pdo = new PDO("mysql:host=$db_host;dbname=$db_name;charset=utf8", $db_user, $db_pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Crear tabla si no existe
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS appointments (
            id INT AUTO_INCREMENT PRIMARY KEY,
            client_name VARCHAR(255) NOT NULL,
            client_email VARCHAR(255) NOT NULL,
            client_phone VARCHAR(50) NOT NULL,
            title VARCHAR(255) NOT NULL,
            description TEXT,
            appointment_date DATE NOT NULL,
            appointment_time TIME NOT NULL,
            duration INT DEFAULT 60,
            status ENUM('scheduled', 'confirmed', 'completed', 'cancelled', 'no-show') DEFAULT 'scheduled',
            type ENUM('consultation', 'follow-up', 'document-review', 'signing', 'other') NOT NULL,
            location ENUM('office', 'video-call', 'phone', 'client-location') NOT NULL,
            notes TEXT,
            reminder_sent BOOLEAN DEFAULT FALSE,
            confirmation_sent BOOLEAN DEFAULT FALSE,
            source VARCHAR(50) DEFAULT 'web-booking',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
    ");
    
    // Insertar nueva cita
    $stmt = $pdo->prepare("
        INSERT INTO appointments (
            client_name, client_email, client_phone, title, description,
            appointment_date, appointment_time, duration, type, location,
            source, notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'web-booking', ?)
    ");
    
    $stmt->execute([
        $input['clientName'],
        $input['clientEmail'],
        $input['clientPhone'],
        $input['title'],
        $input['description'] ?? '',
        $input['appointmentDate'],
        $input['appointmentTime'],
        $input['duration'] ?? 60,
        $input['type'],
        $input['location'],
        $input['notes'] ?? ''
    ]);
    
    $appointment_id = $pdo->lastInsertId();
    
    // Enviar email de confirmación (opcional)
    $to = $input['clientEmail'];
    $subject = 'Confirmación de Cita - PGK Hiszpanii';
    $message = "
        Estimado/a {$input['clientName']},
        
        Hemos recibido su solicitud de cita con los siguientes detalles:
        
        • Fecha: {$input['appointmentDate']}
        • Hora: {$input['appointmentTime']}
        • Tipo: {$input['type']}
        • Modalidad: {$input['location']}
        • Asunto: {$input['title']}
        
        Nos pondremos en contacto con usted pronto para confirmar los detalles.
        
        Saludos cordiales,
        Equipo PGK Hiszpanii
        www.pgkhiszpanii.com
    ";
    
    $headers = "From: noreply@pgkhiszpanii.com\r\n";
    $headers .= "Reply-To: info@pgkhiszpanii.com\r\n";
    $headers .= "Content-Type: text/plain; charset=UTF-8\r\n";
    
    mail($to, $subject, $message, $headers);
    
    // Respuesta exitosa
    echo json_encode([
        'success' => true,
        'message' => 'Cita reservada exitosamente',
        'appointment_id' => $appointment_id,
        'data' => $input
    ]);
    
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Error de base de datos: ' . $e->getMessage()]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Error interno: ' . $e->getMessage()]);
}

// Función para obtener categorías de servicios
function getServiceCategories($pdo) {
    try {
        $stmt = $pdo->prepare("
            SELECT id, name, description, is_active, created_at
            FROM service_categories 
            WHERE is_active = 1 
            ORDER BY name ASC
        ");
        $stmt->execute();
        $categories = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        echo json_encode([
            'success' => true,
            'categories' => $categories,
            'count' => count($categories)
        ]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'error' => 'Error al obtener categorías: ' . $e->getMessage()
        ]);
    }
}

// Función para obtener clientes
function getClients($pdo) {
    try {
        $stmt = $pdo->prepare("
            SELECT * FROM clients 
            ORDER BY created_at DESC
        ");
        $stmt->execute();
        $clients = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Convertir campos JSON
        foreach ($clients as &$client) {
            $client['emails'] = json_decode($client['emails'], true) ?: [];
            $client['phones'] = json_decode($client['phones'], true) ?: [];
            $client['drive_links'] = json_decode($client['drive_links'], true) ?: [];
            $client['key_dates'] = json_decode($client['key_dates'], true) ?: [];
            $client['whatsapp_history'] = json_decode($client['whatsapp_history'], true) ?: [];
        }
        
        echo json_encode([
            'success' => true,
            'clients' => $clients,
            'count' => count($clients)
        ]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'error' => 'Error al obtener clientes: ' . $e->getMessage()
        ]);
    }
}

// Función para guardar un cliente
function saveClient($pdo) {
    try {
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (!$input || !isset($input['id'], $input['name'])) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Datos de cliente incompletos']);
            return;
        }
        
        // Preparar datos JSON
        $emails = json_encode($input['emails'] ?? []);
        $phones = json_encode($input['phones'] ?? []);
        $driveLinks = json_encode($input['driveLinks'] ?? []);
        $keyDates = json_encode($input['keyDates'] ?? []);
        $whatsappHistory = json_encode($input['whatsappHistory'] ?? []);
        
        // Insertar o actualizar cliente
        $stmt = $pdo->prepare("
            INSERT INTO clients (
                id, name, emails, phones, company, category, status, 
                consultation_type, notes, ai_suggestions, drive_links, 
                key_dates, priority, source, paid_in_cash, whatsapp_history,
                created_at, updated_at
            ) VALUES (
                ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW()
            ) ON DUPLICATE KEY UPDATE
                name = VALUES(name),
                emails = VALUES(emails),
                phones = VALUES(phones),
                company = VALUES(company),
                category = VALUES(category),
                status = VALUES(status),
                consultation_type = VALUES(consultation_type),
                notes = VALUES(notes),
                ai_suggestions = VALUES(ai_suggestions),
                drive_links = VALUES(drive_links),
                key_dates = VALUES(key_dates),
                priority = VALUES(priority),
                source = VALUES(source),
                paid_in_cash = VALUES(paid_in_cash),
                whatsapp_history = VALUES(whatsapp_history),
                updated_at = NOW()
        ");
        
        $stmt->execute([
            $input['id'],
            $input['name'],
            $emails,
            $phones,
            $input['company'] ?? '',
            $input['category'] ?? '',
            $input['status'] ?? 'pending',
            $input['consultationType'] ?? '',
            $input['notes'] ?? '',
            $input['aiSuggestions'] ?? '',
            $driveLinks,
            $keyDates,
            $input['priority'] ?? 'medium',
            $input['source'] ?? 'crm',
            $input['paidInCash'] ? 1 : 0,
            $whatsappHistory,
            $input['createdAt'] ?? date('Y-m-d H:i:s')
        ]);
        
        echo json_encode(['success' => true, 'message' => 'Cliente guardado correctamente']);
        
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'error' => 'Error al guardar cliente: ' . $e->getMessage()
        ]);
    }
}

// Función para sincronizar múltiples clientes
function syncClients($pdo) {
    try {
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (!$input || !isset($input['clients']) || !is_array($input['clients'])) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Lista de clientes inválida']);
            return;
        }
        
        $pdo->beginTransaction();
        $savedCount = 0;
        
        foreach ($input['clients'] as $client) {
            if (!isset($client['id'], $client['name'])) continue;
            
            // Preparar datos JSON
            $emails = json_encode($client['emails'] ?? []);
            $phones = json_encode($client['phones'] ?? []);
            $driveLinks = json_encode($client['driveLinks'] ?? []);
            $keyDates = json_encode($client['keyDates'] ?? []);
            $whatsappHistory = json_encode($client['whatsappHistory'] ?? []);
            
            $stmt = $pdo->prepare("
                INSERT INTO clients (
                    id, name, emails, phones, company, category, status, 
                    consultation_type, notes, ai_suggestions, drive_links, 
                    key_dates, priority, source, paid_in_cash, whatsapp_history,
                    created_at, updated_at
                ) VALUES (
                    ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW()
                ) ON DUPLICATE KEY UPDATE
                    name = VALUES(name),
                    emails = VALUES(emails),
                    phones = VALUES(phones),
                    company = VALUES(company),
                    category = VALUES(category),
                    status = VALUES(status),
                    consultation_type = VALUES(consultation_type),
                    notes = VALUES(notes),
                    ai_suggestions = VALUES(ai_suggestions),
                    drive_links = VALUES(drive_links),
                    key_dates = VALUES(key_dates),
                    priority = VALUES(priority),
                    source = VALUES(source),
                    paid_in_cash = VALUES(paid_in_cash),
                    whatsapp_history = VALUES(whatsapp_history),
                    updated_at = NOW()
            ");
            
            $stmt->execute([
                $client['id'],
                $client['name'],
                $emails,
                $phones,
                $client['company'] ?? '',
                $client['category'] ?? '',
                $client['status'] ?? 'pending',
                $client['consultationType'] ?? '',
                $client['notes'] ?? '',
                $client['aiSuggestions'] ?? '',
                $driveLinks,
                $keyDates,
                $client['priority'] ?? 'medium',
                $client['source'] ?? 'crm',
                $client['paidInCash'] ? 1 : 0,
                $whatsappHistory,
                $client['createdAt'] ?? date('Y-m-d H:i:s')
            ]);
            
            $savedCount++;
        }
        
        $pdo->commit();
        
        echo json_encode([
            'success' => true, 
            'message' => "Se sincronizaron $savedCount clientes correctamente"
        ]);
        
    } catch (PDOException $e) {
        $pdo->rollBack();
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'error' => 'Error al sincronizar clientes: ' . $e->getMessage()
        ]);
    }
}
?>