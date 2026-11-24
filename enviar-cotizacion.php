<?php
/**
 * Envío de cotizaciones con plantilla HTML corporativa de Grupo Hi-Tech Ingeniería.
 * Listo para producción en Hostinger:
 *   1. Cambia $CORREO_DESTINO y $CORREO_REMITENTE por tus correos corporativos de Hostinger.
 *   2. En script.js cambia: const FORM_MODE = 'hostinger'; y elimina WEB3FORMS_KEY.
 */
header('Content-Type: application/json; charset=UTF-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  http_response_code(405);
  echo json_encode(['ok' => false, 'message' => 'Método no permitido']);
  exit;
}

// Correos corporativos oficiales de Grupo Hi-Tech Ingeniería en Hostinger
$CORREO_DESTINO   = 'Administracion@grupohiteching.com, Lvelasquez@grupohiteching.com';
$CORREO_REMITENTE = 'Administracion@grupohiteching.com';

$nombre   = trim($_POST['Empresa_/_Cliente']     ?? $_POST['Empresa / Cliente']     ?? '');
$correo   = trim($_POST['Correo_Electronico']    ?? $_POST['Correo Electronico']    ?? '');
$telefono = trim($_POST['Telefono_/_WhatsApp']   ?? $_POST['Telefono / WhatsApp']   ?? '');
$interes  = trim($_POST['Area_de_Interes']       ?? $_POST['Area de Interes']       ?? '');
$mensaje  = trim($_POST['Detalles_del_Proyecto'] ?? $_POST['Detalles del Proyecto'] ?? 'Sin detalles adicionales');
$fecha    = date('d/m/Y h:i A');

if ($nombre === '' || !filter_var($correo, FILTER_VALIDATE_EMAIL)) {
  http_response_code(400);
  echo json_encode(['ok' => false, 'message' => 'Datos incompletos']);
  exit;
}

$e = fn($v) => htmlspecialchars($v, ENT_QUOTES, 'UTF-8');
$telSoloDigitos = preg_replace('/[^\d]/', '', $telefono);
$waUrl = $telSoloDigitos ? "https://wa.me/{$telSoloDigitos}" : '#';

$asunto = "=?UTF-8?B?" . base64_encode("Nueva Cotización Web | {$nombre} - {$interes}") . "?=";

$html = '<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:24px;background:#f2f7f9;font-family:Arial,Helvetica,sans-serif;color:#1b2b33;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:620px;margin:0 auto;background:#ffffff;border-radius:14px;overflow:hidden;border:1px solid #d9e6ec;">
    <tr>
      <td style="background:#034550;padding:28px 32px;border-bottom:5px solid #2ac0d5;">
        <div style="font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#2ac0d5;font-weight:bold;margin-bottom:6px;">
          SOLICITUD DESDE SITIO WEB OFICIAL
        </div>
        <h1 style="margin:0;font-size:22px;color:#ffffff;font-weight:700;">
          GRUPO HI-TECH INGENIERÍA
        </h1>
        <div style="font-size:13px;color:rgba(255,255,255,0.82);margin-top:4px;">
          Refrigeración Comercial e Industrial · Equipamiento Retail
        </div>
      </td>
    </tr>
    <tr>
      <td style="padding:28px 32px;">
        <p style="margin:0 0 18px;font-size:14px;color:#5d717c;">
          Se ha recibido una nueva solicitud de cotización el <strong>' . $e($fecha) . '</strong>:
        </p>
        <table role="presentation" width="100%" cellspacing="0" cellpadding="10" style="border-collapse:collapse;font-size:14px;">
          <tr style="border-bottom:1px solid #e6eff3;">
            <td style="width:38%;color:#5d717c;font-weight:bold;">Empresa / Cliente</td>
            <td style="color:#034550;font-weight:bold;">' . $e($nombre) . '</td>
          </tr>
          <tr style="border-bottom:1px solid #e6eff3;">
            <td style="color:#5d717c;font-weight:bold;">Correo Electrónico</td>
            <td><a href="mailto:' . $e($correo) . '" style="color:#0f7688;text-decoration:none;font-weight:bold;">' . $e($correo) . '</a></td>
          </tr>
          <tr style="border-bottom:1px solid #e6eff3;">
            <td style="color:#5d717c;font-weight:bold;">Teléfono / WhatsApp</td>
            <td style="color:#1b2b33;font-weight:bold;">' . $e($telefono) . '</td>
          </tr>
          <tr style="border-bottom:1px solid #e6eff3;">
            <td style="color:#5d717c;font-weight:bold;">Área de Interés</td>
            <td><span style="display:inline-block;background:#e5f7fa;color:#034550;padding:4px 12px;border-radius:99px;font-weight:bold;font-size:13px;">' . $e($interes) . '</span></td>
          </tr>
          <tr>
            <td style="color:#5d717c;font-weight:bold;vertical-align:top;">Detalles del Proyecto</td>
            <td style="color:#1b2b33;line-height:1.5;">' . nl2br($e($mensaje)) . '</td>
          </tr>
        </table>

        <div style="margin-top:26px;text-align:center;">
          <a href="' . $e($waUrl) . '" style="display:inline-block;background:#25d366;color:#ffffff;text-decoration:none;padding:12px 22px;border-radius:8px;font-weight:bold;font-size:14px;margin:4px;">
            Responder por WhatsApp
          </a>
          <a href="mailto:' . $e($correo) . '?subject=' . rawurlencode("Cotización Grupo Hi-Tech Ingeniería - {$interes}") . '" style="display:inline-block;background:#034550;color:#ffffff;text-decoration:none;padding:12px 22px;border-radius:8px;font-weight:bold;font-size:14px;margin:4px;">
            Responder por Correo
          </a>
        </div>
      </td>
    </tr>
    <tr>
      <td style="background:#022a31;padding:16px 32px;text-align:center;font-size:12px;color:rgba(255,255,255,0.75);">
        Grupo Hi-Tech Ingeniería · Santa Mónica, Caracas · Cobertura Nacional
      </td>
    </tr>
  </table>
</body>
</html>';

$headers  = "MIME-Version: 1.0\r\n";
$headers .= "Content-Type: text/html; charset=UTF-8\r\n";
$headers .= "From: Grupo Hi-Tech Ingeniería <{$CORREO_REMITENTE}>\r\n";
$headers .= "Reply-To: {$correo}\r\n";

$enviado = mail($CORREO_DESTINO, $asunto, $html, $headers);

if ($enviado) {
  echo json_encode(['ok' => true]);
} else {
  http_response_code(500);
  echo json_encode(['ok' => false, 'message' => 'Error al enviar correo']);
}
