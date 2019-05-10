<?php
include ("../conexion.php");

//creamos variable para llamar función de conexión()
$link=conexion();

header('Content-Type: application/json');
ini_set( "display_errors", 0); 
header('Access-Control-Allow-Origin: *'); 


//indicamos el formato y consulta a ejecutar
///$exe = oci_parse($link, "SELECT COUNT(*) AS NUMBER_OF_ROWS FROM CLIENTE WHERE CL_USUARIO='$_POST[usuario]'");
$sql = mysqli_query($link, "SELECT COUNT(*) AS NUMBER_OF_ROWS FROM usuario WHERE username='$_POST[username]' AND estado=1");


$row = mysqli_fetch_assoc($sql);
$cols_respuesta = $row['NUMBER_OF_ROWS'];



if($cols_respuesta!=0 ){

    //  $exe = oci_parse($link, "SELECT COUNT(*) AS NUMBER_ROW FROM CLIENTE WHERE CL_USUARIO='$_POST[usuario]' AND CL_CLAVE='$_POST[psw]'");
      $exe = mysqli_query($link, "SELECT COUNT(*) AS NUMBER_ROW FROM usuario WHERE username='$_POST[username]' AND password='$_POST[password]'  AND estado=1");


      $row = mysqli_fetch_assoc($exe);
      $guardo_rows = $row['NUMBER_ROW'];

      if($guardo_rows!=0){


        session_name("login");
        session_start();

        $ahora = date("Y-n-j H:i:s");
        //Guardamos dos variables de sesión que nos auxiliará para saber si se está o no "logueado" un usuario
        $_SESSION["autenticado"] = "SI";
        $_SESSION["usuarioactual"] = $_POST[username];
        $_SESSION["ultimoAcceso"] = $ahora;

        $_SESSION["tiempo"] = time();



                 $sql = mysqli_query($link, "SELECT id_usuario, nombre_completo, email FROM usuario WHERE username='$_POST[username]'");


                 $row = mysqli_fetch_object($sql);
                 $jsondata['id_usuario'] = $row->id_usuario;
                 $jsondata['nombre_completo'] = $row->nombre_completo;
                 $jsondata['email'] = $row->email;
               

                 $_SESSION["id_usuario"] = $row->id_usuario;
                 $_SESSION["nombre_completo"] = $row->nombre_completo;

                 $jsondata['session_id'] = session_id();

                 //echo json_encode(session_id());
                print(json_encode($jsondata));
      }else{
            echo json_encode('BadPassword');
      }

}else{
  echo json_encode('BadUsuario');
}


mysqli_close($link);


?>
