<?php
    define("_URL_TIKET" , "https://firebasestorage.googleapis.com/v0/b/tickets-45d8c.appspot.com/o/ticket.png?alt=media&token=5cded4b9-4738-4c96-a1c4-c4c58d901b2e");
    define("_URL_FONDO" , "https://firebasestorage.googleapis.com/v0/b/tickets-45d8c.appspot.com/o/fondo.jpg?alt=media&token=6820b33b-cbbf-4e2c-8f9c-09cfe7e46642");
    define("_URL_WEB" , "https://172.29.11.26/dev/tickets/#/");
    //define("_URL_WEB" , "http:/localhost:3000/tickets/#/");
    
    function setHistorial($id_usuario , $accion , $con){
        if ( !empty($id_usuario) && !empty($accion) ) {
            $strQuery = "INSERT INTO historial (id_usuario , accion)
                         VALUES( {$id_usuario} , '{$accion}' )";
            if ( mysqli_query($con, $strQuery) ) {
                return true;
            }
        }
        return false;
    }

    function sendNotificacionFirebase($strTitulo , $strMensaje , $strToken , $strUrl = '' , $name = '') {
        $ch = curl_init();

        $arr["data"]["title"] = $strTitulo;
        $arr["data"]["body"] = $strMensaje;
        $arr["data"]["icon"] = _URL_TIKET;
        $arr["data"]["link"] =  _URL_WEB.$strUrl;
        $arr["data"]["name"] =  $name;
        $arr["to"] = $strToken;

        curl_setopt($ch, CURLOPT_URL,"https://fcm.googleapis.com/fcm/send");
        curl_setopt($ch, CURLOPT_POST, 1);
        curl_setopt($ch, CURLOPT_POSTFIELDS,  json_encode($arr));  //Post Fields
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

        $headers =  array(
            'Content-Type:application/json',
            'Authorization:key=AAAAlwU9e0k:APA91bHskhENEmD4QXFgzua7N-OT5F2Jp5Sp0jseqY82cFooipIeMpHE6riAnYXz_4GG-mcoDHiKYLqkSGEcYmF9gND7tN1VaBLoBNWkb5iRRmGseAqCb9q8ZtpA-otB-lsl81gci4vB'
        );

        curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);

        $server_output = curl_exec ($ch);
        //print_r($server_output);
        curl_close ($ch);
    }

    function enviarCoreoElectronico($strPara , $strAsunto , $arrCopi) {
        require_once("./libs/phpmailer/class.phpmailer.php");
        require_once("./libs/phpmailer/class.smtp.php");
    
        try {
    
            $mail = new PHPMailer();
            $mail->IsSMTP();
            $mail->SMTPSecure = "ssl";
            $mail->SMTPAuth = true;
            
            $mail->Host = "mail.ocacall.com"; // SMTP a utilizar. Por ej. smtp.elserver.com
            $mail->Username = "helpdesk@ocacall.com"; // Correo completo a utilizar
            $mail->Password = "Ge@FAG8C8km-QC9fNAb9x@XT5b!ytHRk3nK7FN4hq=9dQ"; // Contraseña
            
            /*$mail->Host = "smtp.gmail.com"; 
            $mail->Username = "mortegalex27@gmail.com"; 
            $mail->Password = "********";  */      
            
            $mail->Port = 465; // Puerto a utilizar
            $mail->From = "admin@ocacall.com"; // Desde donde enviamos (Para mostrar)
            $mail->FromName = "SYSTICKETS.COM";
           
            $mail->AddAddress("{$strPara}"); // Esta es la dirección a donde enviamos           
            foreach ($arrCopi as $key => $email) {
                $mail->AddCC("{$email}"); // Copia
            }            

            //$mail->AddAddress("mortegalex27@gmail.com");
            //$mail->AddBCC("deruballos@gmail.com");
            
            $mail->IsHTML(true); // El correo se envía como HTML
            $mail->Subject = "Sistena de tickets"; // Este es el titulo del email.

            $mail->Body = "<style>
                            .container {
                                background-color: #cccccc;
                                height: 750px;
                                background-position: center;
                                background-repeat: no-repeat;
                                background-size: cover;
                            }        
                            .centrado-porcentual {
                                width: 40%;
                                position: absolute;
                                left: 50%;
                                top: 30%;
                                transform: translate(-50%, -50%);
                                -webkit-transform: translate(-50%, -50%);
                            }
                            .descripcion {
                                text-align: justify;
                                font-size: 1.1rem;
                            }
                        </style>
                        <table class='container' width='100%' height='100%'
                            background='"._URL_FONDO."'>
                            <tr>
                                <td style='text-align: center;' >
                                    <div class='centrado-porcentual'>
                                        <h1>Sistema de Tickets</h1>
                                        <p class='descripcion'>{$strAsunto}</p>
                                        <br>
                                        <br>
                                        <p class='descripcion'>Este mensaje es automatico. visita <a href='"._URL_WEB."'>Sistema de Tickets</a></p>
                                    </div>
                                </td>
                            </tr>
                        </table>";

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
    }

    function fasesPorTicket($fase , $intIdUsuarioTicket , $con , $intIdUsuario , $descripcion = null) {
        $strQuery = "SELECT id_usuario_ticket_fase
                     FROM usuario_ticket_fase  
                     WHERE id_usuario_ticket = {$intIdUsuarioTicket}
                     ORDER BY fecha_inicio DESC LIMIT 1";
        $qTmp = mysqli_query($con , $strQuery);
        $rTmp = mysqli_fetch_assoc($qTmp);    
        $intIdUsuarioTicketFase =  $rTmp['id_usuario_ticket_fase'];       

		$strQuery = "UPDATE usuario_ticket_fase 
					 SET fecha_fin = current_timestamp() , 
					     estado = 1 
					 WHERE id_usuario_ticket_fase = {$intIdUsuarioTicketFase}";
        mysqli_query($con , $strQuery);		
        

        if ( $fase == 1 ) {  
            $strQuery = "INSERT INTO usuario_ticket_fase(id_usuario_ticket, id_fase , id_tecnico ) 
                          VALUES( {$intIdUsuarioTicket} , 2 , {$intIdUsuario} )";
		    mysqli_query($con , $strQuery);
        } else {
            $_SET = ", estado = 1 , fecha_fin = current_timestamp() , comentario_final = '{$descripcion}'";
        }
        
	 	$strQuery = "UPDATE usuario_ticket 
                     SET id_tecnico = {$intIdUsuario} 
                         {$_SET}
                     WHERE id_usuario_ticket = {$intIdUsuarioTicket}";
		mysqli_query($con , $strQuery);

		$strQuery = "UPDATE notificacion 
                     SET estado = 0
                     WHERE accion_key = {$intIdUsuarioTicket}";
		mysqli_query($con , $strQuery);	

        if ( $fase == 1 ) {
            $titulo = "Asignacion de tickets";
            $arr['mensaje'] =  "{$rTmp['nombre_completo']} ha tomado tu ticket, muy pronto le estará dando solución!" ;
        } else {           
			$arr['mensaje'] = "Ticket dada por finalizada.";
            $titulo = "Cierre de tickets";

            $strQuery = "SELECT c.email
                         FROM usuario_ticket a
                         INNER JOIN departamento_puesto b ON a.id_cargo = b.id_cargo
                         INNER JOIN usuario c ON b.id_usuario = c.id_usuario
                         WHERE a.id_usuario_ticket = {$intIdUsuarioTicket}
                         AND c.id_rol >= 2";
            $qTmp = mysqli_query($con , $strQuery);
            $index = 0;
            while ($rTmp = mysqli_fetch_array($qTmp)) {
                $arr["copia"][$index] = $rTmp['email'];
            }
        }	
        
        $strQuery = "SELECT b.token_web , b.email , b.id_usuario ,
                c.nombre_completo
        FROM  usuario_ticket a 
        INNER JOIN usuario b ON a.id_usuario = b.id_usuario
        LEFT JOIN usuario c ON a.id_tecnico = c.id_usuario
        WHERE a.id_usuario_ticket = {$intIdUsuarioTicket}";
        $qTmp = mysqli_query($con , $strQuery);
        $rTmp = mysqli_fetch_assoc($qTmp);
		
		$strQuery = "INSERT INTO notificacion(id_usuario, titulo, descripcion, accion, accion_key, estado) 
					 VALUES( {$rTmp['id_usuario']} , '{$titulo}' , '{$arr['mensaje']}', 'ver_ticket', {$intIdUsuarioTicket} , 1)";
		mysqli_query($con , $strQuery);

		if ( !empty($rTmp['token_web']) ) {
            $strUrl = "inicio/".$intIdUsuarioTicket;
			sendNotificacionFirebase($titulo , $arr['mensaje'] , $rTmp['token_web'] , $strUrl);
		}

		if ( !empty($rTmp['email']) ) {
			 $arr["para"] = $rTmp['email'];
		}
		$arr["err"] = "false";
		print(json_encode($arr));
    }
?>