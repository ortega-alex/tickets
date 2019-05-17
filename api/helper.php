<?php
    define("_URL" , "http://172.29.9.186");

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

    function sendNotificacionFirebase($strTitulo , $strMensaje , $strToken , $strUrl = '' ) {
        $ch = curl_init();


        $arr["data"]["title"] = $strTitulo;
        $arr["data"]["body"] = $strMensaje;
        $arr["data"]["icon"] = _URL.":8082/tickets/public/img/ticket.png";
        $arr["data"]["link"] = _URL.":3000".$strUrl;
        $arr["to"] = $strToken;

        curl_setopt($ch, CURLOPT_URL,"https://fcm.googleapis.com/fcm/send");
        curl_setopt($ch, CURLOPT_POST, 1);
        curl_setopt($ch, CURLOPT_POSTFIELDS,  json_encode($arr));  //Post Fields
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

        $headers = [
            'Content-Type: application/json',
            'Authorization: key=AAAA9sHmvgs:APA91bFaQYKfhaG8sAPcCGPwnHzmam-0oa9sIp2XJRGEoQf1kAvn_YOsLWK-8ReLuU7HxaNrFnfbOq_XHlLGpAUFV8Jp6rH6TRnlov3gt22W62bgmdVCKnWBkyqR0jBLAA--L9d2j7f8'
        ];

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
            
            /*$mail->Host = "mail.ocacall.com"; // SMTP a utilizar. Por ej. smtp.elserver.com
            $mail->Username = "helpdesk@ocacall.com"; // Correo completo a utilizar
            $mail->Password = "Ge@FAG8C8km-QC9fNAb9x@XT5b!ytHRk3nK7FN4hq=9dQ"; // Contraseña*/
            
            $mail->Host = "smtp.gmail.com"; 
            $mail->Username = "mortegalex27@gmail.com"; 
            $mail->Password = "Alexander27@+*";            
            
            $mail->Port = 465; // Puerto a utilizar
            $mail->From = "admin@ocacall.com"; // Desde donde enviamos (Para mostrar)
            $mail->FromName = "SYSTICKETS.COM";
           
            $mail->AddAddress("{$strPara}"); // Esta es la dirección a donde enviamos

            foreach ($arrCopi as $key => $email) {
                $mail->AddCC("{$email}"); // Copia
            }
            
            //$mail->AddBCC("mortegalex27@gmail.com"); // Copia oculta
            $mail->IsHTML(true); // El correo se envía como HTML
            $mail->Subject = "Sistena de tickets"; // Este es el titulo del email.
            $mail->Body = "<style>
                                .container {
                                    background-image: url("._URL."/dev/tickets/fondo.jpg);
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
                            <div class='container'>
                                <div class='centrado-porcentual'>
                                    <h1>Sistema de Tickets</h1>
                                    <p class='descripcion'>{$strAsunto}</p>
                                    <br>
                                    <br>
                                    <p class='descripcion'>Este mensaje es automatico. visita <a href='"._URL.":3000'>Sistema de Tickets</a></p>
                                </div>
                            </div>"; // Mensaje a enviar
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
    }
?>