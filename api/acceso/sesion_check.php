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

          if (isset($_SESSION['tiempo'])) {
               
               $vida_session = time() - $_SESSION['tiempo'];

               if ($vida_session > $inactivo) {
                    session_destroy();
                    session_unset();
                    echo json_encode('nosesion');
               } else {  
                    $usuarioactual=$_SESSION['usuarioactual'];
                    $strQuery = "SELECT a.id_usuario , a.nombre_completo , a.email , a.id_rol , a.soporte ,
                                        c.accion ,
                                        d.modulo
                              FROM usuario a
                              LEFT JOIN usuario_permisos b ON a.id_usuario = b.id_usuario
                              LEFT JOIN accion c ON b.id_accion = c.id_accion
                              LEFT JOIN modulo d ON c.id_modulo = d.id_modulo
                              WHERE a.username = '{$usuarioactual}'
                              GROUP BY c.id_accion
                              ORDER BY c.id_modulo";
                    $qTmp = mysqli_query($link, $strQuery);
                    $jsondata = [];
                    while ( $rTmp = mysqli_fetch_array($qTmp) ) {
                         $jsondata['id_usuario'] = $rTmp['id_usuario'];
                         $jsondata['nombre_completo'] = $rTmp['nombre_completo'];
                         $jsondata['email'] = $rTmp['email'];
                         $jsondata['id_rol'] = $rTmp['id_rol'];
                         $jsondata['soporte'] = $rTmp['soporte'];
                         $jsondata['accesos'][$rTmp['accion']] = $rTmp['accion'];
                         $jsondata['modulos'][$rTmp['modulo']] = $rTmp['modulo'];
                    }   

                    $strQuery = "SELECT b.id_departamento , b.departamento 
                              FROM departamento_puesto a
                              INNER JOIN departamento b ON a.id_departamento = b.id_departamento
                              WHERE a.id_usuario = {$jsondata['id_usuario']}
                              GROUP BY a.id_departamento";
                    $qTmp = mysqli_query($link , $strQuery);
                    $index = 0;
                    while ( $rTmp = mysqli_fetch_array($qTmp) ) {
                         $jsondata['departamentos'][$index]['id_departamento'] = $rTmp['id_departamento'];
                         $jsondata['departamentos'][$index]['departamento'] = $rTmp['departamento'];
                         $index++;
                    }   

                    echo json_encode($jsondata);
               }
          } else {
          echo json_encode('nosesion');
          }
          mysqli_close($link);
     } else {
     echo json_encode('nosesion');
     }

     mysqli_close($link);
?>