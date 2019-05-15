<?php
  include ("../conexion.php");

  //creamos variable para llamar función de conexión()
  $link=conexion();

  header('Content-Type: application/json');
  ini_set( "display_errors", 0); 
  header('Access-Control-Allow-Origin: *'); 


  //indicamos el formato y consulta a ejecutar
  $strQuery = "SELECT COUNT(*) AS NUMBER_OF_ROWS FROM usuario WHERE username='$_POST[username]' AND estado=1";
  $qTmp = mysqli_query($link, $strQuery);
  $rTmp = mysqli_fetch_assoc($qTmp);

  if ( $rTmp['NUMBER_OF_ROWS'] != 0 ) {
    $strQuery = "SELECT COUNT(*) AS NUMBER_ROW FROM usuario WHERE username='$_POST[username]' AND password='$_POST[password]'  AND estado=1";
    $qTmp = mysqli_query($link, $strQuery);
    $rTmp = mysqli_fetch_assoc($qTmp);

    if ( $rTmp['NUMBER_ROW'] != 0 ) {

      session_name("login");
      session_start();

      $ahora = date("Y-n-j H:i:s");
      //Guardamos dos variables de sesión que nos auxiliará para saber si se está o no "logueado" un usuario
      $_SESSION["autenticado"] = "SI";
      $_SESSION["usuarioactual"] = $_POST[username];
      $_SESSION["ultimoAcceso"] = $ahora;
      $_SESSION["tiempo"] = time();

      //$strQuery = "SELECT id_usuario, nombre_completo, email FROM usuario WHERE username='$_POST[username]'";
      $strQuery = "SELECT a.id_usuario , a.nombre_completo , a.email , a.id_rol ,
                          c.accion , 
                          d.modulo
                  FROM usuario a
                  LEFT JOIN usuario_permisos b ON a.id_usuario = b.id_usuario
                  LEFT JOIN accion c ON b.id_accion = c.id_accion
                  LEFT JOIN modulo d ON c.id_modulo = d.id_modulo
                  WHERE a.username = '{$_POST[username]}'
                  GROUP BY c.id_accion
                  ORDER BY c.id_modulo";
      $qTmp = mysqli_query($link, $strQuery);
      $jsondata = [];
      while ( $rTmp = mysqli_fetch_array($qTmp) ) {
        $jsondata['id_usuario'] = $rTmp['id_usuario'];
        $jsondata['nombre_completo'] = $rTmp['nombre_completo'];
        $jsondata['email'] = $rTmp['email'];
        $jsondata['id_rol'] = $rTmp['id_rol'];
        $_SESSION["id_usuario"] = $rTmp['id_usuario'];
        $_SESSION["nombre_completo"] = $rTmp['nombre_completo'];     
        $jsondata['accesos'][$rTmp['accion']] = $rTmp['accion'];
        $jsondata['modulos'][$rTmp['modulo']] = $rTmp['modulo'];
      }      
      $jsondata['session_id'] = session_id();

      $strQuery = "SELECT b.id_departamento , b.departamento 
                    FROM departamento_puesto a
                    INNER JOIN departamento b ON a.id_departamento = b.id_departamento
                    WHERE a.id_usuario = {$jsondata['id_usuario']}
                    GROUP BY a.id_departamento";
      $qTmp = mysqli_query($link, $strQuery);
      $index = 0;
      while ( $rTmp = mysqli_fetch_array($qTmp) ) {
        $jsondata['departamentos'][$index]['id_departamento'] = $rTmp['id_departamento'];
        $jsondata['departamentos'][$index]['departamento'] = $rTmp['departamento'];
        $index++;
      }   

      print(json_encode($jsondata));
    }else{
      echo json_encode('BadPassword');
    }
  }else{
    echo json_encode('BadUsuario');
  }

  mysqli_close($link);

?>