<?php

    require("./libs/phpmailer/class.phpmailer.php");
    require("./libs/phpmailer/class.smtp.php");

    header('Content-Type: application/json');
    ini_set( "display_errors", 0);
    header('Access-Control-Allow-Origin: *');

    try {
    
        $mail = new PHPMailer();
        $mail->IsSMTP();
        $mail->SMTPSecure = "ssl";
        $mail->SMTPAuth = true;
        $mail->Host = "mail.ocacall.com"; // SMTP a utilizar. Por ej. smtp.elserver.com
        $mail->Username = "helpdesk@ocacall.com"; // Correo completo a utilizar
        $mail->Password = "Ge@FAG8C8km-QC9fNAb9x@XT5b!ytHRk3nK7FN4hq=9dQ"; // Contraseña
        $mail->Port = 465; // Puerto a utilizar
        $mail->From = "m.ortega@ocacall.com"; // Desde donde enviamos (Para mostrar)
        $mail->FromName = "ELSERVER.COM";
        $mail->AddAddress("m.ortega@ocacall.com"); // Esta es la dirección a donde enviamos
        $mail->AddCC("mortegalex27@gmail.com"); // Copia
        //$mail->AddBCC("mortegalex27@gmail.com"); // Copia oculta
        $mail->IsHTML(true); // El correo se envía como HTML
        $mail->Subject = "Titulo"; // Este es el titulo del email.
        $body = "Hola mundo. Esta es la primer línea<br />";
        $body .= "Acá continuo el <strong>mensaje</strong>";
        $mail->Body = $body; // Mensaje a enviar
        $mail->AltBody = "Hola mundo. Esta es la primer línean Acá continuo el mensaje"; // Texto sin html
        //$mail->AddAttachment("imagenes/imagen.jpg", "imagen.jpg");
        $mail->CharSet = 'UTF-8';
        $exito = $mail->Send(); //Envía el correo.

        if($exito){
            echo "El correo fue enviado correctamente.";
        }else{
            echo "Hubo un inconveniente. Contacta a un administrador.";
        }

    } catch (Exception $e) {
        echo 'Excepción capturada: ',  $e->getMessage(), "\n";
    }
?>