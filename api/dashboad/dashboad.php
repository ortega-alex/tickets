<?php

    include("../conexion.php");
    $con=conexion();

    mysqli_set_charset($con,"utf8");
    header('Content-Type: application/json');
    ini_set( "display_errors", 0); 
    header('Access-Control-Allow-Origin: *'); 


    if (isset($_GET["get"])) {

        $intUsuario = isset($_POST['id_usuario']) ? intval($_POST['id_usuario']) : 0;
        $intDepartamento = isset($_POST['id_departamento']) ? intval($_POST['id_departamento']) : 0;

        $strQuery = "SELECT id_rol , soporte
                     FROM usuario 
                     WHERE id_usuario = {$intUsuario}";
        $qTmp = mysqli_query($con , $strQuery);
        $rTmp = mysqli_fetch_assoc($qTmp);
        $id_rol = $rTmp['id_rol'];
        $puesto = ($rTmp['soporte']) == 0 ? "a.id_usuario" : "a.id_tecnico";
        $strJOIN = "";

        if ($id_rol == 1) {
            $strJOIN = "WHERE '{$puesto}' = {$intUsuario}";
        } else {
            $strJOIN = "INNER JOIN departamento_puesto b ON a.id_cargo = b.id_cargo 
                        WHERE b.id_departamento = {$intDepartamento}";
        }

        $strQuery = "SELECT count(distinct a.id_usuario_ticket) AS total , a.estado
                     FROM usuario_ticket a
                     {$strJOIN}
                     GROUP BY a.estado";
        $qTmp = mysqli_query($con,$strQuery);

        while($rTmp = mysqli_fetch_object($qTmp)) {
            if ( $rTmp->estado == 0 ) {
                $obj->abiertos = intval($rTmp->total);   
            }
            if ( $rTmp->estado == 1 ) {
                $obj->cerrados =  intval($rTmp->total);   
            }
        }

        $strQuery = "SELECT ((sum(ca.nivel_satisfaccion) / count(*) * 100 ) / 5) AS total 
                     FROM calificacion_ticket ca
                     INNER JOIN usuario_ticket a ON ca.id_calificacion = a.id_calificacion
                     {$strJOIN}";
        
        $qTmp = mysqli_query($con,$strQuery);
        $rTmp = mysqli_fetch_object($qTmp);
        $obj->satisfaccion = number_format(floatval($rTmp->total), 2, ".", ".");
        print(json_encode($obj));
    }

    if ( isset( $_GET["grafica"] ) ) {
        $intStado = isset($_POST["estado"]) ? intval($_POST["estado"]) : 0;
        $intDepartamento = isset($_POST["id_departamento"]) ? intval($_POST["id_departamento"]) : 0;
        $intRol = isset($_POST["rol"]) ? intval($_POST["rol"]) : 0;
        $intUsuario = isset($_POST["_usuario"]) ? intval($_POST["_usuario"]) : 0;

        $strQuery = "SELECT id_rol , soporte
                     FROM usuario 
                     WHERE id_usuario = {$intUsuario}";
        $qTmp = mysqli_query($con , $strQuery);
        $rTmp = mysqli_fetch_assoc($qTmp);
        $id_rol = $rTmp['id_rol'];
        $puesto = ($rTmp['soporte']) == 0 ? "a.id_usuario" : "a.id_tecnico";
       
        if ( $intRol != 1 ) {
            $join = "INNER JOIN departamento_puesto d ON a.id_cargo = d.id_cargo";
            if ($intStado == 2  ) {
                $join = $join." WHERE d.id_departamento = {$intDepartamento}";
            } else {
                $join = $join." WHERE a.estado = {$intStado} AND d.id_departamento = {$intDepartamento}";
            }
        }  else {
            $join = ( $intStado != 2 ) ? "WHERE '{$puesto}' = {$intUsuario} AND a.estado = {$intStado}" : "WHERE '{$puesto}' = {$intUsuario}";
        }
                
        $strQuery = "SELECT count(*) AS tickers ,
                          IF (a.id_tecnico IS NULL , 'Sin Asignar' , b.username ) AS usuario ,        
                          (((sum(c.nivel_satisfaccion) / count(*)) * 100) / 5) as porcentaje ,
                          a.id_tecnico AS tecnico ,
                          a.estado 
                    FROM usuario_ticket a 
                    LEFT JOIN calificacion_ticket c on a.id_calificacion = c.id_calificacion 
                    LEFT JOIN usuario b ON a.id_tecnico = b.id_usuario 
                    {$join}
                    GROUP BY b.id_usuario";
                      
        $qTmp = mysqli_query($con , $strQuery);

        $index = 0;
        $arr = array();
        while($rTmp = mysqli_fetch_array($qTmp)) {
            $arr[$index]["tickers"] = $rTmp["tickers"];
            $arr[$index]["estado"] = $rTmp["estado"];
            $arr[$index]["usuario"] = $rTmp["usuario"];
            $arr[$index]["porcentaje"] =  number_format(floatval($rTmp["porcentaje"]), 2, ".", ".");            
            $arr[$index]["tecnico"] =  $rTmp["tecnico"];
            $index ++;   
        }
        print(json_encode($arr));
    }

    if (isset($_GET["detalle"])) {
        $intTecnico = isset($_POST["tecnico"]) ? intval($_POST["tecnico"]) : null;
        $estado = isset($_POST["estado"]) ? intval($_POST["estado"]) : null;
        $select = isset($_POST["select"]) ? intval($_POST["select"]) : null;

        $where = (empty($intTecnico)) ? " WHERE a.id_tecnico IS NULL " : " WHERE a.id_tecnico = {$intTecnico} ";
        $and = ($select == 2) ? " " : "AND a.estado = {$estado}";
        
        $sQuery = "SELECT IF (a.estado = 0 , 'Abierto' , 'Cerrado') AS estado  , a.creacion as fecha , a.id_usuario_ticket ,
                          b.id_ticket , b.nombre_ticket as ticket , 
                          c.nombre_completo as usuario , 
                          e.departamento 
                   FROM usuario_ticket a 
                   INNER JOIN ticket b ON a.id_ticket = b.id_ticket
                   INNER JOIN usuario c ON a.id_usuario = c.id_usuario
                   INNER JOIN departamento_puesto d ON a.id_usuario = d.id_usuario 
                   INNER JOIN departamento e ON d.id_departamento = e.id_departamento
                   {$where}
                   {$and}
                   GROUP BY a.id_usuario_ticket
                   ORDER BY a.creacion DESC";
         
         $qTemp = mysqli_query($con , $sQuery);

         $index = 0;
         $arr = array();
         while($rTemp = mysqli_fetch_array($qTemp)) {
            $arr[$index]["estado"] = $rTemp["estado"];
            $arr[$index]["fecha"] = $rTemp["fecha"];
            $arr[$index]["id_usuario_ticket"] = $rTemp["id_usuario_ticket"];
            $arr[$index]["id_ticket"] = $rTemp["id_ticket"];
            $arr[$index]["ticket"] = $rTemp["ticket"];
            $arr[$index]["usuario"] = $rTemp["usuario"];
            $arr[$index]["departamento"] = $rTemp["departamento"];
            $index ++;   
         }
         print(json_encode($arr));
    }

    if ( $_GET['accion'] == 'get_puesto_usuario' ) {
        $intDepartamento = isset($_GET['departamento']) ? intval($_GET['departamento']) : 0;
        $strQuery = "SELECT b.id_puesto , b.puesto
                    FROM departamento_puesto a 
                    INNER JOIN puesto b ON a.id_puesto = b.id_puesto
                    WHERE a.id_departamento = {$intDepartamento}";
        $qTmp = mysqli_query($con , $strQuery );
        $arr = [];
        $index = 0;
        while ( $rTmp = mysqli_fetch_array($qTmp) ) {
            $arr[$index]["id_puesto"] = $rTmp['id_puesto'];
            $arr[$index]["puesto"] = $rTmp['puesto'];
            $index++;
        }
        print(json_encode($arr));
    }

    mysqli_close($con);
?>