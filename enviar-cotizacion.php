<?php
/**
 * Script de envío de cotizaciones listo para Hostinger (Email Corporativo).
 * Cuando subas la web a Hostinger:
 *   1. Cambia $CORREO_DESTINO y $CORREO_REMITENTE por tu correo corporativo de Hostinger.
 *   2. En script.js cambia: const FORM_MODE = 'hostinger';
 */
header('Content-Type: application/json; charset=UTF-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  http_response_code(405);
  echo json_encode(['ok' => false, 'message' => 'Método no permitido']);
  exit;
}

// Configura aquí el correo corporativo creado en Hostinger
$CORREO_DESTINO   = 'cotizaciones@tudominio.com';
$CORREO_REMITENTE = 'no-reply@tudominio.com';

$nombre   = trim($_POST['Nombre_o_Empresa']     ?? $_POST['Nombre o Empresa']     ?? '');
$correo   = trim($_POST['Correo_del_Cliente']   ?? $_POST['Correo del Cliente']   ?? '');
$telefono = trim($_POST['Teléfono_/_WhatsApp']  ?? $_POST['Teléfono / WhatsApp']  ?? '');
$interes  = trim($_POST['Área_de_Interés']      ?? $_POST['Área de Interés']      ?? '');
$mensaje  = trim($_POST['Detalles_del_Proyecto'] ?? $_POST['Detalles del Proyecto'] ?? 'Sin detalles adicionales');

if ($nombre === '' || !filter_var($correo, FILTER_VALIDATE_EMAIL)) {
  http_response_code(400);
  echo json_encode(['ok' => false, 'message' => 'Datos incompletos']);
  exit;
}

$asunto = "Nueva cotización web - {$nombre} ({$interes})";
$cuerpo = "Nueva solicitud recibida desde la web de Grupo Hi-Tech Ingeniería:\n\n"
        . "Nombre o Empresa: {$nombre}\n"
        . "Correo del Cliente: {$correo}\n"
        . "Teléfono / WhatsApp: {$telefono}\n"
        . "Área de Interés: {$interes}\n"
        . "Detalles del Proyecto:\n{$mensaje}\n";

$headers  = "From: Grupo Hi-Tech Web <{$CORREO_REMITENTE}>\r\n";
$headers .= "Reply-To: {$correo}\r\n";
$headers .= "Content-Type: text/plain; charset=UTF-8\r\n";

$enviado = mail($CORREO_DESTINO, $asunto, $cuerpo, $headers);

if ($enviado) {
  echo json_encode(['ok' => true]);
} else {
  http_response_code(500);
  echo json_encode(['ok' => false, 'message' => 'Error al enviar correo']);
}
