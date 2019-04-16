<?php

header('Content-Type: application/json');
ini_set( "display_errors", 0); 
header('Access-Control-Allow-Origin: *'); 


//iniciamos la sesión
session_name("login"); //mismo nombre de sesion 
session_id($_POST[session_id]);
session_start();

if (isset($_SESSION["autenticado"])) {

     include ("../conexion.php");
     $link=conexion();
     $inactivo = 28800;


     if(isset($_SESSION['tiempo'])){
          
          $vida_session = time() - $_SESSION['tiempo'];

          if($vida_session > $inactivo){
              session_destroy();
              session_unset();
              echo json_encode('nosesion');
          }else{
              
              $usuarioactual=$_SESSION['usuarioactual'];


               $sql = mysqli_query($link, "SELECT id_usuario, nombre_completo, email FROM usuario WHERE username='$usuarioactual'");


               $row = mysqli_fetch_object($sql);
               $jsondata['id_usuario'] = $row->id_usuario;
               $jsondata['nombre_completo'] = $row->nombre_completo;
               $jsondata['email'] = $row->email;


               echo json_encode($jsondata);
               
          }

     }else{

       echo json_encode('nosesion');

     }

     mysqli_close($link);


}else{

  echo json_encode('nosesion');

}






?>
