<?php
//iniciamos la sesión

header('Content-Type: application/json');
ini_set( "display_errors", 0); 
header('Access-Control-Allow-Origin: *'); 

  session_name("login"); //mismo nombre de sesion que iniciarsesion.php
  session_id($_POST[session_id]);

  session_start();
  unset($_SESSION["autenticado"]);
  unset($_SESSION["usuarioactual"]);
  unset($_SESSION["ultimoAcceso"]);

  $_SESSION = array();
  session_destroy();

  echo json_encode('nosesion');

?>
