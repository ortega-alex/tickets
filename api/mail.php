<?php

    include("helper.php");
    header('Content-Type: application/json');
    ini_set( "display_errors", 0); 
    header('Access-Control-Allow-Origin: *'); 

    if ( $_GET['accion'] = "set") {
        $strPara = isset($_POST['para']) ? trim($_POST['para']) : null;
        $strMensaje = isset($_POST['mensaje']) ? trim($_POST['mensaje']) : null;
        $arrCopia = isset($_POST['copia']) ?  json_decode($_POST['copia'] , true) : [];

        if ( !empty($strPara) && !empty($strMensaje) ) {
            enviarCoreoElectronico($strPara , $strMensaje , $arrCopia);	
            print("ok");
        } else {
            print("err");
        } 
    }  
?>